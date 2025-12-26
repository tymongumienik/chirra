import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WebSocketContextType = {
  ws: WebSocket | null;
  ready: boolean; // only true after ping/pong
  sendMessage: (message: string, data?: Record<string, unknown>) => void;
  subscribe: (
    cb: (message: string, data?: Record<string, unknown>) => void,
  ) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [ready, setReady] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<
    Set<(message: string, data?: Record<string, unknown>) => void>
  >(new Set());

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const retryCountRef = useRef(0);
  const connectingRef = useRef(false);
  const destroyedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ...
  useEffect(() => {
    destroyedRef.current = false;
    setReady(false);

    const url = `${window.location.origin.replace(/^http/, "ws")}/api`;

    const connect = () => {
      if (destroyedRef.current) return;
      if (connectingRef.current || wsRef.current?.readyState === WebSocket.OPEN)
        return;

      connectingRef.current = true;
      const socket = new WebSocket(url);
      wsRef.current = socket;
      setWs(socket);
      setReady(false);

      const handleMessage = async (msg: MessageEvent) => {
        let text: string;
        if (typeof msg.data === "string") text = msg.data;
        else text = await msg.data.text();

        const msgObject = JSON.parse(text);

        if (msgObject.message === "pong") {
          // handshake complete
          setReady(true);
          return;
        }

        for (const cb of listenersRef.current) {
          cb(msgObject.message, msgObject.data);
        }
      };

      socket.onopen = () => {
        console.log("WebSocket connected");
        connectingRef.current = false;
        retryCountRef.current = 0;

        const pingTimeout = setTimeout(() => {
          if (!ready) {
            console.warn("Ping timed out, closing socket");
            socket.close();
          }
        }, 5000);

        sendMessage("ping");

        socket.onmessage = (msg) => {
          const data = JSON.parse(msg.data);
          if (data.message === "pong") {
            setReady(true);
            clearTimeout(pingTimeout);
          } else {
            for (const cb of listenersRef.current) cb(data.message, data.data);
          }
        };
      };

      socket.onmessage = handleMessage;

      socket.onerror = (err) => {
        console.error("WebSocket error", err);
        connectingRef.current = false;
        socket.close();
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
        connectingRef.current = false;
        setReady(false);

        if (destroyedRef.current) return;

        const delay = Math.min(10000, 1000 * 2 ** retryCountRef.current);
        retryCountRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      destroyedRef.current = true;
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const sendMessage = (message: string, data?: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message, data: data || {} }));
    } else {
      console.warn("WebSocket not open :(");
    }
  };

  const subscribe = (
    cb: (message: string, data?: Record<string, unknown>) => void,
  ) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  };

  return (
    <WebSocketContext.Provider
      value={{
        ws,
        ready,
        sendMessage,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return ctx;
};
