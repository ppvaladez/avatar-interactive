import React, { useState } from "react";

import { Button } from "../Button";
import { useTextChat } from "../logic/useTextChat";

export const DialoguePlayer: React.FC = () => {
  const { repeatMessageSync } = useTextChat();
  const [dialogue, setDialogue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const playDialogue = async () => {
    if (dialogue.trim() === "") return;
    setIsPlaying(true);
    for (const line of dialogue.split("\n")) {
      const text = line.trim();
      if (!text) continue;
      await repeatMessageSync(text);
    }
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        className="w-full text-white text-sm bg-zinc-700 p-2 rounded-lg"
        placeholder="Enter dialogue, one line per message"
        rows={3}
        value={dialogue}
        onChange={(e) => setDialogue(e.target.value)}
      />
      <Button disabled={isPlaying} onClick={playDialogue}>
        Play Dialogue
      </Button>
    </div>
  );
};
