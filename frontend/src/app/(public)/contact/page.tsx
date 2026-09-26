"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  workload: z.string().min(1, "Please specify workload size"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    // Client-side simulation
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    toast.success("Inquiry dispatched to Vault Architecture team");
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#F5F7FA]">
          Contact Systems Architecture
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA3AF]">
          Discuss cluster sizing, custom Reed-Solomon polynomial requirements, or enterprise pilots.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Inquiry</CardTitle>
          <CardDescription>
            Reach our distributed systems engineering group directly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="p-6 rounded bg-[#35C98B]/10 border border-[#35C98B]/20 text-center space-y-2">
              <Mail className="w-8 h-8 text-[#35C98B] mx-auto" />
              <h3 className="text-sm font-semibold text-[#F5F7FA]">
                Message Received
              </h3>
              <p className="text-xs text-[#9AA3AF]">
                An infrastructure engineer will follow up with telemetry specs within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#F5F7FA] font-medium">Your Name</label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Alex Mercer"
                  compact
                />
                {errors.name && (
                  <p className="text-[11px] text-[#E05D6F]">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[#F5F7FA] font-medium">Work Email</label>
                <Input
                  {...register("email")}
                  placeholder="alex@enterprise.com"
                  type="email"
                  compact
                />
                {errors.email && (
                  <p className="text-[11px] text-[#E05D6F]">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[#F5F7FA] font-medium">Expected Storage Scale</label>
                <select
                  {...register("workload")}
                  aria-label="Expected Storage Scale"
                  className="w-full h-8 rounded border border-[#252A31] bg-[#111418] px-3 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#4F7CFF]"
                >
                  <option value="">Select storage capacity range</option>
                  <option value="10-50TB">10 TB – 50 TB</option>
                  <option value="50-250TB">50 TB – 250 TB</option>
                  <option value="250TB-1PB">250 TB – 1 PB</option>
                  <option value="1PB+">1 PB+ Petabyte Scale</option>
                </select>
                {errors.workload && (
                  <p className="text-[11px] text-[#E05D6F]">{errors.workload.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[#F5F7FA] font-medium">Deployment Details</label>
                <textarea
                  {...register("message")}
                  rows={4}
                  placeholder="Describe your node hardware, latency tolerances, and compliance requirements..."
                  className="w-full rounded border border-[#252A31] bg-[#111418] p-3 text-xs text-[#F5F7FA] placeholder:text-[#69717D] focus:outline-none focus:border-[#4F7CFF]"
                />
                {errors.message && (
                  <p className="text-[11px] text-[#E05D6F]">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Inquiry</span>
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
