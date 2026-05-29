export interface LineItem {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
}

export interface ParsedInvoice {
  vendorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  lineItems: LineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: string | null;
  notes: string | null;
}

export interface ParseResult {
  id: string;
  userId: string;
  fileName: string;
  parsedAt: string;
  data: ParsedInvoice;
}

export type PlanId = "starter" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  documentsPerMonth: number | "unlimited";
  priceId: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planId: PlanId | null;
  priceId: string | null;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}
