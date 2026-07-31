# Claude Code Fluency — Ghid de facilitare · S7

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Numele câmpurilor, comenzile și lista de componente se pot schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/plugins`, `/plugin-marketplaces`, `/discover-plugins`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Verificat pe docul oficial în iulie 2026** — trei lucruri de reținut ca fiind curente: (1) **componentele unui plugin** sunt `skills/`, `commands/` (formă veche), `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `monitors/`, `bin/` și `settings.json` — **„output styles" nu mai e un director de componentă**, ci un plugin ca oricare altul; (2) instalarea e un proces în **doi pași** (adaugi marketplace-ul, apoi instalezi plugin-ul), plus `/reload-plugins` ca să se activeze în sesiunea curentă; (3) skill-urile unui plugin sunt **mereu prefixate** cu numele plugin-ului — `/nume-plugin:skill`, niciodată `/skill`.

---

## S7 — Plugins: împachetezi tot ca unitate de echipă

Ultima sesiune din **Faza 2 — Extensii proprii**. În S2–S6 ai construit componente, una pe săptămână: fapte în `CLAUDE.md`, proceduri în skills, muncă izolată în subagenți, garanții în hooks, acces în servere MCP. Fiecare a rezolvat o problemă reală. Și fiecare a rămas **la tine**, sau cel mult în repo-ul în care ai lucrat.

Azi rezolvi ultima problemă din Faza 2, care nu e tehnică, e de **distribuție**: cum ajunge ce ai construit la colegi, versionat, actualizabil, fără instrucțiuni de setup.

Premisa vine direct din prep-ul de la finalul S6: fiecare a notat **ce din tot ce a construit ar vrea să aibă și colegul de lângă, fără să-i explice nimic**.

### Legătura cu S6 — de la „am configurat" la „am publicat"

Uită-te cu grupul la cum s-a partajat fiecare artefact până acum. E un exercițiu de 3 minute care justifică toată ziua:

| Artefact | Cum s-a partajat până acum | Limita |
|----------|---------------------------|--------|
| `CLAUDE.md` (S2) | comis în repo | doar în repo-ul ăla |
| skill (S3) | comis în `.claude/skills/` | doar în repo-ul ăla; sau copiat manual în `~/.claude/` |
| subagent (S4) | comis în `.claude/agents/` | idem |
| hook (S5) | în `.claude/settings.json` | idem, plus fără versionare |
| server MCP (S6) | `.mcp.json` comis | idem |

Tiparul e clar: **tot ce ai construit e legat de un repo, nemarcat cu versiune, și se propagă prin copy-paste.** Dacă trei colegi au configurat același server MCP în trei feluri, problema nu e serverul.

Un **plugin** rezolvă exact asta: un director versionat care poate livra împreună skills, subagenți, hooks, servere MCP (și mai mult), instalabil cu o comandă, dintr-un **marketplace** care e pur și simplu un repo Git.

Un singur criteriu ține sesiunea:

- **Îl vrei la mai mulți oameni sau pe mai multe repo-uri, cu versionare** → plugin.
- **E personal, sau specific unui singur proiect** → rămâne în `.claude/`. Nu împachetezi ce nu circulă.

### Obiective de învățare

