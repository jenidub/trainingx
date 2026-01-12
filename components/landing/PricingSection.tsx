"use client";

import React from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Check, Crown, Building2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Spotlight Card Component
function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-200 bg-white overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 116, 185, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// Pricing tiers data
const pricingTiers = [
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious learners ready to master AI skills",
    icon: Crown,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/20",
    features: [
      "Unlimited Practice Exercises",
      "verifiable Certificates",
      "Practice Projects",
      "AI Career Matching",
      "Spiral the Study Buddy",
      "Community & Leaderboard",
      "Custom GPTs",
    ],
    cta: "Coming Soon",
    ctaDisabled: true,
    ctaVariant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For organizations training teams at scale",
    icon: Building2,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    features: [
      "Everything in Pro",
      "Custom branding",
      "Priority support",
      "Admin dashboard",
      "Team seat management",
      "Analytics & reporting",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    ctaDisabled: false,
    ctaHref: "mailto:doneal@nuueducation.com",
    ctaVariant: "outline" as const,
  },
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

interface PricingSectionProps {
  showHeader?: boolean;
  className?: string;
}

export default function PricingSection({
  showHeader = true,
  className = "",
}: PricingSectionProps) {
  return (
    <section className={`relative py-16 overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 relative z-10">
        {showHeader && (
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="flex justify-center">
              <div className="inline-flex items-center gap-2 backdrop-blur-md text-slate-800 rounded-full px-5 py-2 border border-slate-200 shadow-sm mb-6 bg-white">
                <Sparkles className="h-4 w-4 text-gradient-from" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Simple Pricing
                </span>
              </div>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6"
            >
              Choose Your{" "}
              <span className="bg-linear-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                Plan
              </span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Simple, transparent pricing. No hidden fees, no surprises—just the
              skills you need to thrive in the AI economy.
            </motion.p>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
              className="relative"
            >
              <SpotlightCard className="h-full rounded-3xl p-8">
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${tier.iconBg} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <tier.icon className={`h-7 w-7 ${tier.iconColor}`} />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-slate-500 mb-6">{tier.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900">
                    {tier.price}
                  </span>
                  <span className="text-slate-500 ml-1">{tier.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-gradient-to" />
                      </div>
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {tier.ctaDisabled ? (
                  <Button
                    disabled
                    className="w-full h-14 rounded-2xl font-bold text-lg bg-slate-200 text-slate-500 cursor-not-allowed"
                  >
                    {tier.cta}
                  </Button>
                ) : (
                  <a href={tier.ctaHref}>
                    <Button
                      className={`w-full h-14 rounded-2xl font-bold text-lg ${
                        tier.ctaVariant === "outline"
                          ? "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 bg-white border"
                          : "bg-linear-to-r from-gradient-from to-gradient-to hover:opacity-90 text-white shadow-lg shadow-gradient-from/25"
                      }`}
                    >
                      {tier.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                )}
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
