# ADR: Next.js App Router for ABSA Web Studio
- **Date**: 2026-09-30
- **Status**: Accepted

## Context
Aplikasi dashboard memerlukan rendering cepat, modularitas komponen, kemudahan integrasi API route LLM di masa depan, dan reproduksi desain 100% identik dengan estetika monokrom editorial `index.html`.

## Decision
1. Inisialisasi Next.js App Router di direktori `fe/` menggunakan TypeScript dan Tailwind CSS.
2. Porting komponen visual `index.html` menjadi komponen React client (`'use client'`) dengan rendering Chart.js native.
3. Hapus preview raw JSON mentah dari sidebar sesuai instruksi user, gantikan dengan interface status koneksi LLM yang rapi dan tombol "HUBUNGKAN API LLM".

## Trade-offs & Consequences
- **Pros**: Ekosistem siap integrasi API route LLM server-side, zero layout drift, modular.
- **Cons & Mitigations**: Bundle JavaScript lebih besar dari static HTML mentah, dimitigasi dengan Ponytail mindset (tanpa library UI berlebih, murni Tailwind CSS + Chart.js).
