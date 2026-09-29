# PRD: Aspect-Based Sentiment Analysis & Multi-Horizon Action Plan (TNGC)
- **Author / Date**: Syifa Pajril Yaum & Antigravity AI | 2026-09-30
- **Status**: Approved
- **Target Audience**: Balai Taman Nasional Gunung Ciremai (BTNGC), Peneliti NLP/Pariwisata, Pengunjung/Pendaki

---

## 1. Problem Statement & Objectives
### Problem Statement
Ulasan pengunjung Taman Nasional Gunung Ciremai (TNGC) di Google Maps didominasi oleh pujian estetika alam umum (pemandangan, sunrise, kawah) yang menenggelamkan keluhan-keluhan krusial operasional dan fasilitas fisik (toilet kotor, air kering di pos atas, penumpukan sampah, calo/tiket tidak transparan, dan trek rusak). Akibatnya, pengelola kesulitan memetakan akar masalah riil di tiap basecamp/ODTWA secara objektif.

### Objectives
1. Mengekstraksi dan memfilter ulasan dari 12 Objek Daya Tarik Wisata Alam (ODTWA) dan Basecamp resmi Balai TNGC.
2. Mengeliminasi ulasan estetika alam murni untuk memfokuskan analisis pada aspek fasilitas fisik dan tata kelola layanan.
3. Menormalkan teks ulasan multi-bahasa (slang Indonesia, singkatan, dialek Sunda, istilah teknis pendakian).
4. Mengklasifikasikan sentimen berbasis aspek (ABSA) menggunakan perbandingan model ML dan Deep Learning.
5. Menghasilkan sistem rekomendasi matriks kebijakan berjenjang: **Jangka Pendek (< 3 bulan)**, **Jangka Menengah (3 - 12 bulan)**, dan **Jangka Panjang (> 1 tahun)**.

---

## 2. User Personas & User Stories
- **Pengelola Balai TNGC / Kepala Resort**:
  - *As a* pengelola kawasan, *I want to* mengetahui sebaran keluhan fasilitas di masing-masing jalur (Palutungan, Apuy, Linggarjati, Linggasana, Sadarehe) dan ODTWA, *so that* anggaran pemeliharaan dapat dialokasikan secara presisi dan tepat sasaran.
- **Pendaki & Wisatawan Alam**:
  - *As a* pendaki, *I want to* suaraku mengenai kondisi MCK, air bersih, dan keselamatan jalur didengar oleh pihak berwenang, *so that* pengalaman pendakian menjadi lebih aman dan higienis.
- **Peneliti / Data Scientist**:
  - *As a* peneliti NLP, *I want to* menerapkan pipeline ABSA dengan normalisasi leksikon akademik dan penanganan class imbalance (SMOTE), *so that* hasil penelitian dapat dipertanggungjawabkan dalam publikasi ilmiah bereputasi (SINTA/Scopus).

---

## 3. Functional Scope
- [x] **Multi-Target Ingestion**: Scraping ulasan berbasis `place_id` resmi Google Maps dari 12 titik ODTWA/Basecamp.
- [x] **Noise Elimination**: Filter ulasan murni estetika alam menggunakan keyword regex & rule-based mask.
- [x] **Lexicon Normalization**: Integrasi Kamus Alay UI (15.000+ kata), InSet Sentiment, serta istilah lokal TNGC.
- [x] **Aspect Categorization**:
  1. *Fasilitas & Sanitasi* (Toilet, MCK, air bersih, shelter, mushola).
  2. *Sampah & Kebersihan* (Penumpukan plastik, sampah di camp, puntung rokok).
  3. *Pelayanan & Petugas* (Sikap petugas loket, CS WhatsApp, briefing ranger, pendaftaran).
  4. *Jalur & Trek* (Akses jalan basecamp, tanjakan terjal, plang penunjuk, tali pengaman).
  5. *Biaya & Logistik* (Tiket simaksi, asuransi, parkir liar, carter mobil Sadarehe, warung pos).
- [x] **Interactive Dashboard**: Antarmuka Streamlit multi-tab untuk eksplorasi data dan matriks kebijakan.
- [ ] **Model Benchmark**: Evaluasi komparatif SVM, Logistic Regression, Random Forest, dan IndoBERT.
- [ ] **Automated Action Plan Matrix Generator**: Pemetaan otomatis sentimen negatif ke rekomendasi berjenjang.

---

## 4. Non-Functional Requirements (NFR)
- **Zero Data Leakage**: Vectorizer dan teknik resampling (SMOTE) hanya di-fit pada data training (80%).
- **Reproducibility**: Penggunaan `random_state=42` di seluruh split dan inisialisasi model.
- **Latency & Usability**: Streamlit dashboard merespons interaksi filter dalam < 1 detik dengan caching.
- **Security & Privacy**: Masking nama reviewer asli pada publikasi publik sesuai etika privasi data.

---

## 5. Acceptance Criteria
- [x] Dataset multi-target terkumpul minimal > 2.000 ulasan riil (Tercapai: 2.216 ulasan).
- [ ] Model klasifikasi sentimen mencapai Macro F1-Score $\ge$ 70% pada data pengujian (holdout test).
- [ ] Setiap aspek negatif terpetakan ke 3 tingkatan solusi konkret (Jangka Pendek, Menengah, Panjang).
- [x] Seluruh alur eksperimen dapat dieksekusi secara mandiri dalam notebook `tngc_absa_analysis.ipynb`.
