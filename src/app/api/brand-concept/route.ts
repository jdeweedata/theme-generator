import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  BrandBriefInput,
  BrandConcept,
  BrandStrategy,
  BrandNaming,
  BrandVisual,
  BrandPrompts,
  BrandAppliedExamples,
  GenerationSection,
  brandBriefSchema,
  brandStrategySchema,
  brandNamingSchema,
  brandVisualSchema,
  brandPromptsSchema,
  brandAppliedExamplesSchema,
  EngineConfig,
  defaultEngineConfig,
} from "@/lib/brand-concept-types"
import {
  BRAND_GENERATION_SYSTEM_PROMPT,
  getStrategyPrompt,
  getNamingPrompt,
  getVisualPrompt,
  getPromptsPrompt,
  getAppliedExamplesPrompt,
} from "@/lib/ai-prompts"
import {
  checkRateLimit,
  rateLimitExceededResponse,
  rateLimitHeaders,
  aiOperationRateLimitConfig,
} from "@/lib/rate-limit"

// ============================================================================
// Security: API Key Redaction for Logging
// ============================================================================

/**
 * Redacts potential API keys from error messages to prevent accidental exposure.
 * Patterns: sk-xxx, sk-ant-xxx, AIza-xxx, and other common API key formats.
 */
function redactApiKeys(message: string): string {
  return message
    // OpenAI keys (sk-...)
    .replace(/sk-[a-zA-Z0-9]{32,}/g, "sk-[REDACTED]")
    // Anthropic keys (sk-ant-...)
    .replace(/sk-ant-[a-zA-Z0-9-]{32,}/g, "sk-ant-[REDACTED]")
    // Google API keys (AIza...)
    .replace(/AIza[a-zA-Z0-9_-]{35,}/g, "AIza[REDACTED]")
    // Generic long alphanumeric strings that might be keys
    .replace(/(?:key|token|secret|password)[=:]["']?[a-zA-Z0-9_-]{20,}["']?/gi, "[CREDENTIAL_REDACTED]")
}

/**
 * Safely stringify an error for logging, redacting any API keys.
 */
function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return redactApiKeys(message)
}

// ============================================================================
// API Client Types
// ============================================================================

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

// ============================================================================
// Anthropic/Claude API Integration
// ============================================================================

async function callAnthropic(
  messages: Message[],
  apiKey: string
): Promise<string> {
  // Extract system message
  const systemMessage = messages.find((m) => m.role === "system")?.content || ""
  const userMessages = messages.filter((m) => m.role !== "system")

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemMessage,
      messages: userMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMessage = error.error?.message || `Anthropic API error: ${response.status}`

    // Check for specific error types
    if (response.status === 401) {
      throw new Error("Your custom Anthropic key failed. Please check your API key or remove it to use our default system.")
    }
    if (response.status === 429) {
      throw new Error("Your custom Anthropic key failed. Please check your quota or remove it to use our default system.")
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  // Extract text from Claude's response format
  const textContent = data.content?.find((c: { type: string }) => c.type === "text")
  return textContent?.text || ""
}

// ============================================================================
// OpenAI API Integration
// ============================================================================

async function callOpenAI(
  messages: Message[],
  apiKey: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMessage = error.error?.message || `OpenAI API error: ${response.status}`

    // Check for specific error types
    if (response.status === 401) {
      throw new Error("Your custom OpenAI key failed. Please check your API key or remove it to use our default system.")
    }
    if (response.status === 429) {
      throw new Error("Your custom OpenAI key failed. Please check your quota or remove it to use our default system.")
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

// ============================================================================
// Strategy Engine Wrapper
// ============================================================================

async function callStrategyEngine(
  messages: Message[],
  engineConfig: EngineConfig
): Promise<string> {
  const { strategyEngine, userKeys } = engineConfig

  if (strategyEngine === "claude-opus") {
    // Use Anthropic/Claude
    const apiKey = userKeys.anthropic || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error(
        "Anthropic API key not configured. Please add your API key in Advanced settings, or configure ANTHROPIC_API_KEY in environment variables."
      )
    }
    return callAnthropic(messages, apiKey)
  } else {
    // Use OpenAI
    const apiKey = userKeys.openai || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not configured. Please add your API key in Advanced settings, or configure OPENAI_API_KEY in environment variables."
      )
    }
    return callOpenAI(messages, apiKey)
  }
}

// ============================================================================
// Safe JSON Parsing with Zod Validation
// ============================================================================

/**
 * Safely parse JSON from AI response and validate against schema.
 * Prevents malformed or malicious AI responses from bypassing type checks.
 */
function safeParseAIResponse<T>(
  response: string,
  schema: z.ZodType<T>,
  sectionName: string
): T {
  // Extract JSON from response (AI may include additional text)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from ${sectionName} response`)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw new Error(`Failed to parse ${sectionName} response as JSON`)
  }

  // Validate against schema
  const result = schema.safeParse(parsed)
  if (!result.success) {
    console.error(
      `[AI Response Validation] ${sectionName} validation failed:`,
      result.error.flatten()
    )
    throw new Error(
      `Invalid ${sectionName} response structure: ${result.error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`
    )
  }

  return result.data
}

