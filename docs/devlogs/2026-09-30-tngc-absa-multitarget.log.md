# Dev Log: Aspect-Based Sentiment Analysis (ABSA) & Multi-Target TNGC
- **Date**: 2026-09-30
- **Engineer**: Syifa Pajril Yaum & Antigravity AI
- **Domain**: Riset Analisis Sentimen Ulasan Pengunjung Taman Nasional Gunung Ciremai (TNGC)
- **Environment**: `nlp-env` (Python 3.10) + Git Bash + CUDA Support

---

## 📌 Rekap Aktivitas & Milestone yang Telah Diselesaikan
1. **Pembersihan & Refactoring Workspace**:
   - Menghapus artefak project lama (Strava).
   - Inisialisasi tooling efisiensi kode: `codegraph init` (72 nodes terindeks) dan `rtk init`.

2. **Pengadaan Dataset Asli Multi-Target Google Maps (2.216 Ulasan)**:
   - Membuat script scraper berbasis internal Google Maps endpoint (`scrape_tngc_multitarget.mjs`).
   - Berhasil mengambil data ulasan terverifikasi dari 12 POI resmi Balai TNGC (Basecamp Palutungan, Apuy, Linggarjati, Linggasana, Sadarehe, Curug Putri, Lembah Cilengkrang, Buper Tenjo Laut, Buper Ipukan, Curug Cipeuteuy, Situ Sangiang, Woodland).
   - Tersimpan rapi di `tngc_official_multitarget_reviews.csv`.

3. **Integrasi Kamus Bahasa Resmi Standar NLP (GitHub) & Dialek Lokal**:
   - Mengunduh `colloquial-indonesian-lexicon.csv` (Kamus Alay Fasilkom UI - Salsabila et al., 15.000+ kata gaul/slang).
   - Mengunduh `inset_positive.tsv` & `inset_negative.tsv` (InSet Sentiment Lexicon - Koto et al.).
   - Menambahkan leksikon spesifik TNGC & Sunda (`runtah`, `ngelekeb`, `leueur`, `simaksi`, `tektok`, `bagas`, dll.) di `lexicon_loader.py`.

4. **Pengembangan Streamlit Interactive Dashboard**:
   - Berhasil membangun `app_dashboard.py` dengan 5 tab interaktif: Distribusi Data, Bedah Aspek ABSA, Action Plan Solusi Berjenjang, Kamus Slang Explorer, dan Data Table.
   - Mengatasi error eksekusi path Windows di Git Bash (`/c/Users/seeva/...`).

5. **Pondasi Notebook Analisis & SMOTE**:
   - Menyediakan `tngc_absa_analysis.ipynb` dengan filter eliminasi ulasan alam murni dan penanganan data imbalance dengan SMOTE.

---

## 🔍 Log Validasi Data Terkini
- **Total Ulasan Multi-Target**: 2.216 ulasan asli.
- **Top POI Volume**: Woodland Kuningan (257), Lembah Cilengkrang (248), Buper Ipukan (247), Curug Cipeuteuy (242), Curug Putri Palutungan (241).
- **Aspek Teridentifikasi**:
  - Fasilitas & Sanitasi (Toilet, air, mushola)
  - Sampah & Kebersihan (Runtah, penumpukan plastik di camp)
  - Pelayanan & Petugas (Sikap CS WhatsApp/loket basecamp, registrasi)
  - Jalur & Trek (Akses jalan rusak, tanjakan terjal, plang penunjuk)
  - Biaya & Logistik (Tiket, parkir, carter angkutan Sadarehe)
