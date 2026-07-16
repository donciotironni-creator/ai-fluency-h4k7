# S3 — Slash commands & skills: promptul repetat devine unealtă

**Faza 1 · Folosire disciplinată · ~3 ore. Programul de joi — AI Fluency pe Claude Code.**

*Document-suport pentru NotebookLM. E scris ca proză explicativă, self-contained: definește termenii pe măsură ce apar, ca să poată fi transformat direct într-o prezentare sau într-un audio overview fără context extern.*

---

## De unde venim și unde mergem

În S2, echipa a mutat **faptele** stabile ale unui repo într-un fișier pe care Claude îl citește automat la fiecare sesiune, `CLAUDE.md`. Acela a fost primul pas de context engineering: să pui în context ce trebuie, o dată, în loc să repeți la nesfârșit.

S3 face al doilea pas. Mută **procedurile** repetate — promptul pe care l-ai scris manual, la fel, de două-trei ori — într-un skill: o unealtă reutilizabilă, invocată cu `/nume`, sau declanșată automat de Claude când e relevantă, și încărcată doar la nevoie.

Premisa vine direct din tema de pregătire de la finalul S2: fiecare a notat un prompt pe care l-a scris de mână de mai multe ori. Candidatul evident, chiar din S2, e promptul de bootstrap al fișierelor `CLAUDE.md`.

Distincția care ține toată sesiunea, într-o singură propoziție: **un fapt stabil despre repo rămâne în `CLAUDE.md`; o procedură pe care o repeți devine un skill.**

## Ce este un skill

Un skill este un folder cu un fișier `SKILL.md`. Fișierul are două părți:

- **Frontmatter YAML** (între linii de `---`) — metadatele. Câmpul care contează este `description`: el spune lui Claude *când* să folosească skill-ul. Numele comenzii, de exemplu `/summarize-changes`, vine din numele folderului, nu din frontmatter.
- **Corp Markdown** — instrucțiunile pe care Claude le urmează când skill-ul rulează, adică *ce* să facă.

Pe scurt: frontmatter-ul spune *când*, corpul spune *ce*.

## Slash commands și skills sunt același lucru

Aceasta este schimbarea din 2026 pe care toată lumea trebuie s-o știe, fiindcă multe tutoriale mai vechi încă vorbesc greșit despre ea.

Comenzile custom au fost **contopite** cu skills. Un fișier `.claude/commands/review.md` și un skill `.claude/skills/review/SKILL.md` produc **amândouă** comanda `/review` și se comportă identic. Fișierele vechi din `commands/` funcționează în continuare.

Deci nu mai gândești „aleg între command și skill". Gândești **forma minimă versus forma completă a aceluiași lucru**:

- **Forma minimă** — un singur fișier `.md`. Bună pentru un prompt-template scurt: `/commit`, `/review`, `/pr`. Rapidă de creat.
- **Forma completă** — un folder cu `SKILL.md` plus fișiere ajutătoare (un reference lung, scripturi, exemple care se încarcă la cerere). Se scalează.

Începi mereu cu forma minimă. Treci la folder doar când ai efectiv ceva ce merită încărcat la cerere. Un folder cu subfoldere „ca să fie" este exact reflexul „mai bag ceva, nu strică" din S2, mutat un nivel mai sus.

## Obiectivele sesiunii

La final, fiecare participant știe:

- Ce e un skill, concret: un `SKILL.md` cu frontmatter plus corp.
- Că un slash command custom și un skill sunt același mecanism.
- Diferența dintre forma minimă și forma completă.
- Cine invocă un skill: tu, Claude, sau amândoi — și cum controlezi asta.
- Cum trece argumente unui skill și cum îi injectează context dinamic.
- Ce înseamnă progressive disclosure.
- Cum verifică empiric că un skill se declanșează corect și produce ce trebuie.

## Unde trăiesc skills-urile

Aceeași logică de straturi ca la `CLAUDE.md`:

- **Personal** — `~/.claude/skills/<nume>/SKILL.md`, valabil pe toate proiectele tale. Nu se comite.
- **Proiect** — `.claude/skills/<nume>/SKILL.md`, doar pentru acest repo, comis în git și partajat cu echipa.
- **Plugin** — livrat printr-un plugin, sub un namespace propriu.

