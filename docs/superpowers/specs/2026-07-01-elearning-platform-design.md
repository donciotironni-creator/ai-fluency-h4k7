# Platformă e-learning AI Fluency — design

**Data:** 2026-07-01
**Status:** aprobat

## Context

Repo-ul conține două materiale existente:
- `suport-curs-sesiunea-1.md` — ghid de facilitare pentru Sesiunea 1 a cursului intern "AI Fluency" (echipa SQL → AI-assisted dev, SSP). Conține conținut pentru participanți (tutorial, exerciții, anexe) și o secțiune privată "Note de facilitare — doar pentru Ionut".
- `ai-fluency-trainer-kit.html` — pagină statică single-file, ghid pentru Ionut ca *viitor trainer de AI Fluency* (framework 4D, cele 5 faze de dezvoltare ca trainer, roadmap tehnic pe 10 săptămâni). Public diferit de cursanții din sesiuni — nu face parte din platforma de curs.

Scopul acestui proiect: o platformă de e-learning tip **vitrină de conținut** (fără conturi, fără tracking de progres) pentru participanții la curs, care afișează sesiunile într-un format navigabil, reutilizând limbajul vizual din `ai-fluency-trainer-kit.html`.

## Plan de curriculum (aprobat)

4 sesiuni, consolidând roadmap-ul din `suport-curs-sesiunea-1.md` (Skills→MCP→Agents→Plugins pe S2-S5) și tabelul de mapping 4D din `ai-fluency-trainer-kit.html`:

| Sesiune | Temă | Competența 4D dominantă | Note |
|---|---|---|---|
| **S1** | Fundamentele ecosistemului Claude Code: bucla 4D + **Skills + MCP + Plugins** | Description + Delegation (platform) | Conținut deja scris în `suport-curs-sesiunea-1.md`; MCP și Plugins de extins de la "hartă de 10 min" la exerciții aplicate. Agents doar menționat, nu exersat. |
| **S2** | Agenți & subagenți | Delegation (task) + Discernment | Agent de code-review pe standardele echipei, subagent de documentare, fluxuri multi-pas. Conținut de scris. |
| **S3** | Evaluare output, cost/latență & când NU folosești AI | Discernment (product) + Delegation (goal awareness) | Seturi de teste, "vânătoarea de halucinații", alegerea modelului potrivit. Conținut de scris. |
| **S4** | Securitate, confidențialitate, GDPR aprofundat + Playbook de echipă | Diligence (creation + deployment) | Threat-model, consolidare, echipa scrie propriul playbook. Conținut de scris. |

Roadmap-ul mai larg 1-10 din `ai-fluency-trainer-kit.html` rămâne referință pe termen lung — nu se implementează acum.

## Arhitectură platformă

Site static, fără build, fără server, fără dependențe externe noi (păstrează convenția din `ai-fluency-trainer-kit.html`: doar Google Fonts). Se deschide direct în browser sau se servește ca fișiere statice simple.

### Structură fișiere

```
index.html              # pagina principală: card per sesiune (titlu, temă 4D, status, link)
sesiune-1.html          # conținut participant-facing, extins din suport-curs-sesiunea-1.md
sesiune-2.html          # placeholder "Coming soon" — agenți & subagenți
sesiune-3.html          # placeholder "Coming soon" — evaluare, cost/latență
sesiune-4.html          # placeholder "Coming soon" — securitate/GDPR + playbook
assets/styles.css       # tokens + componente comune, extrase din <style> din ai-fluency-trainer-kit.html
```

`ai-fluency-trainer-kit.html` și `suport-curs-sesiunea-1.md` rămân neschimbate ca surse/materiale separate — nu sunt integrate direct în platformă. `ai-fluency-trainer-kit.html` se adresează unui public diferit (Ionut ca trainer, nu participanții).

### Reutilizare vizuală

Extrase în `assets/styles.css` din `ai-fluency-trainer-kit.html`:
- CSS custom properties pentru teme light/dark (`--paper`, `--ink`, `--rust`, `--teal`, `--gold`, etc.)
- Nav sticky cu toggle dark/light (`.topbar`, `button.toggle`)
- Componente: `.card`, `.note` (teal, pentru "de verificat"), `.warn` (gold, pentru avertismente date sensibile), `.check` (liste cu →), `.pill`
- Tabele stilizate (`th`/`td`) pentru mapping-uri competență/modalitate
- `<code>` inline

### Conținutul paginii de sesiune (participant-facing)

Doar conținut pentru cursanți: tutorial → exerciții aplicate → anexe (cheat card, ce NU trimiți către Claude). **Exclus explicit**: secțiunea "Note de facilitare — doar pentru Ionut" din `suport-curs-sesiunea-1.md` (timing, capcane, pairing) — rămâne doar în fișierul `.md` sursă, nu ajunge în HTML public.

### Index-ul principal

Card per sesiune: titlu, competența 4D dominantă, status (`Disponibil` / `Coming soon`), link. S2-S4 apar vizual dezactivate (Coming soon) până se scrie conținutul lor.

### Sursă conținut → HTML

Conținutul e convertit o singură dată din Markdown în HTML static (fără script de generare, fără framework). Editările viitoare de conținut se fac direct în fișierele HTML.

## Testare

Manuală, în browser, pentru fiecare pagină:
- navigare index → sesiune → înapoi la index
- toggle dark/light funcțional pe fiecare pagină
- verificare vizuală că nicio secțiune de "note de facilitare" nu apare în paginile publice
- responsive check (layout nu se rupe pe mobil, păstrând breakpoint-urile din CSS-ul original)

## Ce nu face acest proiect (scop exclus în mod explicit)

- Fără conturi, autentificare sau progres per utilizator
- Fără quiz-uri, certificate sau dashboard de trainer
- Fără build tool, framework JS, sau server backend
- Fără conținut scris pentru S2-S4 (doar structura/placeholder — conținutul e proiect separat, ulterior)
