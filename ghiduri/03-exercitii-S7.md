# Proiectul-școală LMS — Exerciții · S7

*Pentru participanți. Continuarea proiectului LMS început în S0–S6.*

> **Regula de siguranță:** un plugin execută **cod arbitrar cu privilegiile tale** și poate aduce cu el servere MCP, hooks și executabile puse în `PATH`. Instalezi doar din surse în care te încrezi, și te uiți în panoul `/plugin` la ce componente aduce **înainte** de a confirma. Invers, ca autor: nu împachetezi niciodată credențiale, connection string-uri cu parolă sau căi absolute de pe mașina ta — plugin-ul ajunge la colegi exact așa cum l-ai scris.

---

## S7 — De la „am configurat" la „am publicat"

În S2–S6 ai construit câte o componentă pe săptămână: fapte în `CLAUDE.md`, un skill, un subagent, un hook, o configurație MCP. Fiecare a rămas legată de un repo și se propagă prin copy-paste. Azi le împachetezi într-un **plugin**: un director versionat, instalabil cu o comandă, dintr-un **marketplace** care e pur și simplu un repo Git.

Criteriul care ține toată ziua: *îl vrei la mai mulți oameni sau pe mai multe repo-uri, cu versionare → plugin; e personal sau specific unui proiect → rămâne în `.claude/`.*

Ținta zilei, concret: la final ai **un plugin de echipă, minimal dar real, într-un repo versionat**, listat într-un marketplace, plus un `.claude/settings.json` comis care îl **propune singur** colegilor. Cele șase exerciții urmează segmentele din tutorial.

---

## Prerechizite (≈10 min) — fă-le înainte de exerciții

1. **Ai ce împacheta.** Uită-te în `.claude/` din repo-ul tău și în `~/.claude/`: ce ai din S3 (skill), S4 (subagent), S5 (hook), S6 (`.mcp.json`)? Nu-ți trebuie toate patru — două ajung. Dacă n-ai niciunul, cere-i lui Claude să-ți facă un skill mic acum (S3, 5 minute): ceva pe care îl repeți des.
2. **Push-ul merge.** Confirmă cu `git remote -v` și `git fetch` că ai acces la remote-ul tău. Îți trebuie la Ex. 4 și 5.
3. **`/plugin` există.** Rulează `/plugin` în sesiune. Dacă răspunde „unknown command", actualizează Claude Code (`claude --version` întâi) — restul exercițiilor depind de el.

**Reușit dacă:** ai identificat minim două artefacte de împachetat, `git fetch` merge, iar `/plugin` deschide panoul cu tab-urile Discover / Installed / Marketplaces / Errors.

---

### Exercițiul 1 — Inventar și triaj: ce merită promovat (≈10 min)

**Antrenează:** criteriul standalone vs. plugin (segmentele 1, 3).

Înainte să împachetezi, decide **ce** merită împachetat. Capcana zilei e să pui tot, inclusiv lucruri personale care n-ar trebui să circule.

**Ce faci:**
1. Fă lista completă: ce ai în `.claude/` (proiect) și în `~/.claude/` (personal), din S2–S6.
2. Pentru fiecare, aplică testul: **poți numi cine altcineva îl folosește** și **de ce versiunea contează**? Dacă da → candidat de plugin. Dacă răspunsul e „doar eu, oricând ultima variantă" → rămâne standalone.
3. Marchează explicit **ce lași afară** și de ce. La schimbul de practici, partea asta e mai interesantă decât ce ai pus.
4. Verifică și un detaliu practic: dacă un skill ți-e util **pentru numele lui scurt** (`/deploy`), într-un plugin devine `/plugin:deploy`. Merită schimbul?

**Reușit dacă:** ai o listă de 2–4 artefacte de promovat și cel puțin unul respins conștient, cu motivul scris într-o frază.

---

### Exercițiul 2 — Primul plugin, local (≈20 min)

**Antrenează:** structura unui plugin + testarea fără publicare (segmentele 2, 4).

Un plugin e un director cu un manifest. Îl construim și îl testăm local; publicarea vine la Ex. 4.

