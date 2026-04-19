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
    <div className="flex min-h-screen items-center justify-center bg-[#060b16] px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.18),transparent_42%)]" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="border-white/15 bg-slate-950/80 p-6 md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/35 bg-blue-500/15">
              <LockKeyhole className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Portfolio Admin</p>
              <h1 className="text-xl font-semibold text-white">Dashboard Access</h1>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your dashboard password"
              {...register("password", { required: true })}
            />

            {error ? (
              <p className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                <ShieldAlert className="h-4 w-4" />
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Unlock Dashboard"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

