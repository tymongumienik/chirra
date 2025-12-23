"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/libs/api";
import { useLuciaContext } from "@/app/libs/lucia-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { err } from "@/app/libs/error-helper";

export default () => {
  const lucia = useLuciaContext();
  const [verifyEmail, setVerifyEmail] = useState(false);

  const usernameField = useRef<HTMLInputElement | null>(null);
  const emailField = useRef<HTMLInputElement | null>(null);
  const passwordField = useRef<HTMLInputElement | null>(null);
  const confirmPasswordField = useRef<HTMLInputElement | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (data: {
      username: string;
      email: string;
      password: string;
    }) => {
      if (data.password !== confirmPasswordField.current?.value) {
        throw new Error("Passwords do not match");
      }
      return await api.register.post(data);
    },
    onSuccess: (response) => {
      if (response.error) {
        throw new Error(err(response));
      }
      setVerifyEmail(true);
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !usernameField.current ||
      !emailField.current ||
      !passwordField.current ||
      !confirmPasswordField.current
    )
      return;

    registerMutation.mutate({
      username: usernameField.current.value,
      email: emailField.current.value,
      password: passwordField.current.value,
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
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Create a new account
          </h1>

          {registerMutation.isError && (
            <p className="text-md text-destructive">
              {(registerMutation.error as Error).message}
            </p>
          )}
        </div>

        {verifyEmail ? (
          <div className="text-foreground">
            A verification email has been sent to your inbox. Please verify
            before logging in.
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  className="text-white"
                  ref={usernameField}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  className="text-white"
                  ref={passwordField}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmpassword"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmpassword"
                  className="text-white"
                  ref={confirmPasswordField}
                />
              </div>

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
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                "Sign up"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground gap-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold hover:underline transition-colors text-white"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </form>
  );
};
