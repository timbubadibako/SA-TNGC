"""
Modul Normalisasi Teks Menggunakan Kamus Resmi Standar Akademik dari GitHub:
1. colloquial-indonesian-lexicon.csv (Kamus Alay Salsabila et al., CSUI - 15.000+ kata)
2. InSet Lexicon (Fajri Koto et al. - Lexicon Sentimen Indonesia)
3. Custom Mountain & TNGC Domain Terms (simaksi, bagas, tektok, runtah, dll.)
"""

import os
import re
import pandas as pd
from typing import Dict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEXICON_FILE = os.path.join(BASE_DIR, "data", "lexicon", "colloquial-indonesian-lexicon.csv")

# Domain-specific Ciremai & hiking terms yang melengkapi kamus umum
TNGC_DOMAIN_TERMS = {
    "runtah": "sampah",
    "pesing": "kotor bau",
    "ngelekeb": "pengap",
    "tiris": "dingin",
    "hareudang": "gerah",
    "leueur": "licin",
    "becek": "berlumpur",
    "simaksi": "izin pendakian registrasi",
    "tektok": "pendakian cepat",
    "bagas": "babi hutan",
    "bc": "basecamp",
    "basecamp": "pos registrasi",
    "pos bayangan": "shelter",
    "ranger": "petugas",
    "pungli": "biaya liar",
    "overprice": "terlalu mahal",
    "slow respon": "pelayanan lambat",
    "jutek": "tidak ramah"
}

def load_master_slang_dict() -> Dict[str, str]:
    master_dict = {}
    
    # 1. Load dari GitHub colloquial-indonesian-lexicon
    if os.path.exists(LEXICON_FILE):
        try:
            df_lex = pd.read_csv(LEXICON_FILE)
            for _, row in df_lex.iterrows():
                slang = str(row['slang']).strip().lower()
                formal = str(row['formal']).strip().lower()
                if slang and formal and slang != 'nan' and formal != 'nan':
                    master_dict[slang] = formal
        except Exception as e:
            print(f"Warning load lexicon: {e}")
            
    # 2. Timpa dengan domain spesifik TNGC
    master_dict.update(TNGC_DOMAIN_TERMS)
    return master_dict

SLANG_DICTIONARY = load_master_slang_dict()

def normalize_text_github(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"[^\w\s]", " ", text)
    words = text.split()
    normalized = [SLANG_DICTIONARY.get(w, w) for w in words]
    return " ".join(normalized).strip()
