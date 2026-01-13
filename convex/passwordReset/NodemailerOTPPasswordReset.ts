import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { PasswordResetEmail } from "./PasswordResetEmail";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const NodemailerOTPPasswordReset = Email({
  id: "nodemailer-otp-password-reset",
  apiKey: process.env.SMTP_USER,
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, token, expires }) {
    const transporter = createTransporter();

    const emailHtml = await render(
      PasswordResetEmail({ code: token, expires })
    );

    const mailOptions = {
      from:
        process.env.AUTH_EMAIL ||
        process.env.SMTP_USER ||
        "TrainingX <noreply@trainingx.app>",
      to: email,
      subject: "Reset your TrainingX password",
      html: emailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error(
        `Failed to send password reset email: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
});