**Ce faci:**
1. Cere-i lui Claude structura, în afara repo-ului de curs (plugin-ul e artefact separat):
   > „Fă-mi structura unui plugin Claude Code numit `lms-tools`, în `C:\tools\lms-tools`. Manifest `.claude-plugin/plugin.json` cu `name`, `description`, `version: 1.0.0` și `author`. Mută în el skill-ul meu din `[cale]` sub `skills/<nume>/SKILL.md`. **Atenție:** doar `plugin.json` stă în `.claude-plugin/`; `skills/` stă în rădăcina plugin-ului. Arată-mi structura și manifestul înainte să scrii."
2. **Citește ce a propus.** Verifică: `skills/` e în rădăcină, **nu** în `.claude-plugin/`? `name` e kebab-case? `version` e setat?
3. Validează și testează:
   ```
   claude plugin validate C:\tools\lms-tools
   claude --plugin-dir C:\tools\lms-tools
   ```
4. În sesiunea pornită așa, cheamă skill-ul cu **numele complet**: `/lms-tools:<nume-skill>`. Nu `/<nume-skill>` — prefixul e obligatoriu.

**Dacă „nu apare nimic":** verifică în ordine — (a) e `skills/` în rădăcină și nu în `.claude-plugin/`? (b) ai rulat `/reload-plugins`? (c) ce zice tab-ul **Errors** din `/plugin`?

**Reușit dacă:** `claude plugin validate` trece, iar skill-ul răspunde ca `/lms-tools:<nume>` într-o sesiune pornită cu `--plugin-dir`.

---

### Exercițiul 3 — Împachetează restul (≈20 min)

**Antrenează:** toate componentele unui plugin (segmentul 2), plus migrarea corectă (segmentul 4).

Acum adaugi ce ai din S4, S5 și S6. Câte se aplică — nu forța.

**Ce faci:**
1. Cere migrarea, componentă cu componentă:
   > „Adaugă în plugin-ul `lms-tools`: (1) subagentul meu din `.claude/agents/[nume].md` → `agents/`; (2) hook-ul meu din `.claude/settings.json` → `hooks/hooks.json` (**același format** ca obiectul `hooks` din settings); (3) serverul MCP din `.mcp.json` → `.mcp.json` în rădăcina plugin-ului. Dacă vreo cale din ele e absolută, de pe mașina mea, înlocuiește-o cu `${CLAUDE_PLUGIN_ROOT}`. Verifică să nu rămână niciun secret sau connection string cu parolă. Arată-mi fiecare fișier înainte."
2. **Șterge originalele** din `.claude/` după ce ai confirmat că merg din plugin. Altfel ai duplicate — iar la subagenți e mai rău: cel din `.claude/agents/` **suprascrie** pe cel cu același nume din plugin, deci versiunea din plugin nu se activează deloc. (La skills nu se suprascriu: `/skill` și `/plugin:skill` coexistă.)
3. Retestează cu `--plugin-dir` și verifică fiecare componentă separat:
   - skill → răspunde la `/lms-tools:<nume>`
   - subagent → apare în `/context`, la Custom Agents
   - hook → declanșează evenimentul lui (ex. un edit, pentru `PostToolUse`) și vezi efectul
   - server MCP → `claude mcp list` îl arată `✔ Connected`
4. Ține minte pentru S9: uneltele MCP dintr-un plugin au nume mai lung — `mcp__plugin_lms-tools_<server>__<tool>`. O regulă de permisiune scrisă pe cheia scurtă a serverului **nu** prinde.

**Reușit dacă:** ai minim două componente în plugin, fiecare verificată individual, și zero duplicate rămase în `.claude/`.

---

### Exercițiul 4 — Marketplace-ul echipei (≈20 min)

**Antrenează:** distribuția (segmentul 5). Aici începe artefactul.

Un marketplace nu e un serviciu — e un repo Git cu `.claude-plugin/marketplace.json`.

**Ce faci:**
1. Decide structura. Cea mai simplă care merge: **un repo** care conține și marketplace-ul, și plugin-ul, cu `source` ca cale relativă.
   ```
   ssp-plugins/                       ← repo
   ├── .claude-plugin/
   │   └── marketplace.json
   └── plugins/
       └── lms-tools/                 ← plugin-ul din Ex. 2-3
           ├── .claude-plugin/plugin.json
           └── skills/ agents/ hooks/ .mcp.json
   ```
