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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  clusterName: z.string().min(3, "Cluster identifier must be at least 3 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("Account provisioned. Please verify your email.");
    router.push("/verify-email");
  };

  return (
    <Card className="border-[#252A31] bg-[#111418]">
      <CardHeader>
        <CardTitle className="text-lg">Deploy Vault Workspace</CardTitle>
        <CardDescription>
          Create an administrator account and initial cluster namespace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-[#F5F7FA] font-medium">Administrator Name</label>
            <Input
              {...register("name")}
              placeholder="Rohit Kumar"
              compact
            />
            {errors.name && (
              <p className="text-[11px] text-[#E05D6F]">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[#F5F7FA] font-medium">Work Email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="rohit@enterprise.io"
              compact
            />
            {errors.email && (
              <p className="text-[11px] text-[#E05D6F]">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[#F5F7FA] font-medium">Password (8+ chars)</label>
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

          <div className="space-y-1">
            <label className="text-[#F5F7FA] font-medium">Initial Cluster Identifier</label>
            <Input
              {...register("clusterName")}
              placeholder="prod-cluster-01"
              compact
            />
            {errors.clusterName && (
              <p className="text-[11px] text-[#E05D6F]">{errors.clusterName.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full justify-center gap-1.5 mt-2"
          >
            <span>{isSubmitting ? "Provisioning..." : "Create Cluster Account"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-[#1E2229] pt-4 text-xs text-[#9AA3AF]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#4F7CFF] hover:underline ml-1">
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
