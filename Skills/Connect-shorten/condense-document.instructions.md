# Document Condensing Instructions

Follow these instructions when condensing a Word document to a target character count.

---

## Reading .docx Files

Use **Word COM automation** via PowerShell to read the source document. This handles both modern `.docx` (OOXML) and legacy `.doc` (OLE2) formats regardless of file extension.

### Steps

1. **Copy the file** to `$env:TEMP` before opening — this avoids locking issues with OneDrive-synced files.
2. **Open via Word COM:**

```powershell
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("$env:TEMP\source-copy.docx")
```

3. **Extract paragraph-level structure.** For every paragraph, capture:
   - **Style name** (`$p.Style.NameLocal`) — e.g., `Heading 1`, `Heading 2`, `Heading 3`, `Normal`
   - **Bold status** (`$p.Range.Font.Bold`) — a value of `9999999` means the entire paragraph is bold
   - **Text content** (`$p.Range.Text`)

4. **Record the baseline character count** using `$doc.Content.Text.Length`. This counts all visible characters including spaces and paragraph marks, which aligns with most users' character-counting methods.

5. **Close and release:**

```powershell
$doc.Close($false)
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
```

> **Tip:** Always kill lingering `WINWORD` processes between COM sessions to avoid `RPC_E_CALL_REJECTED` errors.

---

## Condensing Strategies

Apply these strategies in order of priority. The goal is to reduce character count while preserving every fact, metric, name, and outcome.

### 1. Eliminate Redundancy

Look for information that appears in more than one place. Say it once, in the strongest location.

- Example: If a heading already says "BlobFuse 2," the paragraph below does not need to restate "BlobFuse 2 content."
- Example: If the impact is stated in one paragraph, a later paragraph should not re-describe the same impact in different words.

### 2. Remove Filler Words and Qualifiers

Cut adverbs and qualifiers that add length but not meaning:

| Before | After |
|--------|-------|
| "systematically reviewed" | "reviewed" |
| "definitively determined" | "determined" |
| "thoroughly reviewed and edited" | "reviewed and edited" |
| "routinely unblocked … the same day" | "routinely unblocked … same-day" |
| "a complete, prioritized action list" | "a prioritized action list" |

### 3. Tighten Sentence Structure

Restructure verbose constructions into shorter equivalents:

| Before | After |
|--------|-------|
| "Progressed toward a new operating model for how content teams' partner with support by setting up a meeting series" | "Set up a meeting series to develop a content-support collaboration model" |
| "To inform the overhaul, I systematically reviewed X, Y, and Z, and then built a complete, prioritized action list from real customer signals." | "Built a prioritized action list from real signals: X, Y, and Z." |

### 4. Shorten Headings

Remove generic phrasing from headings while keeping the specific differentiator:

| Before | After |
|--------|-------|
| "Overhauled the AzCopy content collection - the highest-traffic tooling content in Azure Storage" | "Overhauled AzCopy content — highest-traffic tooling in Azure Storage" |
| "Established content representation in cross-team forums and drove cross-functional alignment" | "Established content representation in cross-team forums" |

### 5. Compress Low-Impact Sections

Sections that describe smaller contributions can often be reduced to a single sentence without information loss. Look for paragraphs that narrate a process step-by-step when a result-oriented summary would suffice.

### What to Never Cut

- **Metrics and data points** (percentages, counts, before/after comparisons)
- **Names of people, teams, and tools** involved in the work
- **Specific outcomes and deliverables**
- **Distinct accomplishments** — every separate achievement must survive even if shortened

---

## Writing .docx Files

Use **Word COM automation** via PowerShell to create the output document.

### Steps

1. **Create a new document:**

```powershell
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection
```

2. **Write each paragraph** using the Selection object, applying the original style and bold formatting:

```powershell
$sel.Style = "Heading 1"          # or "Heading 2", "Heading 3", "Normal"
$sel.Font.Bold = 0                # 0 = not bold, 1 = bold
$sel.TypeText("Paragraph text")
$sel.TypeParagraph()
```

3. **Remove the trailing empty paragraph** that Word adds automatically:

```powershell
$lastPara = $doc.Paragraphs.Item($doc.Paragraphs.Count)
if ($lastPara.Range.Text.Trim().Length -eq 0) {
    $lastPara.Range.Delete() | Out-Null
}
```

4. **Save as `.docx`** (format code `12` = `wdFormatXMLDocument`):

```powershell
$doc.SaveAs($outFile, 12)
```

5. **Close and release** the COM objects as described in the reading section.

---

## Verifying Character Count

After writing the output document, re-open it and check `$doc.Content.Text.Length`. This value must be **at or below** the target.

If the count exceeds the target:
1. Identify the longest paragraphs and apply additional condensing.
2. Rebuild and re-verify.
3. Repeat until the count is within the limit.

Also report `$doc.ComputeStatistics(3)` (Word's "Characters with spaces" metric) as a secondary reference, since some users may rely on Word's built-in word-count dialog.
