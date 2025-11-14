import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { SignInMethodDivider } from "@/components/auth/SignInMethodDivider";
import { SignInWithOAuth } from "@/components/auth/SignInWithOAuth";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInFormEmailLink() {
  const [step, setStep] = useState<"signIn" | "linkSent">("signIn");

  return (
    <div className="max-w-[384px] mx-auto flex flex-col gap-4">
      {step === "signIn" ? (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Sign in or create an account
          </h2>
          <SignInWithOAuth />
          <SignInMethodDivider />
          <SignInWithMagicLink handleLinkSent={() => setStep("linkSent")} />
        </>
      ) : (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Check your email
          </h2>
          <p>A sign-in link has been sent to your email address.</p>
          <Button
            className="p-0 self-start"
            variant="link"
            onClick={() => setStep("signIn")}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}

function SignInWithMagicLink({
  handleLinkSent,
}: {
  handleLinkSent: () => void;
}) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        signIn("resend", formData)
          .then(handleLinkSent)
          .catch((error) => {
            console.error(error);
            const errorMessage = error?.message || error?.toString() || "";
            const errorName = error?.name || "";
            
            let toastTitle = "Could not send sign-in link";
            let toastDescription: string | undefined;
            
            if (
              errorMessage.includes("InvalidAccountId") ||
              errorName === "InvalidAccountId" ||
              (error instanceof Error && error.message.includes("InvalidAccountId"))
            ) {
              toastTitle = "Account not found";
              toastDescription = "This account doesn't exist. Please sign up first.";
            } else if (
              errorMessage.includes("Invalid") ||
              errorMessage.includes("not found") ||
              errorMessage.includes("does not exist")
            ) {
              toastTitle = "Could not send sign-in link";
              toastDescription = "Please check your email address and try again.";
            } else {
              toastDescription = "Please try again later.";
            }
            
            toast.error(toastDescription || "Could not send sign-in link");
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      <Button type="submit" disabled={submitting}>
        Send sign-in link
      </Button>
    </form>
  );
}
