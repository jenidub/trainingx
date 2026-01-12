"use client";

import { useEffect } from "react";
import { useAgent, useSessionContext } from "@livekit/components-react";
import { toast } from "sonner";

export function useAgentErrors() {
  const agent = useAgent();
  const { isConnected, end } = useSessionContext();

  useEffect(() => {
    if (isConnected && agent.state === "failed") {
      const reasons = agent.failureReasons;

      toast.error("Session ended", {
        description: reasons.length === 1 ? reasons[0] : reasons.join(", "),
      });

      end();
    }
  }, [agent, isConnected, end]);
}
