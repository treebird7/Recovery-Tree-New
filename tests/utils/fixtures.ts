/**
 * Test data fixtures for E2E tests
 */

/**
 * Walk session check-in options
 */
export const walkCheckInData = {
  steps: [1, 2, 3] as const,

  moods: [
    'calm',
    'anxious',
    'hopeful',
    'struggling',
    'grateful',
    'overwhelmed',
  ],

  locations: [
    'park',
    'neighborhood',
    'trail',
    'backyard',
    'beach',
    'indoor',
  ],

  bodyNeeds: [
    'rest',
    'movement',
    'water',
    'food',
    'fresh-air',
    'warmth',
  ],

  intentions: [
    'Work through my first step honestly',
    'Find clarity about my powerlessness',
    'Connect with my higher power',
    'Get honest about my behavior',
    'Seek guidance for today',
  ],
};

/**
 * Sample walk session responses
 */
export const walkResponses = {
  step1: [
    'I have been struggling with controlling my drinking. Every time I tell myself I will just have one, I end up having more. Last week I promised my family I would stop, but I relapsed again.',
    'It happened at the work party. I told myself I could handle it, that I would just have a couple drinks. But once I started, I could not stop. I ended up embarrassing myself in front of my colleagues.',
    'I felt ashamed and powerless. In that moment, I knew I had lost control again, but I could not stop myself. It is like there is a part of me that takes over.',
  ],

  step2: [
    'I do not really believe in God, but I am open to the idea that there could be something bigger than me. Maybe it is the group, or nature, or just the collective wisdom of people in recovery.',
    'When I am in a meeting and I hear people share their stories, I feel less alone. There is something powerful about that connection. Maybe that is my higher power - the power of community and shared experience.',
    'Last week I was feeling really hopeless, but then I went for a walk in the woods and felt this sense of peace. Like maybe there is something out there that wants me to be okay.',
  ],

  step3: [
    'The idea of turning my will over is scary. I am used to trying to control everything. But clearly my way has not been working.',
    'I am willing to try. I do not fully understand what it means to turn things over to a higher power, but I am tired of fighting this alone.',
    'This morning I woke up and instead of making all these plans and promises to myself, I just asked for help. Just said I cannot do this alone. It felt like a relief, honestly.',
  ],

  vague: [
    'I do not know, I guess I will try to do better.',
    'Maybe I should think about it more.',
    'I will probably work on that eventually.',
  ],

  honest: [
    'Last Tuesday I lied to my wife about where I was. I told her I was working late, but I was actually at a bar.',
    'I have been isolating from my friends because I am ashamed. I used to go to the gym with them, but now I make excuses.',
    'Yesterday I snapped at my kid for no reason. They just asked me a question and I yelled. I saw the hurt in their eyes and I hated myself for it.',
  ],
};

/**
 * Urge support scenarios
 */
export const urgeScenarios = {
  low: {
    intensity: 2,
    description: 'I had a stressful day at work and I keep thinking about having a drink to relax.',
  },

  medium: {
    intensity: 5,
    description: 'I ran into my old drinking buddy today and they invited me out. I said no, but now I am really struggling with cravings.',
  },

  high: {
    intensity: 7,
    description: 'I got into a fight with my partner and I am feeling really anxious and angry. The urge to use is really strong right now.',
  },

  crisis: {
    intensity: 9,
    description: 'I just got fired and I am spiraling. I keep thinking about how one drink would make this all feel better. I need help.',
  },
};

/**
 * Mining timer durations
 */
export const miningDurations = {
  short: { label: '30 minutes', value: 30, minutes: 30 },
  medium: { label: '1 hour', value: 60, minutes: 60 },
  long: { label: '2 hours', value: 120, minutes: 120 },
  morning: { label: 'Until morning', value: 'until-morning', minutes: 480 },
  custom: { label: 'Custom', value: 'custom', minutes: 90 },
};

/**
 * Daily inventory responses
 */
