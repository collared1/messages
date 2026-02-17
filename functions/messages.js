export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, content, username, created_at FROM messages ORDER BY id DESC"
    ).all();
    return Response.json(results);
  }

  if (request.method === "POST") {
    const { message } = await request.json();

    const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";

    // Multiply IP numbers
    const numbers = ip.split(".").map(n => parseInt(n));
    const username = numbers.reduce((acc, val) => acc * val, 1);

    await env.DB.prepare(
      "INSERT INTO messages (content, ip, username) VALUES (?, ?, ?)"
    ).bind(message, ip, username).run();

    return Response.json({ success: true });
  }

  return new Response("Method not allowed", { status: 405 });
}
