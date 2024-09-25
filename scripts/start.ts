Bun.spawn(`bun run preview --port 3100`.split(" "), {
  cwd: "./apps/spa_pkce_proconnect",
});

Bun.serve({
  fetch() {
    return new Response("404!");
  },
  static: {
    "/": new Response(await Bun.file("./scripts/index.html").bytes(), {
      headers: { "Content-Type": "text/html" },
    }),
  },
  port: 3000,
});
