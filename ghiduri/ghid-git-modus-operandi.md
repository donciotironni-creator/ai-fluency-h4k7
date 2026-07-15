# Modus Operandi Git

Ghid de bune practici Git pentru echipă. Folosim **Bitbucket**, dar principiile sunt aceleași pe orice platformă (GitHub, GitLab, Azure DevOps) — Git e Git; Bitbucket e doar locul unde stă remote-ul și unde facem pull request-urile.

Scris pentru o echipă care vine dinspre SQL și trece spre full-stack. Nu presupune că știi deja Git „de reflex" — dar nici nu-ți explică ce e un fișier. Scopul: să lucrăm toți la fel, ca istoricul repo-ului să rămână curat și munca nimănui să nu se piardă.

---

## 1. Modelul mental (fără asta, restul e magie neagră)

Patru concepte și cam atât:

- **Repository (repo)** — folderul proiectului plus toată istoria lui. Ce e local la tine e o copie completă, nu o vedere parțială.
- **Commit** — o fotografie a proiectului la un moment dat, cu un mesaj și un părinte. Istoricul e un lanț de commit-uri.
- **Branch** — un pointer mișcător către un commit. „Un branch" nu copiază fișiere; e doar o etichetă care avansează pe măsură ce comiți. De asta branch-urile în Git sunt ieftine.
- **Remote (`origin`)** — copia de pe Bitbucket. `push` trimite commit-urile tale acolo; `pull` le aduce pe ale celorlalți.

> Analogie pentru echipa SQL: un commit e ca un `BACKUP` cu timestamp și comentariu. Un branch e ca un environment de lucru izolat. `merge` e ca un `MERGE` — iei două stări și le împaci. Diferența: în Git te poți întoarce oricând la orice snapshot, gratis.

Cele trei zone prin care trece o modificare:

```
working directory  →  staging area (index)  →  commit (istoric local)  →  origin (Bitbucket)
     (editezi)          git add                    git commit                git push
```

---

## 2. Modelul de branching

Ținem lucrurile simple: **trunk cu feature branches scurte**.

- `main` (sau `master` / `develop`, după repo) e sacru. Nu comiți direct pe el. Se ajunge acolo **doar prin pull request**.
- Pentru orice bucată de lucru îți faci un branch pornit din `main` la zi.
- Branch-urile trăiesc scurt — ore sau zile, nu săptămâni. Cu cât stă mai mult un branch deschis, cu atât doare mai tare merge-ul la final.

**Convenție de denumire** (prefix + descriere kebab-case, opțional ticket):

```
feature/timeoff-accrual-policy
fix/filnet-ocr-null-date
hotfix/iris-deadlock-sync-job
chore/bump-dependencies
docs/git-modus-operandi
```

Dacă lucrați cu ticket-uri (Jira / Bitbucket issues), pune ID-ul în nume: `feature/PROJ-142-remaining-days`.

**Regula de aur:** un branch = o intenție. Dacă te trezești că faci „și încă un fix cât tot aici", probabil e alt branch.

---

## 3. Commit-uri: mici, atomice, cu mesaj care spune DE CE

Un commit bun e o unitate logică care are sens singură. Nu „munca de azi", ci „adaug validarea pe câmpul X".

### Anatomia unui mesaj

Folosim **Conventional Commits** (același format ca la commit-urile noastre din cod):

```
<tip>: <ce face, la imperativ, sub 72 de caractere>

<corp opțional: DE CE, nu CUM — codul spune deja cum>

<footer opțional: refs ticket, breaking changes>
```

Tipuri:

| Tip | Când |
|-----|------|
| `feat` | funcționalitate nouă |
| `fix` | corectare de bug |
| `docs` | doar documentație |
| `refactor` | rescriere fără schimbare de comportament |
| `test` | adaug / repar teste |
| `chore` | mentenanță, dependințe, config |
| `perf` | optimizare de performanță |

Exemple bune:

```
feat: add remaining-days calculation for partial accrual

Accrual-ul lunar trebuia proratat pentru angajații intrați
la mijlocul lunii. Înainte primeau luna întreagă.

Refs: TIMEOFF-142
```

```
fix: guard against null OCR date in Filnet pipeline
```

Anti-pattern (nu face asta):

```
update                     ← ce ai updatat?
fix bug                    ← care bug?
asdf                       ← ...
final version FINAL v2     ← nu.
wip                        ← ok local, dar squash-uiește înainte de PR
```

### Reguli practice

