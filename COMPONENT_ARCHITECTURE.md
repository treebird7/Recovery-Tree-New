# 🏗️ Component Architecture - Recovery Tree
*Design-System-Ready Component Specifications*

**Version:** 1.0
**Date:** 2025-11-09
**Author:** Watson (Strategy & Architecture)
**For:** Sancho (Implementation) + Maude (Design Reference)

---

## 🎯 Purpose

This document defines the technical architecture for Recovery Tree's UI components, designed to support Maude's therapeutic design philosophy while maintaining clean, maintainable code.

**Core Principle:** Every component must support emotional regulation through timing, spacing, and gentle state transitions.

---

## 🌿 Design Token Integration

### Token System Location
```
/design/system/tokens.json
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'calm-green': '#4A7C59',
        'soft-white': '#F8F9FA',
        'soft-gray': '#6B7280',
        'earth-brown': '#7B5E57',
        'moss-gold': '#B8A665',
      },
      spacing: {
        'breathing': '2rem',
        'card-margin': '1rem',
      },
      fontFamily: {
        'guidance': ['Inter', 'sans-serif'],
        'elder': ['Georgia', 'serif'],
      },
      fontSize: {
        'guidance': ['18px', { lineHeight: '1.6' }],
        'elder': ['16px', { lineHeight: '1.8' }],
      },
      transitionDuration: {
        'breathe-in': '1500ms',
        'breathe-out': '1000ms',
        'pause': '2000ms',
      },
    },
  },
}
```

---

## 🧩 Core Components

### 1. BreathingText

**Purpose:** Display guidance text with calm, sentence-by-sentence animation

**Props:**
```typescript
interface BreathingTextProps {
  sentences: string[];
  timing?: {
    fadeIn?: number;      // Default: 1500ms
    hold?: number;        // Default: 4000ms
    fadeOut?: number;     // Default: 1000ms
    pauseBetween?: number; // Default: 2000ms
  };
  keepPrevious?: boolean; // Show previous sentences or fade them out
  onComplete?: () => void; // Called when all sentences shown
}
```

**Behavior:**
1. Start with opacity 0
2. Fade in first sentence (1.5s)
3. Hold visible (4s)
4. Fade out (1s) OR keep visible (if keepPrevious=true)
5. Pause (2s)
6. Repeat for next sentence

**Usage:**
```tsx
<BreathingText
  sentences={[
    "Find a quiet place to sit.",
    "Close your eyes if it feels safe.",
    "Notice your breathing."
  ]}
  keepPrevious={true}
  onComplete={() => showNextStep()}
/>
```

**Implementation Notes:**
- Use CSS transitions, not JS animations
- Respect `prefers-reduced-motion`
- Text should be centered, max-width 600px
- Font: guidance (Inter 18-20px / 1.6-1.8)

---

### 2. ReflectionCard

**Purpose:** Display Elder Tree responses with warmth and breathing space

**Props:**
```typescript
interface ReflectionCardProps {
  content: string;
  type?: 'elder' | 'insight' | 'encouragement';
  tone?: 'gentle' | 'direct' | 'inquisitive';
  showIcon?: boolean;
}
```

**Visual States:**
- Default: Soft background, rounded corners
- Elder: Slightly warmer tone, tree icon
- Insight: Subtle highlight, lightbulb icon
- Encouragement: Soft gold accent

**Styling:**
```css
.reflection-card {
  background: soft-white;
  border: 1px solid soft-gray;
  border-radius: 12px;
  padding: breathing (2rem);
  margin: card-margin (1rem);
  font-family: elder (Georgia);
  font-size: 16px;
  line-height: 1.8;
}
```

**Behavior:**
- Fade in over 1.5s
- Never appear instantly
- Breathing space around all edges
- No shadows (keeps stillness)

---

### 3. TreeGrowthCanvas

**Purpose:** Visual progress indicator without race/competition feeling

**Props:**
```typescript
interface TreeGrowthCanvasProps {
  stage: number;        // 0-100 growth percentage
  showRings?: boolean;  // Tree ring visualization
  animate?: boolean;    // Gentle growth animation
  onStageChange?: (stage: number) => void;
}
```

**Visual Approach:**
- NOT a progress bar
- Shows tree growing organically
- Rings appear gradually
- No numbers/percentages visible unless requested
- Earthy colors: earth-brown, moss-gold, calm-green

**Animation:**
- Slow, organic growth
- No sudden jumps
- Respects reduced motion preferences

**Implementation:**
- SVG-based for scalability
- Canvas API for complex animations
- Cached renders for performance

---

### 4. CalmChoiceGrid

**Purpose:** Present options without overwhelming the user

**Props:**
```typescript
interface CalmChoiceGridProps {
  choices: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
  columns?: 1 | 2 | 3;     // Default: 2
  onSelect: (id: string) => void;
  spacing?: 'compact' | 'breathing'; // Default: breathing
}
```

