# API Routes Documentation

## Overview

Rooting Routine uses Next.js App Router API routes to handle backend operations including session management, AI conversation, and content generation.

## API Structure

```
app/api/
├── session/
│   ├── start/
│   │   └── route.ts          # POST - Start new session
│   ├── question/
│   │   └── route.ts          # POST - Get next question
│   ├── complete/
│   │   └── route.ts          # POST - Complete session
│   └── history/
│       └── route.ts          # GET - Get user's sessions
├── generate/
│   ├── reflection/
│   │   └── route.ts          # POST - Generate reflection
│   └── image/
│       └── route.ts          # POST - Generate nature image
└── auth/
    └── (handled by Supabase)
```

## Session Routes

### POST /api/session/start

Start a new recovery walk session.

**Request Body:**
```typescript
{
  pre_walk_mood: string        // User's current mood
  pre_walk_intention: string   // What they want to work on
}
```

**Response:**
```typescript
{
  session_id: string           // UUID of created session
  first_question: string       // Initial Elder Tree question
}
```

**Example:**
```typescript
const response = await fetch('/api/session/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pre_walk_mood: 'anxious',
    pre_walk_intention: 'work on step 1 - powerlessness'
  })
})

const data = await response.json()
// data.session_id: "550e8400-e29b-41d4-a716-446655440000"
// data.first_question: "Tell me about the last time you tried to stop..."
```

**Implementation:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body
  const { pre_walk_mood, pre_walk_intention } = await request.json()

  // Create session in database
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      pre_walk_mood,
      pre_walk_intention,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Generate first question based on intention
  const first_question = await generateFirstQuestion(pre_walk_intention)

  return NextResponse.json({
    session_id: session.id,
    first_question
  })
}
```

### POST /api/session/question

Get next question from Elder Tree based on previous answer.

**Request Body:**
```typescript
{
  session_id: string           // Current session UUID
  previous_answer: string      // User's last answer
  current_step: 'step1' | 'step2' | 'step3'
}
```

**Response:**
```typescript
{
  question: string             // Next Elder Tree question
  is_complete: boolean         // Whether step work is done
}
```

**Example:**
```typescript
const response = await fetch('/api/session/question', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    previous_answer: "I tried to limit my usage to 30 minutes but ended up using for 3 hours",
    current_step: 'step1'
  })
})

const data = await response.json()
// data.question: "What does your mind tell you to get you to use?"
// data.is_complete: false
```

**Implementation:**
```typescript
import { Anthropic } from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const supabase = await createClient()
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const { session_id, previous_answer, current_step } = await request.json()

  // Get session and conversation history
  const { data: session } = await supabase
    .from('sessions')
    .select('step_responses, user_id')
    .eq('id', session_id)
    .single()

  // Verify user owns this session
  const { data: { user } } = await supabase.auth.getUser()
  if (session.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Build conversation context
  const messages = buildConversationHistory(session.step_responses)

  // Get next question from Claude
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 400,
    system: getElderTreeSystemPrompt(current_step),
    messages: [
      ...messages,
      {
        role: 'user',
        content: previous_answer
      }
    ]
  })

  const nextQuestion = response.content[0].text

  // Update session with new Q&A
  await updateSessionConversation(session_id, previous_answer, nextQuestion)

  // Check if step work is complete
  const is_complete = checkIfComplete(session.step_responses, current_step)

  return NextResponse.json({
    question: nextQuestion,
    is_complete
  })
}
```

### POST /api/session/complete

Complete a walk session and generate reflection + image.

**Request Body:**
```typescript
{
  session_id: string           // Session to complete
}
```

**Response:**
```typescript
{
  reflection: string           // Personalized reflection
  image_url: string           // Generated nature image URL
  encouragement: string       // Brief encouragement message
  insights: string[]          // Key insights from session
}
```

**Example:**
```typescript
const response = await fetch('/api/session/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId
  })
})

