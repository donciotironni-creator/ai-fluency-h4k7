<!--
Prezentare S7 — Plugins
Format slide-uri: fiecare "---" separă un slide, fiecare "##" e titlul slide-ului.
Compatibil Marp / reveal.js / pandoc→pptx. Pentru Marp, decomentează frontmatter-ul de mai jos.
-->
<!--
---
marp: true
theme: default
paginate: true
---
-->

# S7 — Plugins

## Împachetezi tot ca unitate de echipă

Faza 2 · Extensii proprii · ~3h

*Programul de joi — AI Fluency pe Claude Code*

---

## De unde venim → unde mergem

- **S2–S6:** ai construit o componentă pe săptămână — fapte, proceduri, subagenți, hooks, acces MCP.
- Fiecare a rezolvat o problemă reală. Și fiecare a rămas **la tine**, sau în repo-ul în care ai lucrat.
- **S7:** ultima problemă din Faza 2, și nu e tehnică — e de **distribuție**.
- Premisa vine din prep-ul S6: ce ai vrea să aibă și colegul de lângă, fără să-i explici nimic.

---

## Cum s-a partajat, până acum, fiecare artefact

| Artefact | Cum s-a partajat | Limita |
|---|---|---|
| `CLAUDE.md` (S2) | comis în repo | doar în repo-ul ăla |
| skill (S3) | `.claude/skills/`, comis | idem, sau copiat manual |
| subagent (S4) | `.claude/agents/`, comis | idem |
| hook (S5) | `.claude/settings.json` | idem, fără versionare |
| server MCP (S6) | `.mcp.json`, comis | idem |

> Tot ce ai construit e legat de un repo, nemarcat cu versiune, și se propagă prin copy-paste.

---

## Criteriul care ține sesiunea

| Ai... | Ce faci |
|---|---|
| ceva ce vrei **la mai mulți oameni** sau pe **mai multe repo-uri**, cu versionare | **plugin** |
| ceva **personal** sau specific unui singur proiect | rămâne în `.claude/` |

> Regula de aur: promovezi când poți numi **cine altcineva** îl folosește și **de ce versiunea contează**. „Doar eu, oricând, ultima variantă" = standalone.

---

## Ce e un plugin, concret

**Un director.** Atât. Nu se compilează, nu se publică într-un registry.

```
lms-tools/
├── .claude-plugin/
│   └── plugin.json          ← singurul fișier care stă aici
├── skills/review-sql/SKILL.md
├── agents/codebase-explorer.md
├── hooks/hooks.json
├── .mcp.json
└── README.md
```

---

## Manifestul

```json
{
  "name": "lms-tools",
  "description": "Skills, subagenți și acces la baza LMS pentru echipa SQL.",
  "version": "1.0.0",
  "author": { "name": "Echipa SQL SSP" }
}
```

- **`name`** — identificatorul **și namespace-ul** skill-urilor.
- **`description`** — ce se vede în managerul de plugin-uri.
- **`version`** — dacă îl pui, colegii primesc update **doar când îl urci**. Dacă îl omiți pe git, **fiecare commit** e o versiune nouă.

---

## Ce poate împacheta un plugin

| Director / fișier | Ce aduce |
|---|---|
| `skills/<nume>/SKILL.md` | skills (S3), ca `/plugin:nume` |
| `commands/*.md` | forma **veche** a skill-urilor |
| `agents/*.md` | subagenți (S4) |
| `hooks/hooks.json` | hooks (S5) — același format ca în `settings.json` |
| `.mcp.json` | servere MCP (S6) |
| `.lsp.json` | code intelligence (diagnostice, salt la definiție) |
| `monitors/monitors.json` | monitoare de fundal |
| `bin/` | executabile în `PATH`-ul uneltei `Bash` |
| `settings.json` | setări implicite (doar `agent`, `subagentStatusLine`) |

---

## ⚠️ Capcana #1 a zilei

**Nu** pune `skills/`, `agents/`, `hooks/` sau `commands/` în interiorul `.claude-plugin/`.

