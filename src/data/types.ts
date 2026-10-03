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
  name: string;
  cities: string[];
  description: string;
  /** Optional branch details, added only when verified. */
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
};

export type City = { name: string; region: string; lat: number; lng: number };