const data = await response.json()
```

**Implementation:**
```typescript
export async function POST(request: Request) {
  const { session_id } = await request.json()

  // Get session data
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', session_id)
    .single()

  // Generate reflection using Anthropic
  const reflection = await generateReflection(session.step_responses)

  // Generate nature image using FAL.ai
  const image_url = await generateImage(session.step_responses)

  // Generate encouragement
  const encouragement = await generateEncouragement(reflection)

  // Extract insights
  const insights = extractInsights(session.step_responses)

  // Update session as complete
  await supabase
    .from('sessions')
    .update({
      completed_at: new Date().toISOString(),
      final_reflection: reflection,
      generated_image_url: image_url,
      encouragement_message: encouragement,
      insights: insights
    })
    .eq('id', session_id)

  return NextResponse.json({
    reflection,
    image_url,
    encouragement,
    insights
  })
}
```

### GET /api/session/history

Get user's past walk sessions.

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```typescript
{
  sessions: Session[]          // Array of session objects
  total: number               // Total count of sessions
}
```

**Example:**
```typescript
const response = await fetch('/api/session/history?limit=10&offset=0')
const data = await response.json()
```

**Implementation:**
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get sessions with pagination
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Get total count
  const { count } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)

  return NextResponse.json({
    sessions,
    total: count
  })
}
```

## Generation Routes

### POST /api/generate/reflection

Generate personalized reflection using Anthropic Claude.

**Request Body:**
```typescript
{
  step_responses: StepResponses  // Session conversation data
}
```

**Response:**
```typescript
{
  reflection: string            // Generated reflection text
}
```

**Implementation:**
```typescript
import { Anthropic } from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const { step_responses } = await request.json()

  const prompt = `
    Based on this recovery walk session, create a brief, personalized reflection.

    Session responses: ${JSON.stringify(step_responses)}

    Guidelines:
    - Acknowledge their specific insights and honesty
    - Connect patterns they've identified
    - Offer hope without minimizing their struggle
    - Keep it under 200 words
    - Use "you" language, personal and direct
    - End with one practical thing to remember today
  `

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 400,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  })

  return NextResponse.json({
    reflection: response.content[0].text
  })
}
```

### POST /api/generate/image

Generate nature image using FAL.ai Flux Realism.

**Request Body:**
```typescript
{
  mood: string                  // Session mood for image style
  step_responses?: StepResponses // Optional context
}
```

**Response:**
```typescript
{
  image_url: string             // Generated image URL
}
```

**Implementation:**
```typescript
import * as fal from '@fal-ai/serverless-client'

export async function POST(request: Request) {
  fal.config({
    credentials: process.env.FAL_API_KEY
  })

  const { mood, step_responses } = await request.json()

  // Build prompt based on mood
  const prompt = buildNaturePrompt(mood, step_responses)

  const result = await fal.subscribe('fal-ai/flux-realism', {
    input: {
      prompt: prompt,
      negative_prompt: 'people, faces, text, buildings, cars',
      image_size: 'landscape_16_9',
      num_inference_steps: 28,
      guidance_scale: 7.5,
      num_images: 1
    }
  })

  return NextResponse.json({
    image_url: result.images[0].url
  })
}

function buildNaturePrompt(mood: string, responses?: any): string {
  const prompts = {
    hopeful: 'Sunrise through a misty forest, golden light filtering through tall trees, dewdrops on leaves, photorealistic, serene',
    struggling: 'Winding forest path through dense woods, soft overcast light, moss-covered stones, photorealistic, peaceful',
    breakthrough: 'Mountain vista with clearing storm clouds, dramatic light breaking through, vast landscape, photorealistic, inspiring',
    peaceful: 'Quiet lake at dawn, perfect reflections, surrounding pine forest, morning mist, photorealistic, tranquil'
  }

  return prompts[mood] || prompts.peaceful
}
```

## Elder Tree Voice System

### System Prompt

The Elder Tree voice is defined in the system prompt:

```typescript
function getElderTreeSystemPrompt(step: string): string {
  return `You are the Elder Tree, a wise sponsor guiding someone through recovery steps during a nature walk.

