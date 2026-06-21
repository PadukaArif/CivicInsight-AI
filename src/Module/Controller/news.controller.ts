// Controller untuk endpoint

import { NewsService } from "../Service/news.service"

export class NewsController {
  static async getCnnNews() {
    return await NewsService.getCnnNews()
  }

  static async getTempoNews() {
    return await NewsService.getTempoNews()
  }

  static async searchCnnNews({ query }: { query: { q?: string } }) {
    if (!query.q) {
      return {
        message: "Query parameter 'q' is required",
        success: false
      }
    }

    return await NewsService.searchCnnNews(query.q)
  }

  static async searchTempoNews({ query }: { query: { q?: string } }) {
    if (!query.q) {
      return {
        message: "Query parameter 'q' is required",
        success: false
      }
    }

    return await NewsService.searchTempoNews(query.q)
  }
}