// Extension: customer-questions
// Builds a spreadsheet of customer questions for an Azure service from multiple data sources.
// Uses onSessionStart to inject methodology context, and a custom tool for reliable CSV assembly.

import { joinSession } from "@github/copilot-sdk/extension";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// In-memory question store for the current session
let questions = [];
let csvPath = "";
let targetProduct = "";

function escapeCSV(field) {
    const s = String(field);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

function isDuplicate(newQuestion) {
    const norm = newQuestion.toLowerCase().replace(/[?.,!'"]/g, "").trim();
    return questions.some((q) => {
        const existing = q.question.toLowerCase().replace(/[?.,!'"]/g, "").trim();
        // Exact or near-exact match
        if (existing === norm) return true;
        // One contains the other (catches minor rephrasing)
        if (existing.includes(norm) || norm.includes(existing)) return true;
        return false;
    });
}

function writeCSV() {
    const header = "Question,Source,Type,Confidence,Notes";
    const rows = questions.map(
        (q) =>
            [q.question, q.source, q.type, q.confidence, q.notes]
                .map(escapeCSV)
                .join(",")
    );
    writeFileSync(csvPath, [header, ...rows].join("\n") + "\n", "utf-8");
}

const session = await joinSession({
    tools: [
        {
            name: "customer-questions_add_questions",
            description:
                "Add one or more customer questions to the CSV. Each question object must have: question (string), source (string), type (string), confidence (string), notes (string). Duplicates are automatically skipped. Returns a summary of what was added.",
            parameters: {
                type: "object",
                properties: {
                    product: {
                        type: "string",
                        description:
                            "The Azure product/service name. Required on first call to set up the CSV file.",
                    },
                    items: {
                        type: "array",
                        description: "Array of question objects to add.",
                        items: {
                            type: "object",
                            properties: {
                                question: {
                                    type: "string",
                                    description: "The customer question text.",
                                },
                                source: {
                                    type: "string",
                                    description:
                                        'Source category: "AI system", "Community", or "Content dev".',
                                },
                                type: {
                                    type: "string",
                                    description:
                                        'Question type: Conceptual, Procedural, Troubleshooting, Decision-making, Fact-finding, or Coding.',
                                },
                                confidence: {
                                    type: "string",
                                    description:
                                        'Confidence level, usually "High" or "Low".',
                                },
                                notes: {
                                    type: "string",
                                    description:
                                        "Notes about the data source (e.g., Microsoft Q&A, Stack Overflow, Reddit).",
                                },
                            },
                            required: [
                                "question",
                                "source",
                                "type",
                                "confidence",
                                "notes",
                            ],
                        },
                    },
                },
                required: ["items"],
            },
            skipPermission: true,
            handler: async (args) => {
                // Initialize CSV path on first call with product name
                if (args.product && !targetProduct) {
                    targetProduct = args.product;
                    const safeName = targetProduct
                        .replace(/[^a-zA-Z0-9 ]/g, "")
                        .replace(/\s+/g, "-");
                    csvPath = join(
                        homedir(),
                        `Customer-Questions-${safeName}.csv`
                    );
                }
                if (!csvPath) {
                    return "Error: Call with 'product' parameter first to initialize the CSV file.";
                }

                let added = 0;
                let skipped = 0;
                const skippedQuestions = [];

                for (const item of args.items) {
                    if (isDuplicate(item.question)) {
                        skipped++;
                        skippedQuestions.push(
                            item.question.substring(0, 60) + "..."
                        );
                        continue;
                    }
                    questions.push({
                        question: item.question,
                        source: item.source,
                        type: item.type,
                        confidence: item.confidence,
                        notes: item.notes,
                    });
                    added++;
                }

                writeCSV();

                let result = `Added ${added} question(s), skipped ${skipped} duplicate(s). Total: ${questions.length} questions in ${csvPath}`;
                if (skippedQuestions.length > 0) {
                    result += `\nSkipped: ${skippedQuestions.join("; ")}`;
                }
                return result;
            },
        },
        {
            name: "customer-questions_get_status",
            description:
                "Get the current status of the customer questions CSV: total count, breakdown by source and type, and the file path.",
            parameters: { type: "object", properties: {} },
            skipPermission: true,
            handler: async () => {
                if (!csvPath) {
                    return "No CSV initialized yet. Use add_questions with a product name first.";
                }
                const bySource = {};
                const byType = {};
                for (const q of questions) {
                    bySource[q.notes] = (bySource[q.notes] || 0) + 1;
                    byType[q.type] = (byType[q.type] || 0) + 1;
                }
                return JSON.stringify(
                    {
                        product: targetProduct,
                        totalQuestions: questions.length,
                        csvPath,
                        bySource,
                        byType,
                    },
                    null,
                    2
                );
            },
        },
    ],

    hooks: {
    onSessionStart: (input) => {
        const shouldAutoPrompt =
            input.source === "new" && !input.initialPrompt;

        if (shouldAutoPrompt) {
            setTimeout(() => {
                session.send({
                    prompt: "Hello! I'm ready to build a customer questions spreadsheet. What Azure product or service should I research? (e.g., Azure Files, Azure Kubernetes Service, Azure Cosmos DB)"
                });
            }, 0);
        }

        return {
            additionalContext: `You are a customer-questions research agent. Your job is to build a comprehensive CSV of realistic customer questions for an Azure product or service.

## Output format
CSV with columns: Question, Source, Type, Confidence, Notes.
Use the "customer-questions_add_questions" tool to add questions — it handles dedup and CSV writing.
Use "customer-questions_get_status" to check progress.

## Question types
- Conceptual: "What is...?", "How does...work?"
- Procedural: "How do I...?", "What are the prerequisites for...?"
- Troubleshooting: "Why is...happening?", "How do I fix...?"
- Decision-making: "When should I use...vs...?"
- Fact-finding: "What is the limit for...?", "What regions support...?"
- Coding: "How do I write a script that...?", "What SDK method do I use to...?"

## Quality criteria
- Questions should be 8-18 words, include product/feature name
- Use natural customer language (contractions, varied punctuation)
- Verbatim community questions should be used as-is when possible
- Cover a range of question types — don't cluster on one type
- No duplicates across sources

## Data sources (search in this order)
1. **Microsoft Q&A** — Search web for recent questions tagged with the product. Source: "Community", Confidence: "High", Notes: "Microsoft Q&A"
2. **Stack Overflow** — Search for tagged questions. Source: "Community", Confidence: "High", Notes: "Stack Overflow"
3. **Reddit** — Search r/AZURE and relevant subreddits. Source: "Community", Confidence: "High", Notes: "Reddit"
4. **Alchemy portal** (optional, best-effort) — Navigate to https://alchemyportal.azurewebsites.net, find the workload for the product, read the Bucket List. Source: "Community", Confidence: "High", Notes: "Alchemy portal". If auth fails or workload not found, skip gracefully.
5. **Emails/Teams** (optional) — Ask user if they want to search their emails/Teams via Work IQ. Source: "Content dev", Confidence: "Low", Notes: leave empty.

## Workflow
1. Ask the user what Azure product/service to research (if not already specified).
2. Set up the CSV by calling add_questions with the product name.
3. Search each data source systematically.
4. After each source, call add_questions with the batch of questions found.
5. After all sources, call get_status and present a summary to the user.
6. Ask if they want to add more questions or search additional sources.`,
        };
    },
    },
});
