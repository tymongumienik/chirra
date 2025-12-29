"use client";

import type { Static, TSchema } from "elysia";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import superjson from "superjson";

type WebSocketContextType = {
  ws: WebSocket | null;
  ready: boolean; // only true after ping/pong
  sendMessage: <S extends TSchema>(message: string, data: Static<S>) => void;
  sendMessageAndWaitForReply: <S extends TSchema>(
    message: string,
    data: Static<S>,
    waitFor: (message: string, data?: Record<string, unknown>) => boolean,
  ) => Promise<void>;
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to connect once on mount
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

        const msgObject = superjson.parse<{
          message: string;
          data: Record<string, unknown>;
        }>(text);

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
        connectingRef.current = false;
        retryCountRef.current = 0;

        const pingTimeout = setTimeout(() => {
          if (!ready) {
            console.warn("Ping timed out, closing socket");
            socket.close();
          }
        }, 5000);

        sendMessage("over:ping");

        socket.onmessage = (msg) => {
          const data = superjson.parse<{
            message: string;
            data: Record<string, unknown>;
          }>(msg.data);
          if (data.message === "pong") {
            setReady(true);
            clearTimeout(pingTimeout);
          } else {
            for (const cb of listenersRef.current) cb(data.message, data.data);
          }
        };
      };

      socket.onmessage = handleMessage;

      socket.onerror = () => {
        connectingRef.current = false;
        socket.close();
      };

      socket.onclose = () => {
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

  const sendMessage = <S extends TSchema>(
    message: string,
    data?: Static<S>,
  ) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open :(");
      return;
    }

    wsRef.current.send(
      superjson.stringify({
        message,
        data: data ?? {},
      }),
    );
  };

  const sendMessageAndWaitForReply = async <S extends TSchema>(
    message: string,
    data: Static<S>,
    waitFor: (message: string, data?: Record<string, unknown>) => boolean,
  ) => {
    return new Promise<void>((resolve) => {
      const unsubscribe = subscribe((msg, d) => {
        if (waitFor(msg, d)) {
          unsubscribe();
          resolve();
        }
      });

      sendMessage(message, data);
    });
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
        sendMessageAndWaitForReply,
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
