# Agenci designsystem (v1 · 2026-09-22)

Biofilt grensesnitt: rolig lys, få farger, mye luft. Én stemme i skrift, én aksent i mosegrønn, myke former der mennesker tar i dem.
Fullt visuelt oppslag med komponenter og revisjon ligger som Claude-artifact («Agenci Designsystem»).

## Prinsipper

1. **Lys før farge.** Hierarki lages med tone (hvitt, kullgrå, sølv). Grønn = én primærhandling per skjerm, valgt tilstand, fokus.
2. **Fire skrifter, fire jobber.** Gellix (500, −0,055em) til overskrifter. Inter til løpetekst og UI. Space Grotesk til etiketter og tall. Circular til Agencis stemme (svar i samtalen, sitater, Book Italic som vekt i titler). Ingen fet display, ingen andre skrifter.
3. **Mykt der hånden er.** Knapper, chips, bobler = pill. Kort/paneler 16–24 px. Rette hjørner kun på tabeller, kode, bilder.
4. **Bevegelse som pust.** 120–180 ms ease-out på alt som svarer på klikk. 900 ms ease-in-out på scener. Alltid `prefers-reduced-motion`.

## Farger

| Token | Lys | Mørk | Bruk |
|---|---|---|---|
| `--ground` | `#FAFAFA` | `#050607` | Sidegrunn |
| `--surface` | `#FFFFFF` | `#1A1C21` | Kort, paneler, widget |
| `--surface-2` | `#F3F5F4` | `#22252B` | Ikonbokser, inaktive segmenter |
| `--ink` | `#243236` kullgrå | `#E6EAEA` | Primær tekst, ink-knapp |
| `--ink-2` | `#5A606A` | `#A8AFB6` | Sekundær tekst, ikoner |
| `--ink-3` | `#8A9096` | `#6F767E` | Placeholder, metadata (kun ≥ 12 px) |
| `--line` | `#E4E8E5` | `#262A30` | Hårlinje |
| `--line-2` | `#D7DCE2` pale silver | `#33383F` | Input-ramme, sterke linjer |
| `--accent` | `#365C3D` sparsom | `#8FB394` | Primærhandling, fokus, valgt |
| `--accent-hover` | `#294A30` | `#A6C6AA` | |
| `--accent-soft` | `#EDF1EE` | `#17251A` | Valgt rad, chip-bakgrunn |
| `--accent-soft-2` | `#DDE6DE` | `#1F3323` | Fokusring, selection |
| `--on-accent` | `#FFFFFF` | `#0B1A0E` | Tekst på grønn |
| `--deep` | `#050607` | | Hero, mørk grunn |
| `--charcoal` | `#1A1C21` | | Nav, sidebar |
| `--on-deep` / `--on-deep-2` | `#F2F4F4` / 72 % | | Tekst på mørk |
| `--ok` / `--warn` / `--bad` | `#3F7A4A` / `#A3762A` / `#9A4B3F` | | Status. Aldri dekor. |

Kontrast: ink/hvit 12,4:1, ink-2/hvit 5,6:1, accent/hvit 7,4:1. `--ink-3` kun til tekst ≥ 12 px som ikke er eneste informasjonsbærer.
Regel: maks én grønn fylt flate i synsfeltet. Grønn brukes aldri på lange avsnitt eller som identitetsform.

## Skrifter

| Face | Rolle | Vekter | Kilde | Variabel |
|---|---|---|---|---|
| Gellix | Alle overskrifter (Display–H4). Aldri kursiv, aldri < 20 px | 500 (400/600/700 lastet) | `public/fonts/gellix` · `next/font/local` | `--font-gellix` → `--font-agenci-title` |
| Inter | Løpetekst, knapper, skjema, dashbord, widget | 400, 500 (600 til UI-etiketter) | `next/font/google` | `--font-sans` → `--font-agenci-body` |
| Space Grotesk | Eyebrows, captions, tabellhoder, nøkkeltall, tid, tokens. Alltid `tabular-nums` | 400, 500 | `next/font/google` | `--font-display` |
| Circular (Lineto) | Agencis stemme: bot-svar i samtalen, sitater, Book Italic som vekt på ett ord i en tittel | Book 400, Book Italic, Medium 500 | `public/fonts/Circular-Font-Family` · `next/font/local` | `--font-circular` → `--font-agenci-voice` |

Alle fire lastes i `app/layout.tsx`. Geist og Geist Mono er fjernet. Kode/monospace i UI bruker system-monospace, ikke en webfont.

