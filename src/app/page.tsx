"use client";

import { useEffect } from "react";
import { api } from "./libs/api";

export default function Home() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      window.api = api;
    }
  }, []);

  return (
    <div>
      <h1 className="geist">Chirra</h1>
      <span className="geist-mono">
        This is just an empty boilerplate page. There will be something here, I
        promise.
      </span>
    </div>
  );
}
