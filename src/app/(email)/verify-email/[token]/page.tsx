"use client";

import { LoaderCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { use, useEffect, useState } from "react";
import { api } from "@/app/libs/api";

export default ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await api["verify-email"].get({
        query: { token },
      });

      setLoading(false);

      if (result.error) {
        setError("An error occured while trying to verify your email");
        return;
      }

      if ("error" in result.data) {
        setError(result.data.error.message);
        return;
      }

      redirect("/app");
    })();
  }, [token]);

  return (
    <div className="inter min-h-screen flex items-center justify-center bg-background p-8 text-4xl text-foreground">
      {loading ? <LoaderCircle className="animate-spin" /> : error ? error : ""}
    </div>
  );
};
