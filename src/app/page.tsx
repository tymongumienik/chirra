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

  const register = () => {
    api["register"].post({
      username: window.prompt("username")!,
      password: window.prompt("password")!,
      email: window.prompt("email")!,
    });
  };

  return (
    <div>
      <h1 className="geist">Chirra</h1>
      <span className="geist-mono">
        This is just an empty boilerplate page. There will be something here, I
        promise.
      </span>
      <button type="button" onClick={register}>
        Create Account
      </button>
    </div>
  );
}
