import Anthropic from "@anthropic-ai/sdk";
import type { ParsedInvoice } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert invoice and receipt data extractor.
Extract all available fields from the document and return a single valid JSON object.
If a field is not present, use null. Never add commentary outside the JSON.`;

const USER_PROMPT = `Extract the invoice/receipt data from this document and return ONLY a JSON object with this exact shape:
{
  "vendorName": string | null,
  "invoiceNumber": string | null,
  "invoiceDate": string | null,
  "dueDate": string | null,
  "lineItems": [{ "description": string, "quantity": number | null, "unitPrice": number | null, "total": number | null }],
  "subtotal": number | null,
  "tax": number | null,
  "total": number | null,
  "currency": string | null,
  "notes": string | null
}`;

export async function parseInvoiceFromBase64(
  base64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp" | "application/pdf"
): Promise<ParsedInvoice> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaType as "application/pdf",
              data: base64,
            },
          } as Anthropic.DocumentBlockParam,
          {
            type: "text",
            text: USER_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");

  return JSON.parse(jsonMatch[0]) as ParsedInvoice;
}