2. Cere fișierul:
   > „Fă-mi `.claude-plugin/marketplace.json` pentru un marketplace numit `[nume-de-casă]`, cu `owner.name` echipa mea, care listează plugin-ul `lms-tools` cu `source` cale relativă `./plugins/lms-tools`, plus `description` și `version`. **Nu** folosi un nume rezervat (`claude-plugins-official`, `claude-community`, `anthropic-plugins` sau ceva care imită surse oficiale). Arată-mi fișierul înainte."
3. Testează **local, înainte de push**:
   ```
   /plugin marketplace add ./calea/catre/ssp-plugins
   /plugin install lms-tools@[nume-marketplace]
   /reload-plugins
   ```
   apoi cheamă skill-ul. Alege scope-ul de instalare conștient: **user** (tu, pe toate proiectele) / **project** (toți colaboratorii repo-ului) / **local** (tu, doar aici).
4. Push pe remote-ul tău. Apoi re-adaugă marketplace-ul din formă remote și confirmă că merge la fel:
   ```
   /plugin marketplace remove [nume-marketplace]
   /plugin marketplace add <owner>/<repo>
   ```

**Două lucruri de reținut:** `source` ca cale relativă **trebuie** să înceapă cu `./` și se rezolvă față de rădăcina marketplace-ului, nu față de `.claude-plugin/`. Și: **ștergerea unui marketplace dezinstalează plugin-urile luate din el** — de aici pasul 4, în ordinea asta.

**Reușit dacă:** ai un repo pushat din care `/plugin marketplace add <owner>/<repo>` + `/plugin install <plugin>@<marketplace>` funcționează de la zero.

---

### Exercițiul 5 — Repo-ul care se auto-configurează (≈15 min)

**Antrenează:** `extraKnownMarketplaces` + `enabledPlugins` (segmentul 5). Aici se termină artefactul.

Până acum, un coleg trebuie să știe numele marketplace-ului și să ruleze două comenzi. Acum punem repo-ul să-i propună singur.

**Ce faci:**
1. În **repo-ul de curs** (nu în cel al plugin-ului), cere:
   > „Adaugă în `.claude/settings.json` — cel comis, nu `.local.json` — configurația care propune plugin-ul echipei: `extraKnownMarketplaces` cu marketplace-ul meu (`source` de tip `github`, `repo` `<owner>/<repo>`) și `enabledPlugins` cu `\"lms-tools@[marketplace]\": true`. Ambele sunt **obiecte**, nu liste. Arată-mi diff-ul înainte."
2. **Citește diff-ul.** Verifică forma:
   ```json
   {
     "extraKnownMarketplaces": {
       "[marketplace]": { "source": { "source": "github", "repo": "<owner>/<repo>" } }
     },
     "enabledPlugins": { "lms-tools@[marketplace]": true }
   }
   ```
   Zero credențiale. `enabledPlugins` are chei de forma `"plugin@marketplace"`, cu valoare booleană — `false` dezactivează la nivel de repo, fără dezinstalare.
