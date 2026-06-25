export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    limits: {
      MAX_LEADS: 50,
      MAX_MEMBERS: 2,
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 4900,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    limits: {
      MAX_LEADS: Infinity,
      MAX_MEMBERS: Infinity,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