// ============================================================================
// Section Generation Functions
// ============================================================================

async function generateStrategy(
  brief: BrandBriefInput,
  engineConfig: EngineConfig
): Promise<BrandStrategy> {
  const response = await callStrategyEngine(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getStrategyPrompt(brief) },
    ],
    engineConfig
  )

  return safeParseAIResponse(response, brandStrategySchema, "strategy")
}

async function generateNaming(
  brief: BrandBriefInput,
  engineConfig: EngineConfig
): Promise<BrandNaming> {
  const response = await callStrategyEngine(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getNamingPrompt(brief) },
    ],
    engineConfig
  )

  return safeParseAIResponse(response, brandNamingSchema, "naming")
}

async function generateVisual(
  brief: BrandBriefInput,
  brandName: string | undefined,
  engineConfig: EngineConfig
): Promise<BrandVisual> {
  const response = await callStrategyEngine(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getVisualPrompt(brief, brandName) },
    ],
    engineConfig
  )

  return safeParseAIResponse(response, brandVisualSchema, "visual")
}

async function generatePrompts(
  brief: BrandBriefInput,
  brandName: string | undefined,
  visual: BrandVisual | undefined,
  engineConfig: EngineConfig
): Promise<BrandPrompts> {
  const visualContext = visual
    ? JSON.stringify({
        colors: visual.colorPalette,
        typography: visual.typography,
        style: visual.iconographyStyle,
      })
    : undefined

  const response = await callStrategyEngine(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getPromptsPrompt(brief, brandName, visualContext) },
    ],
    engineConfig
  )

  return safeParseAIResponse(response, brandPromptsSchema, "prompts")
}

async function generateAppliedExamples(
  brief: BrandBriefInput,
  brandName: string | undefined,
  strategy: BrandStrategy | undefined,
  naming: BrandNaming | undefined,
  engineConfig: EngineConfig
): Promise<BrandAppliedExamples> {
  const strategyContext = strategy ? JSON.stringify(strategy) : undefined
  const namingContext = naming
    ? JSON.stringify({
        name: naming.primaryName,
        taglines: naming.taglineOptions,
        tone: naming.toneOfVoice,
      })
    : undefined

  const response = await callStrategyEngine(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      {
        role: "user",
        content: getAppliedExamplesPrompt(
          brief,
          brandName,
          strategyContext,
          namingContext
        ),
      },
    ],
    engineConfig
  )

  return safeParseAIResponse(response, brandAppliedExamplesSchema, "applied examples")
}

