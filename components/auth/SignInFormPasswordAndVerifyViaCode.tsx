import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { CodeInput } from "@/components/auth/CodeInput";
import { ResetPasswordWithEmailCode } from "@/components/auth/ResetPasswordWithEmailCode";
import { SignInMethodDivider } from "@/components/auth/SignInMethodDivider";
import { SignInWithOAuth } from "@/components/auth/SignInWithOAuth";
import { SignInWithPassword } from "@/components/auth/SignInWithPassword";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

/**
 * Users choose between OAuth providers or email and password combo
 * with required email verification and optional password reset via OTP.
 */
export function SignInFormPasswordAndVerifyViaCode() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | { email: string } | "forgot">(
    "signIn",
  );
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="max-w-[384px] mx-auto flex flex-col gap-4">
      {step === "signIn" ? (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Sign in or create an account
          </h2>
          <SignInWithOAuth />
          <SignInMethodDivider />
          <SignInWithPassword
            handleSent={(email) => setStep({ email })}
            handlePasswordReset={() => setStep("forgot")}
            provider="password-code"
          />
        </>
      ) : step === "forgot" ? (
        <ResetPasswordWithEmailCode
          provider="password-code"
          handleCancel={() => setStep("signIn")}
        />
      ) : (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Check your email
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter the 8-digit code we sent to your email address.
          </p>
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitting(true);
              const formData = new FormData(event.currentTarget);
              signIn("password-code", formData).catch((error) => {
                console.error(error);
                toast.error("Code could not be verified, try again");
                setSubmitting(false);
              });
            }}
          >
            <label htmlFor="email">Code</label>
            <CodeInput />
            <input name="email" value={step.email} type="hidden" />
            <input name="flow" value="email-verification" type="hidden" />
            <Button type="submit" disabled={submitting}>
              Continue
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={() => setStep("signIn")}
            >
              Cancel
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
