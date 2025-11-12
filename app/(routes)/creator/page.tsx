"use client";

import { SidebarLayout } from "@/components/SidebarLayout";
import { CreatorStudioEntry } from "@/components/creator/CreatorStudioEntry";

export default function CreatorPage() {
  return (
    <SidebarLayout>
      <div className="bg-gray-50 min-h-full">
        <div className="container mx-auto px-4 py-6">
          <CreatorStudioEntry />
        </div>
      </div>
    </SidebarLayout>
  );
}
