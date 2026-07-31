# S6 — MCP: Claude Code vorbește cu lumea din afara repo-ului

**Faza 2 · Extensii proprii · ~3 ore. Programul de joi — AI Fluency pe Claude Code.**

*Document-suport pentru NotebookLM. E scris ca proză explicativă, self-contained: definește termenii pe măsură ce apar, ca să poată fi transformat direct într-o prezentare sau într-un audio overview fără context extern.*

---

## De unde venim și unde mergem

Până acum, echipa a învățat să schimbe felul în care lucrează Claude Code **în interiorul** uneltei. A controlat permisiunile (S1), a pus faptele stabile ale unui proiect într-un fișier citit automat, `CLAUDE.md` (S2), a transformat procedurile repetate în skills (S3), a delegat munca grea unor subagenți în context izolat (S4), și a prins evenimente din ciclul de viață cu hook-uri deterministe (S5). Toate aceste componente operează cu uneltele proprii ale Claude Code: citește fișiere, caută în cod, rulează comenzi, editează.

S6 deschide o ușă nouă: spre exterior. MCP — Model Context Protocol — îi dă lui Claude **unelte noi**, care ajung la sisteme reale, din afara repo-ului. Nu mai schimbăm comportamentul lui Claude; îi extindem **suprafața de acțiune**.

Forma sesiunii de azi nu e o expunere abstractă, ci un **tur de patru servere**, instalate live, în ordine crescătoare de implicare. Întâi un server oficial de Jira, remote, cu autentificare prin browser. Apoi Playwright, un server local care îi dă lui Claude un browser. Apoi un server custom, scris de noi, pe care echipa îl clonează din git și îl construiește. Și, la final, un server pe care fiecare îl scrie de la zero. Fiecare pas adaugă exact o idee nouă peste anteriorul.

## Simptomul care se vede: copiezi date în chat

Semnalul practic că ai nevoie de MCP e mereu același: te prinzi copiind date dintr-un alt sistem în conversație. Deschizi un ticket din Jira și îl parafrazezi. Rulezi un `SELECT` în SSMS și lipești rezultatul. Copiezi un log dintr-un dashboard. De fiecare dată, **tu** ești transportul dintre Claude și sistem. Fiecare copy-paste e un tool care lipsește.

Ce schimbă MCP: Claude primește unelte care vorbesc direct cu sistemul. Nu mai lipești rezultate — ceri ce vrei să afli, iar Claude iterează singur: interoghează, se uită la rezultat, mai întreabă, corelează.

## Ce este MCP, concret

MCP este un **protocol deschis**, de tip client–server. Claude Code este clientul. Un **server MCP** este un proces — local sau remote — care expune capabilități. Nu este un simplu wrapper peste comenzi shell: un server MCP întoarce **date structurate**, cu o **schemă de unealtă** care spune ce parametri acceptă și ce înseamnă, nu text pe care Claude trebuie să-l ghicească. Și, spre deosebire de un script, un server MCP se partajează ca **configurație**, nu ca fișier de copiat.

## Ce expune un server: nu doar tools

Majoritatea documentației vorbește doar de tools, dar un server expune trei lucruri. **Tools** sunt uneltele pe care Claude le cheamă singur, ca `searchJiraIssuesUsingJql` sau `tempo_worklog_create`. **Resources** sunt bucăți de context pe care tu le referențiezi cu simbolul `@`, la fel ca fișierele — apar în autocomplete lângă ele. **Prompts** sunt slash commands venite de la server, de forma `/mcp__server__prompt` — exact forma din S3, doar că definite în altă parte. Un server bun îți dă deci și acțiuni, și context, și comenzi.

## Cum funcționează: transporturile

Transportul este felul în care Claude Code vorbește cu serverul. Azi contează două, și le vezi pe amândouă pe viu.

Primul este `stdio`: serverul e un proces **local**, pornit de Claude Code, care comunică pe intrarea și ieșirea standard. E default-ul pentru tot ce rulezi la tine — Playwright, serverul custom de pontaj, serverul pe care-l scrii singur.

Al doilea este `http`: serverul e **remote**, undeva în cloud. În fișierul de configurare apare ca `http`, cu aliasul `streamable-http`. E singurul transport care suportă **OAuth**, adică autentificare prin browser — de aceea Jira, un serviciu cloud, se conectează prin `http`.

Mai există două, pe care le recunoști dar nu le folosești azi. `sse` este **deprecat** — îl vezi doar dacă un serviciu vechi nu expune altceva. Și `ws`, WebSocket, pentru servere care împing evenimente, configurabil doar prin JSON.