**Visual Rules:**
- Maximum 6 choices visible at once
- If more needed, use progressive disclosure
- Each choice has breathing space
- Hover states are subtle (no aggressive highlights)
- Selected state is clear but calm

**Layout:**
```css
.choice-grid {
  display: grid;
  gap: breathing (2rem);
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.choice-card {
  background: soft-white;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 300ms ease;
}

.choice-card:hover {
  border-color: calm-green;
}

.choice-card.selected {
  border-color: calm-green;
  background: rgba(74, 124, 89, 0.05);
}
```

---

### 5. PauseOverlay

**Purpose:** Intervention moments - pause between trigger and action

**Props:**
```typescript
interface PauseOverlayProps {
  duration: number;      // Seconds for the pause
  message?: string;      // Optional custom message
  onComplete: () => void;
  allowEarlyExit?: boolean; // User can skip if needed
}
```

**Behavior:**
1. Fullscreen overlay (not modal - can't click outside)
2. Breathing animation (gentle pulse)
3. Countdown shows remaining time
4. Message appears sentence by sentence
5. After duration, gentle exit animation

**Visual:**
- Semi-transparent background (not solid black)
- Message in guidance font
- Breathing animation on text
- No aggressive colors
- Optional "I'm ready" button if allowEarlyExit=true

**Usage:**
```tsx
<PauseOverlay
  duration={60}
  message="You chose to pause. This is courage."
  onComplete={() => navigateToNextStep()}
  allowEarlyExit={true}
/>
```

---

## 🎭 Animation System

### useRecoveryAnimation Hook

**Purpose:** Centralized animation timing that respects user preferences
```typescript
export function useRecoveryAnimation(
  type: 'breathe' | 'fade' | 'grow' | 'pulse'
) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const userSpeed = useUserPreference('animation_speed'); // 0.5 - 2.0

  const baseTimings = {
    breathe: { duration: 1500, easing: 'ease-in-out' },
    fade: { duration: 1000, easing: 'ease' },
    grow: { duration: 2000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    pulse: { duration: 3000, easing: 'ease-in-out' },
  };

  if (prefersReducedMotion) {
    return { duration: 0, easing: 'linear' };
  }

  const timing = baseTimings[type];
  return {
    duration: timing.duration * userSpeed,
    easing: timing.easing,
  };
}
```

### Animation Utilities
```typescript
// Breathing animation for text
export const breatheIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const breatheOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
`;

// Gentle pulse for pause overlays
export const gentlePulse = keyframes`
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
`;
```

---

## 🗄️ State Management

### UI Preferences Schema
```sql
CREATE TABLE user_ui_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  animation_speed DECIMAL DEFAULT 1.0,
  breathing_pause_ms INTEGER DEFAULT 2000,
  reduced_motion BOOLEAN DEFAULT FALSE,
  theme_preference TEXT DEFAULT 'nature',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### UI State Type
```typescript
type UIState =
  | 'pause'           // User initiated pause
  | 'reflecting'      // Showing Elder Tree response
  | 'breakthrough'    // Positive milestone
  | 'relapse'         // Gentle acknowledgment
  | 'growth'          // Progress visualization
  | 'neutral';        // Default calm state

interface UIStateConfig {
  state: UIState;
  timing: {
    fadeIn: number;
    fadeOut: number;
    hold: number;
  };
  colors: {
    primary: string;
    background: string;
  };
}
```

### State Transitions

All state changes must be gentle:
```typescript
export function useUIStateTransition() {
  const [state, setState] = useState<UIState>('neutral');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transition = async (newState: UIState) => {
    setIsTransitioning(true);

    // Fade out current state
    await delay(1000);

    // Change state
    setState(newState);

    // Fade in new state
    await delay(1500);

    setIsTransitioning(false);
  };

  return { state, transition, isTransitioning };
}
```

---

## 📱 Responsive Design

### Mobile-First Principles

1. **Minimum touch targets:** 44x44px
2. **Breathing space scales:** 2rem → 1rem on mobile
3. **Text remains legible:** Never below 16px
4. **Animations respect battery:** Reduced on low power mode

### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // Phone landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape
  xl: '1280px',  // Desktop
};
```

### Mobile Adaptations
```css
/* Desktop: Breathing space */
.recovery-container {
  padding: 2rem;
}

/* Mobile: Compact but not cramped */
@media (max-width: 640px) {
  .recovery-container {
    padding: 1rem;
  }

  .breathing-text {
    font-size: 16px; /* Slightly smaller */
  }
}
```

---

## ♿ Accessibility

### Required Standards

1. **WCAG 2.1 AA minimum**
2. **Keyboard navigation:** All interactive elements
3. **Screen reader support:** ARIA labels where needed
4. **Focus indicators:** Visible and calm (not aggressive)
5. **Color contrast:** Minimum 4.5:1 for text

### Reduced Motion
```typescript
const useReducedMotion = () => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

