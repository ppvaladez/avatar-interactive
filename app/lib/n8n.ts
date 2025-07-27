export async function sendMessageToN8n(message: string, sender: string) {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, sender }),
    });
  } catch (error) {
    console.error("Failed to send message to n8n", error);
  }
}