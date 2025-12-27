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
// OpenAI API Integration
// ============================================================================

interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature: number
  max_tokens: number
  response_format?: { type: "json_object" }
}

async function callOpenAI(
  messages: OpenAIMessage[],
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
    } as OpenAIRequest),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `OpenAI API error: ${response.status}`
    )
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ""
}

// ============================================================================
// Section Generation Functions
// ============================================================================

async function generateStrategy(
  brief: BrandBriefInput,
  apiKey: string
): Promise<BrandStrategy> {
  const response = await callOpenAI(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getStrategyPrompt(brief) },
    ],
    apiKey
  )

  return JSON.parse(response) as BrandStrategy
}

async function generateNaming(
  brief: BrandBriefInput,
  apiKey: string
): Promise<BrandNaming> {
  const response = await callOpenAI(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getNamingPrompt(brief) },
    ],
    apiKey
  )

  return JSON.parse(response) as BrandNaming
}

async function generateVisual(
  brief: BrandBriefInput,
  brandName: string | undefined,
  apiKey: string
): Promise<BrandVisual> {
  const response = await callOpenAI(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getVisualPrompt(brief, brandName) },
    ],
    apiKey
  )

  return JSON.parse(response) as BrandVisual
}

async function generatePrompts(
  brief: BrandBriefInput,
  brandName: string | undefined,
  visual: BrandVisual | undefined,
  apiKey: string
): Promise<BrandPrompts> {
  const visualContext = visual
    ? JSON.stringify({
        colors: visual.colorPalette,
        typography: visual.typography,
        style: visual.iconographyStyle,
      })
    : undefined

  const response = await callOpenAI(
    [
      { role: "system", content: BRAND_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: getPromptsPrompt(brief, brandName, visualContext) },
    ],
    apiKey
  )

  return JSON.parse(response) as BrandPrompts
}

async function generateAppliedExamples(
  brief: BrandBriefInput,
  brandName: string | undefined,
  strategy: BrandStrategy | undefined,
  naming: BrandNaming | undefined,
  apiKey: string
): Promise<BrandAppliedExamples> {
  const strategyContext = strategy ? JSON.stringify(strategy) : undefined
  const namingContext = naming
    ? JSON.stringify({
        name: naming.primaryName,
        taglines: naming.taglineOptions,
        tone: naming.toneOfVoice,
      })
    : undefined

  const response = await callOpenAI(
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
    apiKey
  )

  return JSON.parse(response) as BrandAppliedExamples
}

// ============================================================================
// Main API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get API key from header (user-provided) or environment variable
    const customApiKey = request.headers.get("X-OpenAI-Key")
    const apiKey = customApiKey || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OpenAI API key not configured. Please add your API key in Advanced settings, or configure OPENAI_API_KEY in environment variables.",
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { brief, sections, existingConcept } = body as {
      brief: BrandBriefInput
      sections: GenerationSection[]
      existingConcept?: BrandConcept
    }

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
        concept.strategy = await generateStrategy(brief, apiKey)
      } catch (error) {
        console.error("Strategy generation failed:", error)
      }
    }

    // Naming
    if (sectionsToGenerate.has("naming")) {
      try {
        concept.naming = await generateNaming(brief, apiKey)
        brandName = concept.naming.primaryName || brandName
      } catch (error) {
        console.error("Naming generation failed:", error)
      }
    }

    // Visual
    if (sectionsToGenerate.has("visual") || sectionsToGenerate.has("tokens")) {
      try {
        concept.visual = await generateVisual(brief, brandName, apiKey)
      } catch (error) {
        console.error("Visual generation failed:", error)
      }
    }

    // Prompts
    if (sectionsToGenerate.has("prompts")) {
      try {
        concept.prompts = await generatePrompts(
          brief,
          brandName,
          concept.visual,
          apiKey
        )
      } catch (error) {
        console.error("Prompts generation failed:", error)
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
          apiKey
        )
      } catch (error) {
        console.error("Applied examples generation failed:", error)
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
    // Get API key from header (user-provided) or environment variable
    const customApiKey = request.headers.get("X-OpenAI-Key")
    const apiKey = customApiKey || process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured. Please add your API key in Advanced settings.",
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { brief, section, existingConcept } = body as {
      brief: BrandBriefInput
      section: GenerationSection
      existingConcept: BrandConcept
    }

    const concept = { ...existingConcept }
    const brandName =
      concept.naming?.primaryName || brief.existingName

    switch (section) {
      case "strategy":
        concept.strategy = await generateStrategy(brief, apiKey)
        break
      case "naming":
        concept.naming = await generateNaming(brief, apiKey)
        break
      case "visual":
        concept.visual = await generateVisual(brief, brandName, apiKey)
        break
      case "prompts":
        concept.prompts = await generatePrompts(
          brief,
          brandName,
          concept.visual,
          apiKey
        )
        break
      case "tokens":
        // Tokens are derived from visual, regenerate visual
        concept.visual = await generateVisual(brief, brandName, apiKey)
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
