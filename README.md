# Kemalpaşa İbrahim-Hüsniye Özdurakoğlu Aile Sağlığı Merkezi

Resmi web sitesi. Hizmetler, kadro, iletişim ve bilgilendirici içerikler için hızlı, erişilebilir ve SEO odaklı bir Astro sitesi.

Canlı: https://ulucakasm.com

## İçerik
- Ana sayfa: hero, hizmetler, doktorlar, iletişim/harita, galeri
- Bilgilendirici sayfalar: Aşı Takvimi, Beslenme ve Obezite

## Teknoloji
- Astro 5
- Tailwind CSS
- TypeScript
- Google Maps JS API

## Performans (Lighthouse)
- 100 / 100 / 100 / 100 (Performance, Accessibility, Best Practices, SEO)
- Metikler: FCP 1.5s, LCP 1.5s, TBT 0ms, CLS 0, Speed Index 1.9s
- Ölçüm: 22 Ocak 2026, Lighthouse 13.0.1, Moto G Power emülasyonu, Yavaş 4G

## Kurulum
Gereksinim: Node.js >= 20

```bash
pnpm install
pnpm dev
```

Alternatif:

```bash
npm install
npm run dev
```

## Ortam Değişkenleri
Google Maps için API anahtarı gereklidir.

```bash
MAPS_API_KEY="YOUR_KEY"
```

## Komutlar
```bash
pnpm dev       # geliştirme
pnpm build     # üretim build
pnpm preview   # build önizleme
pnpm typecheck # astro check
pnpm pretty    # prettier format
```
