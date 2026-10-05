"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LockKeyhole, ShieldAlert } from "lucide-react";

import { requestJson } from "@/components/dashboard/api";
import { Button } from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { Input } from "@/components/ui/dashboard/Input";

type LoginValues = {
  password: string;
};

export default function DashboardLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      await requestJson("/api/dashboard/auth", {
        method: "POST",
        body: JSON.stringify({ password: values.password }),
      });
      router.replace("/dashboard/overview");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Invalid password.";
      setError(message);
    }
  });

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-dash-bg px-5 py-12 [color-scheme:dark]">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-dash-accent text-white">
            <LockKeyhole className="size-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-dash-fg">Portfolio admin</h1>
            <p className="text-[13px] text-dash-muted">Sign in to manage your site content.</p>
          </div>
        </div>

        <Card className="p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Dashboard password"
              autoFocus
              {...register("password", { required: true })}
            />

            {error ? (
              <p role="alert" className="flex items-center gap-2 rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                <ShieldAlert className="size-4 shrink-0" aria-hidden />
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
