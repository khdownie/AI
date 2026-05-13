---
name: monthly-content-email
description: Create a monthly content update stakeholder email in Outlook Classic for any Azure product/service. Use when a content developer says "monthly email", "content update email", "stakeholder report", or "monthly report". Gathers highlights from ADO and GitHub, PM dependencies, top-viewed articles from Power BI, and customer feedback verbatims, then composes a formatted Outlook draft.
allowed-tools: Bash(powershell:*), Bash(playwright-cli:*), Read, Edit, Grep, Glob
---

# Monthly Content Update Email

Creates a monthly stakeholder email for any Azure product/service content team. Gathers data from multiple sources and composes a formatted draft in Outlook Classic.

## When to Use

- User asks to create a monthly content update email for an Azure product
- User asks to draft a stakeholder report for their content area
- User says "monthly email" or "content update" for any Azure service

## Prerequisites

Before running this skill, confirm with the user:
1. **Product/service name** — e.g., "Azure Files", "Azure Cosmos DB", "Azure App Service"
2. **Distribution lists (To)** — The stakeholder DLs or individuals for the To line (varies per team)
3. **CC list** — Additional recipients on CC (typically the content dev's manager, PM contacts, etc.)
4. **ADO org and project** — Where their work items live
5. **ADO identity** — Their display name + email for querying assigned items
6. **Power BI report URL** — Their Content Engagement Report link (if different from default)
7. **Customer feedback filter** — The service slug used in the Learn Customer Feedback report
8. **Previous email subject** — To find the template email in Sent Items (for CID images)
9. **Writing team contacts** — Names and roles to list at the bottom

If the user has used this skill before, check the session store for prior parameters.

## Workflow

### Step 1: Gather Highlights (ADO + GitHub)

**ADO work items:**
- Query the user's ADO org/project for items assigned to them, closed in the past month
- Include title and link to published Learn article where possible

**GitHub contributions:**
- Search email for merged PR notifications from the past month
- Look for PRs in the relevant docs repos (azure-docs, azure-docs-pr, etc.)

**Rules:**
- Credit PMs who partnered on items
- Hyperlink highlight text to published articles where possible

### Step 2: Content Plans (Dependencies Only)

- Search ADO for items assigned to the user that are **dependencies filed by PMs**
- Do NOT include personal/self-created work items
- Include hyperlinks to ADO items

### Step 3: Top-Viewed Articles

- Navigate to the Content Engagement Report in Power BI
- Filter for the user's product/service content
- List the **top 15 article titles** (no page view counts)
- Include the standing disclaimer about data freshness

### Step 4: Customer Feedback Verbatims

- Navigate to: https://aka.ms/learncustomerfeedback
- Go to the **Docs Details** tab
- Filter for the product's service slug from the past month
- Extract verbatim text comments
- **Only include significant, constructive feedback** — skip empty, incomplete, or irrelevant entries
- Hyperlink article titles back to the Learn articles

## Email Formatting

```html
<!-- Title bar -->
<div style="background-color:#0078D4; padding:12px 20px;">
  <span style="font-family:'Segoe UI',sans-serif; font-size:20pt; font-weight:bold; color:white;">
    {Product Name} Content Update | YYYY-MM
  </span>
</div>

<!-- Section headers -->
<p style="font-family:'Segoe UI',sans-serif; font-size:18pt; font-weight:bold; color:#262626;">
  Section Title
</p>

<!-- Body text -->
<ul style="font-family:'Segoe UI',sans-serif; font-size:12pt; color:#262626;">
  <li>Item text with <a href="URL">hyperlink</a></li>
</ul>
```

**Formatting rules:**
- Font: Segoe UI throughout
- Title: 20pt bold white text on #0078D4 background
- Section headers: 18pt bold, #262626
- Body: 12pt, #262626
- No blank lines between section headers and first bullet
- Preserve embedded images from prior email via Forward method

## Outlook COM Automation

```powershell
$outlook = New-Object -ComObject Outlook.Application
$ns = $outlook.GetNamespace("MAPI")

# Find previous month's email to Forward (preserves CID-embedded images)
$sentFolder = $ns.GetDefaultFolder(5)  # Sent Items
$previousEmail = $sentFolder.Items | Where-Object {
    $_.Subject -like "*Content Update*" -and $_.Subject -like "*{Product}*"
} | Select-Object -First 1

if ($previousEmail) {
    $draft = $previousEmail.Forward()
} else {
    # No previous email found — create fresh
    $draft = $outlook.CreateItem(0)
}

$draft.To = "{user's To distribution lists — ask if not provided}"
$draft.CC = "{user's CC list — ask if not provided}"
$draft.Subject = "{Product Name} Content Update | YYYY-MM"
# Replace HTMLBody with new content
$draft.Save()
```

**Why Forward?** Carries over CID-embedded images (header banner, icons) without external hosting.

## Sections to Include

1. **Highlights this month** — Completed work with article links and PM credits
2. **Content plans** — PM dependencies with ADO links
3. **Top-viewed articles** — Top 15 titles from Power BI
4. **Customer feedback** — Constructive verbatims with hyperlinked article titles
5. **Writing team contacts** — Team member names and roles

## Quality Checklist

Before presenting the draft:
- [ ] No carriage return between section headers and first bullet
- [ ] Article titles hyperlinked where applicable
- [ ] Only PM dependencies in Content Plans
- [ ] Only constructive verbatims in Customer Feedback
- [ ] No page view numbers next to article titles
- [ ] Draft saved but NOT sent
- [ ] Remind user to review and edit before sending
