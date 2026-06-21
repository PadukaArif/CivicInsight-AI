// Mengambil data API dari Berita Indonesia

export class BeritaClient {
  static async cnnNews() {
    const res = await fetch("https://berita-indo-api-next.vercel.app/api/cnn-news")
    const data = await res.json()
    return data
  }

  static async tempoNews() {
    const res = await fetch("https://berita-indo-api-next.vercel.app/api/tempo-news")
    const data = await res.json()
    return data
  }
}
