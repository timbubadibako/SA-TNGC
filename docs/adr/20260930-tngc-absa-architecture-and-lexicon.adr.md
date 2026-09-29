# ADR: Arsitektur Multi-Target ABSA, Integrasi Leksikon GitHub, & Matriks Rekomendasi TNGC
- **Date**: 2026-09-30
- **Status**: Accepted
- **Deciders**: Syifa Pajril Yaum, Antigravity AI
- **Context**: Perubahan fokus riset dari Strava ke Analisis Sentimen Berbasis Aspek (ABSA) Taman Nasional Gunung Ciremai (TNGC)

---

## 1. Konteks Masalah
Sebelumnya, riset berfokus pada ulasan aplikasi mobile Strava di Play Store. Dilakukan pivot riset ke kawasan konservasi Taman Nasional Gunung Ciremai dengan data ulasan Google Maps. Karakteristik data ulasan Google Maps TNGC memiliki tantangan unik:
1. **Pemisahan Entitas**: TNGC terdiri dari multi-basecamp (Palutungan, Apuy, Linggarjati, Linggasana, Sadarehe) dan puluhan ODTWA wisata kemitraan. Ulasan pada satu titik pusat tidak mewakili kondisi seluruh pos.
2. **Noise Estetika Alam**: Mayoritas (>80%) ulasan hanya memuji pemandangan alam tanpa memberi nilai evaluatif pada fasilitas dan kinerja pengelola.
3. **Bahasa Campuran**: Ulasan memadukan bahasa Indonesia gaul, dialek Sunda lokal, singkatan maps, dan istilah khusus pendakian.
4. **Kebutuhan Actionable Output**: Pengelola taman nasional tidak hanya butuh grafik sentimen, tetapi rekomendasi tindak lanjut berjangka (quick win vs jangka panjang).

---

## 2. Keputusan Desain (Decisions)

### D1: Multi-Target POI Scraping Berbasis Verified Hex Place ID
- **Pilihan**: Menggunakan 12 titik POI spesifik dengan query langsung ke internal endpoint Google Maps (`boqEndpoint`) menggunakan verified place ID hex.
- **Justifikasi**: Menghindari rate limit / bot-detection Playwright GUI dan mengumpulkan representasi yang adil dari seluruh jalur pendakian dan destinasi wisata resmi.
- **Konsekuensi**: Terkumpul 2.216 ulasan riil dengan metadata asal POI yang terstruktur.

### D2: Eliminasi Ulasan Estetika Alam Murni
- **Pilihan**: Menerapkan rule-based keyword filter untuk menyisihkan ulasan yang tidak menyebutkan kata kunci fasilitas/operasional.
- **Justifikasi**: Fokus riset adalah perbaikan tata kelola dan fasilitas. Menyertakan ulasan "pemandangan indah" akan membuat akurasi evaluasi fasilitas menjadi bias tinggi (false positive).

### D3: Penggunaan Kamus Leksikon Resmi GitHub + Domain-Specific Terms
- **Pilihan**: Mengadopsi `colloquial-indonesian-lexicon.csv` (Salsabila et al., Fasilkom UI) digabung dengan leksikon domain lokal TNGC (`runtah`, `ngelekeb`, `simaksi`, `tektok`, `bagas`).
- **Justifikasi**: Menjamin standardisasi ilmiah yang dapat dirujuk dalam publikasi jurnal akademik, sekaligus mempertahankan konteks kearifan lokal Sunda.

### D4: Penanganan Imbalance Menggunakan SMOTE pada Data Latih Saja
- **Pilihan**: Resampling sintetis minoritas (komplain negatif) menggunakan SMOTE hanya setelah train-test split (fit on train only).
- **Justifikasi**: Mencegah data leakage fatal yang sering terjadi pada riset NLP pemula, sekaligus meningkatkan sensitivitas (recall) model terhadap keluhan pengunjung.

### D5: Matriks Rekomendasi Solusi Tiga Horizon
- **Pilihan**: Menghasilkan rekomendasi:
  - *Jangka Pendek (< 3 bulan)*: Perbaikan SOP kebersihan, pasokan sabun/trash bag, transparansi tarif.
  - *Jangka Menengah (3 - 12 bulan)*: Pipanisasi air bersih, perbaikan plang jalur, standarisasi transportasi ojek/bak.
  - *Jangka Panjang (> 1 tahun)*: Pembangunan eco-toilet ketinggian, smart gate e-KTP, sistem deposit sampah digital.
- **Justifikasi**: Menjawab kebutuhan praktis stakeholder pengelola TNGC dalam perencanaan anggaran tahunan.

---

## 3. Status Evaluasi & Risiko
- **Risiko**: Komplain baru dengan bahasa metaforis/sarkastis yang tidak tercakup dalam leksikon.
- **Mitigasi**: Tahap lanjutan akan mengevaluasi transformer IndoBERT pre-trained untuk menangkap pemahaman semantik mendalam.
