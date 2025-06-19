## 🐞 Bug: Initial AI analysis not triggered when opening a document

### Root-cause summary
The editor **does not run the first grammar/style analysis** when an existing document is opened.  
Investigation shows that `RichTextEditor.tsx` initialises
`lastGeneratedContent.current` with the document's current plain-text right after loading the content:
```60:105:components/Editor/RichTextEditor.tsx
lastGeneratedContent.current = plainText
```
Because the idle callback later compares the live text against this value, the very first comparison evaluates to _equal_ ⇒ the `generateSuggestions()` routine is skipped. The AI suggestions therefore only start appearing **after the user edits the document**.

### Fix overview
We need to guarantee that **at least one analysis runs after load** when the document already contains >10 characters.

---

## ✅ Phase-by-Phase Bug-fix Plan

### Phase 1 – Diagnostics ✔️
- [ ] Reproduce: open a non-empty document → observe that no suggestions are generated until typing begins.
- [ ] Add console logs (already present) to verify that in `loadDocument()` the plain-text equals `lastGeneratedContent.current`, causing the early return in the idle callback.

### Phase 2 – Code Changes
- [ ] **Option A (simplest)** – reset the tracker
  1. In `loadDocument()` **remove** or **replace** the assignment `lastGeneratedContent.current = plainText` with an empty string.
  2. This will make the first idle cycle consider the text "new", triggering `generateSuggestions()` automatically.
- [ ] **Option B (explicit trigger)** – fire analysis immediately
  1. Keep the tracker logic intact.
  2. Call `await generateSuggestions(docId, plainText)` right after setting the editor content.
  3. Handle loading state and error just like in the idle callback.
- [ ] Whichever option is chosen, update the comparison guard so very short documents (<10 chars) still skip analysis.
- [ ] Add a unit/integration test ensuring `generateSuggestions` is called on initial load when content length >10.

### Phase 3 – Verification
- [ ] Run `npm run dev` → open several documents with existing content → confirm robot icon appears & suggestions list populates within 2 s without typing.
- [ ] Run `npm run test` to ensure no regressions.

### Phase 4 – Deployment
- [ ] Commit the fix: `git add . && git commit -m "fix: run initial AI analysis on editor load"`
- [ ] Push to trigger Vercel redeploy.

---

### Related files
- `components/Editor/RichTextEditor.tsx` – user-input tracking & idle analysis
- `lib/useIdleCallback.ts` – generic idle-detection helper
- `actions/documents.ts` – `generateSuggestions()` server action

Once these steps are completed, the editor will immediately analyse existing documents and surface grammar/style suggestions without requiring the user to type first. 