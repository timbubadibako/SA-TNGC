# METODOLOGI PENELITIAN & SPESIFIKASI ALGORITMA SKRIPSI
**Judul Penelitian**: Analisis Sentimen Berbasis Aspek (Aspect-Based Sentiment Analysis / ABSA) Ulasan Pengunjung Taman Nasional Gunung Ciremai Menggunakan Machine Learning dan Deep Learning  
**Studi Kasus**: Balai Taman Nasional Gunung Ciremai (TNGC), Jawa Barat  
**Dataset**: 2.216 Ulasan Google Maps dari 12 Objek Daya Tarik Wisata Alam (ODTWA) & Jalur Pendakian Resmi  

---

## 1. Landasan Masalah & Hipotesis Ilmiah

### A. Problem Statement
Sebagian besar ulasan ulasan wisata alam di Google Maps didominasi oleh kekaguman estetika alam murni (contoh: *"pemandangan bagus sekali"*, *"sunrise indah"*). Jika ulasan ini langsung diklasifikasikan secara umum:
1. **Bias Kepuasan Palsu**: Sentimen positif mencapai >85%, menutupi keluhan riil fasilitas.
2. **Ketiadaan Nilai Aksi**: Pengelola TNGC tidak bisa memperbaiki kondisi toilet, sampah, atau pungli ojek karena tertimbun ulasan pemandangan alam.

### B. Solusi Metodologis: Two-Stage Filtering + ABSA
1. **Stage 1 (Operational & Facility Filtering)**: Memisahkan ulasan fasilitas fisik & manajerial dari pujian alam murni menggunakan leksikon fasilitas komprehensif. Dari 2.216 ulasan, didapatkan **1.136 ulasan fasilitas** dan **1.080 ulasan alam murni** yang dieliminasi.
2. **Stage 2 (Aspect-Based Sentiment Extraction)**: Mengekstraksi 5 domain aspek operasional utama:
   - `Fasilitas Sanitasi` (Toilet, MCK, ketersediaan air).
   - `Biaya & Logistik` (Tiket SIMAKSI, retribusi parkir, tarif ojek transit, warung).
   - `Jalur & Trek` (Kondisi tanjakan, tali pegangan, plang kilometer, erosi bebatuan).
   - `Pelayanan Petugas` (Keramahan ranger loket, briefing keselamatan, CS booking online).
   - `Sampah & Kebersihan` (Pilah sampah, puntung rokok, timbulan sampah shelter).

---

## 2. Pipeline Pemrosesan Teks (Preprocessing NLP)

Setiap ulasan melewati tahapan formal:
1. **Case Folding & Punctuation Cleaning**: Mengubah teks ke huruf kecil dan menghapus simbol non-alfanumerik.
2. **Normalisasi Kata Bahasa Gaul (Colloquial Normalization)**:
   - Menggunakan korpus leksikon 15.000+ kata singkatan/slang Indonesia resmi (GitHub colloquial lexicon).
   - Contoh: `yg` -> `yang`, `bgt` -> `banget`, `gak` -> `tidak`, `dgn` -> `dengan`.
3. **Kamus Istilah Lokal & Sunda (Domain-Specific Normalization)**:
   - Mentransformasi istilah lokal pendakian Ciremai:
     - `runtah` -> `sampah`
     - `tiris` -> `dingin`
     - `leueur` -> `licin`
     - `tanjakan PHP` -> `tanjakan curam panjang`
     - `simaksi` -> `surat izin masuk kawasan konservasi`
     - `asoy` -> `nyaman`
4. **TF-IDF Vectorization**:
   - Rentang n-gram: Unigram & Bigram `(1, 2)`.
   - Max features: 2.500 term penting.
   - **Prinsip Bebas Kebocoran Data (Zero Data-Leakage)**: `vectorizer.fit_transform()` hanya dijalankan pada data latih (`X_train`), dan `vectorizer.transform()` pada data uji (`X_test`).

---

## 3. Penanganan Ketimpangan Kelas (Class Imbalance) via SMOTE

### A. Masalah Imbalance
Distribusi kelas sentimen pada ulasan fasilitas mengalami ketimpangan alami:
- Positif: Mayoritas (~80%)
- Negatif (Keluhan): Minoritas (~10%)
- Netral: Minoritas (~10%)

Jika dilatih langsung, model klasikal akan mengalami *majority bias* (selalu menebak positif dan gagal mendeteksi komplain pengunjung).

### B. SMOTE (Synthetic Minority Over-sampling Technique)
- SMOTE melakukan interpolasi sintetis fitur numerik TF-IDF di antara sampel minoritas terdekat (*k-nearest neighbors*):
  $$\vec{x}_{new} = \vec{x}_i + \lambda (\vec{x}_{zi} - \vec{x}_i), \quad \lambda \sim U(0, 1)$$
- **Protokol Validasi Ilmiah**: SMOTE hanya diterapkan pada `X_train_vec`, **dilarang keras** diterapkan pada `X_test_vec` agar metrik evaluasi mencerminkan performa pada data dunia nyata asli.

---

## 4. Evaluasi Model Komparasi (Benchmark)

### A. Linear Support Vector Machine (Linear SVM)
- Memaksimalkan margin pemisah hyperplane antar-kelas sentimen:
  $$\min_{\mathbf{w}, b, \xi} \frac{1}{2} \|\mathbf{w}\|^2 + C \sum_{i=1}^N \xi_i$$
- Diberi pembobotan `class_weight='balanced'` untuk memperkuat penalti salah klasifikasi kelas minoritas keluhan.

### B. Deep Learning: IndoBERT Fine-Tuning (`indobenchmark/indobert-base-p1`)
- Arsitektur Transformer kontekstual 12 layer bertipe *self-attention*:
  $$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$
- Mampu memahami ambiguitas sarkasme atau konteks ganda bahasa Indonesia yang luput dari model n-gram TF-IDF.

---

## 5. Metrik Keberhasilan Penelitian
Karena data imbalanced, metrik utama yang digunakan adalah **Macro-Averaged F1-Score**:
$$\text{F1}_{\text{macro}} = \frac{1}{|C|} \sum_{c \in C} \frac{2 \cdot \text{Precision}_c \cdot \text{Recall}_c}{\text{Precision}_c + \text{Recall}_c}$$
Akurasi mentah (Accuracy) tidak dijadikan patokan tunggal karena dapat menipu (*accuracy paradox*) pada data ulasan yang timpang.
