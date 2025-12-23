"use client";

import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { api } from "@/app/libs/api";
import { err } from "@/app/libs/error-helper";
import { useLuciaContext } from "@/app/libs/lucia-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default () => {
  const lucia = useLuciaContext();

  const [sent, setSent] = useState(false);
  const emailField = useRef<HTMLInputElement | null>(null);

  const requestResetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      return await api["request-password-reset"].post(data);
    },
    onSuccess: (response) => {
      if (response.error) {
        throw new Error(err(response));
      } else {
        setSent(true);
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailField.current) return;

    requestResetPasswordMutation.mutate({
      email: emailField.current.value,
    });
  };

  if (lucia.user) {
    window.location.href = "/app"; // hard redirect
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="inter min-h-screen flex items-center justify-center bg-background p-8"
    >
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
        {sent ? (
          <div>
            <h1 className="text-3xl font-bold text-foreground pb-4">
              Check your email
            </h1>
            <p className="text-md text-muted-foreground">
              If the email provided is correct, we've sent you a password reset
              link.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Password Recovery
              </h1>

              {requestResetPasswordMutation.isError && (
                <p className="text-md text-destructive">
                  {requestResetPasswordMutation.error.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  type="email"
                  id="email"
                  className="text-white"
                  ref={emailField}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-accent text-accent-foreground"
              disabled={requestResetPasswordMutation.isPending}
            >
              {requestResetPasswordMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Request password reset"
              )}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};
