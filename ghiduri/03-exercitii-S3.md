# Proiectul-școală LMS — Exerciții · S3

*Pentru participanți. Continuarea proiectului LMS început în S0–S2.*

> **Regula de siguranță:** citește `SKILL.md`-ul propus de Claude înainte să-l accepți — și citește un skill de proiect străin înainte să te încrezi în repo. Un skill poate rula comenzi (`` !`...` ``) la invocare și-și poate acorda unelte (`allowed-tools`). Aceeași disciplină ca la scaffold în S2: nu aprobi orbește doar pentru că „e doar un skill".

---

## S3 — De la promptul repetat la o unealtă reutilizabilă

În S2 ai mutat **faptele** stabile ale repo-ului în `CLAUDE.md`. Azi muți **procedura** pe care o repeți — promptul pe care l-ai notat în prep (scris manual de 2-3 ori) — într-un skill: invocat cu `/nume`, sau declanșat singur de Claude când e relevant.

Criteriul care ține toată ziua: *fapt stabil despre repo → `CLAUDE.md`; procedură pe care o repeți → skill.*

Ținta zilei, concret: la final ai **cel puțin un skill funcțional, comis în git** pe repo-ul LMS, făcut din propriul prompt repetat — și ai **dovedit** că se declanșează și că schimbă rezultatul, nu doar că există. Cele șase exerciții urmează segmentele din tutorial.

---

### Exercițiul 1 — Alege promptul & testul fapt/procedură (≈10 min)

**Antrenează:** criteriul fapt vs. procedură (segmentele 1–2).

Înainte să faci un skill, decide dacă merită unul. Nu tot ce repeți e o procedură — unele lucruri sunt fapte care aparțin de `CLAUDE.md`.

**Ce faci:**
1. Ia promptul din prep-ul S2 (scris manual de 2-3 ori). Dacă n-ai unul bun, candidați siguri pe LMS: format de commit (`/commit`), review pe diff după convențiile LMS (`/review`), sau bootstrap-ul de `.claude/`.
2. Argumentează de ce e o **procedură**, nu un fapt — dacă ar fi doar „așa e proiectul", ar trebui în `CLAUDE.md`, nu într-un skill.
3. Decide din start: are **efecte laterale** (scrie, comite, trimite)? Dacă da, va fi user-only (îl marchezi în Ex. 3).

**Reușit dacă:** ai un prompt-candidat și poți spune într-o frază de ce e procedură (nu fapt) și dacă are efecte laterale.

---

### Exercițiul 2 — Primul skill, forma minimă (≈15 min)

**Antrenează:** anatomia `SKILL.md`, generarea cu Claude (segmentele 2, 6).

Un skill e un folder cu un `SKILL.md` = frontmatter YAML (spune *când*) + corp Markdown (spune *ce*). Nu-l scrii manual câmp cu câmp — îi ceri lui Claude, ca orice altă sarcină. Începi cu **forma minimă**: un singur `SKILL.md`, fără fișiere ajutătoare.

**Ce faci:**
1. Cere-i lui Claude Code:
   > „Am promptul ăsta pe care-l rulez des: [colează promptul din Ex. 1]. Fă-l skill în `.claude/skills/`. Pune un `description` bun pentru auto-declanșare (cu cuvintele pe care le-aș spune natural). Arată-mi `SKILL.md` înainte să-l scrii."
