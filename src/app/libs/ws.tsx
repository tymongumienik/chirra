import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type WebSocketContextType = {
  ws: WebSocket | null;
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

  useEffect(() => {
    destroyedRef.current = false;

    const url = `${window.location.origin.replace(/^http/, "ws")}/api`;

    const connect = () => {
      if (destroyedRef.current) return;

      if (
        connectingRef.current ||
        wsRef.current?.readyState === WebSocket.OPEN
      ) {
        return;
      }

      connectingRef.current = true;

      const socket = new WebSocket(url);
      wsRef.current = socket;
      setWs(socket);

      socket.onopen = () => {
        console.log("WebSocket connected");
        connectingRef.current = false;
        retryCountRef.current = 0;
      };

      socket.onmessage = async (msg) => {
        let text: string;
        if (typeof msg.data === "string") {
          text = msg.data;
        } else {
          text = await msg.data.text();
        }

        const msgObject = JSON.parse(text);
        for (const x of listenersRef.current)
          x(msgObject.message, msgObject.data);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error", err);
        connectingRef.current = false;
        socket.close();
      };

      socket.onclose = () => {
        console.log("WebSocket closed");
        connectingRef.current = false;

        if (destroyedRef.current) return;

        const delay = Math.min(10000, 1000 * 2 ** retryCountRef.current); // no more than 10s
        retryCountRef.current++;

        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      destroyedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

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
    <WebSocketContext.Provider value={{ ws, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return ctx;
};
