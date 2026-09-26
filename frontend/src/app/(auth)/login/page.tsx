"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async () => {
    // Simulated auth
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Welcome back, authenticated to US-East Cluster");
    router.push("/dashboard");
  };

  return (
    <Card className="border-[#252A31] bg-[#111418]">
      <CardHeader>
        <CardTitle className="text-lg">Sign in to Vault Console</CardTitle>
        <CardDescription>
          Enter your operator credentials to access cluster telemetry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[#F5F7FA] font-medium">Work Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="operator@enterprise.com"
              compact
            />
            {errors.email && (
              <p className="text-[11px] text-[#E05D6F]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[#F5F7FA] font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#4F7CFF] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              compact
            />
            {errors.password && (
              <p className="text-[11px] text-[#E05D6F]">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full justify-center gap-1.5 mt-2"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign In to Cluster"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-[#1E2229] pt-4 text-xs text-[#9AA3AF]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#4F7CFF] hover:underline ml-1">
          Register new cluster
        </Link>
      </CardFooter>
    </Card>
  );
}
