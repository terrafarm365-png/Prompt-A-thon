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
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid work email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
    toast.success("Password recovery instructions dispatched");
  };

  return (
    <Card className="border-[#252A31] bg-[#111418]">
      <CardHeader>
        <CardTitle className="text-lg">Reset Cluster Credentials</CardTitle>
        <CardDescription>
          We will send recovery tokens to your verified administrator email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="p-6 rounded bg-[#35C98B]/10 border border-[#35C98B]/20 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#35C98B] mx-auto" />
            <h3 className="text-sm font-semibold text-[#F5F7FA]">
              Recovery Token Dispatched
            </h3>
            <p className="text-xs text-[#9AA3AF]">
              Check your inbox for a secure token link.
            </p>
            <div className="pt-2">
              <Link href="/reset-password">
                <Button size="sm" variant="secondary">
                  Proceed to Reset Form
                </Button>
              </Link>
            </div>
          </div>
        ) : (
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? "Sending..." : "Send Recovery Token"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center border-t border-[#1E2229] pt-4 text-xs text-[#9AA3AF]">
        <Link href="/login" className="flex items-center gap-1.5 text-[#4F7CFF] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