// ============================================================================
// Main API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  // Check rate limit first (before any expensive operations)
  const rateLimitResult = checkRateLimit(request, aiOperationRateLimitConfig)
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult)
  }

  try {
    // Parse request body
    const body = await request.json()
    const { brief, sections, existingConcept, engineConfig: userEngineConfig } = body as {
      brief: BrandBriefInput
      sections: GenerationSection[]
      existingConcept?: BrandConcept
      engineConfig?: EngineConfig
    }

    // Use provided engine config or defaults
    const engineConfig: EngineConfig = userEngineConfig || defaultEngineConfig

    // Validate brief
    const validation = brandBriefSchema.safeParse(brief)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid brand brief",
          details: validation.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      )
    }

    // Initialize concept with existing or new
    const concept: BrandConcept = existingConcept || {
      brief,
      generatedAt: new Date().toISOString(),
    }

    // Determine which sections to generate
    const sectionsToGenerate = new Set(sections)

    // Generate sections with parallelization where possible
    // Phase 1: Strategy and Naming in parallel (independent)
    const [strategy, naming] = await Promise.all([
      sectionsToGenerate.has("strategy")
        ? generateStrategy(brief, engineConfig).catch((error) => {
            console.error("Strategy generation failed:", safeErrorMessage(error))
            throw error
          })
        : Promise.resolve(undefined),
      sectionsToGenerate.has("naming")
        ? generateNaming(brief, engineConfig).catch((error) => {
            console.error("Naming generation failed:", safeErrorMessage(error))
            throw error
          })
        : Promise.resolve(undefined),
    ])

    concept.strategy = strategy
    concept.naming = naming
    const brandName = naming?.primaryName || brief.existingName

    // Phase 2: Visual (depends on naming for brandName)
    if (sectionsToGenerate.has("visual") || sectionsToGenerate.has("tokens")) {
      try {
        concept.visual = await generateVisual(brief, brandName, engineConfig)
      } catch (error) {
        console.error("Visual generation failed:", safeErrorMessage(error))
        throw error
      }
    }

    // Phase 3: Prompts and Applied Examples in parallel (after their dependencies)
    const [prompts, appliedExamples] = await Promise.all([
      sectionsToGenerate.has("prompts")
        ? generatePrompts(brief, brandName, concept.visual, engineConfig).catch((error) => {
            console.error("Prompts generation failed:", safeErrorMessage(error))
            throw error
          })
        : Promise.resolve(undefined),
      sectionsToGenerate.has("strategy") || sectionsToGenerate.has("naming")
        ? generateAppliedExamples(brief, brandName, concept.strategy, concept.naming, engineConfig).catch((error) => {
            console.error("Applied examples generation failed:", safeErrorMessage(error))
            throw error
          })
        : Promise.resolve(undefined),
    ])

    concept.prompts = prompts
    concept.appliedExamples = appliedExamples

    // Update timestamp
    concept.generatedAt = new Date().toISOString()

    return NextResponse.json(
      {
        success: true,
        concept,
      },
      {
        headers: rateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    console.error("Brand concept generation error:", safeErrorMessage(error))
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? redactApiKeys(error.message)
            : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// Regenerate Section Endpoint
// ============================================================================

export async function PATCH(request: NextRequest) {
  // Check rate limit first (before any expensive operations)
  const rateLimitResult = checkRateLimit(request, aiOperationRateLimitConfig)
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { brief, section, existingConcept, engineConfig: userEngineConfig } = body as {
      brief: BrandBriefInput
      section: GenerationSection
      existingConcept: BrandConcept
      engineConfig?: EngineConfig
    }

    // Use provided engine config or defaults
    const engineConfig: EngineConfig = userEngineConfig || defaultEngineConfig

    const concept = { ...existingConcept }
    const brandName = concept.naming?.primaryName || brief.existingName

    switch (section) {
      case "strategy":
        concept.strategy = await generateStrategy(brief, engineConfig)
        break
      case "naming":
        concept.naming = await generateNaming(brief, engineConfig)
        break
      case "visual":
        concept.visual = await generateVisual(brief, brandName, engineConfig)
        break
      case "prompts":
        concept.prompts = await generatePrompts(
          brief,
          brandName,
          concept.visual,
          engineConfig
        )
        break
      case "tokens":
        // Tokens are derived from visual, regenerate visual
        concept.visual = await generateVisual(brief, brandName, engineConfig)
        break
    }

    concept.generatedAt = new Date().toISOString()

    return NextResponse.json(
      {
        success: true,
        concept,
        regeneratedSection: section,
      },
      {
        headers: rateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    console.error("Section regeneration error:", safeErrorMessage(error))
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? redactApiKeys(error.message)
            : "Regeneration failed",
      },
      { status: 500 }
    )
  }
}
