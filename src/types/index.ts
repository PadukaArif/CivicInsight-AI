export interface Announcement {
  id: number;
  kategori: 'Penting' | 'Umum' | 'Kegiatan';
  judul: string;
  konten: string;
  tanggal: string;
  urgensi: 'high' | 'normal';
}

export interface Aduan {
  id: number;
  wargaNama: string;
  kategori: string;
  deskripsi: string;
  lokasi: string;
  status: 'Terkirim' | 'Diproses' | 'Selesai';
  tanggal: string;
  tanggapanAdmin?: string;
  tanggalTanggapan?: string;
}

export interface Fact {
  id: number;
  judul: string;
  penjelasan: string;
  status: 'fakta' | 'hoaks' | 'belum_verifikasi';
  sumber?: string;
  tanggal: string;
}

export interface Rumor {
  id: number;
  konten: string;
  wargaNama: string;
  tanggal: string;
  status: 'belum_verifikasi' | 'fakta' | 'hoaks';
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export interface LedgerTransaction {
  id: number;
  tanggal: string;
  keterangan: string;
  jenis: 'pemasukan' | 'pengeluaran';
  jumlah: number;
}

export interface FamilyMember {
  id: number;
  nama: string;
  nik: string;
  tglLahir: string;
  pekerjaan: string;
  hubungan: 'Kepala Keluarga' | 'Suami' | 'Istri' | 'Anak' | 'Orang Tua' | 'Lainnya';
  statusKawin: 'Kawin' | 'Belum Kawin' | 'Cerai Hidup' | 'Cerai Mati';
  pendidikan: 'SD' | 'SMP' | 'SMA/SMK' | 'D3' | 'S1' | 'S2' | 'S3' | 'Tidak Sekolah';
}

export interface Household {
  id: number;
  kepalaKeluarga: string;
  noKk: string;
  alamat: string;
  noHp: string;
  members: FamilyMember[];
}
