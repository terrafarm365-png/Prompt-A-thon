"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { MailCheck, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 600));
    setVerifying(false);
    toast.success("Email verified. Initializing cluster workspace.");
    router.push("/dashboard");
  };

  return (
    <Card className="border-[#252A31] bg-[#111418]">
      <CardHeader className="text-center pb-2">
        <div className="w-12 h-12 rounded-full bg-[#35C98B]/10 border border-[#35C98B]/20 flex items-center justify-center text-[#35C98B] mx-auto mb-2">
          <MailCheck className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg">Verify Work Email</CardTitle>
        <CardDescription>
          Enter the 6-digit confirmation pin transmitted to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div className="space-y-1.5 text-center">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="text-center font-mono text-lg tracking-widest h-11"
            />
            <p className="text-[11px] text-[#69717D]">
              Code expires in 15 minutes.
            </p>
          </div>

          <Button
            type="submit"
            disabled={verifying}
            className="w-full justify-center gap-1.5"
          >
            <span>{verifying ? "Verifying..." : "Verify & Launch Console"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t border-[#1E2229] pt-4 text-xs text-[#9AA3AF]">
        Didn&apos;t receive code?{" "}
        <button
          type="button"
          onClick={() => toast.info("New verification code dispatched")}
          className="text-[#4F7CFF] hover:underline ml-1 cursor-pointer"
        >
          Resend code
        </button>
      </CardFooter>
    </Card>
  );
}