Un lucru important de dezmințit: intuiția că „SSE e pentru echipă" e greșită pe două planuri. SSE e deprecat, iar partajarea **nu** e o proprietate a transportului, ci a scope-ului. Un server local pus în fișierul de proiect e partajat cu toată echipa; un server remote pus în scope local nu e partajat cu nimeni.

## Criteriul care ține sesiunea: MCP sau script?

Înainte de orice tur de unelte, echipa fixează judecata care oprește derapajul clasic al zilei — oamenii vor un server MCP pentru fiecare idee și ajung cu șase servere pornite din care folosesc unul.

Regula de aur: merită un server MCP atunci când poți numi **întrebările** pe care Claude le va pune sistemului. Dacă Claude trebuie să raționeze iterativ pe un sistem viu — să interogheze, să se uite, să întrebe altceva — ai nevoie de un server. Dar dacă poți numi doar **comanda** pe care ai rula-o tu, o operație one-shot cu output previzibil ca `git log` sau `dotnet test`, atunci e un script, iar comanda shell îl face deja. La fiecare server din tur, întrebarea de control rămâne: e MCP, sau ar fi fost un script?

## Cele trei scope-uri: unde trăiește configurația

Un server MCP se instalează cu comanda `claude mcp add`, iar unde ajunge configurația e decis de scope. Sunt trei.

Scope-ul `local` este **default-ul**: serverul e al tău și doar în proiectul curent, scris într-un fișier personal, `~/.claude.json`. Bun pentru experimente. Scope-ul `user` e tot privat, dar valabil pe toate proiectele tale. Iar scope-ul `project` este **singurul** care produce un fișier de comis: `.mcp.json`, în rădăcina repo-ului, partajat cu echipa prin git.

Azi echipa instalează în `local` pe parcursul turului și comite în `.mcp.json` abia la finalul lucrului aplicat. Fișierul de proiect are un mecanism care-l face comisibil în siguranță: **expansiunea de variabile de mediu**, de forma `${VAR}` sau `${VAR:-default}`. Token-ul de la Tempo, calea către un server local — toate diferă de la om la om, deci se lasă ca variabile, nu se hardcodează.

Verificarea se face în trei comenzi: `claude mcp list` arată statusul fiecărui server, `claude mcp get` dă detaliile unuia, `claude mcp remove` îl scoate. Iar în sesiune, `/mcp` arată statusul, numărul de tool-uri, autentificarea, și un toggle care dezactivează un server fără să-i pierzi configurația.

## Primul server: Jira, remote și cu OAuth

Jira este primul din tur pentru că introduce cazul „cloud partajat". Îl adaugi **fără credențiale**, cu transport `http`, indicând endpointul oficial al serverului remote Atlassian. Comanda scrie doar configurația; nu te loghează. La prima folosire, deschizi `/mcp`, alegi serverul, și te autentifici prin **sign-in în browser**, cu protocolul OAuth. După aceea, `claude mcp list` trece de la „needs authentication" la „connected", iar token-urile se stochează și se reîmprospătează singure.

Odată conectat, îl pui la treabă în română: ce tickete deschise ai în sprint, un rezumat al unui ticket și al subtask-urilor lui, crearea unui bug. Și o întrebare care pare banală, dar e cheia pasului următor: **care e accountId-ul tău din Jira**. E un identificator, nu adresa de email, și serverul de pontaj va avea nevoie de el.

## Al doilea server: Playwright, un browser pentru Claude

Playwright introduce ideea de server local dintr-un pachet npm, fără cont și fără credențiale, și vine cu un „de ce" care contează pentru o echipă SQL în tranziție spre full-stack. La SQL, vezi **datele**. Cu Playwright, Claude vede **ce vede utilizatorul** din aceleași date, pentru că poate conduce un browser real.

Asta îi permite lui Claude să verifice că o schimbare făcută în baza de date **ajunge în interfață** — clicând prin aplicație, nu doar rulând un `SELECT`. Îi permite să reproducă un bug raportat în aplicație, nu în query. Și să genereze teste end-to-end din instrucțiuni în limbaj natural. Un detaliu tehnic elegant: Playwright lucrează pe **arborele de accesibilitate** al paginii — structura ei — nu pe capturi de ecran. Structurat, ieftin, determinist. Exact tema MCP: date structurate, nu pixeli de ghicit.

Instalarea e o singură comandă, care trage pachetul la prima pornire; primul apel poate descărca browserul, deci cere puțină răbdare.