Când numele se repetă, precedența e enterprise peste personal peste proiect, iar un skill cu numele unuia built-in îl suprascrie.

## Cine invocă — cea mai importantă decizie

Acesta e miezul conceptual al zilei. Un skill are, implicit, **două uși de intrare**: o poți deschide tu, tastând `/nume`, sau o poate deschide Claude, automat, când `description`-ul se potrivește cu ce ceri.

De aici vine ideea centrală: **`description` nu este documentație, este interfața de auto-declanșare.** Este singurul lucru din skill care stă mereu în context, ca modelul să știe că skill-ul există; corpul se încarcă doar la invocare. Un `description` prost înseamnă un skill care nu se declanșează când trebuie, sau se declanșează când nu trebuie. Regula practică: pune cazul principal de folosire primul și include cuvintele pe care le-ai spune natural, de exemplu „când vreau un commit message" sau „când review-uiesc un diff".

Două câmpuri de frontmatter controlează ușile:

- Implicit, un skill poate fi invocat și de tine, și de Claude. Bun pentru cunoștințe și acțiuni fără efecte periculoase.
- Cu `disable-model-invocation: true`, doar tu îl poți invoca. Acesta este cazul pentru orice acțiune cu efecte laterale: `/commit`, `/deploy`, `/send-slack`. Nu vrei ca modelul să decidă singur că e momentul de deploy. Este legătura directă cu firul de siguranță din S1: tu ții degetul pe trăgaci.
- Cu `user-invocable: false`, doar Claude îl poate folosi. Bun pentru context de fundal care nu e o „comandă", de exemplu „cum funcționează sistemul legacy X".

## Argumente și injectare de context

Un skill devine unealtă adevărată când primește input.

- `$ARGUMENTS` reprezintă tot ce urmează după numele skill-ului, ca text brut. `/fix-issue 123` face ca `$ARGUMENTS` să devină `123`.
- Argumentele **poziționale** îți dau acces la valori individuale, iar aici e o capcană importantă.
- Poți folosi și argumente **numite**, declarând în frontmatter o listă precum `arguments: [issue, branch]` și folosind `$issue`, `$branch` în corp. E mai lizibil când ai mai multe.

Pentru injectarea de context dinamic, sintaxa cu semnul exclamării urmat de o comandă între accente grave rulează o comandă de shell **înainte** ca skill-ul să ajungă la model, și înlocuiește locul cu output-ul. Claude nu vede comanda, vede rezultatul, ca text deja inserat. Astfel skill-ul ajunge la model deja „hrănit" cu starea reală — diff-ul curent, statusul git — nu cu presupuneri. Este preprocesare, nu ceva ce execută Claude.

Aici e și o suprafață de securitate: aceste comenzi rulează automat, fără să le aprobi de fiecare dată. Un skill dintr-un repo în care ai încredere scăzută poate rula orice la deschidere. De aceea citești un skill de proiect înainte să te încrezi în repo, exact ca diff-ul de scaffold din S2. Există și o setare care oprește complet execuția aceasta.

## Capcana de sintaxă: argumentele sunt 0-based

Aceasta este corecția din 2026 de care se lovesc cei mai mulți. Argumentele poziționale sunt **0-based**: `$0` (sau `$ARGUMENTS[0]`) este **primul** argument, `$1` este al doilea, și așa mai departe.

Tutorialele vechi spun greșit că `$1` este primul argument. Este `$0`. De exemplu, `/migrate-component SearchBar React Vue` face `$0` egal cu `SearchBar`, `$1` egal cu `React`, `$2` egal cu `Vue`. Valorile cu spații se pun în ghilimele.

## Progressive disclosure și fișiere ajutătoare

Aici forma minimă devine forma completă, dar doar când merită.

Ideea, aceeași economie de context din S2, este că un reference de trei sute de linii sau o specificație de API nu au ce căuta în context la fiecare rulare. Le pui în fișiere separate, referite din `SKILL.md` cu link-uri Markdown, iar ele se încarcă doar când skill-ul chiar are nevoie de ele. `SKILL.md` rămâne scurt, cu ținta sub cinci sute de linii, iar detaliul greu stă deoparte. Scripturile nu se încarcă deloc în context — Claude le execută.

Asta este, de fapt, definiția lui **progressive disclosure**: `description`-ul e mereu în context, corpul se încarcă la invocare, iar fișierele ajutătoare doar când skill-ul le cere.

