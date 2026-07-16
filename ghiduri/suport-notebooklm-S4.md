# S4 — Subagents: munca grea, în context izolat

**Faza 2 · Extensii proprii · ~3 ore. Programul de joi — AI Fluency pe Claude Code.**

*Document-suport pentru NotebookLM. E scris ca proză explicativă, self-contained: definește termenii pe măsură ce apar, ca să poată fi transformat direct într-o prezentare sau într-un audio overview fără context extern.*

---

## De unde venim și unde mergem

Până acum, în Faza 1, echipa a învățat să *folosească* Claude Code disciplinat: să controleze permisiunile (S1), să pună faptele stabile ale unui proiect într-un fișier citit automat, `CLAUDE.md` (S2), și să transforme procedurile repetate în skills reutilizabile (S3).

S4 deschide Faza 2 — „Extensii proprii". Aici echipa nu mai doar folosește unealta, ci începe să construiască componente proprii care schimbă felul în care lucrează. Subagenții sunt primul pas, și rezolvă o problemă pe care oricine a folosit un asistent AI a simțit-o deja: **contextul principal se umple de gunoi pe care nu-l mai reține niciodată**. Rezultatele unei căutări în tot codul, output-ul unei suite de teste, conținutul a zeci de fișiere — toate rămân în fereastra de context și concurează cu munca reală.

Premisa vine din tema de pregătire de la finalul S3: fiecare participant a notat o sarcină pe care ar da-o lui Claude fără să-i polueze contextul principal.

## Ce este un subagent

Un subagent este o sesiune Claude **separată**, cu propria fereastră de context, propriul system prompt și propriul set de unelte. Îi dai o sarcină, el o rezolvă în fereastra lui izolată, și îți întoarce **doar concluzia** — nu munca brută.

Analogia utilă: dacă ai o întrebare care cere citirea a 40 de fișiere, un subagent citește cele 40 de fișiere în fereastra *lui*, le aruncă la final, și îți dă înapoi două rânduri de răspuns. Contextul tău principal rămâne curat.

E al doilea nivel de economie de context din program. În S2 și S3 economia era despre *ce citește modelul* (fapte mereu, proceduri la cerere). Aici economia e despre *unde se face munca*: zgomotul rămâne în altă fereastră.

## Atenție: un subagent NU este un „AGENTS.md"

E o confuzie de terminologie foarte comună, din cauza numelui. Merită lămurită de la început.

`AGENTS.md` este un fișier de **context** — geamănul open-standard, cross-tool, al lui `CLAUDE.md`. Conține instrucțiuni și fapte despre proiect, se încarcă automat, și **nu** este ceva ce „rulezi". Nu e un agent. (În plus, Claude Code citește `CLAUDE.md`, nu `AGENTS.md` direct; dacă un repo are deja un `AGENTS.md`, îl aduci printr-un import.)

Un **subagent**, în schimb, este un lucrător pe care Claude îl deleagă — fișierul lui trăiește în `.claude/agents/` (proiect) sau `~/.claude/agents/` (personal). Ăsta e „agentul pe care-l folosești". Despre el este vorba în S4.

Pe scurt: `AGENTS.md` = context (ce știe Claude); subagent = muncitor (ce face Claude pentru tine).

## Obiectivele sesiunii

La final, fiecare participant știe:

- Ce e un subagent și de ce izolează contextul.
- Cei trei agenți built-in și când îi cheamă Claude singur.
- Compromisul central: izolarea e și beneficiu, și cost.
- Cum definește un subagent propriu (frontmatter plus system prompt).
- Cum controlează uneltele (read-only vs. cu scriere) și modelul (pentru cost).
- Cum rulează subagenți în paralel — și de ce prea mulți anulează economia de context.
- Cum verifică empiric că un subagent e util, nu doar că rulează.

## Cei trei agenți built-in

Nu trebuie să configurezi nimic ca să folosești subagenți: Claude Code vine cu trei, și îi cheamă singur când se potrivesc cu sarcina.

- **Explore** — agent read-only, optimizat pentru căutare și analiză de cod. Write și Edit sunt interzise prin construcție, deci nu poate strica nimic. Claude îl folosește când trebuie să înțeleagă codebase-ul fără să-l modifice.
- **Plan** — agent read-only de cercetare, folosit în plan mode pentru a strânge context înainte de a-ți propune un plan.
- **general-purpose** — agent cu toate uneltele, pentru sarcini complexe, cu mai mulți pași, care cer și explorare, și modificări.