### Bot-stemme i produksjon (22.09.2026)

Circular er nå slått på to steder, begge via én token:

- **Hero-samtalen** (`.agenci-story-message.is-agent` i `styles/tokens.css`) — dekker både den animerte Remotion-spilleren og reduced-motion-fallbacken, siden de deler klassen.
- **Widgetens bot-boble** (`AIMessageContent` i `packages/ui/src/components/ai/message.tsx`) — kun assistant-siden. Brukerens egne meldinger er urørt. Widgeten laster Circular selv i `apps/widget/app/layout.tsx` via `next/font/local` (samme filer, relativ sti på tvers av app-mappene, samme mønster som den eksisterende `tokens.css`-importen der).

Begge steder leser `--font-bot-voice`, satt i `body` i `tokens.css`:

```css
--font-bot-voice: var(--font-agenci-voice); /* = Circular */
```

**For å reversere begge steder på én gang**, bytt den linjen til:

```css
--font-bot-voice: var(--font-agenci-body); /* = Inter, som før */
```

Ingen komponent trenger å endres for å reversere.

**Kjent, urelatert miljøproblem:** widgetens dev-server (`apps/widget`) kompilerer ikke i dette miljøet i dag — roten har TypeScript 7.0.2 installert, og Next.js 15.5.25 støtter ikke TypeScript 7 sin kompilator-API. Dette gjaldt før denne endringen og er ikke noe fontbyttet forårsaket. Fontoppsettet i widgetens `layout.tsx` er verifisert ved kode­gjennomgang og speiler mønsteret som allerede er bekreftet i drift på `apps/web` (localhost:3000).

## Typografi

Anker = dagens hero (`.agenci-cinematic-title` / `.agenci-cinematic-copy`).

| Stil | Font | Størrelse | lh | ls |
|---|---|---|---|---|
| Display 1 | Gellix 500 | `clamp(2.6rem, 5.15vw, 5rem)` | .95 | −.055em |
| Display 2 | Gellix 500 | `clamp(2.1rem, 3.6vw, 3.5rem)` | 1.0 | −.05em |
| Heading 2 | Gellix 500 | `clamp(1.75rem, 2.6vw, 2.5rem)` | 1.04 | −.045em |
| Heading 3 | Gellix 500 | 24px | 1.15 | −.03em |
| Heading 4 | Gellix 500 | 20px | 1.25 | −.025em |
| Lead | Inter 400 | 17px | 1.65 | −.014em |
| Body | Inter 400 | 16px | 1.6 | −.008em |
| Small | Inter 400 | 14px | 1.55 | |
| Stemme | Circular Book 400 | 17px | 1.6 | −.006em · Book Italic til vekt |
| Caption | Space Grotesk 500 | 12px versaler | 1.4 | +.06em |
| Data | Space Grotesk 400 | 13px | 1.5 | tabular-nums · tall, tid, tokens |

Minste størrelse 12 px. Lead maks 38ch på mørk, 47ch på lys. Overskrifter `text-wrap: balance`, maks 12ch (Display) / 20ch (H2).

## Rom, radius, skygge

- Spacing: `4 8 12 16 24 32 48 72 120` (`--sp-1`…`--sp-9`). Seksjon: `clamp(72px, 10vw, 120px)`.
- **Sidegrind (bleed): 100px fra hjørnene på desktop** (≥1024px / Tailwind `lg:`), gjennomført på alle forsidens seksjoner 23.09.2026 — se under. Mobil/nettbrett beholder eksisterende, mindre innrykk (18–32px) per seksjon.
- Radius: `--r-2: 6` (chips, kbd, faner) · `--r-3: 10` (input, menyrad, kompakt kontroll) · `--r-4: 16` (kort) · `--r-5: 24` (hero, modal) · `--r-pill: 999px` (CTA-knapper, bobler). Ikke 5/7/8/12/99/100/9999 — se rettinger 23.09.2026 under.
- Skygge: `--shadow-1` (kort på grunn) og `--shadow-2` (popover). Ingen andre.

## Ikoner

Lucide, `strokeWidth={1.5}` + `absoluteStrokeWidth`, `currentColor`. Størrelser 16 / 20 / 24 / 32. Ikon i knapp står til høyre og flytter 2 px opp-høyre på hover. På mørke bilder: sølv `#D7DCE2` 75–85 %.

## Organisk form (maskot / metaball)

