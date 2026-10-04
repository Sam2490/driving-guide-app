import type { GuideBlock } from '../types';

export type QText = { q: string; o: Record<string, string> };
export type TopicText = { title: string; blocks: GuideBlock[] };
