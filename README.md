# Cut · Suivi

PWA de suivi nutrition/poids (Supabase + Netlify + Gemini).

- `index.html` : app complète (UI + logique)
- `sw.js` : service worker (network-first)
- Edge function Supabase `analyze-meal` : analyse photo/texte via Gemini

Déploiement : auto via Netlify à chaque commit sur main.
