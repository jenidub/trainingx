import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import { VerificationCodeEmail } from "./VerificationCodeEmail";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const NodemailerOTP = Email({
  id: "nodemailer-otp",
  apiKey: process.env.SMTP_USER, // Using SMTP_USER as identifier
  maxAge: 60 * 20, // 20 minutes
  async generateVerificationToken() {
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, token, expires }) {
    const transporter = createTransporter();

    // Render the React email template to HTML
    const emailHtml = await render(
      VerificationCodeEmail({ code: token, expires })
    );

    const mailOptions = {
      from:
        process.env.AUTH_EMAIL ||
        process.env.SMTP_USER ||
        "TrainingX <noreply@trainingx.app>",
      to: email,
      subject: "Verify your email for TrainingX",
      html: emailHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error(
        `Failed to send verification email: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  },
});