## Al treilea server: tempo-mcp, custom și clonat din git

Aici e miezul practic al zilei. tempo-mcp este un server MCP scris de noi, pentru API-ul REST al platformei de pontaj Tempo, cu acoperire completă a endpointurilor — pontaje, planuri, echipe, conturi — în jur de optzeci de unelte. E scris în Node, rulează pe `stdio`, și se distribuie ca **repo public, clonabil**: fiecare îl instalează la el.

E prima dată în sesiune când nu conectezi ceva de-a gata, ci **construiești un artefact local** dintr-un cod sursă. Pașii sunt: clonezi repo-ul în afara proiectului de curs, instalezi dependențele, și rulezi build-ul. Apoi generezi un token din setările Tempo și conectezi serverul pe `stdio`, dându-i token-ul și adresa de bază prin variabile de mediu. Două capcane de sintaxă apar aici, ambele din tutorial: dubla cratimă `--` e obligatorie înainte de comanda serverului, iar numele serverului nu trebuie pus imediat după `--env`, altfel e citit ca încă o pereche cheie-valoare.

Și aici vine cel mai bun moment al zilei: **legătura între două servere**. Pontarea cere un `authorAccountId`, care e chiar Jira account ID-ul notat la primul pas. Îi ceri lui Claude să logheze o oră pe un ticket, iar el ia identificatorul din Jira și cheamă unealta de pontaj din tempo — fără niciun copy-paste între sisteme. Aici se vede de ce ai un **ecosistem** de unelte, nu un tool izolat: un server furnizează inputul altuia.

Acest pas plantează și fitilul spre S7. tempo-mcp a fost dat ca repo de clonat, deci trei oameni l-au configurat în trei feluri: build local propriu, token propriu, cale absolută diferită. Când trei oameni configurează același server în trei feluri, problema nu mai e serverul, e **distribuția**.

## Al patrulea server: al tău, pe SQL

Ținta finală e ca fiecare să plece cu un server propriu, care expune un tool intern al echipei. Îl facem pe SQL, dar deliberat mic — scopul e să înțelegi mecanica, nu să construiești ceva mare.

Un punct important: **nu** rescriem un server de recunoaștere a bazei de date, pentru că echipa are deja unul matur conectat, care caută obiecte, descrie tabele și urmărește dependențe. Construim ceva mic și al echipei. Cea mai curată idee e un server care întoarce **patternurile T-SQL binecuvântate** ale echipei — un MERGE pentru upsert, paginarea corectă, un bloc TRY/CATCH — printr-o singură unealtă care primește numele patternului și întoarce textul. E logică pură, fără intrări-ieșiri, deci se demonstrează impecabil. Alternative bune: un catalog care caută o procedură într-un folder de fișiere SQL, sau un validator de nume de obiecte care verifică prefixele convenției.

Un server MCP minimal e surprinzător de mic: declari un server cu un nume și o versiune, înregistrezi o unealtă cu un nume, o descriere și o schemă de parametri, și te conectezi pe transportul `stdio`. Un detaliu care prinde lumea pe picior greșit: pachetul corect se numește `@modelcontextprotocol/server`; tutorialele mai vechi spun `@modelcontextprotocol/sdk`, care e altceva. Iar serverul nu se scrie de mână obligatoriu — i-l ceri lui Claude, ca orice sarcină, și citești fișierul înainte de accept; sau folosești pluginul oficial de scaffolding.

## Costul real: context și procese

Costul unui server MCP nu e acolo unde se așteaptă lumea. Pe partea de **context**, căutarea de unelte e activă implicit, deci definițiile de unelte sunt amânate — patru servere conectate nu-ți umplu contextul până nu le folosești. Ce umple contextul e **output-ul**: Claude Code avertizează când un tool întoarce peste zece mii de tokeni și taie la douăzeci și cinci de mii. Un `SELECT *` pe o tabelă mare, sau o listare de pontaje pe tot anul, e exact greșeala. E aceeași lecție ca la subagenți: rezumate, nu dump-uri — doar sursa dump-ului s-a schimbat.

Pe partea de **procese**, fiecare server e un proces în plus care poate să nu pornească, să atârne sau să pice. `claude mcp list` îți spune care. Un apel care trece de două minute intră automat în fundal, ca task.

## Perimetrul: două straturi de control

Aici se aplică firul de siguranță din S1. Distincția care contează: „serverul poate face X" **nu** înseamnă „Claude are voie să facă X". Sunt două straturi separate.

