# Condense Document Skill

A Copilot skill that condenses a Word document to a target character count while preserving all important information and the original formatting (headings, bold text, paragraph structure).

## Why This Exists

Performance reviews, executive summaries, and many other business documents have strict character or word limits. Manually trimming a document is tedious and risks losing important details. This skill automates the process: you provide a document and a target character count, and the agent produces a shorter version that retains every metric, name, outcome, and accomplishment from the original.

## Prerequisites

- **GitHub Copilot** (VS Code extension or Copilot CLI) with agent mode enabled.
- **Microsoft Word** installed on your machine — the skill uses Word COM automation to read and write `.docx` files.
- **Windows OS** — Word COM automation requires a Windows environment.

## Quick Start

### Copilot CLI

1. Open a terminal and `cd` into this repository folder.
2. Start a Copilot CLI session.
3. Type:

   ```
   Condense my document
   ```

4. When prompted, provide:
   - The **source document path** (the `.docx` file to condense)
   - The **target character count** (maximum characters including spaces)
   - The **output document path** (where to save the condensed version)

### VS Code

1. Open this repository folder in VS Code.
2. Open the **Copilot Chat** panel.
3. Type `/` and select **condense-document** from the prompt list.
4. Fill in the three inputs when prompted.

## Inputs

| Variable               | Required | Description                                              |
|------------------------|----------|----------------------------------------------------------|
| `sourceDocumentPath`   | Yes      | Full path to the `.docx` file to condense                |
| `targetCharacterCount` | Yes      | Maximum characters (including spaces) in the output      |
| `outputDocumentPath`   | Yes      | Full path where the condensed `.docx` should be saved    |

## What the Skill Does

The skill follows a four-step workflow:

### 1. Read

Opens the source document via Word COM automation in PowerShell. Extracts every paragraph along with its style (Heading 1, 2, 3, Normal), bold formatting, and text content. Records the baseline character count.

> The skill copies the file to a temp location first to avoid locking issues with OneDrive-synced files.

### 2. Condense

Applies five strategies in order of priority to reduce character count:

| Strategy | What it does |
|---|---|
| **Eliminate redundancy** | Removes information that appears in more than one place |
| **Remove filler** | Cuts adverbs and qualifiers that add length but not meaning |
| **Tighten sentences** | Restructures verbose constructions into shorter equivalents |
| **Shorten headings** | Keeps the specific differentiator, drops generic phrasing |
| **Compress low-impact sections** | Summarizes step-by-step process narratives as result-oriented statements |

**Safeguards — the skill will never cut:**
- Metrics and data points (percentages, counts, before/after comparisons)
- Names of people, teams, and tools
- Specific outcomes and deliverables
- Distinct accomplishments (every separate achievement survives, even if shortened)

### 3. Write

Rebuilds the document from scratch using Word COM automation, applying the same heading hierarchy and bold formatting as the original. Saves as `.docx` format to the specified output path. Creates the output directory if it does not exist.

### 4. Verify

Re-opens the saved document and checks the character count. If the count exceeds the target, the skill applies additional cuts and repeats until the document is within the limit. Reports two character-count metrics for transparency:

- **`Content.Text.Length`** — includes paragraph marks; aligns with most copy-paste character counting methods
- **`ComputeStatistics` (Characters with spaces)** — matches Word's built-in Word Count dialog

## File Structure

```
.github/prompts/
  condense-document.prompt.md          ← Skill entry point (prompt file)

instructions/
  condense-document.instructions.md    ← Detailed workflow and condensing strategies
```

## Example

**Before:** An 8,489-character performance review document with three major sections, multiple headings, and mixed bold/normal formatting.

**After:** A 5,493-character document with the same structure, headings, and bold formatting — every metric, name, and accomplishment preserved. That is a 35% reduction achieved by tightening phrasing, eliminating redundancy, and removing filler words.

## Tips

- **Character counting varies.** If your character count doesn't match what the skill reports, you may be using a different counting method. The skill reports two metrics so you can pick the one that matches your tool.
- **Works with `.doc` files too.** Some files saved as `.docx` are actually in the older OLE2 (`.doc`) binary format. The skill handles both formats transparently via Word COM.
- **OneDrive files are supported.** The skill copies the source file to a temp directory before opening it, so OneDrive-synced files work without issues.
- **Run it iteratively.** If the first pass doesn't quite hit your target, you can run the skill again on the output to squeeze out a few more characters.
