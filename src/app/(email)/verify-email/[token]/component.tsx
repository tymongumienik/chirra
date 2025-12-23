"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function VerifyEmail({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Missing token");
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    const verify = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${token}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) throw new Error(await res.text());
        setStatus("success");

        setTimeout(() => {
          window.location.href = "/app";
        }, 1000);
      } catch (err) {
        if (!(err instanceof Error)) return;

        attempts++;
        if (attempts < maxAttempts) {
          // retry after 500ms
          setTimeout(verify, 500);
        } else {
          setStatus("error");
          setErrorMsg(err.message || "Verification failed");
        }
      }
    };

    verify();
  }, [token]);

  return (
    <div className="inter min-h-screen flex items-center justify-center bg-background p-8 text-4xl text-foreground">
      {status === "idle" ||
        (status === "success" && <LoaderCircle className="animate-spin" />)}
      {status === "error" && <span className="text-red-500">{errorMsg}</span>}
    </div>
  );
}