Delegarea este **automată**: pornește de la descrierea sarcinii tale. Nu tastezi nimic special. Un detaliu important: Explore și Plan sar peste `CLAUDE.md` ca să fie rapide și ieftine, deci dacă o regulă din `CLAUDE.md` chiar trebuie să ajungă la ele, o repeți în promptul cu care delegi.

## Compromisul central: izolarea ascunde context

Acesta e miezul conceptual al zilei. Un subagent pornește cu o fereastră de context **proaspătă și goală**. Nu-ți vede conversația, nu vede fișierele pe care Claude le-a citit deja, nu vede skills-urile pe care le-ai invocat.

Asta este, în același timp, și beneficiul, și costul:

- **Beneficiul:** output-ul voluminos rămâne izolat, contextul tău principal nu se umflă, și poți impune restricții de unelte.
- **Costul:** subagentul nu știe ce știi tu. Dacă sarcina depinde de nuanțe discutate în conversație, ori le repeți în delegare, ori subagentul greșește. Și, foarte important, rezultatul lui **reintră** în contextul tău — deci un subagent care-ți întoarce un dump de 500 de linii nu a economisit nimic.

Regula de aur: un subagent merită atunci când poți descrie ce **rezumat** vrei înapoi. Dacă nu poți — dacă vrei să „lucrați împreună la asta", cu multe iterații — nu e o treabă pentru un subagent.

## Când folosești ce: conversație principală vs. subagent vs. fork

- **Conversația principală** — pentru sarcini cu dialog, iterații, faze care împart context (planificare plus implementare plus testare), pentru schimbări mici și țintite, și când contează latența.
- **Subagent izolat** — pentru output voluminos pe care nu-l reții, când vrei restricții de unelte, și când munca e auto-conținută și poate întoarce un rezumat.
- **Fork** — o variantă care moștenește toată conversația de până acum, dar lucrează separat. Util pentru un side-task pe care nu vrei să-l re-explici. (Este fitilul văzut în S3, cu `context: fork`.)

## Cum definești un subagent propriu

Când te trezești că dai *aceeași* sarcină de cercetare iar și iar, o transformi într-un subagent dedicat — exact reflexul „promptul repetat devine skill" din S3, mutat la nivel de agent.

Un subagent este un fișier Markdown cu două părți:

- **Frontmatter YAML** cu câteva câmpuri. Obligatorii: `name` (identificator cu litere mici și cratime) și `description` (spune *când* să delege Claude aici — este interfața de delegare, la fel ca `description` la skills, nu documentație). Opționale: `tools` (allowlist de unelte) și `model` (`haiku`, `sonnet`, `opus` sau `inherit`).
- **Corpul Markdown**, care devine system promptul subagentului. Doar asta primește, plus câteva detalii de mediu — nu tot system promptul lui Claude Code.

Locațiile urmează aceeași logică ca la skills și `CLAUDE.md`: `~/.claude/agents/` pentru subagenți personali, valabili pe toate proiectele tale; `.claude/agents/` pentru subagenți de proiect, comiși în git și partajați cu echipa.

Un detaliu de reținut: comanda `/agents` nu mai deschide un wizard. Creezi un subagent cerându-i lui Claude să scrie fișierul, sau scriindu-l de mână — și, ca întotdeauna, citești ce a propus înainte să accepți.

## Controlul: unelte și model

Două câmpuri de frontmatter îți dau pârghii importante:

- **`tools`** controlează ce poate face subagentul. Pentru un cercetător, restrângi la `Read, Grep, Glob` — nu poate scrie, deci nu poate strica nimic. Aceasta este recomandarea de siguranță care leagă S4 de firul din S1: dă subagenților de cercetare unelte read-only și ține Edit/Write pe agentul principal, unde tu ai degetul pe trăgaci. Un `general-purpose` cu scriere e o alegere conștientă, pentru un muncitor autonom, nu pentru cercetare.
- **`model`** controlează costul. Cercetarea grea pe `haiku` este mult mai ieftină și adesea suficientă; păstrezi `sonnet` pentru sarcini care cer raționament, cum e un review.

## Paralelism, înlănțuire, și costul lor

Pentru investigații independente, Claude poate porni mai mulți subagenți deodată — de exemplu, cercetează în paralel modulele de autentificare, bază de date și API, cu subagenți separați. Pentru fluxuri cu mai mulți pași, îi înlănțuiești: unul găsește problemele, altul le repară. Subagenții rulează în fundal în mod implicit, cât tu continui lucrul.

Există însă un cost care poate anula beneficiul. Fiecare subagent, când termină, își întoarce rezultatul în contextul tău. Zece subagenți care întorc fiecare 200 de linii înseamnă 2000 de linii în contextul principal — exact ce voiai să eviți. Regula rămâne: subagenții întorc **rezumate**, nu dump-uri. Pentru paralelism susținut, la scară mare, există un alt mecanism, agent teams, care e material pentru o altă zi.

