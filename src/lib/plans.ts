import type { Plan } from "@/types";

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 12,
    documentsPerMonth: 50,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    documentsPerMonth: "unlimited",
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  },
];
