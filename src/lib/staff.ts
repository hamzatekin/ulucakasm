export interface Doctor {
  /** matches the image filename stem under assets/images/asm/doctors + schedules */
  slug: string;
  name: string;
  /** aile hekimliği birim kodu: the registry key */
  code: string;
  phone: string;
  /** aile sağlığı çalışanı (ebe / hemşire) — term updated per Aile Hekimliği Uygulama Yönetmeliği (2025) */
  assistant: string;
}

export const DOCTORS: Doctor[] = [
  { slug: 'murat_tansel_kutluk', name: 'Dr. Murat Tansel Kutluk', code: '3516030', phone: '+90 (232) 873 40 81', assistant: 'Ebe Hatice Marangoz' },
  { slug: 'ilkay_taze', name: 'Dr. İlkay Taze', code: '3516035', phone: '+90 (232) 873 40 74', assistant: 'Fatma Doğru' },
  { slug: 'ahmet_serhan_sunbul', name: 'Dr. Ahmet Serhan Sünbül', code: '3516015', phone: '+90 (232) 873 40 74', assistant: 'Ebe Şenay Erdoğdu' },
  { slug: 'cumhur_citak', name: 'Uzm. Dr. Cumhur Çıtak', code: '3516014', phone: '+90 (232) 873 40 81', assistant: 'Nesli Çıtak' },
  { slug: 'gokhan_muglali', name: 'Dr. Gökhan Muğlalı', code: '3516040', phone: '+90 (232) 873 40 81', assistant: 'Özgül Bilgin' },
  { slug: 'seyhmus_kaya', name: 'Dr. Şeyhmus Kaya', code: '3516042', phone: '+90 (232) 873 40 81', assistant: 'Nur Akkaya' },
];

/** strip everything but digits/plus for tel: links */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, '')}`;
