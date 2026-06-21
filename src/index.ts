import cors from "@elysia/cors"
import { Elysia } from "elysia"
import { db } from "./config/database"
import "./database/init"
import newsRoutes from "./Module/Routes/news.routes"
import { logger } from "@bogeychan/elysia-logger"
import { rateLimit } from "elysia-rate-limit"

const app = new Elysia()
  .use(cors())
  .use(rateLimit({
    duration: 60000,
    max: 100
  }))
  .use(logger())
  .use(newsRoutes)
  .listen(3000, () => {
    console.log("Server is running on port 3000")
  })