2. Citește ce a propus, înainte să accepți. Verifică:
   - Numele folderului = comanda pe care o vei tasta (`/nume`).
   - `description`-ul conține cazul de folosire **primul** și cuvintele naturale — nu e vag („helper pentru X").
   - Corpul e concis (procedura, nu un eseu — fiecare linie stă în context cât e skill-ul activ).

**Model de referință** (skill minim, cu injectare de context):
```markdown
---
description: Rezumă modificările necomise și semnalează ce e riscant.
  Folosește când userul întreabă ce s-a schimbat, vrea un commit
  message, sau cere review pe diff.
---

## Modificările curente

!`git diff HEAD`

## Instrucțiuni

Rezumă modificările de mai sus în 2-3 puncte, apoi listează riscurile
pe care le observi (error handling lipsă, valori hardcodate, teste).
```

**Reușit dacă:** ai un `.claude/skills/<nume>/SKILL.md` pe care l-ai **citit** înainte să-l accepți, nu unul acceptat orbește.

---

### Exercițiul 3 — Cine invocă: `description` + `disable-model-invocation` (≈20 min)

**Antrenează:** controlul invocării + testul celor două uși (segmentul 3).

Un skill are, implicit, **două uși de intrare**: tu (`/nume`) și Claude (automat, când `description`-ul se potrivește cu ce ceri). `description` nu e documentație — e **interfața de auto-declanșare**.

**Ce faci:**
1. Testează skill-ul din Ex. 2 în **două feluri**: (a) `/nume` direct; (b) o frază naturală care ar trebui să-l cheme singur (ex. „ce am schimbat?").
2. Dacă **nu** se declanșează pe fraza naturală, problema e aproape mereu `description`-ul — reglează-l (cuvinte naturale, cazul principal primul), **nu** corpul.
3. Dacă skill-ul are efecte laterale (din Ex. 1), adaugă în frontmatter `disable-model-invocation: true` și verifică: `/nume` merge în continuare, dar fraza naturală **nu-l mai declanșează**. Vrei ca **tu** să ții trăgaciul.

**De ce contează:** nu vrei ca Claude să declanșeze `/deploy` sau `/commit` pentru că „codul pare gata". Acțiunile cu efecte → user-only. Cunoștințele și acțiunile inofensive → lasă-le auto-declanșabile. (Există și inversul, `user-invocable: false`, pentru context de fundal pe care doar Claude ar trebui să-l folosească — ex. „cum funcționează sistemul legacy X".)

**Reușit dacă:** skill-ul se declanșează (sau nu) exact cum vrei pe ambele uși — și poți argumenta alegerea pentru al tău.

---

### Exercițiul 4 — Argumente & injectare de context (≈15 min)

**Antrenează:** `$ARGUMENTS` / poziționale 0-based + `` !`cmd` `` (segmentul 4).

Un skill devine unealtă adevărată când primește input și „știe" starea curentă.

**Ce faci:**
1. Dacă skill-ul ar beneficia de un argument, adaugă-l: `$ARGUMENTS` pentru tot textul, sau poziționale pentru mai multe valori.
2. Verifică numerotarea — e **0-based**: `$0` (sau `$ARGUMENTS[0]`) e primul argument, `$1` al doilea.
   > ⚠️ **Capcana zilei:** tutorialele vechi zic greșit „`$1` = primul argument". E `$0`. Valorile cu spații se pun în ghilimele: `/skill "hello world" second` → `$0`=`hello world`.
3. Adaugă o linie de injectare care hrănește skill-ul cu starea reală — ex. `` !`git diff HEAD` `` sau `` !`git status --short` ``. Verifică faptul că skill-ul „vede" diff-ul curent fără să-l colezi tu. E **preprocesare**: comanda rulează înainte ca modelul să vadă skill-ul, iar output-ul e inserat ca text.

**Securitate:** `` !`...` `` rulează automat, la invocare, fără aprobare. E ok pentru skill-urile **tale**; pentru unul dintr-un repo străin, citește-l întâi. Nu pune comenzi distructive într-un skill auto-declanșabil.

**Reușit dacă:** skill-ul primește măcar un argument (numerotat corect, 0-based) sau injectează starea curentă cu `` !`...` `` — și l-ai testat că funcționează.

---

### Exercițiul 5 — Dovada: înainte / după (≈20 min)

**Antrenează:** verificarea empirică — declanșare + rezultat (segmentul 6).

Un skill nu contează pentru că se declanșează, ci pentru că schimbă vizibil ce face Claude. A vedea skill-ul pornind îți spune doar că l-a găsit, nu că face ce voiai. Se măsoară **două lucruri separat** — exact ca la `CLAUDE.md` în S2.

**Ce faci:**
1. Alege 2-3 prompturi realiste pe LMS pe care skill-ul ar trebui să le acopere.
2. Rulează-le într-o **sesiune curată, fără** skill (dezactivat / redenumit temporar) și notează rezultatul.
3. Rulează-le **cu** skill-ul activ. Compară pe două axe:
   - **(a) declanșarea** — a pornit singur pe fraza corectă? Dacă nu → reglezi `description`.
   - **(b) rezultatul** — e ce voiai? Dacă nu → reglezi corpul.

**De ce sesiune curată:** contextul rămas de la scrierea skill-ului maschează golurile din instrucțiuni — pare că merge pentru că *tu* știi ce voiai, nu pentru că skill-ul o spune clar.

**Reușit dacă:** poți arăta o diferență concretă „înainte/după" pe cel puțin un prompt — și știi dacă ce mai trebuie reglat e `description`-ul (declanșare) sau corpul (rezultat).

---

### Exercițiul 6 (Capstone) — Comite & (opțional) sparge în fișiere (≈15 min)

**Antrenează:** forma completă + toate împreună, cap-coadă (segmentele 5, 6).

**Ce faci:**
1. Dacă skill-ul are efecte laterale și beneficiază de unelte pre-aprobate, adaugă `allowed-tools` (ex. `Bash(git add *) Bash(git commit *)`) și vezi cum dispar prompturile de aprobare la fiecare pas. `allowed-tools` **nu restricționează** — doar pre-aprobă, cât e skill-ul activ.
2. **Comite** skill-ul de proiect în git (`chore: add /nume skill`). Skill-urile personale (`~/.claude/skills/`) **nu** se comit — sunt ale tale, pe toate repo-urile.
3. Notează pentru schimbul de practici: din ce prompt a venit, dacă e user-only sau auto-declanșabil, și un moment „aici s-a văzut diferența".

**Extensie (doar dacă ai terminat):** ia un skill care a crescut prea mult și **sparge-l** — mută reference-ul lung într-un `reference.md` separat, referit din `SKILL.md` cu un link Markdown (`vezi [reference.md](reference.md)`). Simte diferența de context (progressive disclosure): `SKILL.md` rămâne scurt, detaliul greu se încarcă doar la nevoie. Aici forma minimă devine forma completă — dar doar pentru că a apărut un motiv real.

**Reușit dacă:** ai cel puțin un skill comis, care se declanșează corect și are dovada „înainte/după" — iar oricine clonează repo-ul LMS îl are din prima sesiune Claude Code.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- Cel puțin un skill funcțional în `.claude/skills/` (sau `.claude/commands/`) pe LMS, cu `description` care declanșează corect și cu **dovada „înainte/după"** pe un prompt concret, comis în git.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- Skill-ul făcut, din ce prompt repetat a venit, și dacă e user-only sau auto-declanșabil (și de ce).
- Un moment „aici s-a văzut diferența" — declanșarea (a pornit singur pe fraza corectă) sau rezultatul (înainte/după din Ex. 5).

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce skills intră în setul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 1 e scurt și decizional — nu-l sări.** E singurul care oprește oamenii să facă skill dintr-un fapt. Cine ratează testul fapt/procedură ajunge cu `CLAUDE.md`-uri pline de „pași" și skills pline de „așa e proiectul".
- **Miezul e Ex. 3 (cine invocă) și Ex. 5 (dovada).** Dacă timpul strânge, comprimă Ex. 4 (argumentele se pot adăuga rapid) și Ex. 6 (extensia e opțională). Protejează Ex. 5 — verificarea empirică e lecția care rămâne, exact ca la S2.
- **Capcana de sintaxă: 0-based.** Aproape sigur cineva scrie `$1` pentru primul argument. Prinde-o devreme, pe un skill cu 2+ argumente.
- **Skill de acțiune fără `disable-model-invocation`.** Dacă vezi un `/commit` sau `/deploy` pe care Claude îl poate declanșa singur, oprește-te 1 minut pe distincția de siguranță.
- **Fișierul personal nu se comite.** Ca la S2 — dacă cineva dă `git add ~/.claude/...`, oprește-te pe distincția personal/proiect.
- Claude Code se schimbă des: un `/help` la începutul sesiunii pentru sintaxa curentă a frontmatter-ului, substituțiilor și `allowed-tools`.