Sirkler 1×, 0,7×, 0,5× radius bundet med konkav hals (55–65 % av minste diameter). Sølv eller hvitt på mørk, kullgrå på lys. Aldri grønn. Morfer (900 ms `--ease-in-out`), skaleres ikke. Brukes til maskot, KI→menneske-overtakelse, tom tilstand, avatarklynger. Ikke i knapper eller som mønster.

På forsiden forteller formen teksten, styrt av scroll: sirkelen ved «Gjør mindre manuelt» krymper der den står (venstre), sirkelen ved «Automatiser mer» vokser der den står (høyre) — ingen vandring. Midtsirkelen står fast og holder halsen mellom dem. Ingen evig tomgangsanimasjon. Redusert bevegelse viser sluttbildet.

## Komponenter (kort)

- **Knapper:** to bekreftede høyder i faktisk bruk — **48px for primær CTA** («Kom i gang gratis», «Snakk med oss», «Start gratis»), **44px for kompakte/sekundære kontroller** (fanebrytere, prisperiode-veksler, skjemaknapper). Alle CTA-knapper er pill (`--r-pill`). Varianter primary (grønn), ink, secondary (ramme `--line-2`), ghost. På mørk hero: primary = hvit/kull, secondary = glass med 26 % hvit ramme (som i dag). Trykk `scale(.985)`.
- **Filtermeny / kommando:** 14 px radius, `--shadow-2`, søkefelt øverst, rader 32 px ikonboks + 14 px tittel + 12,5 px beskrivelse, valgt rad `--accent-soft` + `↵`. Inn 180 ms fra scale .98 / 4 px.
- **Segmentkontroll:** pill i `--surface-2`, glidende hvit thumb 320 ms.
- **Input:** 44 px, `--r-3`, ramme `--line-2`, fokus `--accent` + 3 px `--accent-soft-2`.
- **Status-pill:** dempet ok/warn/bad, aldri aksentgrønn.
- **Samtale:** kunde høyre (kullgrå, Inter), Agenci venstre (hvit + hårlinje, Circular Book), 18 px radius / 6 px mot avsender. Skriver-indikator 3 prikker 1,2 s. Bekreftelse = eneste grønn i samtalen.
- **Nøkkeltall:** Gellix 32 px `tabular-nums`, etikett 12 px Space Grotesk versaler.

## Bevegelse

- `--ease-out: cubic-bezier(.16,1,.3,1)` for alt brukeren utløser.
- `--ease-in-out: cubic-bezier(.65,0,.35,1)` for alt som beveger seg selv.
- `--t-fast 120` hover · `--t-base 180` knapp/meny · `--t-slow 320` panel · `--t-scene 900` scener/morph.
- Kun `transform`/`opacity`. Innhold inn starter synlig, flyttes maks 8 px. Ingen spretting.
- **Scroll på forsiden** (alltid på nettleserens scroll-/view-timeline, aldri scroll-events; redusert bevegelse = ingen parallakse):
  - *Hero-overtakelse* (som stingray.no): filmen glir med 0,45× og teksten 0,6× av scrollen mens maskot-seksjonen tar over heroen.
  - *Åpneren*: maskot-seksjonens avrundede underkant ligger over Møt Agenci; innholdet der ligger først 280 px inn under kanten og glir ned på plass (ikke hele seksjonen). Kanten og skyggen (`#181c1a`) hører til maskot-seksjonen og følger den; en dypere skygge i samme tone tones inn mens kanten stiger — lokket løftes.
  - *Naturbilder* bak glasskortene: ±5 % parallakse inne i rammen, skalert 1,12 så kantene aldri vises.
- **Mikrointeraksjoner:** trykk `scale(.97)` / 160 ms på knapper og faner (`.95` på små runde piler); fane- og prisbytte glir den nye teksten inn (6 px, 40 → 100 % opasitet, 240–280 ms) i en liten bølge på 30–40 ms per kort — først etter første valg, aldri ved sidelasting.
- **Overskrifter, scroll-inn:** bare på utvalgte steder — Outcome, Brand og Workflow — ikke alle. 55 → 100 % opasitet og 22 px (unntak fra 8 px-regelen: den følger scrollen, ikke tiden), `entry 0–75 %`; neste linje kommer 10 % senere i scrollen.
- **Nav-hover:** én pille bak hovedlenkene, klippet til lenken under pekeren — glir mellom lenker (`clip-path` 220 ms) og tones inn/ut (150 ms). Kommer pekeren utenfra, hopper den dit og tones bare inn. Kun mus/penn. Lenkene ligger kant i kant, så det ikke finnes døde felt mellom dem.
- **Cookie-samtykke:** stripen glir opp fra underkanten (400 ms `ease`) og ut samme vei (250 ms); innstillingsdialogen tones inn med kortet fra 96 % (250 ms), ut på 180 ms. Redusert bevegelse: bare opasitet.
- **Nyhetsbrev-knappen:** tone-overgang og trykk; tekstbyttet (Meld meg på → Sender → Du er på listen!) kommer inn fra 2 px uskarphet på 200 ms.