## Pre-aprobarea uneltelor

Câmpul `allowed-tools` dă voie unui skill să folosească anumite unelte fără să-ți ceară aprobare de fiecare dată, cât e activ. De exemplu, un skill `/commit` poate primi voie să ruleze comenzile git de care are nevoie, fără să te întrebe la fiecare pas. Este important de reținut că `allowed-tools` nu restricționează — restul uneltelor rămân disponibile, guvernate de permisiunile tale normale din S1.

Tot aici e fitilul pentru S4: un skill poate rula într-un subagent izolat, cu un câmp care spune că nu vede istoricul conversației tale. Nu construim asta în S3, doar arătăm câmpul, ca punte spre subagenți.

## Cum verifici că un skill chiar ajută

Un skill nu contează pentru că se declanșează, ci pentru că schimbă vizibil ce face Claude. A vedea skill-ul pornind îți spune doar că Claude l-a găsit, nu că face ce voiai. Se măsoară două lucruri, separat:

1. **Se declanșează** pe prompturile pe care ar trebui, și nu pe cele pe care n-ar trebui? Dacă nu, reglezi `description`-ul.
2. **Produce** ce te aștepți când se declanșează? Dacă nu, reglezi corpul.

Metoda pentru ambele este bucla „înainte / după" din S2: rulezi două-trei prompturi realiste într-o sesiune curată, o dată cu skill-ul și o dată fără, și compari. Sesiunea curată contează, fiindcă contextul rămas de la scrierea skill-ului maschează golurile din instrucțiuni.

## Când NU faci un skill

- Când e un fapt, nu o procedură — atunci rămâne în `CLAUDE.md`.
- Când l-ai făcut o singură dată și n-ai motiv să-l repeți — atunci e doar un prompt, nu merită un fișier.
- Când e ceva ce Claude face oricum bine fără instrucțiuni — atunci un skill ar adăuga doar zgomot.

## Lucrul aplicat al sesiunii

Fiecare participant iese cu cel puțin un skill funcțional, comis în git pe proiectul-școală, făcut din propriul prompt repetat. Pașii: alege promptul și confirmă că e o procedură, nu un fapt; generează skill-ul cerându-i lui Claude și citește `SKILL.md`-ul propus înainte să-l accepți; adaugă un argument sau o injectare de context dacă ajută, verificând numerotarea 0-based; testează declanșarea pe `/nume` și pe o frază naturală; fă dovada „înainte / după"; comite skill-ul de proiect. Skill-urile personale nu se comit — sunt ale tale, pe toate repo-urile.

## Capcane comune

- **„Command sau skill?"** este întrebarea greșită — s-au unificat, sunt același `/nume`.
- **`$1` ca prim argument** este cel mai probabil bug de sintaxă al zilei — este 0-based, `$0` e primul.
- **`description` tratat ca documentație** duce la un skill care nu se declanșează — el este interfața de auto-invocare.
- **Skill de acțiune fără `disable-model-invocation`** este un risc — un `/deploy` pe care Claude îl poate porni singur.
- **Fapt împachetat ca skill**, sau invers — testul rămâne: fapt stabil în `CLAUDE.md`, procedură repetată în skill.
- **Folder prematur** — începe cu forma minimă, folder doar când ai ceva de încărcat la cerere.
- **Skill declarat „gata" pentru că se declanșează** — declanșarea nu e totuna cu rezultat corect; insistă pe dovada „înainte / după".

## Cu ce pleci — checklist

- Cel puțin un skill funcțional în `.claude/skills/`, comis în git.
- Un `description` care declanșează pe fraza naturală corectă.
- `disable-model-invocation` dacă skill-ul are efecte laterale.
- Numerotarea argumentelor verificată, 0-based.
- Dovada „înainte / după" pe un prompt concret.

## Pregătire pentru S4

Fiecare notează o sarcină pe care ar da-o lui Claude fără să-i polueze contextul principal — o cercetare grea, o verificare paralelă, analiza unui fișier mare. Ai văzut deja fitilul: câmpul care rulează un skill într-un subagent izolat. În S4 luăm asta în serios, cu subagenți dedicați, cu context propriu, care fac munca grea și întorc doar concluzia.

---

**Următorul pas: S4 — Subagents.**