Doar `plugin.json` stă acolo. Restul stă în **rădăcina plugin-ului**.

> Dacă plugin-ul se încarcă dar „nu are nimic" — asta e prima verificare.

Și: `${CLAUDE_PLUGIN_ROOT}` pentru căi interne. Plugin-urile se copiază în cache, deci o cale către ceva din afara directorului se rupe.

---

## Namespacing — spune-o din start

Skill-urile unui plugin sunt **mereu** prefixate:

```
/lms-tools:review-sql
```

- Nu `/review-sql`. Prefixul nu se poate scoate — se schimbă doar prin `name` din `plugin.json`.
- Previne coliziuni între plugin-uri.
- Dacă vrei nume scurt (`/deploy`), rămâne standalone.

Uneltele MCP dintr-un plugin: `mcp__plugin_<plugin>_<server>__<tool>`. O regulă de permisiune pe cheia scurtă **nu** prinde.

---

## Când promovezi în plugin

**Promovezi când:**
- îl folosește **și altcineva**, sau tu pe **mai multe repo-uri**;
- vrei **versionare** — update controlat, „v1.2 a schimbat X";
- livrezi **mai multe componente împreună** (subagent + skill-ul care-l cheamă + serverul MCP);
- vrei ca un coleg nou să fie productiv fără document de setup.

**Lași în `.claude/` când:** e personal · e specific unui proiect · încă experimentezi · numele scurt contează.

---

## Pas intermediar: plugin în directorul de skills

```bash
claude plugin init lms-tools
```

- Creează `~/.claude/skills/lms-tools/` cu manifest și un `SKILL.md` de start.
- La următoarea sesiune se încarcă singur, ca `lms-tools@skills-dir`.
- Fără marketplace, fără instalare.

> Ai deja structura de plugin (deci poți publica mâine), fără să te ocupi de distribuție azi.

---

## Testare locală — fără să publici nimic

```bash
claude --plugin-dir ./lms-tools        # încarcă direct din director
claude plugin validate ./lms-tools    # ✔ Validation passed
```

- **`/reload-plugins`** — reîncarcă fără restart. Atenție: numărul de „skills" din sumar acoperă **doar `commands/`**, deci poate zice `0 skills` chiar dacă s-au reîncărcat.
- **Tab-ul Errors din `/plugin`** — manifest invalid, LSP care nu pornește, executabil lipsă.
- **`claude plugin details`** — inventarul componentelor.

---

## Migrarea din `.claude/` în plugin

1. `mkdir -p lms-tools/.claude-plugin` + manifestul.
2. Copiezi `.claude/skills/` și `.claude/agents/` în rădăcina plugin-ului.
3. Muți obiectul `hooks` din `settings.json` în `hooks/hooks.json` — **același format**.
4. Testezi cu `--plugin-dir`.
5. **Ștergi originalele.**

> Un subagent din `.claude/agents/` **suprascrie** unul cu același nume din plugin. La skills nu: `/skill` și `/plugin:skill` coexistă.

---

## Marketplace = un repo Git

Nu e un serviciu. E un fișier JSON într-un repo: `.claude-plugin/marketplace.json`.

```json
{
  "name": "ssp-sql",
  "owner": { "name": "Echipa SQL SSP" },
  "plugins": [
    {
      "name": "lms-tools",
      "source": "./plugins/lms-tools",
      "description": "Skills, subagenți și acces la baza LMS.",
      "version": "1.0.0"
    }
  ]
}
```

---

## Forme de `source` și reguli de nume

- **Cale relativă:** `"./plugins/x"` — trebuie să înceapă cu `./`, se rezolvă față de **rădăcina marketplace-ului**, nu față de `.claude-plugin/`.
- **`{"source":"github","repo":"..."}`** (cu `ref` sau `sha`) · **`url`** · **`git-subdir`** (monorepo, clonare sparse) · **`npm`**.
- **`metadata.pluginRoot`** — prefix, ca să scrii `"source": "lms-tools"`.
- **Un marketplace per nume, per utilizator.** Mai multe plugin-uri → **același** `marketplace.json`.
- Nume rezervate: `claude-plugins-official`, `claude-community`, `anthropic-plugins`… și orice imită surse oficiale.

