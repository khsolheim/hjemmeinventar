## Container-query responsivitetsplan (Alternativ 2) for hele appen

Mål: Gjøre hver side og nøkkelkomponent responsiv ved hjelp av CSS Container Queries, kombinert med auto-fit/minmax grids og fluid design tokens (CSS-variabler med clamp). Baseline (viewport-breakpoints) beholdes, men komponentenes layout styres primært av sin container.

Implementasjonsprinsipper (gjelder alle sider)
- Legg `container-type: inline-size;` på hovedinnholdswrapper per side og på kort-grids.
- Bruk `@container` regler for å bytte layout/typografi/spacing på tersklene: 360px, 480px, 640px, 768px, 1024px.
- Bruk `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));` for kortlister; ned til 200–220px ved behov.
- Definer fluid tokens i `:root` og side-wrapper:
  - `--space: clamp(8px, 1.2vw, 16px);`
  - `--radius: clamp(6px, 1vw, 12px);`
  - `--text-sm: clamp(12px, 0.95vw, 14px);`
  - `--text-md: clamp(14px, 1.05vw, 16px);`
  - `--text-lg: clamp(16px, 1.3vw, 18px);`
- Sikre synlighet/overflow:
  - Kort/Dialog: `max-width: min(100%, 100cqw); max-height: min(100dvh - 2rem, 720px); overflow:auto;`
  - Flex-barn: `min-width:0;` for å hindre at tekst skyver layout.
  - Bilder: `max-width:100%; height:auto; object-fit:cover;`
- Testpunkter: 320/360/375/414/480/640/768/1024/1280/1536 + smale sidepaneler.

Presiseringer og forbedringer
- Design tokens for grid-min-bredde per side
  - Sett `--card-min: 220px;` på side/grid, og bruk `repeat(auto-fit, minmax(var(--card-min), 1fr))`. Juster via `@container` (f.eks. 200px i trange containere, 260px i brede).
- Utvidede tokens
  - Legg til: `--gap`, `--btn-pad`, `--btn-radius`, `--container-pad`. Disse kan overstyres per side/container for jevn spacing og knappestørrelser på tvers.
- Navngitte containere
  - Bruk `container-name: items-grid` (o.l.) på viktige wrappers. Da kan du skrive `@container items-grid (width < 480px) { ... }` for mer presise regler når siden har flere containere.
- Fallback-strategi
  - Behold viewport-utilities (Tailwind sm/md/lg) som baseline. Container queries overstyrer når støttet. Eldre nettlesere får fortsatt god layout via baseline.
- Standard for modaler/dialoger
  - `max-width: min(100cqw, 640px); width: clamp(320px, 90cqw, 640px);`
  - `max-height: min(85dvh, 90cqh); overflow:auto;`
  - Innhold bruker `padding: var(--space);` og `gap: var(--space);`
- Tabeller
  - Wrapper: `overflow-x:auto;` + `min-w` på tabell.
  - Sticky header: `thead { position: sticky; top: 0; background: var(--background); }` for lesbarhet.
  - Tilrettelegg for tastatur: `tabIndex="0"` på wrapper hvis nødvendig.
- Typografi/kontrast per terskel
  - Under 360px: bruk `--text-sm` og øk `line-height` noe.
  - Over 768px: løft til `--text-md`/`--text-lg` på titler og spacing `var(--space)`.
- CQ mixins
  - Definer hjelpeklasser i CSS: `.cq { container-type: inline-size; }`, `.cq-grid { container-type:inline-size; display:grid; gap:var(--space); }`

Tokens koblet til Tailwind
- Legg til @layer utilities som eksponerer tokens for enkel bruk i JSX:
```css
@layer utilities {
  .space-var { padding: var(--space); }
  .gap-var { gap: var(--gap, var(--space)); }
  .rounded-var { border-radius: var(--radius); }
  .btn-pad { padding-inline: var(--btn-pad, 0.875rem); padding-block: calc(var(--btn-pad, 0.875rem) * 0.6); }
}
```
- Performance
  - Ikke over-nest containere. Sett `container-type` på få, men riktige wrappers (hovedinnhold og større seksjoner).

