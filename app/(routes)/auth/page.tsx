"use client";

import { ResetPasswordWithEmailCode } from "@/components/ResetPasswordWithEmailCode";
import { SignInMethodDivider } from "@/components/SignInMethodDivider";
import { SignInWithGoogle } from "@/components/oauth/SignInWithGoogle";
import { SignInWithPassword } from "@/components/SignInWithPassword";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";

export default function AuthPage() {
  const [step, setStep] = useState<"signIn" | "forgot">("signIn");
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-[384px] w-full flex flex-col gap-6">
        {step === "signIn" ? (
          <>
            <div className="text-center">
              <h2 className="font-semibold text-2xl tracking-tight">
                Sign in or create an account
              </h2>
            </div>
            <SignInWithGoogle />
            <SignInMethodDivider />
            <SignInWithPassword
              provider="password-with-reset"
              handlePasswordReset={() => setStep("forgot")}
            />
          </>
        ) : (
          <ResetPasswordWithEmailCode
            provider="password-with-reset"
            handleCancel={() => setStep("signIn")}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
}
