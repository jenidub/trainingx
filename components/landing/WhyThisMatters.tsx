import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProblemOpportunitySection() {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <Badge
            variant="secondary"
            className="mb-4 bg-white shadow-sm text-slate-600 hover:bg-white"
          >
            Market Reality
          </Badge>
          <h2 className="text-balance text-5xl md:text-[68px]/15 font-heading font-bold text-slate-900 mb-6 tracking-tight">
            The AI Skills Gap is{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Costing Billions
            </span>
          </h2>
          {/* <p className="text-xl text-slate-500 leading-relaxed">
            We are in the middle of a massive workforce correction.{" "}
            <br className="hidden md:block" />
            Which side of history will you be on?
          </p> */}
          <p className="text-xl text-gray-600 mb-4 sm:mb-8">
            Every app, every industry, every career runs on AI now.{" "}
          </p>
          <p className="text-lg text-gray-700 mb-4 sm:mb-6">
            ChatGPT. Claude. Microsoft Copilot. Google Gemini. GitHub Copilot.
            Midjourney. Over 200 tools and they all require one universal skill:
          {" "}  <strong>prompting</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* LEFT: THE PROBLEM (Light Mode - Clean but Warning) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative"
          >
            {/* Decorative background blob */}
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />

            <Card className="relative bg-white/80 backdrop-blur-sm border-rose-100 shadow-xl shadow-rose-900/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-rose-900/10 hover:border-rose-200">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />

              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
                  <ShieldAlert size={24} />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  The Risk
                </CardTitle>
                <p className="text-rose-600/80 font-medium text-sm uppercase tracking-wide">
                  Falling Behind
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    "2.5B prompts fail daily due to poor context.",
                    "Companies wasting millions on bad AI outputs.",
                    "Manual cleanup of AI code takes 2x longer.",
                    "Generic skills are being automated first.",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-slate-600 group/item"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 group-hover/item:text-rose-500 transition-colors" />
                      <span className="text-sm md:text-base group-hover/item:text-slate-900 transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-rose-100">
                  <div className="flex items-center gap-2 text-rose-600 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    Cost of Inaction: Obsolescence
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: THE OPPORTUNITY (Light Mode - Fresh & Elevated) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative"
          >
            {/* Decorative background blob */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />

            <Card className="relative bg-white border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1 ring-1 ring-emerald-500/10">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />

              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                  <TrendingUp size={24} />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">
                  The Reward
                </CardTitle>
                <p className="text-emerald-600/80 font-medium text-sm uppercase tracking-wide">
                  AI Mastery
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    {
                      text: "Prompt Engineers: $95k - $375k salaries",
                      bold: true,
                    },
                    {
                      text: "Master one skill, control 200+ tools",
                      bold: false,
                    },
                    {
                      text: "Vibe Coders: $66k entry level wages",
                      bold: false,
                    },
                    { text: "Future-proof against automation", bold: true },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 text-slate-600 group/item"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 group-hover/item:scale-110 transition-transform" />
                      <span
                        className={`text-sm md:text-base group-hover/item:text-slate-900 transition-colors ${item.bold ? "font-semibold text-slate-800" : ""}`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                      <DollarSign size={16} />
                      <span>Value: Unlimited</span>
                    </div>
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="text-emerald-600 text-sm font-bold flex items-center gap-1"
                    >
                      Get Ahead <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Call to Action Strip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-12 bg-white rounded-xl border border-slate-200 p-6 md:p-12 text-center shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-slate-200 to-emerald-400" />
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 mb-4">
            Everyone prompts. Few do it well.
          </h3>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Don't let the AI revolution happen <em>to</em> you. Make it happen{" "}
            <em>for</em> you.
          </p>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all transform hover:-translate-y-0.5">
            Start Free Assessment
          </button>
        </motion.div>
      </div>
    </section>
  );
}
