# PRD: Next.js Sentiment Arena & ABSA Web Studio
- **Author / Date**: SDLC Engine / 2026-09-30
- **Status**: Approved

## 1. Problem Statement & Objectives
Menggantikan antarmuka static HTML dan prototype Streamlit dengan aplikasi Next.js (App Router, Tailwind CSS, TypeScript) yang scalable, tervalidasi fungsinya, dan mengadopsi desain sistem `Sentiment Arena` persis (plek ketiplek). Panel kanan menampilkan integrasi status LLM yang bersih (tanpa raw JSON mentah), dengan call-to-action "Hubungkan API LLM" dan error handler 503 jika belum terkoneksi.

## 2. User Personas & User Stories
- **Sebagai**: Pengelola Balai TNGC & Peneliti Wisata Gunung Ciremai.
- **Saya ingin**: Melihat dashboard interaktif visualisasi polaritas ulasan per 5 aspek operasional (Sanitasi, Logistik, Jalur, Petugas, Sampah) serta berpindah antara mode stacked bar dan breakdown.
- **Agar**: Dapat memetakan prioritas perbaikan fasilitas dan menghubungkan mesin penalaran LLM untuk rekomendasi short-term/long-term.

## 3. Functional Scope
- [x] In Scope:
  - Setup Next.js (App Router + Tailwind + TypeScript) di folder `fe/`.
  - Halaman utama persis desain sistem `Sentiment Arena by TNGC.ID` (Space Mono, ticker sentimen, border tegas monokrom, bar chart polaritas aspek ulasan).
  - Selector filter view (`BAR POLARITAS` / `BREAKDOWN`) yang tervalidasi dan interaktif.
  - Tab preview rekomendasi `SHORT-TERM` vs `LONG-TERM`.
  - Pembersihan raw JSON, diganti modal dialog & panel status koneksi "Hubungkan API LLM".
- [x] Out of Scope:
  - Mock recommendations (dilarang mock).
  - Library eksternal berlebih (Ponytail principle: Tailwind + Chart.js / lightweight canvas).

## 4. Non-Functional Requirements (NFR)
- Zero-bloat, build lolos tanpa error type TypeScript, responsive desktop-first.

## 5. Acceptance Criteria
- [x] Next.js build sukses (`npm run build`).
- [x] UI identik 100% dengan estetika `index.html`.
- [x] Chart aspek interaktif dan filter view berfungsi.
- [x] Raw JSON tereliminasi, digantikan panel konfigurasi/koneksi API LLM.