Akseptansekriterier per side (QA)
- Ingen horisontal scroll ved 320/360/375/414/480/640/768/1024/1280/1536.
- Alle primærknapper har klikkmål ≥ 44x44 CSS px ved alle bredder.
- Ingen avklipt tekst; lange strenger bryter eller trunkeres med `title`-attributt.
- Dialoger/sidepaneler får scroll internt, ikke på body.
- Skjermleser-titler og fokusrekkefølge fungerer i trange containere.

Ferdig-kriterier per prioritet
- P1-sider: alle kriterier over + CLS < 0.1 i Lighthouse; ingen kjent overflow-bug.
- P2/P3: samme, men midlertidig “kompakt”-visning godtas under 360px.

Standardiserte CQ-komponenter (anbefalt bibliotek internt)
- `ResponsiveGrid`: auto-fit grid med `--card-min`, navngitt container, innebygde terskler.
- `ResponsiveDialog`: implementerer modal-standarden over, med `cq` og `overflow:auto`.
- `ResponsiveTable`: wrapper med `overflow-x-auto`, sticky head og min-w tokens.
- `ResponsivePanel`: veksler mellom stack/split via `@container` terskler (f.eks. 480/720px).

Kompakt-liste fallback for tabeller
- Ved `@container (width < 560px)`: skjul tabellheader; render rader som kort-liste med “label: value”. Sørg for `aria-label`/`aria-labelledby` og korrekt rekkefølge for skjermlesere.

Feature-flag og rollback
- Aktiver CQ per side via enkel konfig (env/feature map). Muliggjør å skru av på enkeltsider ved regressjoner.

Ekstra stabilitet og tilgjengelighet
- Sett `min-w-0` på flex-barn globalt for å hindre uønsket overflow.
- Lange id’er/QR-koder: `word-break: break-word;` + monospace font i små containere.
- `html, body { overflow-x: hidden; }` for å unngå mikro-scrollbars.
- iOS safe areas: vurder `padding: env(safe-area-inset-*)` på helskjerm-komponenter.
- Preferer `content-visibility: auto;` på lange lister/paneler for bedre innlastingsytelse.

Test- og verifikasjonsløp
- Storybook med container-bredde-knobs og viewports for nøkkelkomponenter (Grid, Dialog, Table, Panel).
- Playwright visuelle skjermbilder for 6 bredder per side; kjør i CI.
- Sjekkliste (over) krysser vi av per side før ferdigmerking.

Print-støtte (bonus)
- Enkel `@media print` som skalerer typografi, komprimerer margins og skjuler navigasjon.

Kodeeksempler per mønster

Grid (kortlister)
```css
.items-grid { container-type: inline-size; container-name: items-grid; }
.items-grid { display: grid; gap: var(--space); grid-template-columns: repeat(auto-fit, minmax(var(--card-min, 220px), 1fr)); }
@container items-grid (width >= 720px) { .items-grid { --card-min: 240px; } }
@container items-grid (width < 420px) { .item-card__meta { display: grid; grid-template-columns: 1fr; } }
```

Dialog
```css
.responsive-dialog { max-width: min(100cqw, 640px); width: clamp(320px, 90cqw, 640px); max-height: min(85dvh, 90cqh); overflow: auto; }
.responsive-dialog__content { padding: var(--space); gap: var(--space); }
/* Eksempel terskel for å bytte layout internt */
@container (width < 480px) { .dialog-actions { display: grid; grid-template-columns: 1fr; } }
```

Tabell
```css
.table-wrap { overflow-x: auto; }
.table { min-width: var(--table-min, 560px); }
.table thead { position: sticky; top: 0; background: var(--background); }
/* Kompakt-liste fallback */
@container (width < 560px) {
  .table { display: none; }
  .table-compact { display: grid; gap: var(--space); }
  .table-compact__row { border: 1px solid var(--border); border-radius: var(--radius); padding: var(--space); }
}
```

Panel (stack → split)
```css
.panel { container-type: inline-size; }
.panel { display: grid; gap: var(--space); grid-template-columns: 1fr; }
@container (width >= 720px) { .panel { grid-template-columns: 1fr 1fr; } }
```

Do-nots (for å unngå regressjoner)
- Ikke bruk faste bredder/høyder i px på komponenter; bruk min/max/clamp.
- Ikke nest mer enn 2 containere i samme visuelle hierarki.
- Unngå negative margins; bruk tokens for spacing.

