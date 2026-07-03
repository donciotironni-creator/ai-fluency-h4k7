# Proiectul-școală LMS — Exerciții · S1

*Pentru participanți. Continuarea proiectului LMS început în S0.*

> **Regula de siguranță:** nu folosiți `--dangerously-skip-permissions`. Pe greenfield, unde curg multe `npm install` și comenzi shell, e cu atât mai important.

---

## S1 — Bucla zilnică pe teren gol

În S1 exersați bucla exact unde e mai grea: pe greenfield nu există cod care să „ancoreze" modelul, deci fiecare pârghie de control contează mai mult. Cele patru exerciții antrenează pe rând segmentele din tutorial; al cincilea le combină.

### Exercițiul 1 — Plan mode pe pânză goală (≈20 min)

**Antrenează:** plan mode vs. execuție directă.

**Prompt de pornire (în plan mode):**
> „Folder gol. Vreau un *walking skeleton* pentru LMS: un API .NET 10 cu un endpoint `GET /courses` (deocamdată cu date în memorie) și o pagină React care le afișează. Fă întâi un plan, fără să scrii cod."

**Ce urmărești:**
1. Intră în plan mode (`Shift+Tab` ciclează modurile în versiunile curente; verifică cu `/help`).
2. Pe greenfield, planul e **plin de presupuneri**: structură de foldere, versiuni, librării, cum pornește fiecare parte. Citește-le **înainte** să aprobi.
3. Ajustează cel puțin o presupunere în dialog (ex: structura de foldere, librăria de UI, cum e organizat repo-ul).

**Reușit dacă:** ai un plan pe care-l înțelegi complet și ai schimbat conștient cel puțin o decizie pe care Claude o luase implicit.

---

### Exercițiul 2 — Igiena contextului la bootstrap (≈15 min)

**Antrenează:** `/clear`, compaction.

Un **pas de bootstrap** = primul pas care generează, din nimic, scheletul gol al unei părți din aplicație: folderele + un proiect care compilează și pornește, dar încă nu face nimic util. E zgomotos, pentru că generează multe fișiere și rulează instalări.

**Exemplu de prompt pe care i-l dai lui Claude Code:**
> „Pornim de la zero, folderul e gol. Creează un proiect .NET 10 Web API minimal, care doar pornește gol, și rulează-l o dată ca să confirmi că merge."

Claude va rula sub capotă comenzile potrivite (aici: `dotnet new webapi` pentru schelet și `dotnet run` pentru verificare) — tu nu tastezi comenzile, doar aprobi ce cere. Pentru front-end, promptul echivalent ar fi: „creează un proiect React cu Vite și TypeScript, gol, care pornește".

**Ce faci:**
1. Cere-i lui Claude Code să facă un pas de bootstrap. Concret, pentru API: „creează un proiect .NET 10 Web API minimal, care pornește gol" — sub capotă rulează un `dotnet new webapi`, adaugă câteva fișiere de proiect și îl pornește o dată ca să confirme că merge.
2. Dă `/clear` **înainte** de pasul următor. Concret, pentru front-end: „creează un proiect React cu Vite și TypeScript, gol, care pornește" (sub capotă: `npm create vite` + `npm install`).
3. Compară cu varianta în care ai fi ținut ambii pași într-o singură sesiune, fără `/clear` — cât de la obiect rămâne modelul după ce contextul s-a umplut cu output de instalare și fișiere generate.

**Reușit dacă:** poți formula regula ta: „la bootstrap dau `/clear` când ___".

---

### Exercițiul 3 — Model / effort + o decizie de design LMS (≈20 min)

**Antrenează:** alegerea conștientă de `/model` și `/effort`.

Trei sarcini, rutate deliberat:

| # | Sarcină | Nivel potrivit |
|---|---------|----------------|
| a | „Ce comandă pornește proiectul React?" (lookup simplu) | ieftin/rapid (Haiku) |
| b | „Redenumește folderul `Api` în `Backend` și actualizează referințele." | mediu (Sonnet) |
| c | **Decizie de design, în zona voastră:** „Un curs poate avea prerechizite (alte cursuri). Cum aș modela relația asta ca să pot găsi *tot lanțul* de prerechizite al unui curs? Argumentează opțiunile și compromisurile." | puternic (Opus), effort mai mare |

**Contra-exemplu intenționat:** fă (a) pe modelul puternic și (c) pe cel ieftin. Simte diferența de cost/viteză/calitate.

**Notă:** la (c) **nu** implementați nimic azi — doar decizia. Structura apare când o construiți efectiv, mai încolo. (Da, e un recursive CTE care se ascunde acolo — dar întâi decizia, apoi codul.)

**Reușit dacă:** poți spune, pentru fiecare tip de task, ce nivel folosești implicit și de ce.

---

### Exercițiul 4 — Permisiuni la scaffolding (≈15 min)

> **Scaffolding** = generarea automată a structurii de pornire a unui proiect (foldere, fișiere de configurare, un proiect gol care compilează), de obicei cu o comandă gen `dotnet new` sau `npm create`. E „schela" de la care pornești, înainte să scrii cod propriu. Practic, e ce faci la pașii de bootstrap din Ex. 2.

