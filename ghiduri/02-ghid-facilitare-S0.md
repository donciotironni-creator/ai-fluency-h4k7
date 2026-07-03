# Claude Code Fluency — Ghid de facilitare · S0

*Publicul: echipă senior, cu fundamentele AI deja acoperite.*

> **Notă:** Claude Code publică des. Sintaxa exactă (comenzi, flag-uri, keybindings) se poate schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial. Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal.

---

## S0 — Kickoff & Diagnostic (30 min)

Sesiune scurtă, **înainte** de S1. Scopul nu e să predai nimic, ci: (1) să setezi așteptările programului, (2) să afli unde e echipa ca să calibrezi, (3) să te asiguri că toată lumea are unealta instalată și funcțională pentru S1.

### Obiective
- Toată lumea înțelege că programul e despre Claude Code **ca platformă**, nu despre bazele AI.
- Ai o hartă a nivelului real al echipei pe fiecare capabilitate.
- Toți au Claude Code instalat, autentificat și au rulat cel puțin o sesiune.
- Docul partajat „AI Wins & Fails" există și e accesibil tuturor.

### Agendă (30 min)

| Timp | Bloc | Ce faci |
|------|------|---------|
| 0–5 min | Cadru | Explici arcul: Faza 1 folosire disciplinată → Faza 2 extensii proprii → Faza 3 platformă de echipă. Fiecare săptămână produce un **artefact real** comis în repo, nu notițe. |
| 5–20 min | Diagnostic | Rundă rapidă (vezi mai jos). Notezi scoruri pe un tabel vizibil. |
| 20–27 min | Calibrare | Pe baza rezultatelor, anunți dacă S1–S3 se rulează integral sau se comasează. |
| 27–30 min | Setup & logistică | Confirmi instalarea, deschizi docul partajat, stabilești prezentatorul rotativ din S4. |

### Ce le zici — bloc cu bloc

**0–5 min · Cadru**
> „Programul ăsta nu e despre AI în general — e despre Claude Code ca unealtă de echipă. Deci nu predăm prompturi frumoase, predăm cum conduci un agent: ce îi dai să vadă, ce îl lași să facă, cum ții costul și riscul sub control. Fiecare joi pleacă cu ceva comis în repo — nu cu notițe, nu cu idei, cu un artefact real. Azi nu producem nimic, azi ne calibrăm."

**5–20 min · Diagnostic**
> „O să vă pun 9 întrebări rapide. La fiecare, autoevaluare sinceră: 0 dacă n-ai auzit sau n-ai folosit niciodată, 1 dacă ai atins subiectul dar nu sistematic, 2 dacă e parte din rutina ta zilnică. Nu există răspuns greșit — cu cât știu mai bine unde sunteți, cu atât adaptez mai bine programul pentru voi."

**20–27 min · Calibrare**
> *(după ce ai scorurile vizibile pentru toată lumea)*
> „Pe baza a ce văd, iată cum mergem: [varianta A — dacă mediile 1–4 sunt ≥ 1,5] S1–S3 le comprimăm, punem mai mult timp în Faza 2 și 3 unde e valoarea reală pentru echipă. [varianta B — dacă sunt scoruri mici la 1–4] Mergem integral pe Faza 1 — e exact ce trebuie. [în ambele cazuri] Cei cu scoruri mari pe 5–9 — voi intrați mai devreme ca prezentatori rotativi; aveți ceva de arătat celorlalți."

**27–30 min · Setup & logistică**
> „Înainte să plecați: verificați că `claude` rulează în terminal și că sunteți autentificați — `claude auth status`. Dacă nu, rezolvați azi, că joi începem direct în unealtă. Am deschis acum docul partajat AI Wins & Fails — linkul e în chat. Acolo notăm săptămânal ce a mers și ce n-a mers. Devine memoria colectivă a programului. Din S4, unul dintre voi prezintă la începutul fiecărei joi — stabilim rotatia atunci."

---

### Diagnosticul (întrebări pentru rundă)

Pentru fiecare, cere o autoevaluare rapidă: **0 = n-am auzit / n-am folosit**, **1 = am folosit ocazional**, **2 = folosesc curent și conștient**.

1. Plan mode — folosești modul de planificare înainte de execuție, sau mergi direct?
2. Gestiunea contextului — `/clear`, compaction, ții sesiunile „curate" conștient?
3. Alegerea model / effort — schimbi conștient modelul sau nivelul de effort după tipul task-ului?
4. `CLAUDE.md` — ai un fișier de „constituție" în repo-urile tale?
5. Slash commands / skills — ai comenzi custom proprii?
6. Subagents — ai folosit sau definit vreun subagent?
7. Hooks — ai configurat vreun hook determinist?
8. MCP — ai conectat vreun server MCP (extern sau intern)?
9. Permisiuni — știi diferența allow/ask/deny și riscul lui `--dangerously-skip-permissions`?

### Cum folosești rezultatele

- **Medie ≥ 1,5 pe întrebările 1–4** → comasează S1–S3 în 1–2 sesiuni și pune timpul câștigat în Faza 2–3 (plugins, automatizare, guvernanță), unde e cel mai mult de câștigat la scară.
- **Scoruri mari doar la câțiva** → ei devin candidați pentru prezentator rotativ mai devreme; pot intra pe traseu „skip-ahead" (sar la lucru aplicat cu un artefact mai ambițios).
- **Mult 0 pe 5–9** → păstrează Faza 2–3 integral; acolo e nevoia reală.

### Checklist de setup (înainte de S1)

Trimite-l după S0 ca „temă de 10 minute":

- [ ] Claude Code instalat (`claude` rulează în terminal).
- [ ] Autentificat (`claude auth status` arată sesiune validă).
- [ ] Ai rulat cel puțin o sesiune reală pe un repo propriu.
- [ ] Ai la îndemână **un repo de test „de nisip"** (sandbox), separat de codul real — pe el vom testa în sesiunile următoare lucruri potențial distructive (hooks, permisiuni).
- [ ] Ai acces la docul partajat „AI Wins & Fails".
