/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_extractTextContent from "../lib/extractTextContent.js";
import type * as lib_firecrawl from "../lib/firecrawl.js";
import type * as lib_htmlToPlainText from "../lib/htmlToPlainText.js";
import type * as lib_knowledgeIngestion from "../lib/knowledgeIngestion.js";
import type * as lib_publicHttpUrl from "../lib/publicHttpUrl.js";
import type * as lib_secrets from "../lib/secrets.js";
import type * as lib_subscriptionAccess from "../lib/subscriptionAccess.js";
import type * as lib_webpageCrawler from "../lib/webpageCrawler.js";
import type * as lib_workflow from "../lib/workflow.js";
import type * as playground from "../playground.js";
import type * as private_agents from "../private/agents.js";
import type * as private_answerTraining from "../private/answerTraining.js";
import type * as private_config from "../private/config.js";
import type * as private_contactSessions from "../private/contactSessions.js";
import type * as private_conversations from "../private/conversations.js";
import type * as private_dashboard from "../private/dashboard.js";
import type * as private_files from "../private/files.js";
import type * as private_messages from "../private/messages.js";
import type * as private_onboarding from "../private/onboarding.js";
import type * as private_plugins from "../private/plugins.js";
import type * as private_secrets from "../private/secrets.js";
import type * as private_subscription from "../private/subscription.js";
import type * as private_vapi from "../private/vapi.js";
import type * as private_widgetSettings from "../private/widgetSettings.js";
import type * as public_contactSessions from "../public/contactSessions.js";
import type * as public_conversations from "../public/conversations.js";
import type * as public_messages from "../public/messages.js";
import type * as public_organizations from "../public/organizations.js";
import type * as public_secrets from "../public/secrets.js";
import type * as public_widgetSettings from "../public/widgetSettings.js";
import type * as system_ai_agents_supportAgent from "../system/ai/agents/supportAgent.js";
import type * as system_ai_constants from "../system/ai/constants.js";
import type * as system_ai_pingMini from "../system/ai/pingMini.js";
import type * as system_ai_rag from "../system/ai/rag.js";
import type * as system_ai_tools_escalateConversation from "../system/ai/tools/escalateConversation.js";
import type * as system_ai_tools_resolveConversation from "../system/ai/tools/resolveConversation.js";
import type * as system_ai_tools_search from "../system/ai/tools/search.js";
import type * as system_contactSessions from "../system/contactSessions.js";
import type * as system_conversations from "../system/conversations.js";
import type * as system_onboarding from "../system/onboarding.js";
import type * as system_plugins from "../system/plugins.js";
import type * as system_secrets from "../system/secrets.js";
import type * as system_subscriptions from "../system/subscriptions.js";
import type * as system_websites from "../system/websites.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  constants: typeof constants;
  crons: typeof crons;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/extractTextContent": typeof lib_extractTextContent;
  "lib/firecrawl": typeof lib_firecrawl;
  "lib/htmlToPlainText": typeof lib_htmlToPlainText;
  "lib/knowledgeIngestion": typeof lib_knowledgeIngestion;
  "lib/publicHttpUrl": typeof lib_publicHttpUrl;
  "lib/secrets": typeof lib_secrets;
  "lib/subscriptionAccess": typeof lib_subscriptionAccess;
  "lib/webpageCrawler": typeof lib_webpageCrawler;
  "lib/workflow": typeof lib_workflow;
  playground: typeof playground;
  "private/agents": typeof private_agents;
  "private/answerTraining": typeof private_answerTraining;
  "private/config": typeof private_config;
  "private/contactSessions": typeof private_contactSessions;
  "private/conversations": typeof private_conversations;
  "private/dashboard": typeof private_dashboard;
  "private/files": typeof private_files;
  "private/messages": typeof private_messages;
  "private/onboarding": typeof private_onboarding;
  "private/plugins": typeof private_plugins;
  "private/secrets": typeof private_secrets;
  "private/subscription": typeof private_subscription;
  "private/vapi": typeof private_vapi;
  "private/widgetSettings": typeof private_widgetSettings;
  "public/contactSessions": typeof public_contactSessions;
  "public/conversations": typeof public_conversations;
  "public/messages": typeof public_messages;
  "public/organizations": typeof public_organizations;
  "public/secrets": typeof public_secrets;
  "public/widgetSettings": typeof public_widgetSettings;
  "system/ai/agents/supportAgent": typeof system_ai_agents_supportAgent;
  "system/ai/constants": typeof system_ai_constants;
  "system/ai/pingMini": typeof system_ai_pingMini;
  "system/ai/rag": typeof system_ai_rag;
  "system/ai/tools/escalateConversation": typeof system_ai_tools_escalateConversation;
  "system/ai/tools/resolveConversation": typeof system_ai_tools_resolveConversation;
  "system/ai/tools/search": typeof system_ai_tools_search;
  "system/contactSessions": typeof system_contactSessions;
  "system/conversations": typeof system_conversations;
  "system/onboarding": typeof system_onboarding;
  "system/plugins": typeof system_plugins;
  "system/secrets": typeof system_secrets;
  "system/subscriptions": typeof system_subscriptions;
  "system/websites": typeof system_websites;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
