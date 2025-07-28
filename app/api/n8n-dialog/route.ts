const N8N_URL = process.env.N8N_DIALOG_URL;

export async function GET(req: Request) {
  if (!N8N_URL) {
    return new Response("N8N_DIALOG_URL is not configured", { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const step = searchParams.get("step") ?? "0";

  const res = await fetch(`${N8N_URL}?step=${encodeURIComponent(step)}`);

  if (!res.ok) {
    console.error("Failed to fetch dialog from n8n", await res.text());
    return new Response("Failed to fetch dialog", { status: 500 });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ message: data.message }), {
    headers: { "Content-Type": "application/json" },
  });
}