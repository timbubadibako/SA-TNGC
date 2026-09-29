import fs from 'fs';
import { paginateReviews } from "google-maps-review-scraper/dist/utils.js";
import { createClient } from "google-maps-review-scraper/dist/client.js";
import { SortEnum } from "google-maps-review-scraper/dist/types.js";

// DAFTAR 12 DESTINASI & BASECAMP RESMI BALAI TNGC DENGAN PLACE_ID HEX TERVERIFIKASI
const TNGC_OFFICIAL_POIS = [
  {
    name: "Taman Nasional Gunung Ciremai (Pusat Balai TNGC)",
    place_id: "0x2e6f3d455552df21:0xb2853e1d35351916",
    category: "Pusat Balai TNGC"
  },
  {
    name: "Basecamp Pendakian Jalur Palutungan & Apuy",
    place_id: "0x2e6f3cdceebd1f5d:0x11b16d616a8ca38c",
    category: "Jalur Pendakian & Basecamp"
  },
  {
    name: "Basecamp Pendakian Jalur Linggarjati",
    place_id: "0x2e6f18316645f6bd:0x9d198da42fa0a3a0",
    category: "Jalur Pendakian & Basecamp"
  },
  {
    name: "Basecamp Pendakian Jalur Linggasana",
    place_id: "0x2e6f182f7c4d7109:0x9fa683ee63b9daaa",
    category: "Jalur Pendakian & Basecamp"
  },
  {
    name: "Jalur Pendakian Trisakti Sadarehe",
    place_id: "0x2e6f238aeebc3e61:0xf7cddc52ad2d5908",
    category: "Jalur Pendakian & Basecamp"
  },
  {
    name: "Curug Putri Palutungan",
    place_id: "0x2e6f1725d98354e5:0x864a2e9711a52259",
    category: "Wisata Alam & Buper TNGC"
  },
  {
    name: "Lembah Cilengkrang",
    place_id: "0x2e6f17d297b6da1d:0xf46ec450342a4929",
    category: "Wisata Alam & Pemandian TNGC"
  },
  {
    name: "Bumi Perkemahan Tenjo Laut",
    place_id: "0x2e6f3d8344727537:0xf1778b00fdeed6a",
    category: "Bumi Perkemahan TNGC"
  },
  {
    name: "Bumi Perkemahan Ipukan",
    place_id: "0x2e6f162b4742689f:0xac2ba55af5f11e9b",
    category: "Bumi Perkemahan TNGC"
  },
  {
    name: "Curug Cipeuteuy Majalengka",
    place_id: "0x2e69d5a955555555:0x3c59b225b45ead8c",
    category: "Wisata Alam & Buper TNGC"
  },
  {
    name: "Situ Sangiang Majalengka",
    place_id: "0x2e6f3c877d357923:0x2d64f6c6536afd1e",
    category: "Wisata Alam & Cagar Budaya TNGC"
  },
  {
    name: "Woodland Kuningan",
    place_id: "0x2e6f194b687799ad:0x4b26178dac2b9930",
    category: "Wisata Pinus Mitra TNGC"
  }
];

const OUTPUT_CSV = "tngc_official_multitarget_reviews.csv";

function cleanReviewText(text) {
  if (!text) return "";
  return String(text)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/"/g, '""')
    .replace(/\r?\n|\r/g, ' ')
    .trim();
}

async function scrapeAll() {
  console.log("==================================================================");
  console.log("🚀 SCRAPING MULTI-TARGET RESMI BALAI TNGC (RPC CLIENT)");
  console.log(`📍 Total Target: ${TNGC_OFFICIAL_POIS.length} Objek Wisata & Basecamp Resmi`);
  console.log("==================================================================\n");

  const client = createClient({ proxy: {} });
  const allReviewsMap = new Map();
  const sortTypes = [
    { name: "lowest_rating", enumVal: SortEnum.lowest_rating },
    { name: "relevant", enumVal: SortEnum.relevant },
    { name: "newest", enumVal: SortEnum.newest }
  ];

  for (const poi of TNGC_OFFICIAL_POIS) {
    console.log(`\n------------------------------------------------------`);
    console.log(`📌 [ODTWA TNGC] ${poi.name} (${poi.category})`);
    console.log(`🔑 Place ID: ${poi.place_id}`);
    console.log(`------------------------------------------------------`);

    for (const sortItem of sortTypes) {
      try {
        process.stdout.write(`  -> Tarik ulasan sort '${sortItem.name}'... `);
        const res = await paginateReviews({
          placeId: poi.place_id,
          sortOrder: sortItem.enumVal,
          pages: 15, // Tarik hingga 15 halaman (~150 ulasan) per sort type
          clean: true,
          client
        });

        let added = 0;
        if (Array.isArray(res)) {
          res.forEach(item => {
            const text = cleanReviewText(item.review?.text);
            const key = `${poi.name}_${item.review_id || Math.random()}`;
            if (text.length >= 8 && !allReviewsMap.has(key)) {
              allReviewsMap.set(key, {
                poi_name: poi.name,
                category: poi.category,
                rating: item.review?.rating || 5,
                text: text,
                published_at: item.review?.published_at_date || ""
              });
              added++;
            }
          });
        }
        console.log(`OK! (+${added} teks ulasan baru) [Total pool: ${allReviewsMap.size}]`);
      } catch (err) {
        console.log(`SKIP (${err.message})`);
      }
    }
  }

  console.log(`\n==================================================================`);
  console.log(`🎉 SCRAPING SELESAI! Total ulasan unik berteks: ${allReviewsMap.size}`);
  console.log(`==================================================================`);

  if (allReviewsMap.size === 0) {
    console.error("❌ GAGAL: Tidak ada ulasan yang ditarik.");
    return;
  }

  const header = "review_id,poi_name,category,rating,review_text,published_at,sentiment\n";
  const rows = [];
  let id = 1;

  for (const [_, item] of allReviewsMap.entries()) {
    const sentiment = item.rating >= 4 ? "positif" : (item.rating === 3 ? "netral" : "negatif");
    rows.push(`${id},"${item.poi_name}","${item.category}",${item.rating},"${item.text}","${item.published_at}",${sentiment}`);
    id++;
  }

  fs.writeFileSync(OUTPUT_CSV, header + rows.join("\n"), "utf-8");
  console.log(`💾 File dataset resmi tersimpan di: ${OUTPUT_CSV}`);
}

scrapeAll();
