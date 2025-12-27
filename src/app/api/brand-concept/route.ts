import { NextRequest, NextResponse } from "next/server"
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
// Google Imagen 3 API Integration
// ============================================================================

interface ImagenConfig {
  numberOfImages?: number // 1-4
  aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
  personGeneration?: "DONT_ALLOW" | "ALLOW_ADULT" | "ALLOW_ALL"
}

interface ImagenResponse {
  predictions?: {
    bytesBase64Encoded: string
    mimeType: string
  }[]
  error?: {
    code: number
    message: string
    status: string
  }
}

async function callImagen(
  prompt: string,
  apiKey: string,
  config: ImagenConfig = {}
): Promise<{ images: string[]; mimeType: string }> {
  if (!apiKey) {
    throw new Error("Google API key required for Imagen image generation")
  }

  const {
    numberOfImages = 1,
    aspectRatio = "1:1",
    personGeneration = "DONT_ALLOW",
  } = config

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: numberOfImages,
          aspectRatio,
          personGeneration,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMessage =
      error.error?.message || `Imagen API error: ${response.status}`

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Your Google API key failed. Please check your API key or remove it to use our default system."
      )
    }
    if (response.status === 429) {
      throw new Error(
        "Your Google API key hit rate limits. Please try again later or check your quota."
      )
    }
    throw new Error(errorMessage)
  }

  const data: ImagenResponse = await response.json()

  if (data.error) {
    throw new Error(data.error.message || "Imagen generation failed")
  }

  if (!data.predictions || data.predictions.length === 0) {
    throw new Error("No images generated from Imagen API")
  }

  return {
    images: data.predictions.map((p) => p.bytesBase64Encoded),
    mimeType: data.predictions[0]?.mimeType || "image/png",
  }
}

// Generate logo using Imagen 3
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateLogoWithImagen(
  prompt: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const result = await callImagen(prompt, apiKey, {
    numberOfImages: 1,
    aspectRatio: "1:1",
    personGeneration: "DONT_ALLOW",
  })

  return {
    imageBase64: result.images[0],
    mimeType: result.mimeType,
  }
}

// Generate hero image using Imagen 3
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateHeroWithImagen(
  prompt: string,
  apiKey: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const result = await callImagen(prompt, apiKey, {
    numberOfImages: 1,
    aspectRatio: "16:9",
    personGeneration: "ALLOW_ADULT",
  })

  return {
    imageBase64: result.images[0],
    mimeType: result.mimeType,
  }
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
// DALL-E 3 API Integration
// ============================================================================

interface DallEResponse {
  data?: {
    url?: string
    b64_json?: string
    revised_prompt?: string
  }[]
  error?: {
    message: string
    type: string
    code: string
  }
}

async function callDallE(
  prompt: string,
  apiKey: string,
  config: { size?: "1024x1024" | "1792x1024" | "1024x1792"; quality?: "standard" | "hd" } = {}
): Promise<{ imageBase64: string; mimeType: string; revisedPrompt?: string }> {
  if (!apiKey) {
    throw new Error("OpenAI API key required for DALL-E 3 image generation")
  }

  const { size = "1024x1024", quality = "standard" } = config

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size,
      quality,
      response_format: "b64_json",
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const errorMessage = error.error?.message || `DALL-E API error: ${response.status}`

    if (response.status === 401) {
      throw new Error(
        "Your OpenAI API key failed. Please check your API key or remove it to use our default system."
      )
    }
    if (response.status === 429) {
      throw new Error(
        "Your OpenAI API key hit rate limits. Please try again later or check your quota."
      )
    }
    throw new Error(errorMessage)
  }

  const data: DallEResponse = await response.json()

  if (data.error) {
    throw new Error(data.error.message || "DALL-E generation failed")
  }

  if (!data.data || data.data.length === 0 || !data.data[0].b64_json) {
    throw new Error("No images generated from DALL-E API")
  }

  return {
    imageBase64: data.data[0].b64_json,
    mimeType: "image/png",
    revisedPrompt: data.data[0].revised_prompt,
  }
}

// ============================================================================
// Visual Engine Wrapper
// ============================================================================

