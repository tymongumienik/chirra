"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { api } from "@/app/libs/api";
import { useLuciaContext } from "@/app/libs/lucia-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { err } from "@/app/libs/error-helper";

export default () => {
  const lucia = useLuciaContext();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameOrEmailField = useRef<HTMLInputElement | null>(null);
  const passwordField = useRef<HTMLInputElement | null>(null);

  if (lucia.user) {
    window.location.href = "/app"; // hard redirect
    return;
  }

  const action = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage(null);

    if (!usernameOrEmailField?.current) return;
    if (!passwordField?.current) return;

    setLoading(true);

    const response = await api.login.post({
      usernameOrEmail: usernameOrEmailField.current.value,
      password: passwordField.current.value,
    });

    setLoading(false);

    if (response.error) {
      setErrorMessage(err(response));
      return;
    }

    window.location.href = "/app"; // hard redirect
  };

  return (
    <form
      onSubmit={action}
      className="inter min-h-screen flex items-center justify-center bg-background p-8"
    >
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl border border-border shadow-xl backdrop-blur-sm">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>

          {errorMessage && (
            <p className="text-md text-destructive">{errorMessage}</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="usernameoremail"
              className="text-sm font-medium text-muted-foreground"
            >
              Username or email
            </label>
            <Input
              type="text"
              id="usernameoremail"
              className="text-white"
              ref={usernameOrEmailField}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors "
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              id="password"
              className="text-white"
              ref={passwordField}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-accent text-accent-foreground"
          disabled={loading}
        >
          {loading ? <LoaderCircle className="animate-spin" /> : "Sign in"}
        </Button>

        <div className="text-center text-sm  text-muted-foreground gap-2">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline transition-colors text-white"
          >
            Create an account
          </Link>
        </div>
      </div>
    </form>
  );
};
