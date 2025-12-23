"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/app/libs/api";
import { err } from "@/app/libs/error-helper";

export default ({ token }: { token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const response = await api["verify-email"].get({
        query: { token },
      });

      if (response.error) {
        setErrorMessage(err(response));
        return;
      }

      window.location.href = "/app"; // hard redirect
    })();
  }, [token]);

  return (
    <div className="inter min-h-screen flex items-center justify-center bg-background p-8 text-4xl text-foreground">
      {errorMessage === null ? (
        <LoaderCircle className="animate-spin" />
      ) : (
        errorMessage
      )}
    </div>
  );
};