---

## Instalarea: doi pași plus unul

```bash
/plugin marketplace add org/ssp-plugins   # 1. adaugi catalogul
/plugin install lms-tools@ssp-sql         # 2. instalezi, alegi scope-ul
/reload-plugins                           # 3. îl activezi în sesiunea curentă
```

- **Scope-uri:** **user** (toate proiectele tale) · **project** (toți colaboratorii, în `.claude/settings.json`) · **local** (doar tu, doar aici) · **managed** (administrator).
- `/plugin` = panou cu Discover / Installed / Marketplaces / Errors.
- ⚠️ **Ștergerea unui marketplace dezinstalează plugin-urile luate din el.**

---

## Partea care face diferența: repo-ul se auto-configurează

`.claude/settings.json`, **comis**:

```json
{
  "extraKnownMarketplaces": {
    "ssp-sql": { "source": { "source": "github", "repo": "org/ssp-plugins" } }
  },
  "enabledPlugins": { "lms-tools@ssp-sql": true }
}
```

- Ambele sunt **obiecte**, nu liste. `enabledPlugins` are chei `"plugin@marketplace"`.
- Colegul clonează, marchează repo-ul de încredere → primește propunerea de instalare.
- `false` dezactivează la nivel de repo, fără dezinstalare.

---

## Repo privat & auto-update

- **Repo privat merge.** Comenzile pe care le rulezi tu folosesc credențialele git existente (`gh auth login`, keychain, SSH din `ssh-agent`).
- ⚠️ **Auto-update-ul de fundal dezactivează credential helper-ele pe HTTPS** → pe repo privat poate eșua și cade pe re-clonare. Pe SSH nu e afectat.
- Auto-update: activat implicit doar pentru marketplace-urile oficiale Anthropic.

---

## Ce devine standard de casă

Întrebarea de închidere a Fazei 2. Criterii:

- Îl folosesc **cel puțin doi oameni**? Dacă nu — personal.
- E **stabil**? Ce se schimbă săptămânal nu merită versionat încă.
- E **legibil de altcineva**? Un hook pe care doar autorul îl înțelege e datorie tehnică, nu standard.
- **Ce costă?** `/plugin` arată **Context cost** și secțiunea **Will install** înainte de instalare.

---

## Cum verifici că merge — trei pași

1. **Se încarcă?** `claude plugin validate` trece, tab-ul **Errors** e gol.
2. **Componentele apar?** `/plugin:skill` răspunde · subagentul e în `/context` · hook-ul se declanșează · serverul MCP e `✔ Connected`.
3. **Ajunge la altcineva?** Un coleg clonează, acceptă încrederea, instalează — **și îi merge fără să-i explici**.

> Dacă are nevoie de instrucțiuni, plugin-ul nu e gata. Ce te întreabă el = ce lipsește din README.

---

## Igienă — ca să nu adunați gunoi

- `/plugin` grupează sub **Not used recently** plugin-urile nefolosite ~2 săptămâni (peste minim 10 sesiuni), cu **Last used** pe fiecare.
- Alea costă context și pornire degeaba → dezactivează sau dezinstalează.
- **Încredere:** un plugin execută cod arbitrar cu privilegiile tale și poate aduce servere MCP, hooks și executabile în `PATH`. Panoul arată ce aduce **înainte** de instalare — folosește-l. (Serios, în S9.)

---

## Lucru aplicat (~70–85 min)

1. **Inventariază și triază** ce ai în `.claude/` din S2–S6.
2. **Primul plugin, local** — manifest + un skill migrat, testat cu `--plugin-dir`.
3. **Împachetează restul** — subagent (S4), hook (S5), server MCP (S6).
4. **Marketplace-ul** — `.claude-plugin/marketplace.json`, pushat.
5. **Instalarea reală** + `extraKnownMarketplaces` / `enabledPlugins` comise.
6. **Capstone** — `validate`, versiune, README, cei trei pași.

