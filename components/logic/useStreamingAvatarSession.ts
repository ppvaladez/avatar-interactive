import StreamingAvatar, {
  ConnectionQuality,
  StartAvatarRequest,
  StreamingEvents,
} from "@heygen/streaming-avatar";
import { useCallback } from "react";

import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "./context";
import { useVoiceChat } from "./useVoiceChat";
import { useMessageHistory } from "./useMessageHistory";

export const useStreamingAvatarSession = () => {
  const {
    avatarRef,
    basePath,
    sessionState,
    setSessionState,
    stream,
    setStream,
    setIsListening,
    setIsUserTalking,
    setIsAvatarTalking,
    setConnectionQuality,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
    clearMessages,
  } = useStreamingAvatarContext();
  const { stopVoiceChat } = useVoiceChat();

  useMessageHistory();

  const init = useCallback(
    (token: string) => {
      avatarRef.current = new StreamingAvatar({
        token,
        basePath: basePath,
      });

      return avatarRef.current;
    },
    [basePath, avatarRef],
  );

  const handleStream = useCallback(
    ({ detail }: { detail: MediaStream }) => {
      setStream(detail);
      setSessionState(StreamingAvatarSessionState.CONNECTED);
    },
    [setSessionState, setStream],
  );

  const handleConnectionQuality = useCallback(
    ({ detail }: { detail: ConnectionQuality }) =>
      setConnectionQuality(detail),
    [setConnectionQuality],
  );
  const handleUserStart = useCallback(() => setIsUserTalking(true), [setIsUserTalking]);
  const handleUserStop = useCallback(() => setIsUserTalking(false), [setIsUserTalking]);
  const handleAvatarStart = useCallback(
    () => setIsAvatarTalking(true),
    [setIsAvatarTalking],
  );
  const handleAvatarStop = useCallback(
    () => setIsAvatarTalking(false),
    [setIsAvatarTalking],
  );

  const stop = useCallback(async () => {
    avatarRef.current?.off(StreamingEvents.STREAM_READY, handleStream);
    avatarRef.current?.off(StreamingEvents.STREAM_DISCONNECTED, stop);
    avatarRef.current?.off(
      StreamingEvents.CONNECTION_QUALITY_CHANGED,
      handleConnectionQuality,
    );
    avatarRef.current?.off(StreamingEvents.USER_START, handleUserStart);
    avatarRef.current?.off(StreamingEvents.USER_STOP, handleUserStop);
    avatarRef.current?.off(StreamingEvents.AVATAR_START_TALKING, handleAvatarStart);
    avatarRef.current?.off(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStop);
    avatarRef.current?.off(StreamingEvents.USER_TALKING_MESSAGE, handleUserTalkingMessage);
    avatarRef.current?.off(
      StreamingEvents.AVATAR_TALKING_MESSAGE,
      handleStreamingTalkingMessage,
    );
    avatarRef.current?.off(StreamingEvents.USER_END_MESSAGE, handleEndMessage);
    avatarRef.current?.off(StreamingEvents.AVATAR_END_MESSAGE, handleEndMessage);
    clearMessages();
    stopVoiceChat();
    setIsListening(false);
    setIsUserTalking(false);
    setIsAvatarTalking(false);
    setStream(null);
    await avatarRef.current?.stopAvatar();
    setSessionState(StreamingAvatarSessionState.INACTIVE);
  }, [
    handleStream,
    setSessionState,
    setStream,
    avatarRef,
    setIsListening,
    stopVoiceChat,
    clearMessages,
    setIsUserTalking,
    setIsAvatarTalking,
    handleConnectionQuality,
    handleUserStart,
    handleUserStop,
    handleAvatarStart,
    handleAvatarStop,
    handleUserTalkingMessage,
    handleStreamingTalkingMessage,
    handleEndMessage,
  ]);

  const start = useCallback(
    async (config: StartAvatarRequest, token?: string) => {
      if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
        throw new Error("There is already an active session");
      }

      if (!avatarRef.current) {
        if (!token) {
          throw new Error("Token is required");
        }
        init(token);
      }

      if (!avatarRef.current) {
        throw new Error("Avatar is not initialized");
      }

      setSessionState(StreamingAvatarSessionState.CONNECTING);
      avatarRef.current.on(StreamingEvents.STREAM_READY, handleStream);
      avatarRef.current.on(StreamingEvents.STREAM_DISCONNECTED, stop);
      avatarRef.current.on(
        StreamingEvents.CONNECTION_QUALITY_CHANGED,
        handleConnectionQuality,
      );
      avatarRef.current.on(StreamingEvents.USER_START, handleUserStart);
      avatarRef.current.on(StreamingEvents.USER_STOP, handleUserStop);
      avatarRef.current.on(StreamingEvents.AVATAR_START_TALKING, handleAvatarStart);
      avatarRef.current.on(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStop);
      avatarRef.current.on(
        StreamingEvents.USER_TALKING_MESSAGE,
        handleUserTalkingMessage,
      );
      avatarRef.current.on(
        StreamingEvents.AVATAR_TALKING_MESSAGE,
        handleStreamingTalkingMessage,
      );
      avatarRef.current.on(StreamingEvents.USER_END_MESSAGE, handleEndMessage);
      avatarRef.current.on(
        StreamingEvents.AVATAR_END_MESSAGE,
        handleEndMessage,
      );

      await avatarRef.current.createStartAvatar(config);

      return avatarRef.current;
    },
    [
      init,
      handleStream,
      stop,
      setSessionState,
      avatarRef,
      sessionState,
      setConnectionQuality,
      handleConnectionQuality,
      setIsUserTalking,
      handleUserStart,
      handleUserStop,
      handleUserTalkingMessage,
      handleStreamingTalkingMessage,
      handleEndMessage,
      setIsAvatarTalking,
      handleAvatarStart,
      handleAvatarStop,
    ],
  );

  return {
    avatarRef,
    sessionState,
    stream,
    initAvatar: init,
    startAvatar: start,
    stopAvatar: stop,
  };
};
