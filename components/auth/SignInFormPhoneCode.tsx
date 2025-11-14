import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { CodeInput } from "@/components/auth/CodeInput";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export function SignInFormPhoneCode() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | { phone: string }>("signIn");

  return (
    <div className="max-w-[384px] mx-auto flex flex-col gap-4">
      {step === "signIn" ? (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Sign in or create an account
          </h2>
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              signIn("twilio", formData)
                .then(() => setStep({ phone: formData.get("phone") as string }))
                .catch((error) => {
                  console.error(error);
                  const errorMessage = error?.message || error?.toString() || "";
                  const errorName = error?.name || "";
                  
                  let toastTitle = "Could not send code";
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
                    toastTitle = "Could not send code";
                    toastDescription = "Please check your phone number and try again.";
                  } else {
                    toastDescription = "Please try again later.";
                  }
                  
                  toast.error(toastDescription || "Could not send code");
                });
            }}
          >
            <label htmlFor="phone">Phone</label>
            <Input
              name="phone"
              id="phone"
              className="mb-4"
              autoComplete="tel"
            />
            <Button type="submit">Send code</Button>
          </form>
        </>
      ) : (
        <>
          <h2 className="font-semibold text-2xl tracking-tight">
            Check your phone
          </h2>
          <p className="text-muted-foreground text-sm">
            Enter the 6-digit code we sent to your phone number.
          </p>
          <form
            className="flex flex-col"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              signIn("twilio", formData).catch((error) => {
                console.error(error);
                const errorMessage = error?.message || error?.toString() || "";
                const errorName = error?.name || "";
                
                let toastTitle = "Code could not be verified";
                let toastDescription: string | undefined;
                
                if (
                  errorMessage.includes("InvalidAccountId") ||
                  errorName === "InvalidAccountId" ||
                  (error instanceof Error && error.message.includes("InvalidAccountId"))
                ) {
                  toastTitle = "Verification failed";
                  toastDescription = "This account doesn't exist. Please sign up first.";
                } else if (
                  errorMessage.includes("Invalid") ||
                  errorMessage.includes("incorrect") ||
                  errorMessage.includes("wrong")
                ) {
                  toastTitle = "Invalid code";
                  toastDescription = "The code you entered is incorrect. Please try again.";
                } else {
                  toastDescription = "Please try again.";
                }
                
                toast.error(toastDescription || "Code could not be verified");
              });
            }}
          >
            <label htmlFor="code">Code</label>
            <CodeInput length={6} />
            <input name="phone" value={step.phone} type="hidden" />
            <Button type="submit">Continue</Button>
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
