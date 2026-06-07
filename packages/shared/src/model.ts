import type { string } from "zod"

export type ModelPricing = {
  inputUsdPerMillionToken: number;
  outputUsdPerMillionToken: number;
};

// Fixed the typo from "antropic" to "anthropic"
export type SupportedProvider = "anthropic" | "openai" | "mistral" | "google";

type SupportedChatModelDefinition = {
  id: string;
  provider: SupportedProvider;
  pricing: ModelPricing;
};

export const SUPPORTED_CHAT_MODELS: SupportedChatModelDefinition[] = [
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 1.0,
      outputUsdPerMillionToken: 5.0
    }
  },
  {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 3.0,
      outputUsdPerMillionToken: 15.0
    }
  },
  {
    id: "claude-opus-4-6",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 5.0,
      outputUsdPerMillionToken: 25.0
    }
  },
  {
    id: "claude-opus-4-7",
    provider: "anthropic",
    pricing: {
      inputUsdPerMillionToken: 5.0,
      outputUsdPerMillionToken: 25.0
    }
  },

  {
    id: "gpt-5-4-nano",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 0.2,
      outputUsdPerMillionToken: 1.25
    }
  },
  {
    id: "gpt-5-4-mini",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 0.75,
      outputUsdPerMillionToken: 4.5
    }
  },
  {
    id: "gpt-5-4", // Flagship Standard
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 2.5,
      outputUsdPerMillionToken: 15.0
    }
  },
  {
    id: "gpt-5-4-pro",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 30.0,
      outputUsdPerMillionToken: 180.0
    }
  },
  {
    id: "gpt-4o-mini",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 0.15,
      outputUsdPerMillionToken: 0.6
    }
  },
  {
    id: "gpt-4o",
    provider: "openai",
    pricing: {
      inputUsdPerMillionToken: 2.5,
      outputUsdPerMillionToken: 10.0
    }
  },

  {
    id: "gemini-2-5-flash-lite",
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 0.1,
      outputUsdPerMillionToken: 0.4
    }
  },
  {
    id: "gemini-2-5-flash",
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 0.15,
      outputUsdPerMillionToken: 0.6
    }
  },
  {
    id: "gemini-2-5-pro", // Under 200k base token pricing tier
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 1.25,
      outputUsdPerMillionToken: 10.0
    }
  },
  {
    id: "gemini-3-pro-preview",
    provider: "google",
    pricing: {
      inputUsdPerMillionToken: 2.0,
      outputUsdPerMillionToken: 12.0
    }
  },

  {
    id: "ministral-3b",
    provider: "mistral",
    pricing: {
      inputUsdPerMillionToken: 0.04,
      outputUsdPerMillionToken: 0.04
    }
  },
  {
    id: "mistral-small-4",
    provider: "mistral",
    pricing: {
      inputUsdPerMillionToken: 0.1,
      outputUsdPerMillionToken: 0.3
    }
  },
  {
    id: "mistral-large-2",
    provider: "mistral",
    pricing: {
      inputUsdPerMillionToken: 2.0,
      outputUsdPerMillionToken: 6.0
    }
  }
] as const satisfies SupportedChatModelDefinition[];

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];

export type SupportedChatModelId = SupportedChatModel["id"];

export function findSupportedChatModel(modelId: string){
  return SUPPORTED_CHAT_MODELS.find((m)=> m.id===modelId)
}
export const DEFAULT_CHAT_MODEL_ID:SupportedChatModelId = "gpt-4o";