---

## Capcane comune

- **Componente în `.claude-plugin/`.** → plugin „gol". Prima verificare.
- **Se împachetează tot.** → poți numi cine altcineva îl folosește?
- **Surpriza cu namespacing.** → `/plugin:deploy`, nu `/deploy`.
- **Duplicate după migrare.** → subagentul din `.claude/` suprascrie pe cel din plugin.
- **`0 skills` la reload.** → numără doar `commands/`. Nu e eroare.
- **Fără `version`.** → fiecare commit devine versiune nouă.
- **Cale `source` greșită.** → față de rădăcina marketplace-ului, cu `./`.
- **Se uită `/reload-plugins`.** → instalat ≠ activ.

---

## Cu ce pleci — checklist

- [ ] Un plugin cu manifest valid (`claude plugin validate` trece).
- [ ] Cel puțin două componente din S3–S6 împachetate.
- [ ] `.claude-plugin/marketplace.json` pushat într-un repo.
- [ ] `.claude/settings.json` comis cu `extraKnownMarketplaces` + `enabledPlugins`.
- [ ] `version` setat intenționat, README care ajunge.
- [ ] **Un coleg a instalat și i-a mers**, fără explicații de la tine.

---

## Prep pentru S8

- Notează **o sarcină pe care o faci manual și repetat, și pe care ai lăsa-o să ruleze singură** — fără cineva în fața terminalului.
- Candidați: review automat pe fiecare PR, verificare de noapte pe un log, un raport, triaj de tickete.
- Tot ce ai construit în Faza 2 presupune că **tu ești în sesiune**.
- În S8 scoatem omul din buclă: **headless** — Claude Code neinteractiv, din scripturi și CI.
- Notează și **ce ar trebui să se întâmple dacă eșuează** când nu e nimeni acolo.

---

# Întrebări?

Următorul pas: **S8 — Headless & automatizare**

*Faza 2 e închisă. Review de fază: ce devine standard de casă?*

---

<!-- APPENDIX — slide-uri de backup, doar dacă apar întrebări avansate. Nu fac parte din flux. -->

## Appendix · Dezvoltare & distribuție avansată

- **`--plugin-url`** — încarcă un plugin din `.zip` de la un URL, doar pentru sesiunea curentă (artefacte de CI).
- **Precedență la testare:** `--plugin-dir` bate un plugin instalat cu același nume, pentru acea sesiune. Excepție: plugin-uri forțate de managed settings.
- **Dependențe** — un plugin poate declara dependențe; cele către alt marketplace sunt blocate dacă nu apar în `allowCrossMarketplaceDependenciesOn`.
- **`renames`** în `marketplace.json` — mapare nume vechi → nume nou (sau `null` dacă a fost scos), pentru migrare automată.
- **Numele din marketplace ≠ numele din `plugin.json`** — la `enable`/`disable`/`uninstall` se folosește cel din marketplace.

---

## Appendix · Componente mai rare & guvernanță

- **LSP** — diagnostice după fiecare edit + navigare. Există gata făcute în marketplace-ul oficial (`csharp-lsp` cere `csharp-ls`, `typescript-lsp` cere `typescript-language-server`); binarul nu se instalează singur.
- **Monitors** — fiecare linie de stdout a comenzii ajunge la Claude ca notificare în sesiune.
- **`settings.json` de plugin** — cheia `agent` activează un agent al plugin-ului ca thread principal (system prompt, unelte, model).
- **Marketplace-uri Anthropic:** `claude-plugins-official` (curat, adăugat automat) și `claude-community` (submisii terțe, adăugat manual, fiecare plugin pinuit pe SHA).
- **Guvernanță (S9/S10):** `strictKnownMarketplaces`, plugin-uri forțate din managed settings, `autoUpdate` per marketplace.
- **Cache:** `~/.claude/plugins/cache`. Când skill-urile „nu apar" deloc — curăță cache-ul și reinstalează.
