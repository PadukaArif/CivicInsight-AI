import { Elysia } from "elysia"
import { NewsController } from "../Controller/news.controller"

export const newsRoutes = new Elysia({
  prefix: "/news",
})
  // Get all
  .get("/cnn", NewsController.getCnnNews)
  .get("/tempo", NewsController.getTempoNews)

  // Search
  .get("/cnn/search", NewsController.searchCnnNews)
  .get("/tempo/search", NewsController.searchTempoNews)

export default newsRoutes