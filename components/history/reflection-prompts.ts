export const REFLECTION_PROMPTS = [
  { key: "reflection1", label: "What went well?" },
  { key: "reflection2", label: "What was challenging?" },
  { key: "reflection3", label: "What are you grateful for?" },
  { key: "reflection4", label: "What's on your mind?" },
] as const

export type ReflectionPromptKey = (typeof REFLECTION_PROMPTS)[number]["key"]

export const REFLECTION_PROMPT_LABELS = Object.fromEntries(
  REFLECTION_PROMPTS.map(({ key, label }) => [key, label])
) as Record<ReflectionPromptKey, string>
