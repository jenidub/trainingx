"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

interface NextBestActionCardProps {
  title: string;
  description: string;
  link: string;
  iconType: "target" | "sparkles" | "trending" | "arrow";
}

const iconMap = {
  target: Target,
  sparkles: Sparkles,
  trending: TrendingUp,
  arrow: ArrowRight,
};

export function NextBestActionCard({
  title,
  description,
  link,
  iconType,
}: NextBestActionCardProps) {
  const Icon = iconMap[iconType];

  return (
    <Card className="mb-8 border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-green-600" />
          Next Best Action
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <Button asChild>
            <Link href={link}>
              Start <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

