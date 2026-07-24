# Demo S4 (Subagents) pe repo-ul LMS — cheat-sheet facilitator

*Repo de demo: `C:\Learning\S1` (backend .NET 10 + frontend Vue 3). Verificat pe 2026-07-22. Citește-l înainte de curs.*

---

## ⚠️ Atenție: repo-ul e walking skeleton

Repo-ul LMS de demo e o **singură felie de infrastructură**, nu un LMS matur. Concret, tot backend-ul e:
- `HealthController` cu 4 endpoint-uri de diagnostic (vezi mai jos);
- un `LmsDbContext` cu o **singură** entitate, `ConnectionTest`;
- o migrare SQL scrisă de mână (`backend/Migrations/001_CreateConnectionTest.sql`).

**Nu există** `Course`/`User`/`Session`, niciun controller de business, nicio autentificare reală, niciun CORS.

**Consecință directă:** orice prompt care cere feature-uri inexistente — *„unde e ruta de login?"*, *„mapează modulul de cursuri/utilizatori"* — întoarce onest „nu găsesc nimic". Materialele S4 (ghid, prezentare, pagină) au fost **deja aliniate** la realitatea de mai jos; acest cheat-sheet rămâne referința detaliată (tabelul de endpoint-uri + momentele de aur) pentru demo-ul live.

> De ce nu „reparăm" repo-ul adăugând un modul de login? Pentru că modelul cursului e „structura apare slice cu slice" (vezi `CLAUDE.md`-ul lui). Demonstrăm pe realitate, nu pe un decor.

---

## Ground truth — ce va găsi `Explore` (ca să nu fii surprins live)

### Backend (`backend/LearningPlatform.Api/`)
Un singur controller — `Controllers/HealthController.cs`, rută `/Health`:

| Verb + rută | Ce întoarce |
|---|---|
| `GET /Health` | `{ status = "ok" }` — health static |
| `GET /Health/db` | testează conexiunea EF → `200 {status="ok"}` sau `503 {status="unreachable"}` |
| `GET /Health/db/rows` | ultimele 50 `ConnectionTest` (desc după Id) → `{ count, rows }` |
| `POST /Health/db/rows` | inserează un `ConnectionTest` prin EF → entitatea cu `Id`+`CreatedAt` |

- **`Program.cs`:** `AddControllers` + `AddOpenApi` + `AddDbContext<LmsDbContext>` (SqlServer, connection string `"Lms"` din **user-secrets**, nu în repo). Pipeline: `MapOpenApi` (doar Development) → `UseHttpsRedirection` → `UseAuthorization` (gol) → `MapControllers`.
- **Date:** `Data/LmsDbContext.cs` (baza `LMS_Ionut`), entitatea `Models/ConnectionTest.cs` (`Id`, `Note`, `CreatedAt`). Migrări = SQL manual, nu EF migrations.

### Frontend (`frontend/src/`)
`App.vue` + `main.ts` + componente shadcn-vue în `components/ui/` (badge, button, card). Fără router, fără pagină de login, fără modul de cursuri.

---

## 🥇 Două momente de aur (le-a prins repetiția — folosește-le)

1. **Discrepanță cod ↔ documentație.** `CLAUDE.md` afirmă „configul de CORS e în `backend/Program.cs`", dar în `Program.cs` **nu există niciun `AddCors`/`UseCors`**. Un subagent de cercetare read-only prinde exact genul ăsta de „docul zice X, codul zice Y" — argument perfect pentru *de ce* merită research izolat. (Punctează: subagentul citește codul, nu are încredere oarbă în `CLAUDE.md`.)
2. **Securitate care leagă S1 + S9.** Connection string-ul NU e în repo — stă în user-secrets, baza e per-student (`LMS_Ionut`). Exemplu curat de „secretele nu se comit", fără să predici.

---

## Prompturile de demo, pe segmente

### Segment 1–2 — delegare automată la `Explore` built-in (context curat)
Tastează, live:
> „Mapează cum e structurat backend-ul .NET în acest moment: ce controllere, ce endpoint-uri, cum se leagă de DbContext și de migrări."

**Ce arăți:** în `/tasks` apare `Explore` (read-only) rulând într-o fereastră separată; în conversația principală intră **doar harta** (tabelul de mai sus), nu conținutul celor ~4 fișiere `.cs`. Apoi `/context` → rămâne curat.

Alt prompt sigur, mai mic: *„Unde e definit endpoint-ul `/health` și ce întoarce?"*

### Segment 3 — compromisul izolării (eșec intenționat → corect)
1. Stabilește în conversație o convenție: *„În LMS tratăm toate datele ca UTC."*
2. Deleagă **fără** s-o repeți: *„Fă un subagent care verifică dacă tratăm datele consecvent."* → pornește gol, n-a văzut convenția.
3. Repetă cu convenția **inclusă** în prompt. Compară.

### Segment 4 + 6 — construiește `codebase-explorer` + dovada
Prompt de build (live):
> „Dau des sarcina asta: «mapează cum e structurat un feature/layer în LMS». Fă-mi un subagent în `.claude/agents/`. `description` bun pentru delegare, unelte read-only (`Read, Grep, Glob`), `model: haiku`. În corp, spune-i să întoarcă un rezumat (fișiere-cheie + flux), nu dump-uri. Arată-mi fișierul înainte să-l scrii."

Fișierul de referință așteptat e în `demo-S4-codebase-explorer.md` (alături de acest doc). Citește-l cu grupul **înainte** de accept (regula S1/S2/S3).

**Dovada (segment 6):** cere-i ceva ce-l cheamă (*„mapează stratul de date"*), lasă-l să scaneze, apoi `/context` → doar rezumatul a intrat. Dacă întoarce dump → strânge corpul.

### Segment 5 — paralelism (extensie)
> „Mapează în paralel, cu subagenți separați: (1) stratul de API — controllere + Program.cs; (2) stratul de frontend — componente shadcn + App.vue."

Arată cei doi subagenți în `/tasks` + sinteza. Menționează `SubagentStop` fără să-l implementezi (fitil S5).

---

## Checklist de dimineață (5 min)
- [ ] `cd C:\Learning\S1` și `git status` curat (sau știi ce ai necomis).
- [ ] `/help` — confirmă câmpurile de frontmatter curente.
- [ ] Rulează o dată promptul din Segment 1 ca să vezi că `Explore` chiar întoarce harta.
- [ ] Decizi: lași `codebase-explorer.md` deja în repo (referință) sau îl construiești live de la zero? (Vezi nota de sub fișierul de referință.)
