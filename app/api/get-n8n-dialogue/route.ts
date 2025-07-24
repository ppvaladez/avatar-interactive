const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function GET() {
  try {
    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N webhook url missing from env");
    }
    const res = await fetch(N8N_WEBHOOK_URL);
    if (!res.ok) {
      throw new Error(`Failed to fetch from n8n: ${res.status}`);
    }
    const data = await res.json();
    // Expect data to have { script: string, label?: string }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching n8n dialogue:", error);
    return new Response("Failed to fetch dialogue", { status: 500 });
  }
}
