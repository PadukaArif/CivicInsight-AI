import { serve } from "bun";
import index from "./index.html";

const BACKEND_URL = process.env.VITE_API_URL || "http://localhost:4000";

const server = serve({
  routes: {
    "/news/*": async (req) => {
      const url = new URL(req.url);
      const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
      try {
        const res = await fetch(backendUrl, {
          method: req.method,
          headers: req.headers,
        });
        return res;
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 });
      }
    },
    "/health/*": async (req) => {
      const url = new URL(req.url);
      const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;
      try {
        const res = await fetch(backendUrl, {
          method: req.method,
          headers: req.headers,
        });
        return res;
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500 });
      }
    },
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
