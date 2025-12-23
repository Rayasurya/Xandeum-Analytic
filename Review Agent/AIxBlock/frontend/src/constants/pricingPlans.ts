export type TPricingPlanFeature = {
  name: string,
  type: "COMING-SOON" | "UNLIMITED" | "CHECKED" | "HIGHEST-REWARD" | "ELIGIBLE" | "NONE" | "TEXT",
  text?: string,
}

export type TPricingPlan = {
  name: string,
  monthlyPrice: number | string,
  priceUnit?: string,
  yearlyDiscount: number,
  desc?: string,
  isPopular?: boolean,
  cta: "COMING-SOON" | "CONTINUE" | "CONTACT-SALE" | "EXPLORE",
  features?: TPricingPlanFeature[],
  benefits?: TPricingPlanFeature[],
}

const PLATFORM_PLANS: {[k: string]: TPricingPlan} = {
  "free": {
    name: "Free Plan",
    monthlyPrice: 0,
    yearlyDiscount: 0,
    desc: "Stake AxB tokens around 100 USD equal of AxB tokens (refundable deposit)",
    isPopular: false,
    cta: "CONTINUE",
    features: [
      {name: "2 weeks Free Trail", type: "NONE"},
      {name: "Number of seats", type: "TEXT", text: "3 seats"},
      {name: "Storage workspace", type: "TEXT", text: "Your own"},
      {name: "Unlimited multi - AI Agents Development", type: "NONE"},
      {name: "Build, Fine-tune, Deploy AI Models", type: "NONE"},
      {name: "Label & Validate Data", type: "NONE"},
      {name: "Self Host feature", type: "NONE"},
      {name: "Customized features", type: "NONE"},
      {name: "24/7 Dedicated Support Manager", type: "NONE"},
    ],
    benefits: [
      {name: "Token Rewards (monthly)", type: "TEXT", text: "Eligible (low)"},
    ],
  },
  "ai-agent": {
    name: "Multi-Agents Pro",
    monthlyPrice: 69,
    yearlyDiscount: 0.3,
    desc: "For teams specializing in developing multi AI agents seamlessly.",
    isPopular: false,
    cta: "CONTINUE",
    features: [
      {name: "2 weeks Free Trail", type: "CHECKED"},
      {name: "Number of seats", type: "UNLIMITED"},
      {name: "Storage workspace", type: "TEXT", text: "Your own"},
      {name: "Unlimited multi - AI Agents Development", type: "CHECKED"},
      {name: "Build, Fine-tune, Deploy AI Models", type: "NONE"},
      {name: "Label & Validate Data", type: "NONE"},
      {name: "Self Host feature", type: "CHECKED"},
      {name: "Customized features", type: "NONE"},
      {name: "24/7 Dedicated Support Manager", type: "NONE"},
    ],
    benefits: [
      {name: "Token Rewards (monthly)", type: "HIGHEST-REWARD"},
    ],
  },
  "pro": {
    name: "Pro Plan",
    monthlyPrice: 119,
    yearlyDiscount: 0.3, // 30%
    desc: "An all-in-one solution to build, fine-tune, and deploy AI models effortlessly as well as build multi AI agents",
    isPopular: true,
    cta: "CONTINUE",
    features: [
      {name: "2 weeks Free Trail", type: "CHECKED"},
      {name: "Number of seats", type: "UNLIMITED"},
      {name: "Storage workspace", type: "TEXT", text: "Your own"},
      {name: "Unlimited multi - AI Agents Development", type: "CHECKED"},
      {name: "Build, Fine-tune, Deploy AI Models", type: "CHECKED"},
      {name: "Label & Validate Data", type: "CHECKED"},
      {name: "Self Host feature", type: "CHECKED"},
      {name: "Customized features", type: "NONE"},
      {name: "24/7 Dedicated Support Manager", type: "NONE"},
    ],
    benefits: [
      {name: "Token Rewards (monthly)", type: "TEXT"},
    ],
  },
  "enterprise": {
    name: "Enterprise Plan",
    monthlyPrice: -1,
    yearlyDiscount: 0,
    desc: "For teams needing customized features and dedicated support",
    isPopular: false,
    cta: "CONTACT-SALE",
    features: [
      {name: "2 weeks Free Trail", type: "CHECKED"},
      {name: "Number of seats", type: "UNLIMITED"},
      {name: "Storage workspace", type: "TEXT", text: "Your own"},
      {name: "Unlimited multi - AI Agents Development", type: "CHECKED"},
      {name: "Build, Fine-tune, Deploy AI Models", type: "CHECKED"},
      {name: "Label & Validate Data", type: "CHECKED"},
      {name: "Self Host feature", type: "CHECKED"},
      {name: "Customized features", type: "CHECKED"},
      {name: "24/7 Dedicated Support Manager", type: "CHECKED"},
    ],
    benefits: [
      {name: "Token Rewards (monthly)", type: "HIGHEST-REWARD"},
    ],
  },
}

const MODEL_PLANS: {[k: string]: Exclude<TPricingPlan, "features">} = {
  "sellers": {
    name: "For Sellers",
    monthlyPrice: "10%",
    priceUnit: "per transaction",
    yearlyDiscount: 0,
    cta: "EXPLORE",
    benefits: [
      {name: "Token Rewards (monthly)", type: "ELIGIBLE"},
    ],
  },
}

const CROWDSOURCING_PLANS: {[k: string]: Exclude<TPricingPlan, "features">} = {
  "owners": {
    name: "For Project Owners",
    monthlyPrice: "3%",
    priceUnit: "of project budget",
    yearlyDiscount: 0,
    cta: "EXPLORE",
    benefits: [
      {name: "Token Rewards (monthly)", type: "ELIGIBLE"},
    ],
  },
  "freelancers": {
    name: "For Freelancers",
    monthlyPrice: "7%",
    priceUnit: "of the total income",
    yearlyDiscount: 0,
    cta: "EXPLORE",
    benefits: [
      {name: "Token Rewards", type: "NONE"},
    ],
  },
}

export {
  PLATFORM_PLANS,
  MODEL_PLANS,
  CROWDSOURCING_PLANS,
};