- **Commit des, local.** E gratis. Poți oricând să rescrii istoricul înainte de push.
- **Un commit trebuie să lase repo-ul într-o stare validă** — să compileze, să treacă testele. Nu comiți la jumătatea unei idei ca „checkpoint" într-un branch pe care-l dai la review (dar poți, local, dacă faci squash după).
- **Verifică ce comiți.** `git status` și `git diff --staged` înainte de fiecare commit. Nu da `git add .` orbește.

---

## 4. Bucla zilnică (workflow-ul standard)

```bash
# 1. Pornești de la main la zi
git checkout main
git pull

# 2. Îți faci branch-ul de lucru
git checkout -b feature/timeoff-accrual-policy

# 3. Lucrezi. Comiți în bucăți logice.
git add -p                       # stage selectiv, pe bucăți
git commit -m "feat: ..."

# 4. Ții branch-ul sincronizat cu main (dacă lucrarea durează)
git fetch origin
git rebase origin/main           # sau merge, vezi secțiunea 6

# 5. Împingi pe Bitbucket
git push -u origin feature/timeoff-accrual-policy

# 6. Deschizi Pull Request din Bitbucket UI
# 7. După aprobare + merge: cureți
git checkout main
git pull
git branch -d feature/timeoff-accrual-policy
```

`git add -p` (`--patch`) e prietenul tău: te plimbă prin fiecare bucată de modificare și te întreabă dacă o incluzi. Așa ajungi la commit-uri atomice fără efort.

---

## 5. Pull Request-uri pe Bitbucket

PR-ul e locul unde codul devine al echipei. Nu e o formalitate — e review și e documentație.

### Ce face un PR bun

- **Titlu clar** — la fel ca un mesaj de commit: `feat: accrual proratat pentru intrări la mijloc de lună`.
- **Descriere care răspunde la 3 întrebări:**
  1. **Ce** face acest PR?
  2. **De ce** — ce problemă rezolvă / ce ticket?
  3. **Cum verifici** — pași de testare, ce să se uite reviewer-ul cu atenție.
- **Mic.** Un PR de 200 de linii primește review real. Unul de 2000 primește „LGTM 👍" fără să-l citească nimeni. Dacă e mare, sparge-l.
- **Self-review întâi.** Citește-ți propriul diff în Bitbucket înainte să ceri altcuiva. Prinzi jumătate din observații singur.
- **Reviewers potriviți** — cine cunoaște zona. Pentru module sensibile (vezi mai jos), reviewer-ul e obligatoriu, nu opțional.

### Șablon de descriere PR

```markdown
## Ce
Prorează accrual-ul lunar pentru angajații intrați la mijlocul lunii.

## De ce
Bug raportat de HR: angajat intrat pe 20 primea 1.75 zile în loc de ~0.58.
Refs: TIMEOFF-142

## Cum verific
1. Creează un angajat cu data de start 2026-06-20
2. Rulează jobul de accrual pentru iunie
3. RemainingDays trebuie să fie proratat, nu luna întreagă

## Atenție la
Calculul din `AccrualService.ComputeMonthly` — logică de business, review uman obligatoriu.
```

### Merge din PR

- **Squash and merge** pentru feature branches cu istoric zgomotos (multe „wip", „fix typo") — istoricul pe `main` rămâne o linie curată, un commit per feature.
- **Merge commit** când vrei să păstrezi structura branch-ului (rar necesar la noi).
- După merge, **șterge branch-ul** de pe Bitbucket (e un checkbox în UI). Nu lăsa cimitire de branch-uri.

---

## 6. Merge vs. Rebase (cearta clasică, rezolvată simplu)

Amândouă aduc modificările din `main` în branch-ul tău. Diferența e ce fac cu istoricul.

- **`merge`** — creează un „merge commit" care leagă cele două linii. Istoric fidel, dar cu multe furci.
- **`rebase`** — mută commit-urile tale ca și cum ai fi pornit chiar acum din vârful lui `main`. Istoric liniar, curat.

Regula noastră:

> **Rebase pe branch-ul tău local, cât timp e doar al tău. Nu rebase pe nimic pe care l-ai împărțit cu alții.**

```bash
# Îți sincronizezi branch-ul propriu cu main — OK
git fetch origin
git rebase origin/main
```

**Interzis:** `git rebase` sau `git push --force` pe `main`/`develop`/`master` sau pe orice branch pe care lucrează și altcineva. Rescrii istoria de sub picioarele lor.

Dacă chiar trebuie să forțezi un push pe branch-ul TĂU după un rebase, folosește varianta sigură:

```bash
git push --force-with-lease      # eșuează dacă altcineva a împins între timp
```

Niciodată `--force` simplu pe ceva partajat.

---