Beste praksis CSS og fallback
- Bruk logical properties konsekvent: `inline-size/block-size`, `margin-inline`, etc.
- Foretrekk container-relative enheter: `cqw/cqh/cqi` der det gir mening.
- Avgrens støtte ryddig med `@supports (container-type: inline-size)` for å gi ren baseline-fallback til viewport utilities når CQ ikke støttes.

Interaksjonsdensitet (tokens)
- Innfør `--density: compact | comfy` og utled padding/gap fra denne. Bytt automatisk via `@container (width < 420px)` → compact.

Tilgjengelighet for dialoger/paneler
- Sørg for `aria-modal`, `aria-labelledby`, fokusfelle og scroll-lock på body.
- Sett fokusinitialisering på første interaktive element og håndter Escape.

I18n/RTL og språk med lange ord
- Bruk logical properties så layout speiles automatisk ved `direction: rtl`.
- Test tysk/finsk/engelsk på 320–360px; aktiver `word-break: break-word` på kritiske felter.

Globale CSS-eksempler (inkl. oppstarts-snippet)
```css
:root {
  --space: clamp(8px, 1.2vw, 16px);
  --radius: clamp(6px, 1vw, 12px);
  --text-sm: clamp(12px, 0.95vw, 14px);
  --text-md: clamp(14px, 1.05vw, 16px);
  --text-lg: clamp(16px, 1.3vw, 18px);
}

.cq { container-type: inline-size; }
.cq-grid { container-type: inline-size; display: grid; gap: var(--space); }
html, body { height: 100%; overflow-x: hidden; }
.page { container-type: inline-size; padding: var(--space); }
```

Side for side (rekkefølge og fokus)

Prioritet: [P1] kritiske flows først, [P2] viktig, [P3] øvrig.

Container-navn per side (for presise queries)
- items-grid, locations-grid, yarn-grid, batches-grid, dashboard-grid, settings-panel, matrix-panel, admin-grid.

Oppgave-matrise (kryss av ved ferdig)

