import { useCallback, useRef } from "react";
import { useTextChat } from "./useTextChat";

export const useN8nDialog = () => {
  const { sendMessage } = useTextChat();
  const stepRef = useRef(0);

  const loadNextMessage = useCallback(async () => {
    try {
      const res = await fetch(`/api/n8n-dialog?step=${stepRef.current}`);
      if (!res.ok) {
        console.error("Failed to fetch dialog from n8n");
        return;
      }
      const data = await res.json();
      if (data?.message) {
        sendMessage(data.message);
        stepRef.current += 1;
      }
    } catch (e) {
      console.error("Error loading dialog from n8n", e);
    }
  }, [sendMessage]);

  const resetDialog = useCallback(() => {
    stepRef.current = 0;
  }, []);

  return { loadNextMessage, resetDialog };
};