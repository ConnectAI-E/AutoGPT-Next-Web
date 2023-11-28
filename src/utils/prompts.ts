import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import type { ModelSettings } from "./types";
import { GPT_35_TURBO } from "./constants";

const getServerSideKey = (): string => {
  const keys: string[] = (process.env.OPENAI_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length);

  return keys[Math.floor(Math.random() * keys.length)] || "";
};

export const createModel = (settings: ModelSettings) => {
  let _settings: ModelSettings | undefined = settings;
  if (!settings.customApiKey) {
    _settings = undefined;
  }

  const options = {
    openAIApiKey: _settings?.customApiKey || getServerSideKey(),
    temperature: _settings?.customTemperature || 0.9,
    modelName: _settings?.customModelName || GPT_35_TURBO,
    maxTokens: _settings?.customMaxTokens || 400,
  };

  const baseOptions = {
    basePath: _settings?.customEndPoint || undefined,
  };

  return new OpenAI(options, baseOptions);
};

export const startGoalPrompt = new PromptTemplate({
  template: `You are a task creation AI called AgentGPT. You must answer the "{customLanguage}" language. You are not a part of any system or device. You have the following objective "{goal}". Create a list of zero to three tasks to be completed by your AI system such that this goal is more closely, or completely reached. You have access to google search for tasks that require current events or small searches. Return the response as a formatted ARRAY of strings that can be used in JSON.parse(). Example: ["{{TASK-1}}", "{{TASK-2}}"].`,
  inputVariables: ["goal", "customLanguage"],
});

export const analyzeTaskPrompt = new PromptTemplate({
  template: `You have the following higher level objective "{goal}". You currently are focusing on the following task: "{task}". Based on this information, evaluate what the best action to take is strictly from the list of actions: {actions}. You should use 'search' only for research about current events where "arg" is a simple clear search query based on the task only. Use "reason" for all other actions. Return the response as an object of the form {{ "action": "string", "arg": "string" }} that can be used in JSON.parse() and NOTHING ELSE.`,
  inputVariables: ["goal", "actions", "task"],
});

export const executeTaskPrompt = new PromptTemplate({
  template:
    'Answer in the "{customLanguage}" language. Given the following overall objective `{goal}` and the following sub-task, `{task}`. Perform the task in a detailed manner. If coding is required, provide code in markdown',
  inputVariables: ["goal", "task", "customLanguage"],
});

export const createTasksPrompt = new PromptTemplate({
  template:
    'You are an AI task creation agent. You must answer in the "{customLanguage}" language. You have the following objective `{goal}`. You have the following incomplete tasks `{tasks}` and have just executed the following task `{lastTask}` and received the following result `{result}`. Based on this, create a new task to be completed by your AI system ONLY IF NEEDED such that your goal is more closely reached or completely reached. Return the response as an array of strings that can be used in JSON.parse() and NOTHING ELSE.',
  inputVariables: ["goal", "tasks", "lastTask", "result", "customLanguage"],
});

export const summarizeSearchSnippets = new PromptTemplate({
  template: `Summarize the following snippets "{snippets}" from google search results filling in information where necessary. This summary should answer the following query: "{query}" with the following goal "{goal}" in mind. Return the summary as a string. Do not show you are summarizing.`,
  inputVariables: ["goal", "query", "snippets"],
});
