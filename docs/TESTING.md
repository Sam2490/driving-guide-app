# Testing

Run `npm test` (Jest + jest-expo + React Native Testing Library), `npm run typecheck`, `npx expo lint`.

| Suite | Covers |
| --- | --- |
| `features/quiz/engine.test.ts` | Bank integrity (661, unique ids, valid answers), shuffle, exam size and distinct questions, randomisation by seed, locked option order, correct/incorrect detection, score, pass mark 21, mistakes list, restart, timer |
| `features/levels/levels.test.ts` | Level order identical to the web app, 82 levels, XP and combo, 5 attempts, stars, one-time bonus, streak, ranks |
| `features/schools/search.test.ts` | Haversine distance, nearby sort, every school city has coordinates, region/city filters, empty results, coordinate validation |
| `services/services.test.ts` | Location granted / denied / GPS off / unavailable / invalid fix, map URLs, stored-data validation |
| `__tests__/app.test.tsx` | Every screen renders, tab navigation, unknown ids, full mock exam (no answers shown before submit, back, grid, submit, Fail result, mistakes review), locked levels, level feedback, nearby schools (explanation first, sorted list, denied, GPS off) |

Visual checks were done on the web build at phone size (390×844) in Arabic, English and Urdu, light and dark.

**Still to do on real devices:** small and large Android phones, iOS (needs a Mac or EAS + TestFlight), font scaling at the largest setting, TalkBack / VoiceOver pass, airplane-mode check, real GPS outdoors.