## Bilder

Korn/gress i vind, lin og tre i sidelys, sølv/grafittstoff, mennesker sett fra siden. Mett ned 10–15 %, svartpunkt ≥ `#050607`, scrim 35 % kull fra 55 % ned når tekst står på bildet.

## Forsiden — samsvar med designsystemet (23.09.2026)

Gjennomgått seksjon for seksjon (kun det som faktisk rendres av `landing-page-view.tsx`: Nav, Hero, Maskot, Meet/Brand/Workflow, Outcome-demos, Funksjonskarusell, Footer). Målt med beregnede stiler ved 1440px bredde.

### Rettet i denne runden

**Sidegrind → 100px på desktop**, ett tall, alle seksjoner. Verifisert med `getBoundingClientRect()` mot faktisk innhold (ikke bare boksens ytterkant):

| Seksjon | Fil | Før | Nå (≥1024px) |
|---|---|---|---|
| Nav | `landing-nav.tsx:79` | 24px (32px ≥1280px) | 100px |
| Hero | `tokens.css` `.agenci-cinematic-stage` | 32px | 100px |
| Maskot | `landing-mascot-promise-section.tsx:98` | 40px | 100px |
| Meet / Brand / Workflow | `product-story.module.css` `.container` | 48px | 100px |
| Outcome-demos | `product-story.module.css` `.outcomeFrame` | 32px | 100px |
| Funksjonskarusell (header) | `landing-feature-carousel.module.css` `.header` | 48px | 100px |
| Footer | `marketing.css` `.agenci-fresh-footer` | 48px | 100px |

Karusellens kort-track (`.stage`/`.track`) er bevisst IKKE endret — den bufrer til viewport-kanten med hensikt (kort skal ane seg utenfor skjermen som del av dra-interaksjonen). Under 1024px er alle eksisterende, mindre innrykk urørt.

**Skrifter** — fra forrige runde (se lenger opp), nå bekreftet site-wide på selve forsiden: overskrifter viser konsekvent `fontGellix` vekt 500 (ikke lenger Arial-fallback), Space Grotesk dukker opp riktig som etikett-skrift (karusellens «01/08»-rad), Inter bærer brødtekst. Ingen Geist eller Circular XX igjen i DOM.

### Rettet 23.09.2026 (samme dag, etter revisjonen over)

- **`.cardCopy h3` vekt-avviket** — `product-story.module.css:310` satte `font-weight: 400` på steg-kort-titlene («Samle kunnskapen.» m.fl.), mot modulens egen regel om 500. Rettet til 500. Verifisert: null Gellix-tekst med vekt 400 igjen på forsiden.
- **Knappehøyde og -radius, alle ekte knapper på forsiden.** Skilt fra kalenderdager, ikonrunder, dashboard-forhåndsvisningens statkort og tekstlenker uten boks (disse er egne, bevisst ulike mønstre — ikke rørt). Blant de faktiske CTA- og kontroll-knappene:

  | Element | Fil | Før | Nå |
  |---|---|---|---|
  | `.primaryLink` / `.secondaryLink` (Meet, «Kom i gang gratis») | `product-story.module.css:786` | radius 99px | 999px |
  | `.agenci-price-cta` («Start gratis») | `marketing.css:886-887` | 46px / 100px | 48px / 999px |
  | `.agenci-billing button` (Månedlig/Årlig-veksler) | `marketing.css:764,768` | 100px | 999px |
  | `.outcomeTabs` (ramme rundt fanene) | `product-story.module.css:201` | 7px | 10px |
  | `.outcomeTabs button` (selve fanen) | `product-story.module.css:218` | 5px | 6px |
  | `.agenci-footer-nav input` (nyhetsbrev) | `marketing.css:644-645` | 12px / 46px | 10px / 44px |
  | `.agenci-footer-nav button` (nyhetsbrev, send) | `marketing.css:657` | 12px | 10px |
  | Nav «Kom i gang» (desktop) | `landing-nav.tsx:141` | `rounded-[8px]` | `rounded-full` |
  | Nav «Logg inn» / «Dashboard» / «Kom i gang» (mobilmeny) | `landing-nav.tsx:196,205,213` | `rounded-xl` (12px) | `rounded-full` |

  Hero sine knapper (`min-h-12` + `rounded-full`) var allerede riktige og er urørt. Verifisert live: 90 interaktive elementer sjekket, 0 med radius utenfor systemet (`0, 6px, 10px, 999px, 50%` — pluss Tailwinds `rounded-full`, teknisk `calc(infinity*1px)`).

