"use client";

import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { api } from "@/app/libs/api";
import { err } from "@/app/libs/error-helper";
import { useLuciaContext } from "@/app/libs/lucia-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default ({ token }: { token: string }) => {
  const lucia = useLuciaContext();

  const passwordField = useRef<HTMLInputElement | null>(null);
  const confirmPasswordField = useRef<HTMLInputElement | null>(null);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      if (data.newPassword !== confirmPasswordField.current?.value) {
        throw new Error("Passwords do not match");
      }
      return await api["reset-password"].post(data);
    },
    onSuccess: (response) => {
      if (response.error) {
        throw new Error(err(response));
      } else {
        window.location.href = "/app"; // hard redirect
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordField.current || !confirmPasswordField.current) return;

    resetPasswordMutation.mutate({
      token,
      newPassword: passwordField.current.value,
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
            Set a new password
          </h1>

          {resetPasswordMutation.isError && (
            <p className="text-md text-destructive">
              {resetPasswordMutation.error.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
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
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-accent text-accent-foreground"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Confirm"
          )}
        </Button>
      </div>
    </form>
  );
};
