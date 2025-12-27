/**
 * Prompt Sanitization Utilities
 *
 * Protects against prompt injection attacks by sanitizing user input
 * before it's interpolated into AI prompts.
 */

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/gi,

  // Role/context manipulation
  /you\s+are\s+now\s+/gi,
  /act\s+as\s+if\s+/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /roleplay\s+as/gi,

  // System prompt extraction
  /what\s+(is|are)\s+your\s+(system\s+)?prompt/gi,
  /show\s+(me\s+)?your\s+(system\s+)?prompt/gi,
  /reveal\s+(your\s+)?(system\s+)?instructions?/gi,
  /output\s+(your\s+)?(system\s+)?prompt/gi,

  // Jailbreak attempts
  /\bDAN\b/g,  // "Do Anything Now"
  /developer\s+mode/gi,
  /jailbreak/gi,
  /bypass\s+(safety|content|filter)/gi,

  // Delimiter injection (trying to escape context)
  /```\s*(system|assistant|user)\s*:/gi,
  /\[\[(system|assistant|user)\]\]/gi,
  /<\|(system|assistant|user)\|>/gi,

  // API key/secret extraction attempts
  /api[_\s-]?key/gi,
  /secret[_\s-]?key/gi,
  /password/gi,
  /credential/gi,
  /access[_\s-]?token/gi,
]

// Characters that could be used for delimiter manipulation
const DANGEROUS_DELIMITERS = [
  '```',
  '"""',
  "'''",
  '<<<',
  '>>>',
  '[[',
  ']]',
  '{{',
  '}}',
  '<|',
  '|>',
]

/**
 * Sanitize user input to prevent prompt injection attacks.
 *
 * @param input - The raw user input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input safe for prompt interpolation
 */
export function sanitizePromptInput(
  input: string,
  options: {
    maxLength?: number
    removeNewlines?: boolean
    logRejections?: boolean
  } = {}
): string {
  const {
    maxLength = 10000,
    removeNewlines = false,
    logRejections = true,
  } = options

  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
    if (logRejections) {
      console.warn(`[Prompt Sanitizer] Input truncated from ${input.length} to ${maxLength} chars`)
    }
  }

  // Check for and remove injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      if (logRejections) {
        console.warn(`[Prompt Sanitizer] Removed injection pattern: ${pattern.source}`)
      }
      sanitized = sanitized.replace(pattern, '[FILTERED]')
    }
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0
  }

  // Escape dangerous delimiters by adding zero-width spaces
  for (const delimiter of DANGEROUS_DELIMITERS) {
    if (sanitized.includes(delimiter)) {
      // Insert zero-width space to break the delimiter
      const escaped = delimiter.split('').join('\u200B')
      sanitized = sanitized.split(delimiter).join(escaped)
    }
  }

  // Optionally remove newlines (useful for single-line fields)
  if (removeNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ')
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  return sanitized
}

/**
 * Sanitize a brand brief input object.
 * Applies appropriate sanitization to each field.
 */
export function sanitizeBrandBrief<T extends Record<string, unknown>>(brief: T): T {
  const sanitized = { ...brief }

  // Fields that should be sanitized as multi-line text
  const multiLineFields = [
    'businessDescription',
    'targetAudience',
    'constraints',
    'competitors',
    'existingLogoDescription',
  ]

  // Fields that should be sanitized as single-line text
  const singleLineFields = ['existingName']

  // Array fields where each element should be sanitized
  const arrayFields = ['personality']

  for (const field of multiLineFields) {
    if (typeof sanitized[field] === 'string') {
      (sanitized as Record<string, unknown>)[field] = sanitizePromptInput(
        sanitized[field] as string,
        { removeNewlines: false }
      )
    }
  }

  for (const field of singleLineFields) {
    if (typeof sanitized[field] === 'string') {
      (sanitized as Record<string, unknown>)[field] = sanitizePromptInput(
        sanitized[field] as string,
        { removeNewlines: true, maxLength: 200 }
      )
    }
  }

  for (const field of arrayFields) {
    if (Array.isArray(sanitized[field])) {
      (sanitized as Record<string, unknown>)[field] = (sanitized[field] as string[]).map(
        (item) => typeof item === 'string'
          ? sanitizePromptInput(item, { removeNewlines: true, maxLength: 100 })
          : item
      )
    }
  }

  return sanitized
}

/**
 * Wrap user input in explicit data delimiters to help the AI
 * distinguish between instructions and user data.
 */
export function wrapAsUserData(input: string, label: string): string {
  const sanitized = sanitizePromptInput(input)
  return `<user_data label="${label}">\n${sanitized}\n</user_data>`
}
