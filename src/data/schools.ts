// Branches as listed on Absher (driving licence issuance → new appointment → choose branch),
// transcribed from screenshots on 2026-10-03; see scripts/absher/branches.py. Women's schools come from public sources.
import type { School } from './types';

export const SCHOOLS_SOURCE = 'absher' as const;
export const SCHOOLS_CHECKED = '2026-10-03';

export const SCHOOLS: School[] = [
 {
  "id": "b01",
  "name": "مدرسة الشركة العربية لتعليم القيادة بالباحة للرجال",
  "brand": "arabco",
  "cities": [
   "العقيق"
  ],
  "region": "الباحة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b02",
  "name": "مدرسة تعليم القيادة بجامعة الباحة للرجال",
  "brand": "bahauni",
  "cities": [
   "بلجرشي"
  ],
  "region": "الباحة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b03",
  "name": "مدرسة تعليم قيادة المركبات بجازان للرجال",
  "brand": "jazanvd",
  "cities": [
   "صبياء"
  ],
  "region": "جازان",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b04",
  "name": "مدرسة دلة لتعليم القيادة بالدرب للرجال",
  "brand": "dallah",
  "cities": [
   "الدرب"
  ],
  "region": "جازان",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b05",
  "name": "مدرسة دلة لتعليم القيادة بجازان للرجال",
  "brand": "dallah",
  "cities": [
   "صبياء"
  ],
  "region": "جازان",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b06",
  "name": "مدرسة دلة لتعليم القيادة في ابو عريش للرجال",
  "brand": "dallah",
  "cities": [
   "أبو عريش"
  ],
  "region": "جازان",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b07",
  "name": "مدرسة السلي لتعليم القيادة بالرياض للرجال",
  "brand": "sulay",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b08",
  "name": "مدرسة الشروق لتعليم القيادة بحوطة سدير للرجال",
  "brand": "shorouq",
  "cities": [
   "حوطة سدير"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b09",
  "name": "مدرسة المنقاش لتعليم القيادة بالقويعية للرجال",
  "brand": "manqash",
  "cities": [
   "القويعية"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b10",
  "name": "مدرسة المنقاش لتعليم القيادة بالمزاحمية للرجال",
  "brand": "manqash",
  "cities": [
   "المزاحمية"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b11",
  "name": "مدرسة النجمة السابعة لتعليم القيادة بالرمال",
  "brand": "seventhstar",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b12",
  "name": "مدرسة الهاجري لتعليم القيادة بعفيف للرجال",
  "brand": "hajri",
  "cities": [
   "عفيف"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b13",
  "name": "مدرسة تعليم القيادة بجنوب الرياض للرجال",
  "brand": "southriyadh",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b14",
  "name": "مدرسة تعليم القيادة بشقراء للرجال",
  "brand": "shaqra",
  "cities": [
   "شقراء"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b15",
  "name": "مدرسة جامعة الاميرة نورة بالرياض لتعليم القيادة للرجال",
  "brand": "pnu",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b16",
  "name": "مدرسة دلة التخصصي لتعليم القيادة بالرياض للرجال",
  "brand": "dallahtakh",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b17",
  "name": "مدرسة الشهيلي لتعليم القيادة بالقريات للرجال",
  "brand": "shuhaili",
  "cities": [
   "القريات"
  ],
  "region": "الجوف",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b18",
  "name": "مدرسة جوفكو لتعليم القيادة بالجوف للرجال",
  "brand": "jofco",
  "cities": [
   "سكاكا"
  ],
  "region": "الجوف",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b19",
  "name": "مدرسة الفليو لتعليم القيادة بالبكيرية للرجال",
  "brand": "fulaiw",
  "cities": [
   "البكيرية"
  ],
  "region": "القصيم",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b20",
  "name": "مدرسة الفليو لتعليم القيادة ببريدة للرجال",
  "brand": "fulaiw",
  "cities": [
   "بريدة"
  ],
  "region": "القصيم",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b21",
  "name": "مدرسة الهاجري لتعليم القيادة بمحافظة المذنب للرجال",
  "brand": "hajri",
  "cities": [
   "المذنب"
  ],
  "region": "القصيم",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b22",
  "name": "مدرسة شبة الجزيرة لتعليم القيادة بالرس للرجال",
  "brand": "peninsula",
  "cities": [
   "الرس"
  ],
  "region": "القصيم",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b23",
  "name": "مدرسة شبة الجزيرة لتعليم القيادة بعنيزة للرجال",
  "brand": "peninsula",
  "cities": [
   "عنيزة"
  ],
  "region": "القصيم",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b24",
  "name": "مدرسة الزهور لتعليم القيادة في بعرعر للرجال",
  "brand": "zohour",
  "cities": [
   "عرعر"
  ],
  "region": "الحدود الشمالية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b25",
  "name": "مدرسة النزاوي لتعليم القيادة للرجال بالحدود الشمالية",
  "brand": "nazzawi",
  "cities": [
   "عرعر"
  ],
  "region": "الحدود الشمالية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b26",
  "name": "مدرسة وطبان لتعليم القيادة برفحاء للرجال",
  "brand": "watban",
  "cities": [
   "رفحاء"
  ],
  "region": "الحدود الشمالية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b27",
  "name": "مدرسة أزدان نجد لتعليم القيادة بتبوك للرجال",
  "brand": "azdan",
  "cities": [
   "تبوك"
  ],
  "region": "تبوك",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b28",
  "name": "مدرسة تعليم القيادة بالوجه للرجال",
  "brand": "wajh",
  "cities": [
   "الوجه"
  ],
  "region": "تبوك",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b29",
  "name": "مدرسة تعليم القيادة بتيماء للرجال",
  "brand": "tayma",
  "cities": [
   "تيماء"
  ],
  "region": "تبوك",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b30",
  "name": "مدرسة تعليم القيادة للرجال بجامعة تبوك",
  "brand": "tabukuni",
  "cities": [
   "تبوك"
  ],
  "region": "تبوك",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b31",
  "name": "مدرسة شبة الجزيرة لتعليم القيادة بحائل للرجال",
  "brand": "peninsula",
  "cities": [
   "حائل"
  ],
  "region": "حائل",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b32",
  "name": "مدرسة السيد لتعليم القيادة برابغ للرجال",
  "brand": "sayed",
  "cities": [
   "رابغ"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b33",
  "name": "مدرسة الشميسي لتعليم القيادة بمكة المكرمة للرجال",
  "brand": "shumaisi",
  "cities": [
   "مكة المكرمة"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b34",
  "name": "مدرسة النوارية لتعليم القيادة بمكة المكرمة للرجال",
  "brand": "nawwariyah",
  "cities": [
   "مكة المكرمة"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b35",
  "name": "مدرسة جدة المتطورة لتعليم القيادة للرجال",
  "brand": "jeddahadv",
  "cities": [
   "جدة"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b36",
  "name": "مدرسة دلة لتعليم القيادة بالطائف للرجال",
  "brand": "dallah",
  "cities": [
   "الطائف"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b37",
  "name": "مدرسة سابتكو لتعليم قيادة السيارات رجال جدة",
  "brand": "saptco",
  "cities": [
   "جدة"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b38",
  "name": "مدرسة سيسد لتعليم القيادة للرجال",
  "brand": "sised",
  "cities": [
   "الطائف"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b39",
  "name": "مدرسة شمال جدة لتعليم القيادة للرجال",
  "brand": "northjeddah",
  "cities": [
   "جدة"
  ],
  "region": "مكة المكرمة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b40",
  "name": "المدرسة النموذجية لتعليم القيادة بالمدينة المنورة للرجال",
  "brand": "model",
  "cities": [
   "المدينة المنورة"
  ],
  "region": "المدينة المنورة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b41",
  "name": "مدرسة الزهور لتعليم القيادة بالعلا للرجال",
  "brand": "zohour",
  "cities": [
   "العلا"
  ],
  "region": "المدينة المنورة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b42",
  "name": "مدرسة الزهور لتعليم القيادة بالمدينة المنورة للرجال",
  "brand": "zohour",
  "cities": [
   "المدينة المنورة"
  ],
  "region": "المدينة المنورة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b43",
  "name": "مدرسة الزهور لتعليم القيادة بينبع للرجال",
  "brand": "zohour",
  "cities": [
   "ينبع"
  ],
  "region": "المدينة المنورة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b44",
  "name": "مدرسة الهاجري لتعليم القيادة المدينة المنورة رجال",
  "brand": "hajri",
  "cities": [
   "المدينة المنورة"
  ],
  "region": "المدينة المنورة",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b45",
  "name": "مدرسة أزدان نجد لتعليم القيادة بأحد رفيدة للرجال",
  "brand": "azdan",
  "cities": [
   "أحد رفيدة"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b46",
  "name": "مدرسة أزدان نجد لتعليم القيادة بخميس مشيط للرجال",
  "brand": "azdan",
  "cities": [
   "خميس مشيط"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b47",
  "name": "مدرسة الابوين لتعليم القيادة في بالقرن للرجال",
  "brand": "abawain",
  "cities": [
   "بلقرن"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b48",
  "name": "مدرسة الدخول لتعليم القيادة بأبها للرجال",
  "brand": "dukhool",
  "cities": [
   "أبها"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b49",
  "name": "مدرسة السياري لتعليم القيادة بمحايل عسير للرجال",
  "brand": "sayyari",
  "cities": [
   "محايل"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b50",
  "name": "مدرسة العابسي لتعليم القيادة بسراة عبيدة للرجال",
  "brand": "abesi",
  "cities": [
   "سراة عبيدة"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b51",
  "name": "مدرسة فن القيادة لتعليم القيادة في بيشة للرجال",
  "brand": "fanqiyadah",
  "cities": [
   "بيشة"
  ],
  "region": "عسير",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b52",
  "name": "مدرسة الياسين لتعليم القيادة بنجران للرجال",
  "brand": "yaseen",
  "cities": [
   "نجران"
  ],
  "region": "نجران",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b53",
  "name": "مدرسة دلة لتعليم القيادة الياسين شرورة رجال",
  "brand": "dallahyaseen",
  "cities": [
   "شرورة"
  ],
  "region": "نجران",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b54",
  "name": "مدرسة دلة لتعليم القيادة الياسين في بدر الجنوب رجال",
  "brand": "dallahyaseen",
  "cities": [
   "بدر الجنوب"
  ],
  "region": "نجران",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b55",
  "name": "المدرسة النموذجية لتعليم القيادة بالخبر للرجال",
  "brand": "model",
  "cities": [
   "الخبر"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b56",
  "name": "المدرسة النموذجية لتعليم القيادة للرجال بالأحساء",
  "brand": "model",
  "cities": [
   "الأحساء"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b57",
  "name": "المدرسة النموذجية لتعليم القيادة للرجال بالقطيف",
  "brand": "model",
  "cities": [
   "القطيف"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b58",
  "name": "المدرسة النموذجية لتعليم قيادة السيارات بالجبيل",
  "brand": "model",
  "cities": [
   "الجبيل"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b59",
  "name": "مدرسة إكمال لتعليم القيادة بالدمام للرجال",
  "brand": "ekmal",
  "cities": [
   "الدمام"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b60",
  "name": "مدرسة الخرس لتعليم القيادة بالاحساء للرجال",
  "brand": "khurs",
  "cities": [
   "الأحساء"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b61",
  "name": "مدرسة الخرس لتعليم القيادة بالنعيرية للرجال",
  "brand": "khurs",
  "cities": [
   "النعيرية"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b62",
  "name": "مدرسة الخرس لتعليم القيادة ببقيق للرجال",
  "brand": "khurs",
  "cities": [
   "بقيق"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b63",
  "name": "مدرسة السياري لتعليم القيادة بحفر الباطن للرجال",
  "brand": "sayyari",
  "cities": [
   "حفر الباطن"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "b64",
  "name": "مدرسة شرق لتعليم القيادة للرجال بالدمام",
  "brand": "sharq",
  "cities": [
   "الدمام"
  ],
  "region": "الشرقية",
  "gender": "men",
  "source": "absher"
 },
 {
  "id": "w01",
  "name": "مدرسة تعليم القيادة بجامعة الأميرة نورة للنساء",
  "brand": "pnu",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "women",
  "source": "public"
 },
 {
  "id": "w02",
  "name": "مدرسة تعليم القيادة بجامعة عفت للنساء",
  "brand": "effat",
  "cities": [
   "جدة"
  ],
  "region": "مكة المكرمة",
  "gender": "women",
  "source": "public"
 },
 {
  "id": "w03",
  "name": "منال لتدريب قيادة السيارات للسيدات",
  "brand": "manal",
  "cities": [
   "الرياض"
  ],
  "region": "الرياض",
  "gender": "women",
  "source": "public"
 },
 {
  "id": "w04",
  "name": "مركز قيادة المركبات – أرامكو السعودية للنساء",
  "brand": "aramco",
  "cities": [
   "الظهران"
  ],
  "region": "الشرقية",
  "gender": "women",
  "source": "public"
 },
 {
  "id": "w05",
  "name": "مدرسة شرق لتعليم القيادة بجامعة الإمام عبدالرحمن بن فيصل للنساء",
  "brand": "sharq",
  "cities": [
   "الدمام"
  ],
  "region": "الشرقية",
  "gender": "women",
  "source": "public"
 },
 {
  "id": "w06",
  "name": "مدرسة جدة المتطورة لتعليم القيادة للنساء",
  "brand": "jeddahadv",
  "cities": [
   "جدة"
  ],
  "region": "مكة المكرمة",
  "gender": "women",
  "source": "public"
 }
];
