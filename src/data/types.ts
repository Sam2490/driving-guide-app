export type Lang = 'ar' | 'en' | 'ur' | 'hi' | 'bn';
/** Languages that are translations of the Arabic source. */
export type TLang = Exclude<Lang, 'ar'>;

/** Where a piece of content comes from, so official and general information stay distinct. */
export type ContentSource = 'official' | 'general';

export type ImageRef = { kind: 'sign'; id: string } | { kind: 'photo'; key: string };

export type QuestionOption = { id: string; text?: string; image?: ImageRef };

export type Question = {
  id: string;
  question: string;
  image?: ImageRef;
  options: QuestionOption[];
  correctAnswerId: string;
  /** Keep option order (answers like "all of the above"). */
  lockOrder?: boolean;
  category: 'general' | 'signs' | 'pictures';
  explanation?: string;
};

export type Sign = { id: string; group: string; nameAr: string; nameEn: string };

export type GuideBlock = { text: string } | { table: string[][] };
export type GuideTopic = { id: string; icon: string; title: string; blocks: GuideBlock[] };

export type Tip = { title: string; lines: string[] };
export type Step = { title: string; body: string };

export type School = {
  id: string;
  /** Branch name exactly as Absher shows it (Arabic). */
  name: string;
  /** Key of the school brand, used for translated names. */
  brand: string;
  cities: string[];
  region: string;
  gender: 'men' | 'women';
  /** 'absher' = listed in Absher's booking; 'public' = from public sources, not verified on Absher. */
  source: 'absher' | 'public';
  description?: string;
  /** Optional branch details, added only when verified. */
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
};

export type City = { name: string; region: string; lat: number; lng: number };