**Antrenează:** sistemul de permisiuni allow / ask / deny.

Greenfield înseamnă multe scrieri de fișiere, `npm install`, comenzi shell — exact unde „da la tot" e tentant și riscant (un `npm install` rulează cod arbitrar din pachete).

**Ce faci:**
1. La un pas de bootstrap, **citește fiecare comandă** înainte s-o aprobi. Ce instalează, de fapt?
2. Creează (dacă nu există) fișierul `.claude/settings.json` în folderul proiectului și adaugă o regulă `deny` pentru ceva clar distructiv. Concret, arată așa:

   ```json
   {
     "permissions": {
       "deny": ["Bash(rm -rf *)"],
       "ask": ["Bash(git push *)"],
       "allow": ["Bash(npm run *)"]
     }
   }
   ```

   `Bash` e unealta cu care Claude Code rulează comenzi în terminal (shell) — adică exact comenzile pe care le-ai scrie tu într-o consolă: `npm install`, `git push`, `dotnet run`, `rm -rf` etc. Deci `Bash(rm -rf *)` înseamnă „orice comandă din terminal care începe cu `rm -rf`" (`*` = orice urmează). `rm -rf` șterge fișiere/foldere recursiv și fără confirmare — de-aia e exemplul de comandă distructivă pe care vrei s-o blochezi.

   Regulile se evaluează în ordinea `deny` → `ask` → `allow`, deci un `deny` bate mereu orice `allow`. (Sintaxa evoluează; dacă ceva nu se potrivește, confirmă cu `/permissions` sau `/help`.)
3. Cere-i lui Claude Code să ruleze o comandă `rm -rf ...` (pe ceva neimportant din sandbox) și verifică faptul că e **refuzată din start**, nu doar pusă la aprobat.

**Reușit dacă:** ai văzut diferența concretă ask vs. deny — și n-ai folosit `--dangerously-skip-permissions` nici măcar la bootstrap.

---

### Exercițiul 5 (Capstone) — De la gol la walking skeleton (≈25 min)

> **Capstone** = exercițiul final care le adună pe toate. Termenul vine din „piatra de boltă" — ultima piesă pusă în vârful unei construcții, cea care ține totul laolaltă. Aici: aplici într-un singur task toate cele patru principii exersate mai sus (plan mode, model/effort, context curat, permisiuni).

**Antrenează:** toate cele patru împreună.

Du planul din Ex. 1 la execuție, cap-coadă, conducând deliberat:
1. **Plan mode** pentru a porni, plan ajustat înainte de execuție.
2. **Model/effort** ales conștient pe fiecare pas.
3. **Context curat** — `/clear` între pași de bootstrap diferiți.
4. **Permisiuni citite** — nu aprobi orbește.

**Țintă:** un API .NET 10 cu `GET /courses` (date în memorie) + o pagină React care afișează lista. Rulează cap-coadă.

**Reușit dacă:** deschizi pagina și vezi cursurile, iar tu ai 2–3 momente „aici bucla veche m-ar fi dus prost" pentru schimbul de practici.

**Extensie (doar dacă ați terminat, în pereche):** înlocuiește lista din memorie cu o citire reală dintr-o tabelă `Courses` din SQL Server 2022. Structura tabelei o proiectați **voi** — nu vă e dată.

---

## Artefact & schimb de practici

La finalul sesiunii faceți două lucruri concrete.

**1. Artefactul — „Rețeta mea de sesiune" (5 min).** Fiecare scrie, într-un fișier scurt pe care-l păstrează, cum va conduce de-acum o sesiune Claude Code. E rezultatul palpabil al zilei. Completează exact acest template:

```
REȚETA MEA DE SESIUNE CLAUDE CODE

Plan mode — îl folosesc când:
  ...
Execuție directă — o accept când:
  ...

Model / effort:
  Explorare / lookup   →
  Coding zilnic        →
  Decizie de design    →

Dau /clear când:
  ...

Nu aprob niciodată fără să citesc:
  ...

O capcană a mea pe care vreau s-o rup:
  ...
```

În S2, această rețetă devine punctul de plecare pentru `CLAUDE.md`-ul proiectului LMS.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- un moment în care bucla nouă (plan mode / context / model / permisiuni) a schimbat rezultatul — în bine sau în rău;
- o alegere de model/effort care a contat.

Notați aceste puncte în docul partajat **„AI Wins & Fails"**.

---

### Notă pentru facilitator

- **Intenționat nu se dă nicio structură.** Walking skeleton-ul e ținta S1; schema, arhitectura și feature-urile apar în săptămânile următoare, construite de ei. Dacă cineva cere „dă-ne tu scheletul", răspunsul e: tocmai asta exersăm.
- Ținta S1 e **bucla**, nu livrarea — dacă walking skeleton-ul nu e gata la toți, e ok; contează că au condus deliberat.
- Claude Code se schimbă des: un `/help` la începutul sesiunii pentru versiunea curentă (plan mode, permisiuni).
