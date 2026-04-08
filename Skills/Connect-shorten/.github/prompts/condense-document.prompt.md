---
mode: "agent"
description: "Condense a Word document to a target character count while preserving all important information and formatting."
inputs:
  - id: "sourceDocumentPath"
    description: "Full path to the source .docx document to condense."
  - id: "targetCharacterCount"
    description: "Maximum number of characters (including spaces) allowed in the output document."
  - id: "outputDocumentPath"
    description: "Full path where the condensed .docx document should be saved."
---

# Condense Document

You are condensing a Word document to meet a character limit while preserving all important information and the original formatting.

## Your Task

Reduce the character count of `{{sourceDocumentPath}}` to no more than **{{targetCharacterCount}}** characters (including spaces) and save the result to `{{outputDocumentPath}}`.

### 1. Read the Source Document

Follow the reading process in #file:instructions/condense-document.instructions.md.

- Copy the file to a temp location to avoid OneDrive locking issues.
- Open via Word COM automation in PowerShell.
- Extract every paragraph with its **style** (Heading 1/2/3, Normal, etc.), **bold status**, and **text content**.
- Record the current character count using `Content.Text.Length`.

### 2. Condense the Content

Follow the condensing strategies in #file:instructions/condense-document.instructions.md.

Apply these in order:
1. **Eliminate redundancy** — don't say the same thing twice across paragraphs.
2. **Remove filler** — cut adverbs and qualifiers that add length but not meaning.
3. **Tighten sentences** — restructure verbose constructions into shorter equivalents.
4. **Shorten headings** — keep the specific differentiator, drop generic phrasing.
5. **Compress low-impact sections** — summarize process narratives as result-oriented statements.

**Never cut:** metrics, data points, names, specific outcomes, or distinct accomplishments.

### 3. Write the Output Document

Follow the writing process in #file:instructions/condense-document.instructions.md.

- Create the output directory if it does not exist.
- Rebuild the document with the same heading hierarchy and bold formatting as the original.
- Save as `.docx` format.

### 4. Verify

Re-open the saved document and check `Content.Text.Length`. If the count exceeds **{{targetCharacterCount}}**, apply additional cuts and repeat until the document is within the limit.

Report both:
- `Content.Text.Length` (primary — includes paragraph marks)
- `ComputeStatistics(3)` (secondary — Word's "Characters with spaces" metric)
