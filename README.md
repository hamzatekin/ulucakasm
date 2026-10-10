# Kemalpaşa İbrahim-Hüsniye Özdurakoğlu Aile Sağlığı Merkezi

Resmi web sitesi. Hizmetler, kadro, iletişim ve bilgilendirici içerikler için hızlı, erişilebilir ve SEO odaklı bir Astro sitesi.

Canlı: https://ulucakasm.com

## İçerik
- Ana sayfa: hero, hizmetler, doktorlar, iletişim/harita, galeri
- Bilgilendirici sayfalar: Aşı Takvimi, Beslenme ve Obezite, Kişisel Veriler (KVKK), Erişilebilirlik Beyanı

## Teknoloji
- Astro 7
- Tailwind CSS v4
- TypeScript
- Google Maps JS API

## Performans (Lighthouse)
- 100 / 100 / 100 / 100 (Performance, Accessibility, Best Practices, SEO)
- Metrikler: FCP 1.5s, LCP 1.5s, TBT 0ms, CLS 0, Speed Index 1.9s
- Ölçüm: 22 Ocak 2026, Lighthouse 13.0.1, Moto G Power emülasyonu, Yavaş 4G

## Kurulum
Gereksinim: Node.js >= 22.12

```bash
pnpm install
pnpm dev
```

## Ortam Değişkenleri
Google Maps için API anahtarı gereklidir.

```bash
MAPS_API_KEY="YOUR_KEY"
```

## Yayınlama
Site, Cloudflare Workers üzerinde statik dosyalar olarak (Workers Static Assets) yayınlanır; ayarlar `wrangler.jsonc` ve `public/_headers` dosyalarındadır. Workers Builds, `main` dalındaki her değişikliği canlıya alır ve diğer dallar için PR'a bir önizleme adresi yazar. `MAPS_API_KEY`, Workers Builds'te build değişkeni olarak tanımlıdır.

## Komutlar
```bash
pnpm dev       # geliştirme
pnpm build     # üretim build
pnpm preview   # build önizleme
pnpm typecheck # astro check
pnpm pretty    # prettier format
```
