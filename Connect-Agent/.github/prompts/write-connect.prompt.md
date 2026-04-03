---
description: "Write a Connect performance review document. Gathers impact data from Teams chats, meeting transcripts, Office documents, and ADO work items, then produces a structured markdown document organized by impact category."
agent: agent
tools:
  - mcp_workiq_ask_work_iq
  - mcp_ado_wit_get_query_results_by_id
  - mcp_ado_wit_get_work_items_batch_by_ids
  - mcp_ado_wit_get_work_item
  - mcp_ado_search_workitem
  - read
---

Use the configuration and guidelines loaded from the instruction files below before proceeding.

[Connect Configuration](./../instructions/connect-config.instructions.md)
[Connect Writing Guidelines](./../instructions/connect-guidelines.instructions.md)

## Your Task

Write a Connect performance review document in markdown format. The document covers the connect period and uses the H1 heading specified in the configuration above.

## Step 1 — Gather data from Teams chats and meeting transcripts

1. Start the workiq MCP server by using the command `npx -y @microsoft/workiq@latest mcp`. 

2. After the server is started, use the `mcp_workiq_ask_work_iq` tool to search for relevant activity. Run each of the following queries separately to maximize recall:

3. Search for Teams chat messages where the user (identified by **Your name** or **Your alias** in the config) was a participant during the connect period. Ask for a summary of topics discussed, notable decisions, and any evidence of impact or collaboration.

4. Search for meeting transcripts that mention the user by name during the connect period. Ask for a summary of meetings attended, contributions made, and any outcomes or decisions attributed to them.

## Step 2 — Gather data from Office documents

Use the `mcp_workiq_ask_work_iq` tool to find Word documents, Excel workbooks, and PowerPoint presentations that were created or modified by the user during the connect period. For each document found, ask for a summary of its content and purpose as it relates to business impact.

Also read the example Connect document referenced in the configuration using the `read` tool. Use it as a reference for tone, structure, and the level of detail expected.

## Step 3 — Gather data from ADO

Use the ADO MCP tools to pull work item data from the two queries specified in the configuration:

1. Start the ADO MCP server. The ADO MCP server is not started via npx — it runs as a standalone executable. The command from mcp.json is: `mcp-server-azuredevops msft-skilling`.

2. **My work items query** — Run `mcp_ado_wit_get_query_results_by_id` with the URL from the config. These are user stories describing your completed work. Fetch full details for each item using `mcp_ado_wit_get_work_items_batch_by_ids`. For each item, capture the title, description, acceptance criteria, and any comments that describe outcomes or impact.

3. **Items I contributed to query** — Run `mcp_ado_wit_get_query_results_by_id` with the second URL from the config. These items are not assigned to the user but may contain contributions. Search within each item's description, acceptance criteria, and comments for the user's name. Include any items where there is clear evidence of contribution.

## Step 4 — Synthesize and write the document

Using all gathered data, write the Connect document following the guidelines:

- Use the H1 heading from the configuration
- Organize content under the three H2 category headings defined in the guidelines
- Apply the "big rocks" principle — focus on significant impact, not a comprehensive task list
- Describe how activities built on others' work or contributed to others' success wherever the data supports it
- Include measurable outcomes where available; use anecdotal evidence or implied value where measurements are not available
- Match the tone, structure, and level of detail shown in the example document

Output the complete document as markdown.
