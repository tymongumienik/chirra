"use client";

import { useEffect } from "react";
import { api } from "./libs/api";

export default function Home() {
  useEffect(() => {
    window.api = api;
  }, [])

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
