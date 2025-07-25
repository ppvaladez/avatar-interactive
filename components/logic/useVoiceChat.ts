import {
  StreamingEvents,
  TaskMode,
  TaskType,
} from "@heygen/streaming-avatar";
import { useCallback, useRef } from "react";

import { useStreamingAvatarContext } from "./context";

async function fetchN8NDialogue() {
  const res = await fetch("/api/get-n8n-dialogue");
  if (!res.ok) {
    throw new Error("Failed to load dialogue");
  }
  return await res.json();
}

export const useVoiceChat = () => {
  const {
    avatarRef,
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();

  const dialogueRef = useRef<string[]>([]);
  const dialogueIndexRef = useRef(0);

  const playNextLine = useCallback(async () => {
    const line = dialogueRef.current[dialogueIndexRef.current];
    if (!line) return;
    await avatarRef.current?.speak({
      text: line,
      taskType: TaskType.TALK,
      taskMode: TaskMode.ASYNC,
    });
    dialogueIndexRef.current += 1;
  }, [avatarRef]);

  const handleUserEnd = useCallback(() => {
    void playNextLine();
  }, [playNextLine]);

  const startVoiceChat = useCallback(
    async (isInputAudioMuted?: boolean) => {
      if (!avatarRef.current) return;
      setIsVoiceChatLoading(true);

      try {
        const data = await fetchN8NDialogue();
        if (Array.isArray(data.dialogue)) {
          dialogueRef.current = data.dialogue;
        } else if (data.script) {
          dialogueRef.current = data.script
            .split("\n")
            .map((l: string) => l.trim())
            .filter(Boolean);
        } else {
          dialogueRef.current = [];
        }
        dialogueIndexRef.current = 0;

        avatarRef.current.on(StreamingEvents.USER_END_MESSAGE, handleUserEnd);
        avatarRef.current.startListening();
        if (isInputAudioMuted) {
          avatarRef.current.muteInputAudio();
        } else {
          avatarRef.current.unmuteInputAudio();
        }

        await playNextLine();
        setIsVoiceChatActive(true);
        setIsMuted(!!isInputAudioMuted);
      } catch (err) {
        console.error(err);
      } finally {
        setIsVoiceChatLoading(false);
      }
    },
    [
      avatarRef,
      handleUserEnd,
      playNextLine,
      setIsMuted,
      setIsVoiceChatActive,
      setIsVoiceChatLoading,
    ],
  );

  const stopVoiceChat = useCallback(() => {
    if (!avatarRef.current) return;
    avatarRef.current.off(StreamingEvents.USER_END_MESSAGE, handleUserEnd);
    avatarRef.current.stopListening();
    setIsVoiceChatActive(false);
    setIsMuted(true);
  }, [avatarRef, handleUserEnd, setIsMuted, setIsVoiceChatActive]);

  const muteInputAudio = useCallback(() => {
    if (!avatarRef.current) return;
    avatarRef.current?.muteInputAudio();
    setIsMuted(true);
  }, [avatarRef, setIsMuted]);

  const unmuteInputAudio = useCallback(() => {
    if (!avatarRef.current) return;
    avatarRef.current?.unmuteInputAudio();
    setIsMuted(false);
  }, [avatarRef, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
  };
};