export const inventoryResponses = {
  positive: {
    wentWell: 'I made it to my morning meeting and shared honestly about my struggles. My sponsor called me back right away and we talked for 30 minutes. I also went for a walk instead of sitting around feeling sorry for myself.',
    struggles: 'I got triggered when I saw alcohol at the grocery store. I felt angry about having to avoid certain aisles. Also had trouble sleeping because my mind was racing with worries.',
    gratitude: 'I am grateful for my sponsor who always picks up the phone. Grateful for my morning coffee. Grateful that I made it through another day sober.',
    intention: 'Tomorrow I want to call someone in my network just to check in, not because I am in crisis. I want to be of service instead of just taking.',
  },

  struggling: {
    wentWell: 'I did not drink today, even though I wanted to. That is something.',
    struggles: 'Pretty much everything felt hard today. Work was stressful, I am lonely, and I am not sure this is working. I keep questioning if I really have a problem.',
    gratitude: 'I guess I am grateful I have a bed to sleep in. And that I found this app.',
    intention: 'Try to get through tomorrow without using. Maybe call my sponsor if I remember.',
  },

  hopeful: {
    wentWell: 'Today I actually felt happy for the first time in months. I laughed at a joke a coworker made. I enjoyed my lunch. These little things feel huge after so much darkness.',
    struggles: 'I am almost afraid to feel this good. Like waiting for the other shoe to drop. Old voice saying you do not deserve to feel this happy.',
    gratitude: 'I am grateful for this glimpse of what life could be like. Grateful for the people who told me it gets better - they were right. Grateful I did not give up.',
    intention: 'Tomorrow I want to share my experience with someone new in recovery. Let them know it does get better. Be the hope I needed to see.',
  },
};

/**
 * Walkabout scenarios
 */
export const walkaboutScenarios = {
  park: {
    location: 'park',
    bodyNeed: 'fresh-air',
    duration: 15, // minutes
  },

  trail: {
    location: 'trail',
    bodyNeed: 'movement',
    duration: 30,
  },

  neighborhood: {
    location: 'neighborhood',
    bodyNeed: 'rest',
    duration: 10,
  },
};

/**
 * Expected coin calculations
 * 1 coin = 1 minute of activity
 */
export const coinCalculations = {
  walk45min: 45,
  mining1hr: 60,
  mining2hr: 120,
  walkabout15min: 15,
  walkabout30min: 30,
};

/**
 * Elder Tree response patterns for validation
 */
export const elderTreePatterns = {
  validation: [
    /I (hear|see) you/i,
    /That('s| is) (real|honest|important)/i,
    /Thanks for (being honest|sharing|reaching out)/i,
  ],

  challenge: [
    /Can you (give me|tell me about) a specific example/i,
    /What does that look like in your life/i,
    /Let's get more specific/i,
  ],

  encouragement: [
    /(You're|You are) (doing|showing)/i,
    /Keep (coming back|showing up|going)/i,
    /(That took|This takes) (courage|guts|strength)/i,
  ],

  crisis: [
    /This (feeling|urge) will pass/i,
    /You('ve| have) got (time|choices|options)/i,
    /Will you (rest|stay) with me/i,
  ],
};

/**
 * Navigation paths for testing
 */
export const navigationPaths = {
  dashboard: '/dashboard',
  walk: '/walk',
  walkSession: '/walk/session',
  walkComplete: '/walk/complete',
  urge: '/urge',
  urgeMining: '/urge/mining',
  urgeReveal: '/urge/reveal',
  walkabout: '/walkabout',
  walkaboutActive: '/walkabout/active',
  inventory: '/inventory',
  inventoryHistory: '/inventory/history',
  pricing: '/pricing',
  login: '/login',
  signup: '/signup',
};

/**
 * Test user stats for dashboard validation
 */
export const dashboardStats = {
  newUser: {
    completedWalks: 0,
    dayStreak: 0,
    coins: 0,
    inventoryStreak: 0,
  },

  activeUser: {
    completedWalks: 5,
    dayStreak: 3,
    coins: 250,
    inventoryStreak: 3,
  },
};
