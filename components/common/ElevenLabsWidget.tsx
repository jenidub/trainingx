"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const DEFAULT_AGENT_ID = "agent_7701ka2g90che218dkm8pw4hmsa8";
const WIDGET_SRC = "https://unpkg.com/@elevenlabs/convai-widget-embed";

export default function ElevenLabsWidget() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activated, setActivated] = useState(pathname !== "/");
  const [scriptReady, setScriptReady] = useState(false);
  const scriptLoaded = useRef(false);
  const agentId =
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const isLanding = pathname === "/";
    if (!mounted) return;

    // On non-landing pages, allow the widget immediately.
    if (!isLanding) {
      setActivated(true);
      return;
    }

    // On landing, activate only after the user scrolls (no extra "open assistant" button),
    // to avoid covering the hero CTA and to delay third-party loading.
    const onScroll = () => {
      if (window.scrollY > 0) {
        setActivated(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted, pathname]);

  useEffect(() => {
    if (!activated) return;
    if (!enabled || scriptLoaded.current) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-elevenlabs-widget="true"]`
    );

    if (existingScript) {
      scriptLoaded.current = true;
      setScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.type = "text/javascript";
    script.dataset.elevenlabsWidget = "true";
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
    scriptLoaded.current = true;
  }, [activated, enabled]);

  if (!mounted) return null;
  if (!activated) return null;
  if (!scriptReady) return null;

  return (
    <div className="relative z-[100]">
      {/* @ts-expect-error - elevenlabs-convai is a web component */}
      <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
    </div>
  );
}
