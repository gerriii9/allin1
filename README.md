# All in 1 Sport Pub – web s administráciou

Statický web (HTML/CSS/JS) + jednoduchý admin cez **Decap CMS** na adrese `/admin`.
Majiteľ si v admine sám mení **otváracie hodiny, menu, program akcií (kvízy, turnaje…)**, oznam na vrchu stránky a kontakty.

## Štruktúra

```
index.html          – web
css/style.css       – dizajn (čierna + žltá, doodle pozadie)
js/app.js           – načíta obsah z /content a vykreslí ho
content/*.json      – OBSAH (toto mení admin)
  hodiny.json       – otváracie hodiny
  menu.json         – kategórie a jedlá (z Woltu)
  akcie.json        – program / kvízy (október 2026)
  nastavenia.json   – oznam, katering, telefón, adresa, IG/FB, Wolt
admin/              – Decap CMS (config.yml = čo sa dá v admine meniť)
images/             – fotky, logo, doodles.svg; uploads/ = fotky nahraté cez admin
```

## 1) Rýchle demo bez adminu (2 minúty)

1. Choď na https://app.netlify.com/drop
2. Pretiahni tam celý priečinok `allin1-web`.
3. Netlify ti dá odkaz – web funguje, admin sa však na tomto type nasadenia **neuloží** (potrebuje Git).

## 2) Plná verzia s adminom (cca 10 minút)

1. **GitHub:** vytvor nový repozitár (napr. `allin1-web`) a nahraj doň obsah priečinka (vetva `main`).
2. **Netlify:** *Add new project → Import an existing project → GitHub* → vyber repozitár. Build command nechaj prázdny, publish directory `.` (je to v `netlify.toml`).
3. **Identity:** v projekte *Project configuration → Identity → Enable Identity*.
   - *Registration preferences* nastav na **Invite only** (aby sa nemohol registrovať hocikto).
4. **Git Gateway:** *Identity → Services → Git Gateway → Enable*.
5. **Pozvi používateľov:** *Identity → Invite users* → e-mail majiteľa (a svoj).
   Po kliknutí na odkaz v e-maile si nastaví heslo a automaticky ho to presmeruje do `/admin`.
6. Premenuj projekt, napr. na `allin1-navrh` → adresa bude `allin1-navrh.netlify.app`.

Každá zmena v admine sa uloží do GitHubu a Netlify web o ~30 sekúnd znovu nasadí.

> Pozn.: Netlify Identity v roku 2025 označil za končiacu, vo februári 2026 to odvolal a Identity zostáva. Git Gateway je v dokumentácii Netlify stále vedený ako „deprecated“, ale funguje. Pri väčšom počte klientov zváž neskôr alternatívu (napr. DecapBridge alebo vlastný GitHub OAuth).

## 3) Lokálne testovanie adminu (napr. na nahratie videa pre majiteľa)

V priečinku projektu spusti v dvoch termináloch:

```bash
npx decap-server        # lokálny „backend“ pre admin
npx serve .             # web na http://localhost:3000
```

Otvor `http://localhost:3000/admin/` – zmeny sa ukladajú priamo do súborov v `content/`.
(Web neotváraj dvojklikom cez `file://` – prehliadač by nenačítal obsah z JSON.)

## Pred ostrým spustením

- [ ] Zmaž žltý pásik „Návrh webu…“ v `index.html` (`<div class="demo-strip">`).
- [ ] Povoľ indexovanie: zmaž `<meta name="robots" …>` v `index.html`, blok `X-Robots-Tag` v `netlify.toml` a uprav `robots.txt`.
- [ ] Doplň odkazy na Instagram a Facebook (admin → *Oznam a kontakty*).
- [ ] Doplň časy začiatku akcií (v programe zatiaľ chýbajú) a pridaj novembrový program.
- [ ] Over text sekcie Katering (cena, minimálny počet ľudí, ako dlho vopred objednať).
- [ ] Skontroluj ceny – sú z Woltu, kde bývajú vyššie ako v podniku.
- [ ] Doplň chýbajúce alergény (Gina's, Hot Smokey Bacon, Crispy Cheddar, rebrá, wrap s hovädzím).
- [ ] Presmeruj doménu `allin1sportpub.sk` (Websupport) na Netlify: *Domain management → Add domain* a podľa návodu nastav DNS.
