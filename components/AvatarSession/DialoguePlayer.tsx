import React, { useState } from "react";

import { Button } from "../Button";
import { Select } from "../Select";
import { useTextChat } from "../logic/useTextChat";
import { DIALOGUE_SCRIPTS } from "@/app/lib/constants";

async function fetchN8NDialogue() {
  const res = await fetch("/api/get-n8n-dialogue");
  if (!res.ok) {
    throw new Error("Failed to load dialogue");
  }
  return await res.json();
}

export const DialoguePlayer: React.FC = () => {
  const { repeatMessageSync } = useTextChat();
  const [dialogue, setDialogue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const loadFromN8n = async () => {
    try {
      const data = await fetchN8NDialogue();
      if (Array.isArray(data.dialogue)) {
        loadScript(data.dialogue.join("\n"), data.label ?? "n8n");
      } else if (data.script) {
        loadScript(data.script, data.label ?? "n8n");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadScript = (script: string, label: string) => {
    setSelectedScript(label);
    setDialogue(script);
  };

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
      <Select
        options={DIALOGUE_SCRIPTS}
        renderOption={(option) => option.label}
        onSelect={(option) => loadScript(option.script, option.label)}
        isSelected={(option) => option.label === selectedScript}
        value={selectedScript}
        placeholder="Choose a script"
      />
      <Button onClick={loadFromN8n}>Load from n8n</Button>
      <textarea
        className="w-full text-white text-sm bg-zinc-700 p-2 rounded-lg"
        placeholder="Enter dialogue, one line per message"
        rows={3}
        value={dialogue}
        onChange={(e) => {
          setSelectedScript(null);
          setDialogue(e.target.value);
        }}
      />
      <Button disabled={isPlaying} onClick={playDialogue}>
        Play Dialogue
      </Button>
    </div>
  );
};
