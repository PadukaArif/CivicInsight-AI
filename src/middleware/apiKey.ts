export const apiKeyMiddleware = (ctx: any) => {
  const key = ctx.headers["x-api-key"]

  if (!key) {
    return new Response("Api key is missing", { status: 401 })
  }

  if (key !== process.env.API_KEY) {
    return new Response("Invalid API key", { status: 403 })
  }
}