Aici apare și fitilul pentru S5: ciclul de viață al unui subagent are evenimente, cum sunt pornirea și oprirea lui, pe care un **hook** le poate prinde ca să ruleze ceva determinist. Până acum tot ce ai construit depinde de *decizia* modelului; hook-urile rulează indiferent de ea.

## Cum verifici că un subagent chiar ajută

Un subagent nu contează pentru că rulează, ci pentru că face munca fără să-ți umple contextul și întoarce ceva util. Se măsoară două lucruri separat:

1. **A fost delegat corect?** Cere ceva ce ar trebui să-l cheme. Dacă Claude nu deleagă, problema este aproape mereu `description`-ul, nu corpul — la fel ca la skills.
2. **A păstrat contextul curat?** După ce rulează, verifici (de exemplu cu comanda `/context`) că în conversația principală a intrat doar rezumatul, nu munca brută. Dacă a întors un dump, reglezi corpul cerându-i explicit un rezumat.

## Când NU faci un subagent

- Când sarcina cere dialog și iterații — atunci e treabă de conversație principală, fiindcă subagentul pornește gol și nu poate itera cu tine.
- Când o faci o singură dată — atunci ceri direct, nu-ți trebuie un fișier.
- Când agentul built-in Explore face deja treaba — nu reinventa ce ai în cutie.
- Când ai nevoie de tot contextul conversației — atunci folosești un fork, nu un subagent nou.

## Starter-pack: patru subagenți gata de folosit

La finalul sesiunii, echipa pleacă cu un set de subagenți personali, cross-project, gata de copiat în `~/.claude/agents/`. Sunt puncte de plecare, nu fișiere sacre — fiecare le adaptează:

- **codebase-explorer** — cercetare read-only: mapează cum e structurat un feature și întoarce o hartă a fișierelor și fluxului. Unelte read-only, model haiku.
- **code-reviewer** — review pe modificări: corectitudine, securitate, convenții. Read-only, model sonnet.
- **sql-reviewer** — review T-SQL, croit pe munca echipei: proceduri stocate, interogări, migrări, indexuri, cu atenție la siguranța pe date reale. Read-only, model sonnet.
- **test-runner** — rulează suita de teste și întoarce doar testele care pică. Singurul care are nevoie de unealta Bash, model haiku.

## Lucrul aplicat al sesiunii

Fiecare participant iese cu cel puțin un subagent funcțional, comis în git pe proiectul-școală, făcut din propria sarcină de cercetare. Pașii: alege sarcina și verifică dacă e izolabilă (poți descrie rezumatul dorit?); generează subagentul cu Claude, citind fișierul înainte să-l accepți; verifică delegarea; dovedește că păstrează contextul curat; comite subagentul de proiect. Subagenții personali nu se comit — sunt ai tăi, pe toate repo-urile.

## Capcane comune

- **Subagent pentru un task de dialog** — cea mai frecventă greșeală; subagentul „nu știe ce voiai" fiindcă a pornit gol.
- **Subagent care întoarce un dump** — anulează economia de context; corpul trebuie să ceară un rezumat.
- **Scriere când read-only ajungea** — un cercetător n-are ce face cu Edit/Write.
- **Descriere vagă** — subagentul nu e delegat când trebuie.
- **Reinventezi Explore** — verifică built-in-ul înainte să construiești.
- **Prea mulți subagenți „ca să fie"** — contextul devine mai plin, nu mai gol.

## Cu ce pleci — checklist

- Cel puțin un subagent funcțional în `.claude/agents/`, comis în git.
- O descriere care declanșează delegarea pe sarcina corectă.
- Unelte read-only pentru cercetători; scrierea rămâne pe agentul principal.
- Un model potrivit costului (haiku pentru cercetarea grea).
- Dovada că păstrează contextul principal curat — un rezumat întors, nu un dump.

## Pregătire pentru S5

Fiecare notează o regulă pe care ar vrea ca Claude s-o respecte mereu, dar pe care uneori o ratează: „formatează după fiecare edit", „nu comite niciodată un connection string sau un CNP", „nu atinge procedurile din producție", „rulează testele înainte de commit". Până acum tot ce s-a construit (fapte, proceduri, subagenți) depinde de decizia modelului să urmeze instrucțiunea. În S5 vin hook-urile — scripturi care rulează determinist, la evenimente din ciclul de viață. Cod, nu speranță.

---

**Următorul pas: S5 — Hooks.**
