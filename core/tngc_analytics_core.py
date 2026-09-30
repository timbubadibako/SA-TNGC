"""
Core NLP and Machine Learning Module for TNGC Aspect-Based Sentiment Analysis.
Standardized, reproducible, and zero-leakage pipeline for academic research.
"""

import re
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from imblearn.over_sampling import SMOTE

from lexicon_loader import normalize_text_github

# 1. Aspek Operasional & Fasilitas Evaluasi Pengelola Balai TNGC
ASPECT_LEXICON: Dict[str, List[str]] = {
    "aspek_toilet_sanitasi": ["toilet", "kamar mandi", "wc", "air", "mck", "pesing", "kran", "gayung"],
    "aspek_sampah_kebersihan": ["sampah", "kebersihan", "kotor", "plastik", "runtah", "puntung"],
    "aspek_pelayanan_ranger": ["petugas", "simaksi", "ranger", "briefing", "antre", "loket", "registrasi", "cs", "whatsapp", "ramah", "jutek"],
    "aspek_jalur_trek": ["trek", "jalur", "tanjakan", "plang", "tali", "licin", "berdebu", "batu", "curam", "jalan"],
    "aspek_biaya_logistik": ["tiket", "htm", "biaya", "parkir", "harga", "warung", "porter", "ojek", "transportasi", "carter", "mahal", "pungli"]
}

# 2. Filter Regex untuk Eliminasi Ulasan Estetika Alam Murni (Non-capturing group)
FACILITY_REGEX_FILTER = r'(?i)\b(?:toilet|kamar mandi|wc|air|shelter|pos|camp|basecamp|sampah|mushola|kebersihan|fasilitas|mck|listrik|warung|parkir|biaya|tiket|htm|petugas|simaksi|ranger|briefing|ojek|porter|jalan|tali|plang|jalur|trek|transportasi|angkutan|harga|carter|pungli|batu|licin)\b'


def filter_facility_reviews(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Memisahkan ulasan fasilitas & manajerial dari ulasan estetika alam murni.
    Mengembalikan tuple (df_facility, df_nature).
    """
    mask = df["review_text"].str.contains(FACILITY_REGEX_FILTER, na=False)
    df_facility = df[mask].copy().reset_index(drop=True)
    df_nature = df[~mask].copy().reset_index(drop=True)
    return df_facility, df_nature


def preprocess_corpus(df: pd.DataFrame) -> pd.DataFrame:
    """
    Membersihkan teks ulasan dan menerapkan normalisasi kamus resmi + istilah lokal Sunda/pendaki.
    Menambahkan tagging binary indicator untuk masing-masing aspek operasional.
    """
    df_out = df.copy()
    df_out["clean_text"] = df_out["review_text"].apply(normalize_text_github)
    
    # Tagging deteksi aspek biner
    for asp, keywords in ASPECT_LEXICON.items():
        pattern = r'\b(?:' + '|'.join(keywords) + r')\b'
        df_out[asp] = df_out["clean_text"].str.contains(pattern, regex=True).astype(int)
        
    return df_out


def train_benchmark_models(
    X_train_text: pd.Series, 
    y_train: pd.Series, 
    X_test_text: pd.Series, 
    y_test: pd.Series,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Melatih Linear SVM, Logistic Regression, dan Random Forest dengan evaluasi ketat zero data-leakage.
    1. TF-IDF di-fit HANYA pada X_train_text, lalu transform ke X_test_text.
    2. SMOTE over-sampling diterapkan HANYA pada X_train_vec.
    3. Model dievaluasi menggunakan macro-averaged F1 score dan Confusion Matrix pada X_test_vec asli.
    """
    vectorizer = TfidfVectorizer(max_features=2500, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)
    
    min_k = max(1, min(2, y_train.value_counts().min() - 1))
    smote = SMOTE(random_state=random_state, k_neighbors=min_k)
    X_train_res, y_train_res = smote.fit_resample(X_train_vec, y_train)
    
    models = {
        "Logistic Regression": LogisticRegression(random_state=random_state, max_iter=1000),
        "Linear SVM": LinearSVC(random_state=random_state, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=random_state)
    }
    
    results = {}
    for name, model in models.items():
        model.fit(X_train_res, y_train_res)
        preds = model.predict(X_test_vec)
        macro_f1 = f1_score(y_test, preds, average="macro", zero_division=0)
        report = classification_report(y_test, preds, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, preds, labels=np.unique(y_test))
        results[name] = {
            "model": model,
            "macro_f1": macro_f1,
            "report": report,
            "confusion_matrix": cm,
            "predictions": preds
        }
        
    return {
        "vectorizer": vectorizer,
        "models": results,
        "classes": np.unique(y_test),
        "X_train_res_shape": X_train_res.shape,
        "y_train_res_dist": y_train_res.value_counts().to_dict()
    }