### Fortsatt ikke rettet (funnet i forrige runde, uendret)

Disse gjelder fortsatt, målt på nytt 23.09.2026 — ingen kodeendring gjort for dem i denne omgangen, kun bekreftet at de fortsatt står:

- **13 ulike gråtoner** for brødtekst på forsiden (funn 06 i forrige revisjon) — uendret.
- ~~9 ulike knappe-/interaktivhøyder og 8 ulike radius-verdier~~ — **rettet 23.09.2026, se over.** De resterende høyde-/radius-variasjonene som fortsatt finnes (kalenderdager, ikonrunder, dashboard-statkort, tekstlenker uten boks) er bevisst forskjellige mønstre, ikke inkonsistens.
- **Ikonstrek 2 / 1,5 / 1,2 px om hverandre** — funn 09, uendret.
- **Overskriftsskalaen** har fortsatt mange unike størrelser (74, 68, 64, 54, 46, 42, 37, 36, 29, 28, 24, 22, 21px) — funn 04, uendret; skriften er nå riktig (Gellix 500), men selve skalaen er ikke samlet til systemets to-tre trinn.
- **Hero-svart `#090909`** vs. systemets `--deep #050607` — funn 08, uendret.

Disse er ikke rettet nå fordi de krever endringer i mange seksjonsfiler samtidig (fargepalett, ikonkomponent) — det er en større, egen jobb som bør godkjennes separat.

## Revisjon av forsiden (22.09.2026, beregnede stiler)

| Måling | I dag | System |
|---|---|---|
| Skriftfamilier | Deklarert: Gellix, Inter, Circular XX, Geist, Geist Mono, Space Grotesk. Rendret: Arial (Gellix CORS-blokkert), Inter kun hvis installert lokalt, Geist (nav) | Gellix + Inter + Space Grotesk + Circular, alle via next/font |
| H2-størrelser | 6 | 2 |
| H3-størrelser | 7 (vekt 400 og 500) | 2 |
| Tekst < 12 px | 9, 10, 11 px | ingen |
| Unike tekstfarger | 30+ | 6 |
| Radius | 0, 5, 6, 10, 99, 100, 9999, 50 % | 6, 10, 16, 24, 999 |
| CTA-høyder | 44, 46, 47, 48 | 36 / 44 / 52 |
| Transisjoner | 10 kombinasjoner | 4 × 2 |
| Ikon-strek | 2 / 1,5 / 1,2 | 1,5 |
| Aksenter i kodebasen | grønn, teal (`--accent-primary`), blå (shadcn `--primary`) | én |

Prioritert:

1. **Skriftene lastet ikke riktig – rettet 22.09.2026.** Før: Gellix hot-linket fra gumloop.com og CORS-blokkert (titler i Arial); Inter bare et navn i `--font-sans` i packages/ui; Circular XX én ubrukt bold italic fra Webflow-CDN; Geist/Geist Mono uten rolle. Nå: Gellix og Circular selvhostet i `public/fonts` via `next/font/local`, Inter og Space Grotesk via `next/font/google`, aliasene flyttet fra `:root` til `body` i tokens.css. Gjenstår: fjern hardkodet `--font-sans: Inter, sans-serif` i `packages/ui/src/styles/globals.css` l.44/97.
2. **Tre aksenter.** Sett shadcn `--primary`/`--ring` (packages/ui globals.css) til `--accent`; slett teal og `--agenci-teal`-alias.
3. **Tekst 9–11 px** i demo-dashbord/kalender → 12 px minimum.
4. Erstatt alle h2/h3 `clamp()` i marketing.css med skalaen over.
5. Body = Inter overalt på markedssiden; fjern Space Grotesk / `.landing-warp`.
6. Tre gråtoner for tekst, satt én gang i `:root`.
7. Ett pill-tall, tre knappehøyder.
8. Hero `#090909` → `--deep`, nav/sidebar `#1C1C1C` → `--charcoal`.
9. Lucide `strokeWidth=1.5` globalt.
10. Innfør `--t-*` / `--ease-*`.
