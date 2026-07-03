# Claude Code Fluency — Ghid de facilitare · S1

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Sintaxa exactă (comenzi, flag-uri, keybindings) se poate schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial. Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal.

---

## S1 — Modelul mental & bucla zilnică făcută bine

Prima sesiune tehnică. Premisa: majoritatea folosesc Claude Code **sub potențial** — ca pe un autocomplete deștept sau un chat, nu ca pe un sistem pe care îl conduci deliberat. S1 corectează exact bucla zilnică.

### Obiective de învățare

La final, fiecare știe:
- Când folosește **plan mode** vs. execuție directă.
- Cum ține contextul unei sesiuni curat și de ce contează.
- Cum alege conștient **model / effort** după tipul task-ului.
- Sistemul de **permisiuni** și de ce `--dangerously-skip-permissions` e o capcană în afara sandbox-ului.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 60–90 min |
| Lucru aplicat | ~90 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (60–90 min)

Ține-l concret, cu demo pe repo-ul de nisip, nu cu slide-uri. Patru segmente.

#### 1. Modelul mental — chatbot vs. sistem (10 min)

Ideea centrală: Claude Code nu e un chat cu cod. E un agent care citește repo-ul, rulează comenzi, editează fișiere și cere permisiuni. Diferența dintre folosirea slabă și cea bună **nu** stă în prompt-uri mai lungi, ci în cât de deliberat conduci: ce vede, ce are voie, cu ce model, câtă planificare face înainte.

Un cadru util pentru restul programului: fiecare sesiune adaugă o pârghie de control — azi bucla, apoi contextul persistent (S2), apoi comenzile (S3), apoi izolarea (S4) etc.

#### 2. Plan mode vs. execuție directă (15–20 min)

- **Ce e:** un mod în care Claude întâi îți propune un plan și explorează, fără să modifice cod, până aprobi. (În versiunile curente comuți modurile cu `Shift+Tab`; confirmă în sesiunea ta cu `/help`.)
- **Când merită:** task-uri cu ramificații, refactorizări, orice atingi cod pe care nu vrei surprize. Plan mode declanșează des un subagent de tip „Explore" care scanează repo-ul și îți întoarce o hartă, ținând sesiunea principală curată (preview de S4).
- **Când NU:** editări mici, evidente, unde planul e overhead.

**Demo:** ia o cerință cu 2–3 pași pe repo-ul de nisip, intră în plan mode, arată planul propus, ajustează-l în dialog, apoi aprobă execuția. Punctează momentul „aici aș fi lăsat modelul să pornească direct și ar fi luat-o pe alt drum".

#### 3. Gestiunea contextului (15–20 min)

- **Fereastra de context nu e infinită și nu e gratuită.** Cu cât o umpli cu zgomot (log-uri lungi, fișiere irelevante, istoric vechi), cu atât modelul raționează mai prost și mai scump.
- `/clear` — repornește sesiunea curată când treci la un task nesuspectat de cel anterior.
- **Compaction** — Claude comprimă istoricul când se apropie de limită (automat sau la cerere). Înțelege ce se pierde la compactare și de ce e mai bine să `/clear` între task-uri decât să lași istoricul să crească la nesfârșit.
- Regula practică: **o sesiune = un fir de gândire.** Task nou → context nou.

**Demo:** arată o sesiune „murdară" (multe task-uri amestecate) vs. una curată pe aceeași cerință, ca să se vadă diferența în calitatea răspunsului.

#### 4. Model / effort & permisiuni (15–20 min)

**Model / effort** — nu folosi același model reflex la orice:
- Explorare / task-uri simple → nivelul ieftin/rapid (Haiku).
- Coding zilnic, cost-sensibil → nivelul mediu (Sonnet).
- Raționament greu, arhitectură, bucle agentice, analiză de securitate → nivelul puternic (Opus), cu effort mai mare unde chiar contează.
- `opusplan` — Opus planifică, un model mai ieftin execută: bun la refactorizări complexe.
- Comenzile: `/model` și `/effort`. (Numele exacte ale modelelor se schimbă; principiul „potrivește puterea la sarcină" rămâne.)

**Permisiuni** — Claude cere aprobare înainte de acțiuni cu efect (editări, comenzi shell). Regulile sunt de tip **allow / ask / deny** și se pun în settings (le tratăm în profunzime în S9). Punctează clar acum: `--dangerously-skip-permissions` sare peste toate confirmările — acceptabil **doar** într-un sandbox izolat, niciodată pe cod real sau cu date sensibile.

---

### Lucru aplicat (~90 min)

**Brief:** fiecare ia o sarcină reală din munca lui și o duce cap-coadă aplicând bucla din tutorial:

1. Pornește în **plan mode**, obține și ajustează planul înainte de execuție.
2. Alege **conștient** modelul / effort-ul potrivit tipului de task (și notează de ce).
3. Ține **contextul curat** — `/clear` între sub-task-uri diferite; observă unde ai fi umflat contextul degeaba.
4. Observă unde apar cererile de permisiune și ce ai aprobat.

Pe parcurs, fiecare notează 2–3 momente de tipul „aici bucla veche m-ar fi dus prost".

### Artefact al sesiunii

O **„rețetă de sesiune" personală** — un fișier scurt (poate deveni parte din `~/.claude` sau doar o notiță pentru tine) care răspunde la:
- Când folosesc plan mode vs. direct?
- Ce model/effort pe ce tip de task?
- Când dau `/clear`?
- Ce nu aprob niciodată fără să citesc?

Acesta e primul artefact al programului. În S2 devine baza pentru `CLAUDE.md`.

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Un moment în care bucla nouă a schimbat rezultatul (bun sau rău).
- O alegere de model/effort care a contat.

Se notează în docul „AI Wins & Fails".

---

### Capcane comune (note pentru facilitator)

- **„Plan mode e pierdere de timp."** De obicei vine de la cineva care-l încearcă pe task-uri triviale. Arată-l pe un task cu ramificații reale.
- **Sesiuni interminabile.** Semnul clasic de folosire slabă: o singură sesiune uriașă pentru toată ziua. Insistă pe „un fir = o sesiune".
- **Opus la orice.** Scump și inutil pentru explorare. Fă vizibil costul alegerii de model.
- **`--dangerously-skip-permissions` din reflex.** Dacă cineva îl folosește deja pe cod real, oprește-te aici 2 minute — e cel mai riscant obicei din toată sala.

### Prep pentru S2

Temă de 5 minute: fiecare adună comenzile de build / lint / test ale unui repo propriu și 2–3 convenții/capcane ale acelui repo. În S2 le transformăm în primul `CLAUDE.md`.
