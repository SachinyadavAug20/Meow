import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import {
  findSupportedChatModel,
  type SupportedProvider,
  type SupportedChatModel,
  type SupportedChatModelId,
} from "@meow/shared";
import type { LanguageModel } from "ai";
import type { ProviderOptions } from "@ai-sdk/provider-utils";

type AntropicModelId = Extract<
  SupportedChatModel,
  { provider: "anthropic" }
>["id"];
type OpenAIModelId = Extract<SupportedChatModel, { provider: "openai" }>["id"];
type GoogleModelId = Extract<SupportedChatModel, { provider: "google" }>["id"];

export type ResolvedModel = {
  model: LanguageModel;
  provider: SupportedProvider;
  modelId: SupportedChatModelId;
  providerOptions: ProviderOptions;
};
const ANTHROPIC_PROVIDER_OPTIONS: Partial<
  Record<AntropicModelId, ProviderOptions>
> = {
  "claude-haiku-4-5": {
    anthropic: { thinking: { type: "enabled", budgetTokens: 10000 } },
  },
  "claude-sonnet-4-6": {
    anthropic: { thinking: { type: "enabled", budgetTokens: 10000 } },
  },
  "claude-opus-4-6": {
    anthropic: { thinking: { type: "enabled", budgetTokens: 20000 } },
  },
  "claude-opus-4-7": {
    anthropic: { thinking: { type: "enabled", budgetTokens: 20000 } },
  },
};
const GOOGLE_PROVIDER_OPTIONS: Partial<Record<GoogleModelId, ProviderOptions>> =
  {
    "gemini-2.5-flash-lite": {},
    "gemini-2.5-flash": {},
    "gemini-2.5-pro": {
      google: { thinkingConfig: { thinkingLevel: "high" } },
    },
    "gemini-3-pro-preview": {
      google: { thinkingConfig: { thinkingLevel: "high" } },

    },
  };
const OPENAI_PROVIDER_OPTIONS: Partial<Record<OpenAIModelId, ProviderOptions>> =
  {
    "gpt-5-4-nano": {
      openai: { reasoningEffort: "low" },
    },
    "gpt-5-4-mini": {
      openai: { reasoningEffort: "medium" },
    },
    "gpt-5-4": {
      openai: { reasoningEffort: "high" },
    },
    "gpt-5-4-pro": {
      openai: { reasoningEffort: "xhigh" },
    },
  };

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Unsupported provider ${provider}`);
}
function resolveAnthropicModel(modelId: AntropicModelId): ResolvedModel {
  return {
    model: anthropic(modelId),
    provider: "anthropic",
    modelId,
    providerOptions: ANTHROPIC_PROVIDER_OPTIONS[modelId],
  };
}
function resolveOpenAIModel(modelId: OpenAIModelId): ResolvedModel {
  return {
    model: openai(modelId),
    provider: "openai",
    modelId,
    providerOptions: OPENAI_PROVIDER_OPTIONS[modelId],
  };
}
function resolveGoogleModel(modelId: GoogleModelId): ResolvedModel {
  return {
    model: google(modelId),
    provider: "google",
    modelId,
    providerOptions: GOOGLE_PROVIDER_OPTIONS[modelId],
  };
}
function resolveSupportedChatModel(model: SupportedChatModel): ResolvedModel {
  const provider = model.provider;
  switch (provider) {
    case "anthropic":
      return resolveAnthropicModel(model.id as AntropicModelId);
    case "openai":
      return resolveOpenAIModel(model.id as OpenAIModelId);
    case "google":
      return resolveGoogleModel(model.id as GoogleModelId);
    default:
      return assertUnsupportedProvider(provider);
  }
}
export function isSupportedChatModel(
  modelId: string,
): modelId is SupportedChatModelId {
  return findSupportedChatModel(modelId) != null;
}
export function resolveChatModel(modelId: string): ResolvedModel {
  const model = findSupportedChatModel(modelId);
  if (!model) {
    throw new Error(`Unsupported model ${modelId}`);
  }
  return resolveSupportedChatModel(model);
}