La final, fiecare știe:
- Ce e un plugin, concret: un **director** cu componente și, opțional, un manifest `.claude-plugin/plugin.json` — nu un format binar, nu un pachet publicat într-un registry.
- **Ce poate împacheta** un plugin: `skills/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `monitors/`, `bin/`, `settings.json` — și că `commands/` e forma veche a skill-urilor.
- **Capcana de structură:** doar `plugin.json` stă în `.claude-plugin/`; toate celelalte directoare stau în **rădăcina plugin-ului**.
- Că skill-urile devin **namespaced**: `/nume-plugin:skill`. Namespacing-ul previne coliziuni, dar schimbă cum le cheamă oamenii.
- **Când promovezi** ceva din `.claude/` în plugin — și când nu.
- Cum **dezvolți și testezi local**, fără să publici nimic: `claude --plugin-dir ./plugin`, `/reload-plugins`, `claude plugin validate`.
- Ce e un **marketplace**: un repo Git cu `.claude-plugin/marketplace.json`, adăugat cu `/plugin marketplace add owner/repo`.
- Cum se instalează, pe ce **scope** (user / project / local / managed), și cum faci ca **repo-ul echipei să propună singur** plugin-urile: `extraKnownMarketplaces` + `enabledPlugins` în `.claude/settings.json`, comis.
- Cum decizi ce devine **standard de casă** și ce rămâne personal — inclusiv costul de context al unui plugin.

> **Notă de scop pentru facilitator:** S7 e sesiunea de **consolidare a Fazei 2**, nu una de sintaxă nouă. Miezul conceptual e **segmentul 3** (standalone vs. plugin: ce merită promovat) — fără el, oamenii împachetează tot, inclusiv lucruri personale care n-ar trebui să circule. Miezul practic e **segmentul 5** (marketplace-ul echipei), pentru că acolo se produce artefactul. Dacă timpul strânge, comprimă segmentul 2 (anatomia se citește repede din tabel) și segmentul 4 (testarea locală devine demo de 5 minute). **Protejează 3 și 5.** Capcana clasică a zilei: cineva pune `skills/` în interiorul `.claude-plugin/` și nu-i mai apare nimic — e prima verificare când ceva „nu se încarcă".

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 90–110 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici + review de fază | 20–25 min |

---

### Tutorial (90–110 min)

Concret, cu demo pe repo-ul de nisip. Șase segmente.

#### 1. De ce plugins — problema care a rămas (10–15 min)

- **Punctul de plecare:** artefactul notat în prep-ul S6. Întreabă în cerc: „ce ai vrea să aibă și colegul de lângă, fără să-i explici?" Notează pe tablă — e materialul de triaj pentru segmentul 3.
- **Fă tabelul de mai sus, live.** Pentru fiecare artefact din S2–S6, întreabă cum s-ar propaga la un coleg nou. Răspunsul e mereu „copiază fișierul" sau „clonează repo-ul ăsta anume". Ăsta e simptomul.
- **Ce schimbă un plugin:** o unitate cu **nume și versiune**, care aduce mai multe componente deodată, instalabilă cu o comandă, actualizabilă cu `git push` la autor. Un coleg nou nu primește instrucțiuni de setup — primește un nume de plugin.
- **De ce nu e „doar un repo cu fișiere":** pentru că e **descoperibil** (apare în `/plugin`), **versionat** (primești update doar când autorul urcă versiunea), **namespaced** (nu se calcă cu ce ai deja) și **auditabil înainte de instalare** (`/plugin` arată ce componente aduce și cât te costă în context).

**Demo:** instalează live un plugin din marketplace-ul oficial — `/plugin install commit-commands@claude-plugins-official`, apoi `/reload-plugins`, apoi `/commit-commands:commit`. Trei comenzi, zero setup. Punctează: asta e experiența pe care o construim azi pentru echipă.

> **Firul S3, dus mai departe:** un skill de plugin se cheamă `/nume-plugin:skill`, nu `/skill`. Prefixul e obligatoriu și nu se poate scoate — se schimbă doar prin `name` din `plugin.json`. Spune-o acum, ca să nu fie surpriză la segmentul 4.

#### 2. Anatomia unui plugin (15–20 min)

Un plugin e **un director**. Atât. Nu se compilează, nu se publică în npm (deși poate fi distribuit și așa).

```
lms-tools/
├── .claude-plugin/
│   └── plugin.json          ← singurul fișier care stă aici
├── skills/
│   └── review-sql/
│       └── SKILL.md
├── agents/
│   └── codebase-explorer.md
├── hooks/
│   └── hooks.json
├── .mcp.json
└── README.md
```

**Manifestul** `.claude-plugin/plugin.json`:

```json
{
  "name": "lms-tools",
  "description": "Skills, subagenți și acces la baza LMS pentru echipa SQL.",
  "version": "1.0.0",
  "author": { "name": "Echipa SQL SSP" }
}
```

- **`name`** — identificatorul **și namespace-ul** skill-urilor. `review-sql/` într-un plugin numit `lms-tools` devine `/lms-tools:review-sql`.
- **`description`** — ce se vede în managerul de plugin-uri când cineva răsfoiește.
- **`version`** (opțional) — dacă îl pui, colegii primesc update **doar când îl urci**. Dacă îl omiți și distribui prin git, se folosește SHA-ul de commit, deci **fiecare commit e o versiune nouă**. Pentru un plugin de echipă: pune versiune.
- **`author`** (opțional) — atribuire.

**Componentele**, toate în **rădăcina** plugin-ului:

| Director / fișier | Ce aduce |
|-------------------|----------|
| `skills/<nume>/SKILL.md` | skills (S3), namespaced ca `/plugin:nume` |
| `commands/*.md` | forma **veche** a skill-urilor, fișiere plate. Pentru plugin-uri noi folosește `skills/` |
| `agents/*.md` | subagenți (S4) |
| `hooks/hooks.json` | hooks (S5) — același format ca obiectul `hooks` din `settings.json` |
| `.mcp.json` | servere MCP (S6) |
| `.lsp.json` | servere LSP (code intelligence: diagnostice după fiecare edit, salt la definiție) |
| `monitors/monitors.json` | monitoare de fundal — urmăresc un log sau un status și îi notifică pe Claude |
| `bin/` | executabile adăugate în `PATH`-ul uneltei `Bash` cât plugin-ul e activ |
| `settings.json` | setări implicite când plugin-ul e activ; momentan doar cheile `agent` și `subagentStatusLine` |

> ⚠️ **Capcana #1 a zilei, și cea mai frecventă:** **nu** pune `skills/`, `agents/`, `hooks/` sau `commands/` în interiorul `.claude-plugin/`. Doar `plugin.json` stă acolo. Restul stă în rădăcina plugin-ului. Dacă plugin-ul se încarcă dar „nu are nimic", asta e prima verificare.

- **`${CLAUDE_PLUGIN_ROOT}`** — în `.mcp.json` sau în hooks, se substituie cu directorul de instalare al plugin-ului. Îl folosești ca să referențiezi scripturi proprii, fără căi absolute de pe mașina ta. Există și `${CLAUDE_PLUGIN_DATA}` (stare persistentă) și `${CLAUDE_PROJECT_DIR}`.
- **Numele uneltelor MCP dintr-un plugin sunt mai lungi:** `mcp__plugin_<plugin>_<server>__<tool>`. O regulă de permisiune scrisă pe cheia scurtă a serverului **nu** prinde. Leagă direct de S6.
- **Un plugin cu exact un singur skill** poate pune `SKILL.md` direct în rădăcină, fără director `skills/`. Pentru orice plugin care ar putea crește, folosește `skills/`.

**Demo:** deschide un plugin instalat din cache (`~/.claude/plugins/cache/...`) sau creează pe loc structura de mai sus și arăt-o. Apoi rulează `/plugin`, intră pe tab-ul **Installed**, deschide un plugin și arată inventarul de componente pe care le contribuie.

#### 3. Standalone vs. plugin — ce merită promovat (20–25 min)

Miezul conceptual al zilei — echivalentul segmentului „când merită" din S3/S4/S5/S6. Ia lista de pe tablă din segmentul 1 și **triază-o live**.

| Abordare | Cum arată un skill | Bună pentru |
|----------|-------------------|-------------|
| **Standalone** (`.claude/`) | `/deploy` | fluxuri personale, particularități de proiect, experimente rapide |
| **Plugin** | `/nume-plugin:deploy` | partajare cu echipa, versionare, reutilizare pe mai multe repo-uri, distribuție |

**Promovează în plugin când:**
- Vrei să-l folosească **și altcineva**, sau **tu, pe mai multe repo-uri**.
- Vrei **versionare** — să poți spune „v1.2 a schimbat comportamentul" și să dai update controlat.
- Livrezi **mai multe componente împreună** care n-au sens separat (un subagent + skill-ul care-l cheamă + serverul MCP pe care se sprijină).
- Vrei ca un coleg nou să fie productiv fără un document de setup.

**Lasă în `.claude/` când:**
- E **personal** — reguli de stil, preferințe, `~/.claude/CLAUDE.md`. Nu tot ce e util trebuie să circule.
- E **specific unui proiect** și n-are sens în altul.
- Încă **experimentezi**. Recomandarea din doc e explicită: începi standalone, iterezi rapid, promovezi când e gata de partajat.
- Numele scurt contează. Într-un plugin nu poți avea `/deploy` — devine `/plugin:deploy`.

> **Regula de aur:** promovezi când poți numi **cine altcineva** îl folosește și **de ce versiunea contează**. Dacă răspunsul e „doar eu, oricând, ultima variantă" — rămâne standalone.

**Cazul special care merită 2 minute:** un plugin poate fi ținut și în directorul tău de skills, fără marketplace. `claude plugin init nume` creează `~/.claude/skills/nume/` cu manifest și un `SKILL.md` de start, iar la următoarea sesiune se încarcă singur ca `nume@skills-dir`. Bun ca pas intermediar: ai deja structura de plugin (deci poți publica mâine), fără să te ocupi de distribuție azi.

**Demo:** ia trei artefacte reale de pe tablă și triază-le cu grupul, în voce tare: „ăsta e personal, rămâne; ăsta îl vor toți, promovează; ăsta încă se schimbă săptămânal, mai stă". Rezistă tentației de a spune „hai să le punem pe toate" — exact asta antrenăm să nu se facă.

#### 4. Dezvoltare și testare locală — fără să publici nimic (15–20 min)

Tot ce urmează se face **local**. Publicarea vine în segmentul 5.

- **`claude --plugin-dir ./lms-tools`** — pornește o sesiune cu plugin-ul încărcat direct din director, fără instalare. Se poate repeta pentru mai multe plugin-uri, și acceptă și un `.zip`.
- **`/reload-plugins`** — reîncarcă plugin-uri, skills, agenți, hooks și serverele MCP/LSP de plugin, fără restart. Atenție la un detaliu care încurcă: **numărul de „skills" din sumar acoperă doar `commands/`**, deci poate raporta `0 skills` chiar dacă skill-urile din `skills/` s-au reîncărcat corect.
- **`claude plugin validate ./lms-tools`** — validează structura. Trece cu `✔ Validation passed` (sau „with warnings"); `--strict` transformă warning-urile în erori.
- **Tab-ul Errors din `/plugin`** — acolo apar erorile de încărcare: manifest invalid, server LSP care nu pornește, executabil lipsă.
- **`claude plugin details`** — inventarul componentelor, din linia de comandă.

**Migrarea din `.claude/` în plugin**, pașii din doc:
1. `mkdir -p lms-tools/.claude-plugin` și scrii manifestul.
2. Copiezi directoarele: `.claude/skills/` → `lms-tools/skills/`, `.claude/agents/` → `lms-tools/agents/`.
3. Hooks: muți obiectul `hooks` din `.claude/settings.json` în `lms-tools/hooks/hooks.json` — **același format**.
4. Testezi cu `--plugin-dir`.
5. **Ștergi originalele** din `.claude/`, altfel ai duplicate. Nuanță care încurcă: un subagent din `.claude/agents/` **suprascrie** unul cu același nume din plugin, deci versiunea din plugin nu se activează până nu ștergi originalul. La skills nu e suprascriere: `/skill` și `/plugin:skill` coexistă.

**Demo:** ia un skill real din S3 și un subagent din S4 de pe repo-ul de nisip, migrează-le într-un plugin, pornește cu `--plugin-dir` și arată `/nume-plugin:skill` funcționând. Apoi rupe intenționat structura (mută `skills/` în `.claude-plugin/`), arată că nu mai apare nimic, și repar-o. Capcana #1, văzută.

#### 5. Marketplace — magazinul echipei e un repo Git (20–25 min)

Miezul practic al zilei. Aici se produce artefactul.

Un **marketplace** e un repo Git (sau un director local, sau un URL) care conține `.claude-plugin/marketplace.json`. Nu e un serviciu, nu e o platformă. E un fișier JSON într-un repo.

```json
{
  "name": "ssp-sql",
  "owner": { "name": "Echipa SQL SSP", "email": "..." },
  "plugins": [
    {
      "name": "lms-tools",
      "source": "./plugins/lms-tools",
      "description": "Skills, subagenți și acces la baza LMS.",
      "version": "1.0.0"
    },
    {
      "name": "sql-review",
      "source": { "source": "github", "repo": "org/sql-review-plugin" },
      "description": "Review de T-SQL înainte de commit."
    }
  ]
}
```

- **`name`** e public: colegii îl scriu la instalare (`/plugin install lms-tools@ssp-sql`). Kebab-case. Un utilizator poate avea **un singur marketplace per nume** — dacă adaugi altul cu același nume, îl înlocuiește. Deci mai multe plugin-uri se listează în **același** `marketplace.json`, nu în marketplace-uri separate.
- **`owner.name`** e obligatoriu; `email` și `url` sunt opționale.
- **Formele de `source`** pentru un plugin: cale relativă (`"./plugins/x"`, trebuie să înceapă cu `./`, se rezolvă față de rădăcina marketplace-ului, **nu** față de `.claude-plugin/`) · `{"source":"github","repo":"..."}` (cu `ref` sau `sha`) · `{"source":"url","url":"..."}` · `{"source":"git-subdir","url":"...","path":"..."}` pentru monorepo-uri · `{"source":"npm","package":"..."}`.
- **`metadata.pluginRoot`** — prefix pentru căile relative, ca să scrii `"source": "lms-tools"` în loc de `"./plugins/lms-tools"`.
- **Nume rezervate:** `claude-plugins-official`, `claude-community`, `anthropic-plugins` și altele sunt blocate, la fel ca numele care imită surse oficiale. Alege un nume de casă (`ssp-sql`, `ssp-internal`).

**Fluxul de partea consumatorului, doi pași plus unul:**

```bash
/plugin marketplace add org/ssp-plugins     # 1. adaugi catalogul (owner/repo, URL git, cale locală)
/plugin install lms-tools@ssp-sql           # 2. instalezi plugin-ul, alegi scope-ul
/reload-plugins                             # 3. îl activezi în sesiunea curentă
```

- **Scope-uri de instalare:** **user** (tu, pe toate proiectele) · **project** (toți colaboratorii repo-ului, scris în `.claude/settings.json`) · **local** (tu, doar în repo-ul ăsta) · **managed** (pus de administrator, nu se modifică). Paralel direct cu scope-urile de la MCP din S6 și de la permisiuni din S1.
- **Alte comenzi:** `/plugin` (panou cu tab-urile Discover / Installed / Marketplaces / Errors), `/plugin list`, `/plugin disable`, `/plugin enable`, `/plugin uninstall`, `/plugin marketplace list|update|remove`. Pentru scripting există echivalentele `claude plugin ...`, care nu deschid panoul. Scurtături: `/plugin market` și `rm`.
- ⚠️ **Ștergerea unui marketplace dezinstalează plugin-urile instalate din el.**

**Partea care face diferența pentru echipă — repo-ul se auto-configurează.** În `.claude/settings.json` **comis** pui marketplace-ul și plugin-urile activate; când un coleg deschide repo-ul și îl marchează ca de încredere, Claude Code îi propune instalarea:

```json
{
  "extraKnownMarketplaces": {
    "ssp-sql": {
      "source": { "source": "github", "repo": "org/ssp-plugins" }
    }
  },
  "enabledPlugins": {
    "lms-tools@ssp-sql": true
  }
}
```

> Formele de mai sus sunt **obiecte**, nu liste: `extraKnownMarketplaces` e indexat pe numele marketplace-ului, iar `enabledPlugins` are chei `"plugin@marketplace"` cu valoare booleană. (Verificate atât pe doc, cât și pe o instalare reală.) `false` dezactivează explicit un plugin — util ca să scoți ceva la nivel de repo fără să-l dezinstalezi.

- **Repo privat:** merge. Comenzile pe care le rulezi tu folosesc credențialele git existente (`gh auth login`, keychain, SSH din `ssh-agent`). Nuanță: **auto-update-ul de fundal dezactivează credential helper-ele** pe HTTPS, deci pe repo privat actualizările automate pot eșua și cad pe re-clonare; pe SSH nu e afectat.
- **Auto-update:** activat implicit pentru marketplace-urile oficiale Anthropic, dezactivat pentru cele terțe și locale. Se comută din `/plugin` → Marketplaces.

**Demo:** creează live un marketplace minimal (un director cu `.claude-plugin/marketplace.json` care listează plugin-ul din segmentul 4), adaugă-l cu `/plugin marketplace add ./calea-locală`, instalează plugin-ul, `/reload-plugins`, cheamă skill-ul. Apoi arată același lucru pornind de la `owner/repo`. La final arată `.claude/settings.json` cu cele două chei și explică de ce ăsta e artefactul care contează.

#### 6. Ce devine standard de casă — și cum verifici (20–25 min)

Aici se închide Faza 2. Segmentul are două jumătăți: **decizia** și **verificarea**.

**Decizia — review de fază (folosește-l ca discuție, nu ca prelegere).** Ai acum, în echipă, artefacte din patru sesiuni. Întrebarea e: *ce intră în plugin-ul de casă și ce rămâne personal?* Criterii utile:
- Îl folosesc **cel puțin doi oameni**? Dacă nu, e personal.
- E **stabil**? Ce se schimbă săptămânal nu merită versionat încă.
- E **legibil de altcineva**? Un hook pe care doar autorul îl înțelege nu e standard, e datorie tehnică.
- **Ce costă?** Un plugin adaugă context la fiecare tură. `/plugin` arată o estimare de **Context cost** înainte de instalare, plus ce componente aduce („Will install"). Un plugin cu MCP costă mai mult dacă uneltele lui nu sunt amânate de tool search (S6).

**Verificarea, în trei pași** — aceeași structură ca la S3–S6:
1. **Se încarcă?** `claude plugin validate` trece, iar tab-ul **Errors** din `/plugin` e gol.
2. **Componentele apar?** Skill-ul răspunde ca `/nume-plugin:skill`; subagentul apare în `/context` la Custom Agents; hook-ul se declanșează pe evenimentul lui; serverul MCP e `✔ Connected` în `claude mcp list`.
3. **Ajunge la altcineva?** Testul real: **un coleg clonează repo-ul, acceptă încrederea, instalează, și îi merge** — fără să-i explici nimic. Dacă are nevoie de instrucțiuni, plugin-ul nu e gata.

**Igiena, ca să nu adunați gunoi:** managerul de plugin-uri grupează sub **Not used recently** plugin-urile instalate manual pe care nu le-ai folosit în ultimele două săptămâni (peste minim 10 sesiuni), și arată **Last used** pe fiecare. Alea costă context și pornire degeaba — dezactivează-le sau dezinstalează-le. Fitil spre S9 (cost) și S10 (standard de casă).

**Demo:** rulează cei trei pași pe plugin-ul creat în segmentele 4–5. Pentru pasul 3, cel mai bun demo e cu un participant: dă-i numele marketplace-ului și lasă-l să instaleze de la zero, în fața grupului. Ce întreabă el = ce lipsește din README.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu **un plugin de echipă, minimal dar real, într-un repo versionat**, listat într-un **marketplace**, plus `.claude/settings.json` comis care îl propune singur colegilor.

1. **Inventariază și triază** — ce ai în `.claude/` din S2–S6? Ce promovezi, ce rămâne personal?
2. **Primul plugin, local** — manifest + un skill migrat, testat cu `--plugin-dir`.
3. **Împachetează restul** — subagentul din S4, hook-ul din S5, serverul MCP din S6, cât se aplică.
4. **Marketplace-ul** — `.claude-plugin/marketplace.json`, pushat.
5. **Instalarea reală** — de la marketplace, pe scope-ul potrivit, plus `extraKnownMarketplaces` + `enabledPlugins` comise.
6. **Capstone** — `validate`, versiune, README, și cei trei pași de verificare.

**Extensie (dacă ai terminat):** schimbă ceva în plugin, urcă `version`, push, și fă un coleg să ia update-ul (`/plugin marketplace update`). Sau: instalează plugin-ul unui coleg și spune-i ce ți-a lipsit din README.

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- **Un plugin de echipă** (chiar minimal) într-un repo versionat, listat în `.claude-plugin/marketplace.json`, plus `.claude/settings.json` comis cu `extraKnownMarketplaces` și `enabledPlugins` — astfel încât un coleg care clonează repo-ul primește propunerea de instalare, nu un document de setup.

### Schimb de practici + review de fază (20–25 min)

Fiecare, ~2 min:
- Ce a împachetat și ce a **lăsat** afară conștient (partea a doua e mai interesantă).
- Un moment „aici s-a văzut diferența" — de obicei momentul în care altcineva l-a instalat și i-a mers.

Apoi **10 minute de review de fază, cu tot grupul** — închiderea Fazei 2: *ce devine standard de casă și ce rămâne personal?* Faceți lista pe tablă, în două coloane. Notați-o în docul „AI Wins & Fails", coloana „Candidat standard?" — lista aia devine input direct pentru **S10 (playbook-ul de echipă)**.

---

### Capcane comune (note pentru facilitator)

- **Componente puse în `.claude-plugin/`.** Capcana #1, aproape sigur apare. Doar `plugin.json` stă acolo. Dacă un plugin se încarcă „gol", verifică asta întâi.
- **Se împachetează tot.** A doua capcană a zilei. Reguli personale, `~/.claude/CLAUDE.md`, experimente de săptămâna asta — nu circulă. Testul: *poți numi cine altcineva îl folosește?*
- **Surpriza cu namespacing.** Cineva migrează `/deploy` și se supără că nu mai răspunde la `/deploy`. Într-un plugin e `/plugin:deploy`, obligatoriu. Spune-o în segmentul 1, nu la sfârșit.
- **Duplicate după migrare.** Dacă nu ștergi originalul din `.claude/agents/`, el **suprascrie** subagentul din plugin. La skills e altfel: coexistă ambele. Confuzia asta mănâncă timp.
- **`0 skills` la `/reload-plugins`.** Numărul acoperă doar `commands/`. Nu e o eroare, dar oamenii cred că e.
- **Fără `version`.** Un plugin distribuit prin git fără `version` face din fiecare commit o versiune nouă. Pentru un plugin de echipă, pune versiune și urc-o intenționat.
- **Marketplace cu nume rezervat sau duplicat.** Numele care imită surse Anthropic sunt blocate; și un nume duplicat înlocuiește marketplace-ul existent al utilizatorului. Un nume de casă, un singur `marketplace.json`.
- **Cale relativă greșită la `source`.** Se rezolvă față de rădăcina marketplace-ului, nu față de `.claude-plugin/`, și trebuie să înceapă cu `./`.
- **Se uită `/reload-plugins`.** Instalat ≠ activ în sesiunea curentă. Prima întrebare când „nu apare".
- **Încredere oarbă.** Un plugin execută cod arbitrar cu privilegiile tale, și poate aduce servere MCP, hooks și executabile în `PATH`. Instalezi doar din surse în care te încrezi. Panoul `/plugin` arată ce componente aduce **înainte** de instalare — folosește-l. Fir direct spre S9.
- **Referințe la fișiere din afara plugin-ului.** Plugin-urile se copiază în cache (`~/.claude/plugins/cache`), deci o cale către ceva din afara directorului plugin-ului se rupe. Folosește `${CLAUDE_PLUGIN_ROOT}`.

### Întrebări avansate — note pentru facilitator (opțional, NU e în cele 6 segmente)

Răspunsuri scurte, verificate pe docul oficial (iulie 2026). **Nu le preda proactiv** — protejează segmentele 3 și 5.

- **`--plugin-url`** — încarcă un plugin dintr-o arhivă `.zip` de la un URL, doar pentru sesiunea curentă. Util pentru artefacte de CI. Aceleași considerații de încredere.
- **Precedență la testare:** un plugin încărcat cu `--plugin-dir` bate unul instalat cu același nume, pentru sesiunea respectivă — deci poți testa o schimbare fără să dezinstalezi. Excepție: plugin-urile forțate de managed settings.
- **Dependențe între plugin-uri** — un plugin poate declara dependențe; la instalare se listează ce s-a instalat automat. Dependențele către alt marketplace sunt blocate dacă nu apare în `allowCrossMarketplaceDependenciesOn`.
- **`renames`** în `marketplace.json` — mapare de la numele vechi al unui plugin la cel nou (sau `null` dacă a fost scos), ca utilizatorii existenți să migreze automat.
- **Numele din marketplace ≠ numele din `plugin.json`.** La `/plugin enable|disable|uninstall` se folosește numele din intrarea de marketplace. Versiunile recente acceptă oricare dintre cele două.
- **LSP** — plugin-urile de code intelligence dau diagnostice după fiecare edit și navigare (salt la definiție, referințe). Există gata făcute în marketplace-ul oficial pentru limbajele mari (`csharp-lsp` cere `csharp-ls`, `typescript-lsp` cere `typescript-language-server`); binarul nu se instalează singur.
- **Monitors** — `monitors/monitors.json`: fiecare linie de stdout a comenzii ajunge la Claude ca notificare în sesiune. Bun pentru „urmărește log-ul de erori".
- **`settings.json` de plugin** — cheia `agent` activează unul din agenții plugin-ului ca thread principal (system prompt, unelte, model). Un plugin poate deci schimba felul în care se comportă Claude Code by default.
- **Marketplace-uri publice Anthropic:** `claude-plugins-official` (curat, se adaugă automat la prima pornire) și `claude-community` (submisii terțe, se adaugă manual cu `/plugin marketplace add anthropics/claude-plugins-community`, fiecare plugin pinuit pe un SHA).
- **Guvernanță (S9/S10)** — administratorii pot restrânge marketplace-urile permise (`strictKnownMarketplaces`), pot forța plugin-uri prin managed settings, și pot activa auto-update per marketplace din `extraKnownMarketplaces`.
- **Cache** — plugin-urile stau în `~/.claude/plugins/cache`. Când skill-urile unui plugin „nu apar" deloc, curățarea cache-ului plus reinstalare e remediul documentat.

---

### Prep pentru S8

Temă de 5 minute: fiecare notează **o sarcină pe care o face manual și repetat, și pe care ar lăsa-o să ruleze singură** — fără să stea cineva în fața terminalului. Candidați: un review automat pe fiecare PR, o verificare de noapte pe un log, generarea unui raport, un triaj de tickete. Tot ce ai construit până acum (Faza 2) presupune că **tu ești în sesiune**, cu degetul pe trăgaci. În S8 scoatem omul din buclă: **headless** — Claude Code rulat neinteractiv, din scripturi și din CI. Notează și ce ar trebui să se întâmple dacă sarcina eșuează când nu e nimeni acolo.
