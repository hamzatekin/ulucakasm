/** Facts about the clinic, kept in one place so a phone or address change is a single edit. */

export const SHORT_NAME = 'İbrahim-Hüsniye Özdurakoğlu Aile Sağlığı Merkezi';
export const NAME = `Kemalpaşa ${SHORT_NAME}`;
export const ADDRESS = 'Mustafa Kemal Atatürk Mah. 9247 Sok. No:3, Ulucak, Kemalpaşa / İzmir';
export const PHONES = ['+90 (232) 873 40 74', '+90 (232) 873 40 81'];

/** the map image (scripts/map/render.mjs) is centred here; re-render it if this changes */
export const LOCATION = { lat: 38.47771, lng: 27.35559 };

const DESTINATION = `${LOCATION.lat},${LOCATION.lng}`;
/** "Yol tarifi" links: each opens the visitor's own map app (or its website) with a route to the clinic */
export const DIRECTIONS = [
  { app: 'Google', name: 'Google Haritalar', href: `https://www.google.com/maps/dir/?api=1&destination=${DESTINATION}` },
  { app: 'Apple', name: 'Apple Haritalar', href: `https://maps.apple.com/directions?destination=${DESTINATION}` },
  // Yandex's rtext is "from~to"; an empty "from" starts at the visitor's location
  { app: 'Yandex', name: 'Yandex Haritalar', href: `https://yandex.com.tr/maps/?rtext=~${DESTINATION}&rtt=auto` },
];

/** strip everything but digits/plus for tel: links */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, '')}`;

export interface Doctor {
  /** matches the image filename stem under assets/images/asm/doctors + schedules */
  slug: string;
  name: string;
  /** aile hekimliği birim kodu: the registry key */
  code: string;
  phone: string;
  /** aile sağlığı çalışanı (ebe / hemşire) — term updated per Aile Hekimliği Uygulama Yönetmeliği (2025) */
  assistant: string;
  /** weekday working window, read off the schedule image for its screen-reader summary (WCAG 1.1.1); keep in sync with it */
  hours: string;
}

export const DOCTORS: Doctor[] = [
  {
    slug: 'murat_tansel_kutluk',
    name: 'Dr. Murat Tansel Kutluk',
    code: '3516030',
    phone: '+90 (232) 873 40 81',
    assistant: 'Ebe Hatice Marangoz',
    hours: '07.00–17.00',
  },
  {
    slug: 'ilkay_taze',
    name: 'Dr. İlkay Taze',
    code: '3516035',
    phone: '+90 (232) 873 40 74',
    assistant: 'Fatma Doğru',
    hours: '07.00–18.00',
  },
  {
    slug: 'ahmet_serhan_sunbul',
    name: 'Dr. Ahmet Serhan Sünbül',
    code: '3516015',
    phone: '+90 (232) 873 40 74',
    assistant: 'Ebe Şenay Erdoğdu',
    hours: '07.00–17.00',
  },
  {
    slug: 'cumhur_citak',
    name: 'Uzm. Dr. Cumhur Çıtak',
    code: '3516014',
    phone: '+90 (232) 873 40 81',
    assistant: 'Nesli Çıtak',
    hours: '07.00–17.00',
  },
  {
    slug: 'gokhan_muglali',
    name: 'Dr. Gökhan Muğlalı',
    code: '3516040',
    phone: '+90 (232) 873 40 81',
    assistant: 'Özgül Bilgin',
    hours: '08.00–18.00',
  },
  {
    slug: 'seyhmus_kaya',
    name: 'Dr. Şeyhmus Kaya',
    code: '3516042',
    phone: '+90 (232) 873 40 81',
    assistant: 'Nur Akkaya',
    hours: '08.00–18.00',
  },
];