interface GeneratedImage {
  imageBase64: string
  mimeType: string
  revisedPrompt?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateImage(
  prompt: string,
  engineConfig: EngineConfig,
  options: { aspectRatio?: "square" | "landscape" | "portrait" } = {}
): Promise<GeneratedImage> {
  const { visualEngine, userKeys } = engineConfig
  const { aspectRatio = "square" } = options

  if (visualEngine === "gemini-imagen") {
    const apiKey = userKeys.google || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error(
        "Google API key not configured. Please add your API key in Advanced settings, or configure GOOGLE_API_KEY in environment variables."
      )
    }

    // Map aspect ratio to Imagen format
    const imagenAspectRatio =
      aspectRatio === "landscape"
        ? "16:9"
        : aspectRatio === "portrait"
        ? "9:16"
        : "1:1"

    const result = await callImagen(prompt, apiKey, {
      numberOfImages: 1,
      aspectRatio: imagenAspectRatio,
      personGeneration: "ALLOW_ADULT",
    })

    return {
      imageBase64: result.images[0],
      mimeType: result.mimeType,
    }
  } else {
    // DALL-E 3 via OpenAI
    const apiKey = userKeys.openai || process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not configured for DALL-E 3. Please add your API key in Advanced settings."
      )
    }

    // Map aspect ratio to DALL-E format
    const dalleSize =
      aspectRatio === "landscape"
        ? "1792x1024"
        : aspectRatio === "portrait"
        ? "1024x1792"
        : "1024x1024"

    return callDallE(prompt, apiKey, { size: dalleSize as "1024x1024" | "1792x1024" | "1024x1792" })
  }
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

  // Extract JSON from response (Claude may include additional text)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse strategy response")
  }
  return JSON.parse(jsonMatch[0]) as BrandStrategy
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

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse naming response")
  }
  return JSON.parse(jsonMatch[0]) as BrandNaming
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

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse visual response")
  }
  return JSON.parse(jsonMatch[0]) as BrandVisual
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

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse prompts response")
  }
  return JSON.parse(jsonMatch[0]) as BrandPrompts
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

  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Failed to parse applied examples response")
  }
  return JSON.parse(jsonMatch[0]) as BrandAppliedExamples
}

// ============================================================================
// Main API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
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

    // Generate sections in order (some depend on others)
    let brandName = brief.existingName

    // Strategy
    if (sectionsToGenerate.has("strategy")) {
      try {
        concept.strategy = await generateStrategy(brief, engineConfig)
      } catch (error) {
        console.error("Strategy generation failed:", error)
        throw error // Re-throw to show user-friendly error
      }
    }

    // Naming
    if (sectionsToGenerate.has("naming")) {
      try {
        concept.naming = await generateNaming(brief, engineConfig)
        brandName = concept.naming.primaryName || brandName
      } catch (error) {
        console.error("Naming generation failed:", error)
        throw error
      }
    }

    // Visual
    if (sectionsToGenerate.has("visual") || sectionsToGenerate.has("tokens")) {
      try {
        concept.visual = await generateVisual(brief, brandName, engineConfig)
      } catch (error) {
        console.error("Visual generation failed:", error)
        throw error
      }
    }

    // Prompts
    if (sectionsToGenerate.has("prompts")) {
      try {
        concept.prompts = await generatePrompts(
          brief,
          brandName,
          concept.visual,
          engineConfig
        )
      } catch (error) {
        console.error("Prompts generation failed:", error)
        throw error
      }
    }

    // Applied Examples (generated with strategy and naming context)
    if (
      sectionsToGenerate.has("strategy") ||
      sectionsToGenerate.has("naming")
    ) {
      try {
        concept.appliedExamples = await generateAppliedExamples(
          brief,
          brandName,
          concept.strategy,
          concept.naming,
          engineConfig
        )
      } catch (error) {
        console.error("Applied examples generation failed:", error)
        throw error
      }
    }

    // Update timestamp
    concept.generatedAt = new Date().toISOString()

    return NextResponse.json({
      success: true,
      concept,
    })
  } catch (error) {
    console.error("Brand concept generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
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

    return NextResponse.json({
      success: true,
      concept,
      regeneratedSection: section,
    })
  } catch (error) {
    console.error("Section regeneration error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Regeneration failed",
      },
      { status: 500 }
    )
  }
}

// Note: callVisualEngine is available internally for future image generation features
