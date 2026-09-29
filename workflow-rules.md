# Workflow Rules & Research Guidelines
## Project: ABSA Taman Nasional Gunung Ciremai (TNGC)

Pedoman standar riset & pengolahan data ABSA TNGC:

## 1. Reproducibility & Random Seed
- Gunakan `random_state=42` pada pembagian data (`train_test_split`) dan inisialisasi model ML (SVM, Logistic Regression, dll.).
- Rasio standar: **80% Training Data, 20% Testing Data** (atau Stratified K-Fold $k=5$).

## 2. Pencegahan Data Leakage
- Fitur TF-IDF Vectorizer wajib di-`fit` HANYA pada data Training (`fit_transform`), dan di-`transform` pada data Testing.
- Preprocessing & augmentasi/resampling hanya dilakukan pada data latih.

## 3. Metrik Evaluasi Komprehensif
- Laporkan evaluasi per-aspek dan multi-label: **Macro Precision, Macro Recall, Macro F1-Score**, serta Confusion Matrix / Classification Report.

## 4. Rekomendasi Solusi Berjenjang
- Setiap sentimen negatif per aspek wajib dipetakan ke rencana aksi:
  - **Jangka Pendek** (0 - 3 bulan)
  - **Jangka Menengah** (3 - 12 bulan)
  - **Jangka Panjang** (> 1 tahun)

## 5. Keamanan Data
- Anonimkan identitas reviewer (nama reviewer di-masking saat publikasi).