| Side | CQ wrapper | Grid | Dialoger | Tabeller | Paneler | QA (akseptanse) | CLS målt |
|------|------------|------|----------|----------|--------|------------------|----------|
| Home (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☑ |
| Dashboard (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| Items (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| Items/[id] (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ |
| Garn (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| Garn/batch/[id] (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ |
| Garn/register (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Locations (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| Locations/mobile (P1) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ |
| Locations/tree (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Locations/layout (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Categories (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Categories/[categoryId] (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Import-Export (P2) | ☑ | ☑ | ☑ | ☑ | ☑ | ☑ | ☐ |
| Analytics (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Settings (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Settings/Hierarchy (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Households (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Households/[id] (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Households/[id]/invite (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☑ |
| Loans (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| AI (P3) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Collaboration (P3) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Patterns (P3) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Scan (P3) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Admin (P2) | ☑ | ☑ | ☑ | ☐ | ☑ | ☑ | ☐ |
| Auth/Sign in (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Onboarding (P3) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Offline (P3) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Auth/Sign up (P2) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| Test (P3) | ☑ | ☑ | ☐ | ☐ | ☑ | ☑ | ☐ |
| … | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

Avhengigheter og risiko per side
- Store tabeller (analytics, admin, items/[id]) – krever kompakt-liste fallback og sticky head verifisering.
- Komplekse kort (garn/batch, locations med hierarki) – test at action-områder ikke flyter utenfor container under 400cqw.
- Matrise (settings/hierarchy) – sørg for slice/virt-list eller horisontal scroll; test tastaturnavigasjon.
- Dialoger (flytt/kopier/veiviser) – verifiser max-height og intern scroll på 320–360px bredde.

Måleplan for CLS
- Lokal: Lighthouse i dev; mål CLS og legg resultat i PR-kommentar.
- CI: Kjør Lighthouse/Playwright visuelle tester, lagre CLS i artefakter.
- Matrise-kolonne “CLS målt” krysses av etter verifisering (< 0.1 for P1).

Oppstarts-snippet i globals.css
```css
/* Basisoppsett for CQ og tokens */
html, body { height: 100%; overflow-x: hidden; }
body { --space: clamp(8px, 1.2vw, 16px); --gap: var(--space); --radius: clamp(6px, 1vw, 12px); }
.page { container-type: inline-size; padding: var(--space); }
```

Sjekklistemal per side
```md
### Side: <path>
- Containere: <navn>
- Terskler: <verdier>
- --card-min: <220/240/…>
- Edge-cases: <tabell/kort/dialog>
- QA: [ ] ingen hor-scroll [ ] 44x44-mål [ ] dialog-scroll [ ] tilgjengelighet ok
- CLS: <verdi> [ ] < 0.1 (P1)
```

PR-krav
- Alle PR-er som endrer layout skal lenke til planen, oppdatere oppgave-matrisen og inkludere skjermbilder for 3 bredder.

1) / (Hjem) [P2]
- Wrapper: `.page { container-type:inline-size; padding:var(--space); }`
- Hero/intro-seksjoner: @container (width < 480px) stabler alt vertikalt; >=480px to kolonner; >=768px tre kolonner ved behov.
- Kortseksjoner bruker auto-fit grid; kort får `min(100%, 360cqw)` breddebegrensning for små containere.

2) /(dashboard)/dashboard [P1]
- Wrapper + hovedgrid: `container-type:inline-size` på content.
- Statistikk-kort: @container (width < 420px) komprimer typografi til `--text-sm`; skjul sekundærtekst; knappene blir fullbredde.
- Aktivitetsliste: `overflow-x:auto` ved smale containere; celler bryter ord (`break-words`).

3) /(dashboard)/items [P1]
- Filtreringsrad: @container (width < 520px) stack felter i 2 rader; combobox går fullbredde.
- Items grid: `repeat(auto-fit, minmax(220px, 1fr))`; på <380px minmax(200px,1fr).
- Kort: bilde `aspect-[4/3]`; meta i to kolonner fra 480px; enkel kolonne under.

4) /(dashboard)/items/[id] [P1]
- Detaljlayout: @container (width < 600px) én kolonne; >=600px 2 kolonner (bilder/metadata).
- Tabeller (distribusjoner, historikk): `overflow-x-auto` + `min-w-[560px]` for rader.
- Handlingsknapper: fullbredde under 420px.

5) /(dashboard)/items/enhanced [P2]
- Data-dense skjerm: sterke container queries for hver panel-komponent.
- Panelstack: @container (width < 720px) – alle paneler i én kolonne; >=720px to kolonner med `minmax(320px,1fr)`.

6) /(dashboard)/garn [P1]
- Listegrid auto-fit; filterpanel container-styrt stacking.
- Kort med fargeprøve: bilde `aspect-[1/1]`; metadata reflower v/ <420px.

7) /(dashboard)/garn/[id] [P1]
- Mastervisning: @container (width < 720px) – bilde og info vertikalt; `Tabs` scrollable (`overflow-x-auto`) i trange containere.

8) /(dashboard)/garn/[id]/farge/[colorId] [P2]
- Fargedetalj: samme prinsipp; behold min/auto høyder, unngå faste piksler.

9) /(dashboard)/garn/register [P2]
- Skjema: felt grupperes 2/3 kolonner over 768/1024, under det fullbredde.
- Hjælp/sidepanel som sticky på >=1024px; under det foldes under skjemaet.

10) /(dashboard)/garn/batch/[id] [P1]
- Toppseksjon (bilde + info) @container – én kolonne < 720px.
- Dialogene (Rask/Wizard): `max-width: min(100cqw, 640px)`; `max-height: min(100dvh-2rem, 80cqh)`; `overflow:auto`.
- Distribusjonsliste: grid 1 kolonne < 640px, 2+ kolonner > 640px ved actions.

11) /(dashboard)/locations [P1]
- Tre del-seksjoner: filter, grid, detaljpanel – hver egen container.
- Grid: auto-fit minmax(220px,1fr); kompakt kortlayout under 400cqw.

12) /(dashboard)/locations/layout [P2]
- Canvasområdet: @container – verktøylinje bryter til 2 rader < 640px; sidepanelet flyter under canvas < 900px.

13) /(dashboard)/locations/mobile [P1]
- Ren mobiloptimal: sikre 320px; større skjermer gir fler-kolonne-lister via container grid.

14) /(dashboard)/locations/tree [P2]
- Trevisning: scrollable panel; nodekort blir kompakte < 420px; indentering balanseres med `text-ellipsis`.

15) /(dashboard)/categories [P2]
- Kortgrid; redigeringsdialoger som i (10).

16) /(dashboard)/categories/[categoryId] [P2]
- Feltskjema: 1 kolonne < 640px; 2 kolonner >= 640px. Felt-lister scrollable.

17) /(dashboard)/households [P2]
- Liste grid auto-fit; handlingsknapper til fullbredde < 420px.

18) /(dashboard)/households/[id] [P2]
- Medlemsliste tabell: `overflow-x-auto` + `min-w-[640px]`.
- Inviter-seksjon som kompakt panel i liten container.

19) /(dashboard)/households/[id]/invite [P2]
- Skjema container-styrt; bekreftelsespanel får `max-w: 100cqw`.

20) /(dashboard)/loans [P2]
- Låneliste: kortgrid ved smal container; tabell ved bred container (>900px) – bytt via `@container` (vis/skjul varianter).

