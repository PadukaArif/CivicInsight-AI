// Mengatur logika untuk ambil data

import { BeritaClient } from "../Clients/news.client"

export class NewsService {

  // 🔎 GET ALL CNN NEWS
  static async getCnnNews() {
    const response: any = await BeritaClient.cnnNews()

    return this.formatCnn(response.data)
  }

  // 🔎 GET ALL TEMPO NEWS
  static async getTempoNews() {
    const response: any = await BeritaClient.tempoNews()

    return this.formatTempo(response.data)
  }

  // 🔍 SEARCH CNN NEWS
  static async searchCnnNews(query: string) {
    const response: any = await BeritaClient.cnnNews()

    const filtered = response.data.filter((news: any) =>
      news.title?.toLowerCase().includes(query.toLowerCase())
    )

    return this.formatCnn(filtered)
  }

  // 🔍 SEARCH TEMPO NEWS
  static async searchTempoNews(query: string) {
    const response: any = await BeritaClient.tempoNews()

    const filtered = response.data.filter((news: any) =>
      news.title?.toLowerCase().includes(query.toLowerCase())
    )

    return this.formatTempo(filtered)
  }

  // 🧩 FORMAT CNN
  private static formatCnn(data: any[]) {
    return data.map((news) => ({
      title: news.title,
      description: news.description,
      image: news.image,
      url: news.url,
    }))
  }

  // 🧩 FORMAT TEMPO
  private static formatTempo(data: any[]) {
    return data.map((news) => ({
      title: news.title,
      link: news.link,
      content: news.content,
      isoDate: news.isoDate,
    }))
  }
}