3. **Comite** (`chore: add team plugin marketplace to project settings`).
4. Testul real, dacă se poate: dă repo-ul unui coleg (sau clonează-l tu în alt folder, ca utilizator „nou"). La deschidere, după ce marchează folderul ca de încredere, ar trebui să primească propunerea de instalare. Notează ce l-a încurcat.

**Reușit dacă:** ai `.claude/settings.json` comis cu cele două chei în forma corectă, și cineva care clonează repo-ul primește propunerea de instalare în loc de un document de setup.

---

### Exercițiul 6 (Capstone) — Versiune, README și cei trei pași (≈15 min)

**Antrenează:** verificarea și decizia „standard de casă" (segmentul 6).

**Ce faci:**
1. **Versiune, intenționat.** Confirmă `version` în `plugin.json`. Dacă lipsește și distribui prin git, **fiecare commit** devine o versiune nouă pentru colegi. Pune `1.0.0` și urcă-l când schimbi comportamentul.
2. **README** în rădăcina plugin-ului: ce aduce, cum se instalează (cele trei comenzi), ce prerechizite are (ex. serverul MCP cere o bază de date și o variabilă de mediu). Scrie-l pentru cineva care n-a fost la curs.
3. **Cei trei pași de verificare:**
   - **Se încarcă?** `claude plugin validate` trece; tab-ul **Errors** din `/plugin` e gol.
   - **Componentele apar?** Skill la `/lms-tools:<nume>`; subagentul în `/context`; hook-ul se declanșează; serverul MCP `✔ Connected`.
   - **Ajunge la altcineva?** Cineva instalează de la zero **și îi merge fără explicații de la tine**. Dacă are nevoie de instrucțiuni verbale, plugin-ul nu e gata — completează README-ul.
4. **Pentru review-ul de fază:** notează ce din plugin crezi că merită să devină **standard de casă** (îl folosesc minim doi oameni, e stabil, e legibil de altcineva) și ce ai pus doar pentru tine. Uită-te și la costul lui: `/plugin` arată o estimare de **Context cost** și lista **Will install** înainte de instalare.

**Extensie (doar dacă ai terminat):** schimbă ceva în plugin, urcă `version`, push, apoi ia update-ul dintr-o altă instalare (`/plugin marketplace update <marketplace>`). Sau: instalează plugin-ul unui coleg și spune-i, concret, ce ți-a lipsit din README-ul lui.

**Reușit dacă:** plugin-ul trece `validate`, are `version` și README, iar cele trei verificări sunt bifate — inclusiv a treia, cu altcineva.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- **Un plugin de echipă** (chiar minimal) într-un repo versionat, listat în `.claude-plugin/marketplace.json`, plus `.claude/settings.json` comis cu `extraKnownMarketplaces` și `enabledPlugins`.

**2. Schimbul de practici (~2 min/persoană) + review de fază (10 min).** Pe rând, fiecare spune grupului:
- Ce a împachetat și, mai important, **ce a lăsat afară conștient**.
- Un moment „aici s-a văzut diferența" — de obicei momentul în care altcineva a instalat și i-a mers.

Apoi, cu tot grupul, **închiderea Fazei 2**: *ce devine standard de casă și ce rămâne personal?* Două coloane pe tablă. Notați lista în docul **„AI Wins & Fails"**, coloana „Candidat standard?" — devine input direct pentru **S10 (playbook-ul de echipă)**.

---

### Notă pentru facilitator

- **Ex. 1 e scurt și decizional — nu-l sări.** E singurul care oprește oamenii să împacheteze tot, inclusiv reguli personale care n-ar trebui să circule.
- **Miezul practic e Ex. 4 și Ex. 5.** Fără Ex. 5 nu există artefact — plugin-ul rămâne al autorului. Dacă timpul strânge, comprimă Ex. 3 (o componentă în loc de trei) și fă Ex. 6 pasul 3 colectiv.
- **Capcana #1: componente puse în `.claude-plugin/`.** Aproape sigur apare. Când cineva zice „nu apare nimic", asta e prima verificare, înaintea oricărei alteia.
- **Capcana #2: namespacing.** Cineva își migrează `/deploy` și se supără că nu mai răspunde. Spune din start că devine `/plugin:deploy`.
- **`0 skills` la `/reload-plugins`** nu e o eroare: numărul acoperă doar `commands/`, nu `skills/`. Vor întreba.
- **Testul cu altcineva merită timp.** Perechile funcționează bine: A instalează plugin-ul lui B și îi spune ce a lipsit. E cea mai bună formă de feedback pe README pe care o veți primi.
- **Secrete.** Un plugin ajunge la colegi exact cum l-ai scris. Dacă vezi un connection string cu parolă sau un token într-un `.mcp.json` de plugin, oprește-te 1 minut pe distincția variabilă de mediu vs. fișier distribuit (firul S6).
- Claude Code se schimbă des: un `/help` și un `claude plugin --help` la început. Reține: **„output styles" nu mai e un director de componentă** (sunt plugin-uri ca oricare altele), iar instalarea e în **doi pași plus `/reload-plugins`**.