## 7. Ce NU comiți NICIODATĂ

Critic pentru o echipă care lucrează cu baze de date:

- **Connection string-uri** (`Server=...;Password=...`). Merg în config local / secret manager, nu în repo.
- **Parole, API keys, token-uri, certificate.**
- **Dump-uri de date reale** — mai ales cu date de clienți / pacienți (GDPR).
- **Fișiere generate** — `bin/`, `obj/`, `node_modules/`, `.vs/`, build output.
- **Fișiere personale de IDE / OS** — `.idea/`, `*.user`, `Thumbs.db`.

Toate astea stau în **`.gitignore`**, comis în repo de la început:

```gitignore
# Build
bin/
obj/
node_modules/

# Secrete / config local
appsettings.Development.json
*.local.json
.env

# IDE / OS
.vs/
.idea/
*.user
Thumbs.db
```

> Dacă ai comis deja un secret: **nu e destul să-l ștergi într-un commit nou** — rămâne în istoric. Trebuie rotit (schimbat) secretul + curățat istoricul (`git filter-repo` sau BFG). Mai bine să nu ajungi acolo.

---

## 8. Conflicte de merge (nu intra în panică)

Un conflict înseamnă că două branch-uri au schimbat aceleași linii. Git nu ghicește pe care o vrei — te întreabă pe tine.

```
<<<<<<< HEAD
codul tău
=======
codul de pe main
>>>>>>> origin/main
```

Pași:

1. Deschizi fișierul, ștergi marcajele `<<<<<<<`, `=======`, `>>>>>>>` și lași varianta corectă (uneori o combinație a amândurora).
2. `git add <fișier>` pentru fiecare rezolvat.
3. `git rebase --continue` (dacă erai în rebase) sau `git commit` (dacă erai în merge).

Dacă te-ai încurcat rău: `git rebase --abort` / `git merge --abort` te întorc la starea de dinainte. Nimic pierdut.

**Preventiv:** branch-uri scurte + sincronizare deasă cu `main` = conflicte mici și rare.

---

## 9. Trusa de urgență (recovery)

Git aproape nu pierde nimic. Aproape orice greșeală e reversibilă.

| Situație | Comandă |
|----------|---------|
| Am modificat un fișier, vreau înapoi | `git restore <fișier>` |
| Am făcut `add` din greșeală | `git restore --staged <fișier>` |
| Vreau să anulez ultimul commit, dar păstrez modificările | `git reset --soft HEAD~1` |
| Trebuie să întrerup ce fac și să sar pe alt branch | `git stash` → ... → `git stash pop` |
| Am șters un commit / branch și îl vreau înapoi | `git reflog` (găsești hash-ul) → `git checkout <hash>` |
| Vreau să anulez un commit DEJA împins (fără să rescriu istoria) | `git revert <hash>` |

**`reset` vs. `revert`:**
- `reset` rescrie istoria — bun **local**, interzis pe ce ai împins deja pe un branch partajat.
- `revert` creează un commit nou care anulează efectul unuia vechi — sigur pe branch-uri partajate.

`git reflog` e plasa de siguranță: ține evidența oricărei mișcări de `HEAD` din ultimele ~90 de zile. Chiar dacă crezi că ai pierdut ceva, e probabil acolo.

---

## 10. Reguli de aur (rezumatul de pus pe perete)

1. **`main` doar prin PR.** Niciun commit direct pe branch-ul principal.
2. **Branch-uri scurte, o intenție per branch.**
3. **Commit-uri atomice**, mesaj în format `tip: descriere`.
4. **Pull / rebase des** ca să eviți conflicte mari.
5. **PR-uri mici**, cu descriere care spune ce / de ce / cum verifici.
6. **Self-review înainte de a cere review.**
7. **Nici un secret în repo.** `.gitignore` de la prima zi.
8. **`--force-with-lease`, niciodată `--force`** pe ce e partajat.
9. **`revert` pe partajat, `reset` doar local.**
10. **Când te-ai încurcat: `git reflog`.** Nu ai pierdut nimic încă.

---

## Module cu review uman obligatoriu

Pentru repo-urile noastre, modificările în zonele astea NU merg pe „aprob rapid" — se discută în PR:

- **TimeOff:** calcul `RemainingDays`, politici de accrual, verificări de rol.
- **Filnet OCR:** pipeline-ul de extracție pe documente fiscale.
- **Iris / Atlas:** stored procs în producție.

---

*Terminologia Git rămâne în engleză (așa apare în comenzi și în Bitbucket); explicațiile sunt în română. Git se învață făcând — greșește pe un repo de test, nu pe cel de producție.*
