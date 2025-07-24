const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export async function GET() {
  try {
    if (!N8N_WEBHOOK_URL) {
      throw new Error("N8N webhook url missing from env");
    }
    const res = await fetch(N8N_WEBHOOK_URL);
    const json = await res.text();

    if (!res.ok) {
      console.error(`Failed request to n8n with status ${res.status}`);
      return new Response(json || "Failed to fetch from n8n", {
        status: res.status,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response(json, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching n8n dialogue:", error);
    return new Response("Failed to fetch dialogue", { status: 500 });
  }
}