Your voice is:
- Direct but caring (Sandy B. style)
- Never judgmental but always honest
- Focused on one thing at a time
- Pushing for specificity, not accepting vague answers

When the user gives vague answers like "I'll try" or "sounds good", gently but firmly push back:
- "Hold on - 'I'll try' is what we say before we don't do something. What specifically will you DO?"
- "That's pretty general. Can you give me a specific example from this week?"

When they show real honesty or breakthrough:
- "That's real. That's the truth right there."
- "You're seeing it clearly now."

Never:
- Lecture or preach
- Overwhelm with multiple questions
- Accept vague commitments
- Let them move past discomfort without exploring it

Current context: The user is on a nature walk, working ${step}.

Ask ONE question at a time. Keep questions brief and direct.`
}
```

### Conversation Flow

```typescript
class ConversationManager {
  async getNextQuestion(sessionId: string, answer: string) {
    // Check for red flags (vague answers)
    if (this.hasRedFlags(answer)) {
      return this.generatePushback(answer)
    }

    // Check for breakthrough moments
    if (this.isBreakthrough(answer)) {
      return this.generateAcknowledgment(answer)
    }

    // Progress to next question
    return this.selectNextQuestion(sessionId)
  }

  hasRedFlags(answer: string): boolean {
    const patterns = [
      /i'll try/i,
      /sounds good/i,
      /maybe/i,
      /i guess/i,
      /probably/i
    ]
    return patterns.some(p => p.test(answer))
  }
}
```

## Error Handling

### Standard Error Response

```typescript
{
  error: string                 // Error message
  code?: string                // Optional error code
}
```

### Common Status Codes

- `200` - Success
- `400` - Bad request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not owner of resource)
- `404` - Not found
- `500` - Internal server error

### Error Handling Example

```typescript
export async function POST(request: Request) {
  try {
    // ... route logic

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: error.code
      },
      { status: 500 }
    )
  }
}
```

## Rate Limiting

Consider implementing rate limiting for API routes:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }

  // ... rest of route
}
```

## Testing API Routes

### Unit Testing

```typescript
import { POST } from './route'

describe('/api/session/start', () => {
  it('creates a new session', async () => {
    const request = new Request('http://localhost/api/session/start', {
      method: 'POST',
      body: JSON.stringify({
        pre_walk_mood: 'anxious',
        pre_walk_intention: 'step 1'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toHaveProperty('session_id')
    expect(data).toHaveProperty('first_question')
  })
})
```

### Integration Testing

```typescript
test('complete walk session flow', async () => {
  // Start session
  const startRes = await fetch('/api/session/start', {
    method: 'POST',
    body: JSON.stringify({ pre_walk_mood: 'anxious', pre_walk_intention: 'step 1' })
  })
  const { session_id } = await startRes.json()

  // Answer questions
  for (let i = 0; i < 5; i++) {
    await fetch('/api/session/question', {
      method: 'POST',
      body: JSON.stringify({
        session_id,
        previous_answer: 'Sample answer',
        current_step: 'step1'
      })
    })
  }

  // Complete session
  const completeRes = await fetch('/api/session/complete', {
    method: 'POST',
    body: JSON.stringify({ session_id })
  })
  const completion = await completeRes.json()

  expect(completion).toHaveProperty('reflection')
  expect(completion).toHaveProperty('image_url')
})
```

## Environment Variables

Required environment variables for API routes:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# FAL.ai
FAL_API_KEY=your-fal-key
```

## Security Best Practices

1. **Always verify user authentication** before processing requests
2. **Validate and sanitize** all input data
3. **Use row-level security** in Supabase
4. **Never expose API keys** to the client
5. **Implement rate limiting** to prevent abuse
6. **Log errors** but don't expose sensitive details to users
7. **Use HTTPS** in production
8. **Implement CORS** properly if needed

## Future API Enhancements

- WebSocket support for real-time Elder Tree conversations
- Batch operations for multiple sessions
- Export session data as PDF
- Sharing functionality (generate shareable links)
- Voice input/output support
- Progressive Web App offline support