Primul strat e ce poate serverul, și ține de configurația lui. Cea mai eficientă graniță din toată sesiunea e un **token read-only** sau un user de bază de date read-only: un server care nu poate scrie nu scrie, indiferent ce cere modelul. Și trebuie să citești lista de unelte înainte să conectezi ceva — unele servere expun unelte puternice, ca ștergerea de pontaje sau execuția de SQL arbitrar care acceptă și `DROP`.

Al doilea strat e ce are voie Claude, controlat prin reguli de permisiuni comise în repo, pe numele complet al uneltei, de forma `mcp__server__tool`. Tiparul practic: permiți uneltele de citire, și pui pe „ask" sau „deny" cele de creare, modificare și ștergere. O subtilitate: în lista `allow`, un wildcard merge doar după prefixul literal `mcp__server__`; o regulă neancorată e ignorată cu avertisment. În `deny`, în schimb, un wildcard general e valid și taie tot.

## Fitilul spre S9: securitatea

Un server MCP citește conținut pe care **nu l-ai scris tu** — descrieri de tickete din Jira, pagini web prin Playwright, rânduri dintr-o bază. Conținutul ăla ajunge în contextul modelului și **poate conține instrucțiuni**. Asta e prompt injection, vectorul serios al MCP-ului. A doua față: date care **ies** din perimetru — un server remote ca Jira sau Tempo vede ce-i trimiți. Ambele se tratează serios în S9. Azi rămâne doar reflexul: verifică în cine te încrezi înainte să conectezi, și restrânge de la început.

## Cum verifici că un server merge

Dovada se măsoară în trei pași, în ordine. Întâi: se conectează? `claude mcp list` trebuie să arate „connected"; la un server local, cauza tipică a eșecului e o comandă sau o cale greșită. Al doilea: uneltele se văd? `/mcp` arată numărul de tool-uri — zero la un server conectat înseamnă că rulează, dar nu declară nimic. Al treilea: Claude cheamă unealta potrivită? Dacă nu, problema e aproape mereu **descrierea** uneltei, nu implementarea — exact lecția de la skills și subagenți. Descrierile se taie la doi kilobytes, deci pui ce e important la început.

## Lucrul aplicat al sesiunii

Fiecare iese cu patru servere conectate — Jira, Playwright, tempo și serverul propriu — și cu o configurație comisă în `.mcp.json`. Pașii: adaugi Jira și te autentifici, notându-ți accountId-ul; adaugi Playwright și îl pui să verifice ceva în interfață; clonezi și construiești tempo-mcp, apoi loghezi o oră reală folosind identificatorul din Jira; restrângi perimetrul cu reguli de permisiuni; scrii serverul tău de SQL și îl verifici; și, la final, muți configurația în `.mcp.json` cu variabile de mediu și o comiți.

Artefactul e real: un `.mcp.json` comis, cu token-uri și căi ca variabile, plus regulile de permisiuni. Oricine clonează repo-ul primește aceeași configurație — mai puțin token-ul lui personal și build-ul local al serverului custom, exact tensiunea care duce spre S7.

## Capcane comune

Cea mai frecventă e dorința de a face un server pentru fiecare idee — se combate cu testul întrebărilor față de comandă. Apoi capcanele de sintaxă la serverele locale: dubla cratimă uitată, sau numele serverului pus imediat după `--env`. La Jira, mirarea că „nu merge" imediat după adăugare — normal, trebuie autentificarea prin browser. La tempo, build-ul sărit, care face ca pornirea să cadă. Token-ul hardcodat într-un fișier comis, în loc de variabilă. Output-ul nefiltrat care umple contextul. Confuzia dintre cele două straturi de perimetru. Și încrederea oarbă într-un server străin — verifică sursa înainte, chiar și pentru serverul nostru, care e public tocmai ca să poată fi citit.

## Pregătire pentru S7

Fiecare notează ce din tot ce a construit până acum ar vrea să aibă și colegul de lângă, fără să-i explice nimic. În directorul `.claude` sunt deja un `CLAUDE.md` (S2), un skill (S3), un subagent (S4), un hook (S5) și o configurație MCP (S6). Fiecare a fost partajat altfel — sau deloc. Fitilul s-a văzut azi cu tempo-mcp: dat ca repo de clonat, configurat în trei feluri de trei oameni. Problema nu e serverul, e distribuția. În S7 vin **plugins** — un bundle versionat care livrează împreună skills, subagenți, comenzi, hooks și definiții MCP, instalabil cu o comandă. De la „am scris un server" la „l-am publicat".

---

**Următorul pas: S7 — Plugins.**
