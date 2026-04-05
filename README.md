# ESG Pulse Dashboard

Aplikasi web **konsol keberlanjutan (ESG)** untuk perusahaan: melacak emisi gas rumah kaca (Scope 1–3), KPI per fasilitas, kesiapan pelaporan, dan pemetaan ke arah praktik **GHG Protocol** serta **CSRD / ESRS** (lingkungan). Antarmuka gelap, cocok untuk gaya SaaS.

Data disimpan di **browser Anda** (localStorage) sehingga cocok untuk demo, pilot internal, atau prototipe sebelum backend/API produksi.

---

## Isi aplikasi (ringkas)

| Bagian | Fungsi |
|--------|--------|
| **Ringkasan** | Total emisi terfilter, grafik bulanan, cuplikan kesiapan pengungkapan dan progres vs garis dasar. |
| **Emisi** | Inventaris per baris (tambah/hapus), grafik komposisi & batang, rincian Scope 3 per kategori GHG (1–15). |
| **Fasilitas & KPI** | Daftar lokasi, energi/air/limbah/intensitas, tambah/hapus fasilitas. |
| **Target & jalur reduksi** | Garis dasar, tahun target, persen reduksi; grafik perbandingan dengan total saat ini. |
| **Kesiapan pengungkapan** | Workstream dengan **checklist tugas**; progres dan status dihitung dari tugas yang selesai. |
| **Selaras CSRD** | Topik lingkungan ESRS (skor ilustratif) + **pemeriksaan readiness** otomatis + ekspor CSV. |
| **Log aktivitas** | Riwayat perubahan data penting (sisi klien). |
| **Pengaturan** | Nama organisasi, bahasa (ID/EN), Scope 2 lokasi vs pasar, awal tahun fiskal, reset data demo. |

**Bilah atas:** pilih **tahun pelaporan**, **filter fasilitas** (semua lokasi atau satu lokasi), dan menu **Ekspor** (CSV).

---

## Login

- Tanpa backend: setelah membuka aplikasi Anda diarahkan ke **`/login`**.
- **Default demo:** email `admin@esg-pulse.local` · sandi `esgpulse2026` (juga ditampilkan di halaman login).
- **Ingat saya:** jika dicentang, sesi disimpan di `localStorage`; jika tidak, hanya di `sessionStorage` (hilang saat tab ditutup).
- Kunci sesi: `esg-pulse-session-v1`. **Keluar** ada di bagian bawah sidebar.
- Ubah kredensial lewat file **`.env`** (salin dari `.env.example`): `VITE_AUTH_EMAIL` dan `VITE_AUTH_PASSWORD`, lalu jalankan ulang `npm run dev`.

Untuk produksi, ganti alur ini dengan **API login** (JWT, OAuth, SSO) dan jangan menyimpan sandi di klien.

---

## Teknologi

- **React 19** + **TypeScript**
- **Vite** (build & dev server)
- **Tailwind CSS v4**
- **React Router** (navigasi)
- **Recharts** (grafik)

---

## Yang perlu dipasang

- **Node.js** versi LTS (misalnya 20 atau 22) beserta **npm**

---

## Cara menjalankan

Di folder proyek:

```bash
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

### Perintah lain

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Mode pengembangan dengan hot reload |
| `npm run build` | Build produksi ke folder `dist/` |
| `npm run preview` | Menjalankan build produksi secara lokal |
| `npm run lint` | Pemeriksaan ESLint |

---

## Data & penyimpanan

- State aplikasi diserialisasi ke **localStorage** dengan kunci `esg-pulse-dashboard-v2`.
- **Tidak ada server** bawaan: data hanya ada di browser yang sama (bisa hilang jika cache dibersihkan atau mode penyamaran).
- Untuk lingkungan produksi, biasanya state ini diganti dengan **API** (REST/GraphQL) dan **autentikasi** (SSO, JWT, dll.).

---

## Struktur folder (utama)

```
src/
  components/     # Sidebar, TopBar, RequireAuth, dll.
  config/         # Kredensial login demo (override .env)
  context/        # AuthProvider, DashboardStateProvider
  data/           # Data awal (seed), referensi CSRD
  layouts/        # Layout dashboard
  lib/            # Agregasi emisi, CSV, pemeriksaan ESRS
  pages/          # Satu file per halaman/rute
  strings/        # Teks navigasi bilingual
  types/          # Tipe TypeScript domain ESG
```

---

## Standar & konsep yang dipakai

- **GHG Protocol Corporate Standard:** pembagian Scope 1, 2, 3; Scope 3 mengacu pada **15 kategori** resmi.
- **Scope 2:** di pengaturan bisa memilih penyampaian **basis lokasi** atau **basis pasar** (dokumentasi sertifikat/PPA tetap tanggung jawab proses pelaporan Anda).
- **CSRD / ESRS:** modul “Selaras CSRD” memberi **pemetaan topik lingkungan** dan **daftar pemeriksaan** kelengkapan data; skor alignment bersifat **ilustratif** dan harus diganti dengan penilaian internal/assurance Anda.

---

## Ekspor berkas

Dari menu **Ekspor** di bilah atas Anda bisa mengunduh CSV (UTF-8 dengan BOM agar Excel membaca huruf khusus dengan benar), antara lain:

- Inventaris emisi  
- Daftar fasilitas  
- Ringkasan checklist pengungkapan  
- Topik ESRS lingkungan  
- Hasil pemeriksaan readiness  

---

## Mengembalikan data demo

Di **Pengaturan → Zona bahaya → Setel ulang data demo**, semua data lokal diganti dengan dataset contoh lagi (nama organisasi dan bahasa yang dipilih bisa dipertahankan sesuai logika aplikasi).

---

## Lisensi & kontribusi

Proyek ini bersifat privat (`private` di `package.json`). Sesuaikan bagian ini jika Anda membuka kode atau mempublikasikan paket.

---

## Tautan berguna

- [Dokumentasi Vite](https://vite.dev/)
- [Dokumentasi React](https://react.dev/)
- [GHG Protocol](https://ghgprotocol.org/)
- [EFRAG ESRS](https://www.efrag.org/esrs) (kerangka pelaporan terkait CSRD)
