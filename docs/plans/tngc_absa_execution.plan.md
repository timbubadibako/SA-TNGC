# Rencana Eksekusi Riset: ABSA & Policy Recommendation TNGC

Target: Publikasi Ilmiah / Laporan Komprehensif Balai Taman Nasional Gunung Ciremai (TNGC).

---

## 🎯 Status Saat Ini
- [x] Scraping multi-target 12 POI resmi TNGC (2.216 ulasan asli).
- [x] Integrasi kamus resmi GitHub (`colloquial-indonesian-lexicon`) + istilah lokal Sunda/TNGC.
- [x] Streamlit dashboard eksploratif (`app_dashboard.py`).
- [x] Filter eliminasi ulasan estetika alam murni & skema SMOTE.

---

## 📋 Road Map Langkah Selanjutnya

### Tahap 1: Sinkronisasi Dataset Multi-Target ke Jupyter Notebook (`tngc_absa_analysis.ipynb`)
- [ ] Ganti sumber data notebook dari single-target (`tngc_reviews_raw.csv`) ke multi-target (`tngc_official_multitarget_reviews.csv`).
- [ ] Integrasikan `lexicon_loader.py` ke dalam pipeline preprocessing notebook.
- [ ] Visualisasikan sebaran keluhan per masing-masing Basecamp (Palutungan vs Apuy vs Linggarjati vs Sadarehe vs Linggasana) dan per ODTWA.

### Tahap 2: Benchmarking Model Machine Learning & SMOTE Optimization
- [ ] Terapkan SMOTE pada data train berfitur TF-IDF (1-2 gram).
- [ ] Komparasikan 3 algoritma klasifikasi standar jurnal:
  - **Support Vector Machine (Linear SVM)**
  - **Logistic Regression**
  - **Random Forest**
- [ ] Evaluasi komprehensif: Classification Report (Macro Precision, Macro Recall, Macro F1-score) + Confusion Matrix.

### Tahap 3: Eksperimen Deep Learning (Fine-Tuning IndoBERT / IndoRoBERTa)
- [ ] Gunakan GPU RTX 3050 Laptop untuk fine-tuning model pre-trained Bahasa Indonesia (`indobenchmark/indobert-base-p1`).
- [ ] Uji apakah IndoBERT mengungguli model klasik pada sentimen multi-aspek yang mengandung sarkasme dan konteks panjang.

### Tahap 4: Finalisasi Action Plan Berjenjang Berbasis Data Riil
- [ ] Ekstrak daftar keluhan paling krusial per POI (contoh: Toilet Apuy vs Akses jalan Sadarehe vs Sound system Tenjo Laut).
- [ ] Format matriks rekomendasi kebijakan:
  - **Jangka Pendek (< 3 Bulan)**: Quick-wins operasional lapangan.
  - **Jangka Menengah (3 - 12 Bulan)**: Perbaikan infrastruktur pipa air & tata kelola transportasi.
  - **Jangka Panjang (> 1 Tahun)**: Eco-toilet ketinggian, smart gate e-KTP, sistem jaminan sampah digital.
- [ ] Export hasil akhir ke CSV/Excel untuk lampiran naskah/laporan.
