"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [complete, setComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setComplete(true);
    toast.success("Password updated successfully");
  };

  return (
    <Card className="border-[#252A31] bg-[#111418]">
      <CardHeader>
        <CardTitle className="text-lg">Set New Password</CardTitle>
        <CardDescription>
          Enter a secure password to restore cluster access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {complete ? (
          <div className="p-6 rounded bg-[#35C98B]/10 border border-[#35C98B]/20 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-[#35C98B] mx-auto" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Credentials Rotated
            </h3>
            <p className="text-xs text-[#9AA3AF]">
              Your password has been securely reset.
            </p>
            <Link href="/login">
              <Button size="sm" className="w-full justify-center mt-2">
                Sign In Now
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#F5F7FA] font-medium">New Password</label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••••••"
                compact
              />
              {errors.password && (
                <p className="text-[11px] text-[#E05D6F]">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[#F5F7FA] font-medium">Confirm Password</label>
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••••••"
                compact
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-[#E05D6F]">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? "Updating..." : "Update Credentials"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t border-[#1E2229] pt-4 text-xs text-[#9AA3AF]">
        <Link href="/login" className="text-[#4F7CFF] hover:underline">
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