// In components:
const animation = useReducedMotion()
  ? { duration: 0 }
  : { duration: 1500, easing: 'ease' };
```

### Focus Management
```css
/* Calm focus indicator */
*:focus-visible {
  outline: 2px solid calm-green;
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## 🧪 Testing Strategy

### Component Testing

Each component needs:
1. **Render test:** Does it appear?
2. **Timing test:** Animations work correctly?
3. **Reduced motion test:** Respects preferences?
4. **Accessibility test:** Keyboard + screen reader?

### Example Test
```typescript
describe('BreathingText', () => {
  it('shows sentences with correct timing', async () => {
    const { getByText } = render(
      <BreathingText sentences={['First', 'Second']} />
    );

    // First sentence appears
    await waitFor(() => expect(getByText('First')).toBeVisible());

    // Second sentence appears after timing
    await waitFor(() => expect(getByText('Second')).toBeVisible(), {
      timeout: 6000 // fadeIn + hold + fadeOut + pause
    });
  });

  it('respects reduced motion preference', () => {
    mockMediaQuery('(prefers-reduced-motion: reduce)');
    // Test instant display
  });
});
```

---

## 📦 Component Library Structure
```
components/
├── recovery/
│   ├── BreathingText.tsx
│   ├── BreathingText.test.tsx
│   ├── ReflectionCard.tsx
│   ├── ReflectionCard.test.tsx
│   ├── TreeGrowthCanvas.tsx
│   ├── TreeGrowthCanvas.test.tsx
│   ├── CalmChoiceGrid.tsx
│   ├── CalmChoiceGrid.test.tsx
│   ├── PauseOverlay.tsx
│   └── PauseOverlay.test.tsx
├── design-system/
│   ├── tokens.ts          // From Maude's JSON
│   ├── animations.ts      // Animation utilities
│   ├── hooks.ts          // useRecoveryAnimation, etc.
│   └── utils.ts          // Helper functions
└── ui/                    // Generic UI components
    ├── Button.tsx
    ├── Card.tsx
    └── Input.tsx
```

---

## 🔄 Dizzy Integration (Notion AI Bridge)

### Architecture Position
```
Notion (Design Briefs)
    ↓
Zapier (AI by Zapier)
    ↓
Dizzy (Summary Generation)
    ↓
Supabase (dizzy_logs table)
    ↓
Recovery Tree UI (Log View)
```

### Dizzy Logs Schema
```sql
CREATE TABLE dizzy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL,           -- Notion page ID
  role TEXT NOT NULL,               -- 'maude' | 'watson' | 'sancho'
  content TEXT NOT NULL,            -- Summary from Dizzy
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  zap_meta JSONB                    -- Metadata from Zapier
);

CREATE INDEX idx_dizzy_logs_page ON dizzy_logs(page_id);
CREATE INDEX idx_dizzy_logs_role ON dizzy_logs(role);
```

### API Endpoint
```typescript
// app/api/dizzy/logs/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get('page_id');
  const role = searchParams.get('role');

  const query = supabase
    .from('dizzy_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (pageId) query.eq('page_id', pageId);
  if (role) query.eq('role', role);

  const { data, error } = await query;

  return Response.json({ logs: data });
}
```

### UI Display
```tsx
<DizzyLogViewer
  pageId="design-brief-123"
  role="maude"
  limit={10}
/>
```

---

## 🚀 Implementation Priority

### Phase 1: Foundation (Today)
1. ✅ Set up design tokens in Tailwind
2. ✅ Create animation utilities
3. ✅ Build useRecoveryAnimation hook

### Phase 2: Core Components (Tomorrow)
4. ✅ BreathingText component
5. ✅ ReflectionCard component
6. ✅ CalmChoiceGrid component

### Phase 3: Advanced (Day After)
7. ✅ TreeGrowthCanvas component
8. ✅ PauseOverlay component
9. ✅ Dizzy logs integration

---

## 📝 Notes for Sancho

**When implementing:**
- Start with tokens (Tailwind config)
- Build simplest component first (ReflectionCard)
- Test animations with reduced motion
- Use TypeScript strictly
- Keep components pure (no side effects)
- All animations CSS-based when possible

**When stuck:**
- Reference Maude's Figma specs
- Ask Watson for architecture guidance
- Test in browser with actual content

**Quality bar:**
- Does it feel calm?
- Can you breathe while using it?
- Would this help someone pause?

If no, redesign.

---

*Last Updated: 2025-11-09*
*Author: Watson*
*For: Recovery Tree Component System v1.0*
