# PANDUAN TANYA JAWAB SIDANG SKRIPSI (DEFENSE CHEAT-SHEET)
**Topik**: Analisis Sentimen Berbasis Aspek (ABSA) Wisata Taman Nasional Gunung Ciremai  
**Catatan**: Dokumen ini merangkum pertanyaan tajam dosen penguji seputar Machine Learning, Python, dan metodologi, beserta jawaban teoritis yang tepat.

---

### Q1: "Mengapa Anda memfilter ulasan alam dan menyisakan ulasan fasilitas saja? Apakah itu tidak membuang data (bias)?"
**Jawaban Ilmiah**:
> *"Bukan membuang data, melainkan membatasi scope masalah (problem boundary) agar actionable bagi pihak manajerial. Di Google Maps objek wisata alam, ulasan didominasi oleh pujian pemandangan ('bagus', 'indah', 'sunrise mantap') yang sifatnya anugerah alam dan tidak bisa diubah pengelola. Jika ulasan tersebut dimasukkan, sentimen positif semu (>85%) menenggelamkan keluhan kritis seperti toilet kotor atau pungli ojek. Filter fasilitas menyaring 1.136 ulasan yang secara empiris memuat entitas operasional yang bisa dievaluasi Balai TNGC."*

---

### Q2: "Mengapa Anda menggunakan SMOTE? Dan di mana posisi SMOTE dalam kode Anda?"
**Jawaban Ilmiah**:
> *"Ulasan komplain pengunjung berjumlah jauh lebih sedikit dibanding ulasan puas (class imbalance: positif ~80%, negatif ~10%). Tanpa penyeimbangan, model akan terkena Majority Bias (akurasi tinggi tapi recall untuk keluhan bernilai 0).  
> **Posisi penting**: SMOTE hanya diterapkan pada **`X_train_res`**, setelah data dipecah dengan `train_test_split`. Data uji (`X_test`) dibiarkan murni tanpa over-sampling agar tidak terjadi **Data Leakage** dan hasil uji mencerminkan kondisi lapangan asli."*

---

### Q3: "Bagaimana Anda membuktikan bahwa tidak terjadi Data Leakage pada TF-IDF?"
**Jawaban Ilmiah**:
> *"Pada file `core/tngc_analytics_core.py`, fungsi `vectorizer.fit_transform()` hanya dipanggil pada `X_train`. Untuk data uji, kami hanya memanggil `vectorizer.transform(X_test)`. Dengan cara ini, vocabulary dictionary dan inverse document frequency dihitung murni dari data latih, tanpa pernah 'melihat' distribusi kata di data uji sebelumnya."*

---

### Q4: "Mengapa Anda menggunakan Macro F1-Score sebagai metrik utama, bukan Akurasi?"
**Jawaban Ilmiah**:
> *"Karena terjadi Accuracy Paradox. Jika sebuah dataset memiliki 90 ulasan positif dan 10 negatif, model yang menebak semua positif akan mendapat akurasi 90%, padahal gagal mendeteksi 100% keluhan negatif. Macro F1-score menghitung rata-rata F1 per kelas dengan bobot setara, sehingga performa pada kelas minoritas (keluhan) dinilai sama pentingnya dengan kelas mayoritas."*

---

### Q5: "Mengapa Anda membandingkan Linear SVM dengan IndoBERT?"
**Jawaban Ilmiah**:
> *"Linear SVM mewakili algoritma Machine Learning klasik berbasis representasi Sparse BoW/TF-IDF yang sangat efisien secara komputasi dan interpretable. Sedangkan IndoBERT (Indonesian BERT) mewakili Deep Learning berbasis Transformer yang mampu menangkap semantic context dua arah (bidirectional attention), susunan kata, serta negasi bertingkat (contoh: 'tidak ramah' vs 'ramah'). Komparasi ini membuktikan sejauh mana peningkatan performa kontekstual dibanding beban komputasi model."*

---

### Q6: "Bagaimana cara Anda melabeli ground truth sentimen ulasan?"
**Jawaban Ilmiah**:
> *"Label awal diturunkan secara semi-supervised dari rating bintang resmi Google Maps pengguna:
> - Rating 1 & 2: Sentimen **Negatif** (Komplain)
> - Rating 3: Sentimen **Netral** (Evaluasi imbang)
> - Rating 4 & 5: Sentimen **Positif** (Apresiasi)
> Lalu dilakukan verifikasi leksikon polaritas ulasan teks untuk memastikan konsistensi antara teks review dan bintang yang diberikan."*

---

### Q7: "Mengapa rekomendasi kebijakan tidak di-hardcode dengan rumus if-else saja di skripsi Anda?"
**Jawaban Ilmiah**:
> *"Pendekatan Rule-Based statis (seperti matriks if-else kaku) tidak adaptif terhadap nuansa konteks keluhan yang spesifik di setiap jalur. Oleh karena itu, arsitektur skripsi ini dirancang modular: Machine Learning bertugas mengekstraksi fakta ulasan secara terukur (Pure ABSA), sedangkan perumusan saran tindakan operasional didelegasikan ke model penalaran bahasa (LLM) dengan prompt contract terstandar saat terhubung ke API."*

---

### Q8: "Apa kontribusi kamus slang Sunda dan pendaki yang Anda buat di `kamus_slang_tngc.py`?"
**Jawaban Ilmiah**:
> *"Bahasa ulasan pendakian didominasi kosakata non-formal dan bahasa daerah Jawa Barat, seperti 'runtah' (sampah), 'leueur' (licin), 'tiris' (dingin), 'simaksi' (surat izin masuk), hingga istilah lokal 'tanjakan asoy'. Jika langsung menggunakan tokenizer baku Bahasa Indonesia, kata-kata ini akan terbuang sebagai Out-Of-Vocabulary (OOV). Kamus leksikon lokal menormalisasi kata-kata tersebut ke bentuk baku sebelum masuk proses ekstraksi fitur TF-IDF."*
