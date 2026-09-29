# Skema Dataset ABSA Taman Nasional Gunung Ciremai (TNGC)

## Struktur Kolom Data

| Nama Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| `review_id` | String / Int | ID unik ulasan |
| `review_text` | String | Teks ulasan asli dari pengunjung |
| `clean_text` | String | Teks ulasan setelah tahap text preprocessing |
| `rating` | Integer | Rating bintang ulasan (1-5) |
| `aspect_fasilitas` | Integer | Aspek Fasilitas & Sanitasi (1 = Terdeteksi, 0 = Tidak) |
| `aspect_jalur` | Integer | Aspek Jalur & Trek Pendakian (1 = Terdeteksi, 0 = Tidak) |
| `aspect_pelayanan` | Integer | Aspek Petugas / Simaksi / Registrasi (1 = Terdeteksi, 0 = Tidak) |
| `aspect_biaya` | Integer | Aspek Biaya / Logistik / Tiket (1 = Terdeteksi, 0 = Tidak) |
| `aspect_daya_tarik` | Integer | Aspek Pemandangan / Alam / Kawah (1 = Terdeteksi, 0 = Tidak) |
| `sentiment` | String / Int | Sentimen ulasan (`positif`, `netral`, `negatif` atau `1, 0, -1`) |
| `recommendation_short` | String | Aksi perbaikan jangka pendek (< 3 bulan) |
| `recommendation_medium` | String | Aksi perbaikan jangka menengah (3 - 12 bulan) |
| `recommendation_long` | String | Aksi perbaikan jangka panjang (> 1 tahun) |
