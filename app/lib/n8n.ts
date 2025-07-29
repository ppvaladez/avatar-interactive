export async function fetchN8nReply(message: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_N8N_WEBHOOK_URL is not defined");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  if (typeof data === "string") return data;
  return data.reply || data.message || "";
}