21) /(dashboard)/analytics [P2]
- Kort og grafer i auto-fit grid; grafcontainere: `aspect-[4/3]` < 640px, `aspect-[16/9]` >= 640px.

22) /(dashboard)/import-export [P2]
- To paneler (import/eksport) som stacker; tabeller `overflow-x-auto`.

23) /(dashboard)/ai [P3]
- Prompts/resultater i to paneler; @container justerer split til 1/2 kolonner.

24) /(dashboard)/collaboration [P3]
- Tilstedeværelse + feed i separate containere; feed-celler kort modus < 480px.

25) /(dashboard)/patterns [P3]
- Mønsterkort: auto-fit; bilde `aspect-[3/4]`.

26) /(dashboard)/mobile [P1]
- Særskilt mobil først; på bredere skjermer, sentrer og gi maks bredde 640px.

27) /(dashboard)/settings [P2]
- Seksjonskort som container; switch-rader bryter til vertikal under 420px.

28) /(dashboard)/settings/hierarchy [P2]
- Matrise tabell: wrapper `overflow-x-auto`; ved liten container, vis “kompakt listevisning” med avkrysningslinjer aktivert via `@container (width < 560px)`.

29) /(dashboard)/scan [P3]
- Skannerpanel/manuel panel: stack < 720px; QR-forhåndsvisning skalerer med container.

30) /(dashboard)/admin [P2]
- Adminpaneler i grid; tabeller scrollable.

31) /(dashboard)/analytics (allerede listet) – bekreftet.

32) /(dashboard)/onboarding [P3]
- Trinnkort i auto-fit; progress/bar posisjon byttes via `@container`.

33) /auth/signin og /auth/signup [P2]
- Skjema sentrert; maks bredde 400–480px; på veldig smalt (<360px) reduser padding via tokens.

34) /offline [P3]
- Informasjonskort kompakt < 420px; ikoner skaleres via tokens.

35) /test [P3]
- Behold samme prinsipper.

Teknisk utrulling
- Opprett global CSS (f.eks. `globals.css`) seksjon:
  - `.cq { container-type: inline-size; }`
  - `:root` tokens som over.
- Legg `className="cq"` på hovedinnhold per side (wrapper under header) og på grids.
- For hver side:
  1. Marker wrapper med `cq` og flytt lokale px-verdier til tokens.
  2. Bytt kortlister til auto-fit/minmax.
  3. Legg til `@container` blokker for layout/typo-tilpasning.
  4. Sikre overflow/scroll i tabeller/modaler.
- QA sjekkliste per side (alle terskler, fokus/scroll, skjermleser-titler, interaksjonsmål 44x44).

Milepæler
1. Grunnstruktur (tokens + cq-wrapper) – 1 dag.
2. Høytrafikksider: dashboard, items, locations, garn – 2–3 dager.
3. Modaler/dialoger og matrise – 1 dag.
4. Øvrige sider – 2 dager.

Resultat
- Komponenter skalerer korrekt etter sin container, ikke bare skjermens bredde. Bedre lesbarhet, færre overflow-feil, konsistent UX på tvers av panel/layout-varianter.


