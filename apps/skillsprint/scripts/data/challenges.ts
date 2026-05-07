export type TrackId = 'coding' | 'design' | 'writing' | 'critical_thinking';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeType =
  | 'fill_in_blank'
  | 'multiple_choice'
  | 'code_reading'
  | 'writing_prompt'
  | 'design_critique';

export interface FillInBlankContent {
  codeSnippet: string;
  language: string;
  correctAnswer: string;
  hint: string;
}

export interface MultipleChoiceContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CodeReadingContent {
  codeSnippet: string;
  language: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WritingPromptContent {
  prompt: string;
  minWords: number;
  scoringCriteria: string[];
}

export interface DesignCritiqueContent {
  imageUrl: string;
  designPrompt: string;
  scoringCriteria: string[];
}

export interface Challenge {
  id: string;
  track: TrackId;
  type: ChallengeType;
  difficulty: Difficulty;
  content:
    | FillInBlankContent
    | MultipleChoiceContent
    | CodeReadingContent
    | WritingPromptContent
    | DesignCritiqueContent;
  estimatedMinutes: number;
  tags: string[];
}

export const challenges: Challenge[] = [
  // ─── CODING: fill_in_blank (5) ───────────────────────────────────────────

  {
    id: 'cod-fib-001',
    track: 'coding',
    type: 'fill_in_blank',
    difficulty: 'easy',
    content: {
      codeSnippet: 'const nums = [1, 2, 3];\nconst doubled = nums.__BLANK__(n => n * 2);',
      language: 'js',
      correctAnswer: 'map',
      hint: 'Creates a new array by transforming each element',
    } satisfies FillInBlankContent,
    estimatedMinutes: 5,
    tags: ['javascript', 'arrays', 'functional'],
  },
  {
    id: 'cod-fib-002',
    track: 'coding',
    type: 'fill_in_blank',
    difficulty: 'easy',
    content: {
      codeSnippet: 'const [count, __BLANK__] = useState(0);',
      language: 'tsx',
      correctAnswer: 'setCount',
      hint: 'Convention is "set" + capitalized state variable name',
    } satisfies FillInBlankContent,
    estimatedMinutes: 3,
    tags: ['react', 'hooks', 'state'],
  },
  {
    id: 'cod-fib-003',
    track: 'coding',
    type: 'fill_in_blank',
    difficulty: 'medium',
    content: {
      codeSnippet:
        'async function fetchUser(id: string) {\n  const res = __BLANK__ fetch(`/users/${id}`);\n  return res.json();\n}',
      language: 'ts',
      correctAnswer: 'await',
      hint: 'Pauses execution until the Promise resolves',
    } satisfies FillInBlankContent,
    estimatedMinutes: 5,
    tags: ['typescript', 'async', 'promises'],
  },
  {
    id: 'cod-fib-004',
    track: 'coding',
    type: 'fill_in_blank',
    difficulty: 'medium',
    content: {
      codeSnippet: 'function identity__BLANK__(arg: T): T {\n  return arg;\n}',
      language: 'ts',
      correctAnswer: '<T>',
      hint: 'Declare a type parameter between angle brackets on the function name',
    } satisfies FillInBlankContent,
    estimatedMinutes: 5,
    tags: ['typescript', 'generics'],
  },
  {
    id: 'cod-fib-005',
    track: 'coding',
    type: 'fill_in_blank',
    difficulty: 'medium',
    content: {
      codeSnippet: 'const total = [10, 20, 30].__BLANK__((acc, n) => acc + n, 0);',
      language: 'js',
      correctAnswer: 'reduce',
      hint: 'Accumulates array values into a single output',
    } satisfies FillInBlankContent,
    estimatedMinutes: 5,
    tags: ['javascript', 'arrays', 'functional'],
  },

  // ─── CODING: multiple_choice (6) ─────────────────────────────────────────

  {
    id: 'cod-mcq-001',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'What does the following closure print?\n\nfunction makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst c = makeCounter();\nconsole.log(c(), c(), c());',
      options: ['1 2 3', '0 1 2', '1 1 1', 'undefined undefined undefined'],
      correctIndex: 0,
      explanation:
        'Each call to c() increments the closed-over count variable and returns the new value. Starting from 0: ++count gives 1, then 2, then 3.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['javascript', 'closures', 'scope'],
  },
  {
    id: 'cod-mcq-002',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correctIndex: 2,
      explanation:
        'Binary search halves the search space with each comparison, giving O(log n) time complexity.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['algorithms', 'big-o', 'search'],
  },
  {
    id: 'cod-mcq-003',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question: 'Which CSS selector has the highest specificity?',
      options: ['div p { }', '.container p { }', '#header p { }', '* p { }'],
      correctIndex: 2,
      explanation:
        'ID selectors have the highest specificity (0,1,0,0), beating class selectors (0,0,1,0) and element selectors (0,0,0,1). The * wildcard adds 0.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['css', 'specificity'],
  },
  {
    id: 'cod-mcq-004',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'In React, when does useEffect run if its dependency array is empty ([])?',
      options: [
        'On every render',
        'Only on mount and unmount',
        'On mount only, cleanup never runs',
        'Never',
      ],
      correctIndex: 1,
      explanation:
        'An empty dependency array means the effect runs once after mount. The cleanup function (if returned) runs on unmount.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['react', 'hooks', 'effects'],
  },
  {
    id: 'cod-mcq-005',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'What is the key difference between `interface` and `type` in TypeScript?',
      options: [
        'interfaces can only describe objects; types can describe any shape',
        'interfaces support declaration merging; types do not',
        'types are faster to compile than interfaces',
        'There is no practical difference',
      ],
      correctIndex: 1,
      explanation:
        'Interfaces support declaration merging (two declarations with the same name merge their members), while type aliases do not. Both can describe objects, unions, and intersections.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['typescript', 'interfaces', 'types'],
  },
  {
    id: 'cod-mcq-006',
    track: 'coding',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'What does `git rebase main` do when run on a feature branch?',
      options: [
        'Merges main into the feature branch, creating a merge commit',
        'Moves the feature branch commits to start from the tip of main',
        'Copies main commits into the feature branch',
        'Resets the feature branch to match main',
      ],
      correctIndex: 1,
      explanation:
        'Rebase replays the feature branch commits on top of the current tip of main, creating a linear history without a merge commit.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['git', 'rebase', 'branching'],
  },

  // ─── CODING: code_reading (5) ────────────────────────────────────────────

  {
    id: 'cod-crx-001',
    track: 'coding',
    type: 'code_reading',
    difficulty: 'medium',
    content: {
      codeSnippet:
        'const arr = [1, 2, 3, 4, 5];\nconst result = arr\n  .filter(n => n % 2 === 0)\n  .map(n => n * n);\nconsole.log(result);',
      language: 'js',
      question: 'What does this code print?',
      options: ['[4, 16]', '[1, 4, 9, 16, 25]', '[2, 4]', '[4, 9, 16]'],
      correctIndex: 0,
      explanation:
        'filter(n => n % 2 === 0) keeps [2, 4], then map(n => n * n) squares them to [4, 16].',
    } satisfies CodeReadingContent,
    estimatedMinutes: 7,
    tags: ['javascript', 'arrays', 'functional'],
  },
  {
    id: 'cod-crx-002',
    track: 'coding',
    type: 'code_reading',
    difficulty: 'hard',
    content: {
      codeSnippet:
        "console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
      language: 'js',
      question: 'What is the output order?',
      options: ['1 2 3 4', '1 4 3 2', '1 4 2 3', '4 1 3 2'],
      correctIndex: 1,
      explanation:
        'Synchronous code runs first (1, 4). Microtasks (Promises) run before macrotasks (setTimeout). So: 1, 4, 3, 2.',
    } satisfies CodeReadingContent,
    estimatedMinutes: 10,
    tags: ['javascript', 'event-loop', 'async', 'promises'],
  },
  {
    id: 'cod-crx-003',
    track: 'coding',
    type: 'code_reading',
    difficulty: 'medium',
    content: {
      codeSnippet:
        'type Unwrap<T> = T extends Promise<infer U> ? U : T;\ntype A = Unwrap<Promise<string>>;\ntype B = Unwrap<number>;',
      language: 'ts',
      question: 'What are the resolved types of A and B?',
      options: [
        'A = Promise<string>, B = number',
        'A = string, B = number',
        'A = string, B = never',
        'A = unknown, B = number',
      ],
      correctIndex: 1,
      explanation:
        'The conditional type unwraps Promise<string> to string. For number (not a Promise), it returns T directly, so B = number.',
    } satisfies CodeReadingContent,
    estimatedMinutes: 10,
    tags: ['typescript', 'generics', 'conditional-types'],
  },
  {
    id: 'cod-crx-004',
    track: 'coding',
    type: 'code_reading',
    difficulty: 'easy',
    content: {
      codeSnippet:
        "function greet(name: string = 'World') {\n  return `Hello, ${name}!`;\n}\nconsole.log(greet());\nconsole.log(greet('Alice'));",
      language: 'ts',
      question: 'What are the two outputs?',
      options: [
        '"Hello, undefined!" and "Hello, Alice!"',
        '"Hello, World!" and "Hello, Alice!"',
        '"Hello, !" and "Hello, Alice!"',
        'Error on first call',
      ],
      correctIndex: 1,
      explanation:
        'Default parameter "World" is used when no argument is passed. The second call passes "Alice", overriding the default.',
    } satisfies CodeReadingContent,
    estimatedMinutes: 5,
    tags: ['typescript', 'default-params'],
  },
  {
    id: 'cod-crx-005',
    track: 'coding',
    type: 'code_reading',
    difficulty: 'hard',
    content: {
      codeSnippet:
        'function useData() {\n  if (Math.random() > 0.5) {\n    const [data, setData] = useState(null);\n  }\n  return null;\n}',
      language: 'tsx',
      question: 'What is wrong with this React hook usage?',
      options: [
        'useState cannot be used in functions',
        'Hooks cannot be called conditionally — they must be called in the same order every render',
        'The function name must start with "Component"',
        'useState does not accept null as an initial value',
      ],
      correctIndex: 1,
      explanation:
        "React's Rules of Hooks require that hooks are always called at the top level, never inside conditionals or loops, to ensure consistent call order across renders.",
    } satisfies CodeReadingContent,
    estimatedMinutes: 7,
    tags: ['react', 'hooks', 'rules-of-hooks'],
  },

  // ─── DESIGN: multiple_choice (9) ─────────────────────────────────────────

  {
    id: 'des-mcq-001',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question:
        'WCAG 2.1 requires a minimum contrast ratio of ____ for normal body text to meet AA compliance.',
      options: ['3:1', '4.5:1', '7:1', '2:1'],
      correctIndex: 1,
      explanation:
        'WCAG 2.1 Level AA requires a minimum 4.5:1 contrast ratio for normal text. Large text (18pt+ or 14pt bold) only needs 3:1.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['accessibility', 'contrast', 'wcag'],
  },
  {
    id: 'des-mcq-002',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question: 'In typography, what does "leading" refer to?',
      options: [
        'The width between letters (tracking)',
        'The vertical space between lines of text',
        'The weight of a typeface',
        'The horizontal padding around a text block',
      ],
      correctIndex: 1,
      explanation:
        'Leading is the vertical distance between baselines of consecutive lines of text. The name comes from strips of lead used in metal typesetting.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['typography', 'leading', 'line-height'],
  },
  {
    id: 'des-mcq-003',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'Which color model is most appropriate for designing UI that will be displayed on screens?',
      options: ['CMYK', 'RGB', 'Pantone', 'HSL only'],
      correctIndex: 1,
      explanation:
        'RGB (Red, Green, Blue) is the additive color model used by screens. CMYK is for print. HSL/HSB are alternative representations of RGB and are also screen-appropriate, but the base model is RGB.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['color', 'color-model', 'rgb'],
  },
  {
    id: 'des-mcq-004',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'In an 8-point spacing system, which of these is NOT a valid spacing value?',
      options: ['8px', '16px', '24px', '10px'],
      correctIndex: 3,
      explanation:
        'An 8-point grid uses multiples of 8: 8, 16, 24, 32, 40, 48… 10px is not a multiple of 8. This system creates visual consistency across a layout.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['spacing', 'grid', '8-point'],
  },
  {
    id: 'des-mcq-005',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question: 'What is a "component" in Figma?',
      options: [
        'A group of layers that cannot be edited',
        'A reusable design element that can have instances updated from a master',
        'A frame with auto-layout enabled',
        'A color style saved to the team library',
      ],
      correctIndex: 1,
      explanation:
        'A Figma component is a reusable element (the main component) from which instances are created. Changes to the main component propagate to all instances, enabling scalable design systems.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['figma', 'components', 'design-systems'],
  },
  {
    id: 'des-mcq-006',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'The "F-pattern" scanning behavior in UX research describes how users primarily read:',
      options: [
        'Diagonally from center to corners',
        'Two horizontal bands across the top, then vertically down the left side',
        'In a Z-pattern from top-right to bottom-left',
        'Focused entirely on images before reading text',
      ],
      correctIndex: 1,
      explanation:
        'Eye-tracking studies (Nielsen, 2006) show users often read in an F-shape: two horizontal sweeps near the top, then a vertical scan down the left edge. This informs where to place the most important content.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['ux', 'reading-patterns', 'eye-tracking'],
  },
  {
    id: 'des-mcq-007',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'Which mobile gesture is most appropriate for deleting an item in a list on iOS?',
      options: [
        'Double-tap',
        'Long press then drag',
        'Swipe left to reveal a delete action',
        'Pinch to remove',
      ],
      correctIndex: 2,
      explanation:
        'Swipe-left-to-delete is the iOS platform convention for list item deletion (used in Mail, Messages, etc.). Following platform conventions reduces the learning curve for users.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['mobile', 'gestures', 'ios', 'platform-conventions'],
  },
  {
    id: 'des-mcq-008',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'What is the primary purpose of a type scale in a design system?',
      options: [
        'To limit the number of font weights used',
        'To create a harmonious set of font sizes with consistent ratios',
        'To map type styles to specific components only',
        'To define the color of text elements',
      ],
      correctIndex: 1,
      explanation:
        'A type scale defines a set of font sizes based on a consistent ratio (e.g., 1.25 or 1.333), ensuring visual hierarchy and harmony. Common scales include Minor Third, Major Third, and Perfect Fourth.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['typography', 'type-scale', 'design-systems'],
  },
  {
    id: 'des-mcq-009',
    track: 'design',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question:
        'In layout design, what does "white space" (negative space) primarily help with?',
      options: [
        'Reducing file size',
        'Improving readability and visual hierarchy by reducing clutter',
        'Filling empty areas with background color',
        'Separating navigation from content only',
      ],
      correctIndex: 1,
      explanation:
        "White space (or negative space) reduces cognitive load, improves readability, and guides the eye to focus on important elements. It's not wasted space — it's an intentional design tool.",
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 5,
    tags: ['layout', 'white-space', 'visual-hierarchy'],
  },

  // ─── DESIGN: design_critique (7) ─────────────────────────────────────────

  {
    id: 'des-dct-001',
    track: 'design',
    type: 'design_critique',
    difficulty: 'easy',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-001.png',
      designPrompt:
        'The image shows a mobile onboarding screen with white text on a light yellow background. Identify the main accessibility issue and explain how you would fix it.',
      scoringCriteria: [
        'Correctly identifies low contrast as the primary issue',
        'References WCAG contrast ratio guidelines (4.5:1 for normal text)',
        'Provides a specific, actionable fix (e.g., darken the text or change background)',
        'Explains the impact on users with visual impairments',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 10,
    tags: ['accessibility', 'contrast', 'mobile'],
  },
  {
    id: 'des-dct-002',
    track: 'design',
    type: 'design_critique',
    difficulty: 'medium',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-002.png',
      designPrompt:
        'This dashboard uses 8 different font sizes and 3 different font families. Critique the typography choices and propose a cleaner type system for this interface.',
      scoringCriteria: [
        'Identifies the visual noise caused by too many type sizes/families',
        'Proposes limiting to 2 font families (1 for headings, 1 for body) and a defined type scale',
        'Explains how consistent typography aids hierarchy and scanning',
        'Mentions a specific type scale or ratio (e.g., Minor Third 1.25)',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 12,
    tags: ['typography', 'type-hierarchy', 'dashboard'],
  },
  {
    id: 'des-dct-003',
    track: 'design',
    type: 'design_critique',
    difficulty: 'medium',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-003.png',
      designPrompt:
        'A checkout form has its primary CTA "Place Order" and secondary action "Save for Later" styled identically as filled blue buttons. What is the UX problem and how would you resolve it?',
      scoringCriteria: [
        'Identifies the lack of visual hierarchy between primary and secondary actions',
        'Recommends differentiating: e.g., filled button for primary, outlined or text button for secondary',
        'Considers the consequence of users accidentally clicking the wrong action',
        "References Fitts's Law or action hierarchy principles as supporting rationale",
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 10,
    tags: ['ux', 'buttons', 'visual-hierarchy', 'forms'],
  },
  {
    id: 'des-dct-004',
    track: 'design',
    type: 'design_critique',
    difficulty: 'hard',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-004.png',
      designPrompt:
        "A mobile app's home screen shows 14 navigation items in a grid. Users in testing reported feeling overwhelmed. Apply Hick's Law to critique this design and suggest a restructured navigation pattern.",
      scoringCriteria: [
        "Accurately explains Hick's Law (decision time increases logarithmically with number of choices)",
        "Identifies that 14 options exceeds cognitive limits (Miller's Law ~7±2)",
        'Proposes a specific navigation pattern (e.g., tab bar with 5 core items, progressive disclosure for the rest)',
        'Considers discoverability of hidden items in the new structure',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 15,
    tags: ['ux', 'navigation', 'cognitive-load', 'hicks-law'],
  },
  {
    id: 'des-dct-005',
    track: 'design',
    type: 'design_critique',
    difficulty: 'medium',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-005.png',
      designPrompt:
        'A SaaS landing page uses 7 different shades of blue with no clear purpose. Describe the problems this creates and propose a color system to replace it.',
      scoringCriteria: [
        'Identifies inconsistency and lack of semantic meaning in the color usage',
        'Proposes a structured palette: primary, secondary, and semantic states (error, warning, success)',
        'Explains how to derive a tonal scale (50–900) from a base color',
        'Mentions how a design token system would enforce the palette in production',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 12,
    tags: ['color', 'color-system', 'design-tokens', 'landing-page'],
  },
  {
    id: 'des-dct-006',
    track: 'design',
    type: 'design_critique',
    difficulty: 'easy',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-006.png',
      designPrompt:
        'A sign-up form shows inline error messages only after the user clicks Submit, and clears all fields when errors appear. Identify 2 UX problems and suggest improvements.',
      scoringCriteria: [
        'Identifies the "clearing fields" issue as a critical UX failure (data loss)',
        'Identifies delayed validation as a problem — real-time inline validation is better',
        'Proposes preserving field values when errors occur',
        'Suggests per-field validation on blur with accessible error messages',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 10,
    tags: ['forms', 'validation', 'error-states', 'ux'],
  },
  {
    id: 'des-dct-007',
    track: 'design',
    type: 'design_critique',
    difficulty: 'hard',
    content: {
      imageUrl:
        'https://storage.skillsprint.app/design-challenges/des-dct-007.png',
      designPrompt:
        "A mobile banking app uses a hamburger menu as its sole navigation pattern. Users report difficulty finding the \"Transfer\" feature. Critique the navigation choice for a task-critical application and recommend an alternative.",
      scoringCriteria: [
        'Explains why hamburger menus reduce discoverability for primary tasks',
        'Notes that banking apps require fast access to core features (transfer, balance, pay)',
        'Recommends a bottom tab bar with the 4-5 most critical actions',
        'Addresses the concern of fitting more features (e.g., grouped under "More" tab)',
      ],
    } satisfies DesignCritiqueContent,
    estimatedMinutes: 15,
    tags: ['mobile', 'navigation', 'hamburger-menu', 'banking'],
  },

  // ─── WRITING: writing_prompt (15) ────────────────────────────────────────

  {
    id: 'wrt-wpt-001',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'easy',
    content: {
      prompt:
        'Write the opening paragraph of a technical blog post explaining what a REST API is to a developer who is comfortable with JavaScript but has never worked with APIs before.',
      minWords: 80,
      scoringCriteria: [
        'Defines REST API clearly without assuming prior knowledge',
        'Uses an analogy or concrete example to ground the concept',
        'Maintains an engaging, approachable tone appropriate for developers',
        'Sets up what the rest of the post will cover',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 10,
    tags: ['technical-writing', 'blog', 'apis'],
  },
  {
    id: 'wrt-wpt-002',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'easy',
    content: {
      prompt:
        'Write a user story for the following feature: "Users need to be able to reset their password via email." Use the standard "As a [user], I want [goal], so that [reason]" format, then add 3 acceptance criteria.',
      minWords: 60,
      scoringCriteria: [
        'Correctly uses the As a / I want / So that user story format',
        'Focuses on user goal, not implementation details',
        'Writes 3 clear, testable acceptance criteria',
        'Acceptance criteria cover at least one error/edge case (e.g., expired link)',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['user-stories', 'product', 'requirements'],
  },
  {
    id: 'wrt-wpt-003',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write a friendly, helpful error message for the following scenario: a user tries to upload a profile photo that is larger than 5MB. The message should appear inline below the file upload button.',
      minWords: 30,
      scoringCriteria: [
        'States the problem clearly (file too large)',
        'Tells the user exactly what to do next (resize or compress the image)',
        'Avoids technical jargon and blaming the user',
        'Is concise — under 25 words ideally',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['ux-writing', 'error-messages', 'microcopy'],
  },
  {
    id: 'wrt-wpt-004',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        "Write a product changelog entry for the following release: you shipped dark mode support, fixed a bug where notifications weren't showing on iOS 17, and improved dashboard load speed by 40%. Write for an end-user audience on a public changelog page.",
      minWords: 80,
      scoringCriteria: [
        'Uses clear section headers or bullet points to organize changes by type',
        'Leads with the most impactful change (dark mode)',
        'Translates technical fix into user-facing benefit language',
        'Appropriate tone: positive and celebratory but professional',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 10,
    tags: ['changelog', 'release-notes', 'product-writing'],
  },
  {
    id: 'wrt-wpt-005',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write the "Authentication" section of an API reference document for a fictional REST API called Vaultly. The API uses Bearer token authentication. Include: how to obtain a token, how to include it in requests, and what error to expect when unauthorized.',
      minWords: 100,
      scoringCriteria: [
        'Explains token acquisition process clearly (e.g., POST /auth/token)',
        'Shows the correct Authorization header format with example',
        'Documents the 401 Unauthorized response with the error shape',
        'Tone matches technical documentation standards (precise, imperative mood)',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 12,
    tags: ['api-docs', 'authentication', 'technical-writing'],
  },
  {
    id: 'wrt-wpt-006',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'easy',
    content: {
      prompt:
        'Write an onboarding welcome email for a new user who just signed up for a project management tool called Taskly. The email should be sent immediately after sign-up. Include a subject line.',
      minWords: 100,
      scoringCriteria: [
        'Subject line is specific, personalized, and avoids spam triggers',
        'Opening is warm and confirms the sign-up was successful',
        'Includes a single clear call-to-action (e.g., "Create your first project")',
        'Email is concise — avoids information overload in the first touchpoint',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 10,
    tags: ['email-writing', 'onboarding', 'marketing-copy'],
  },
  {
    id: 'wrt-wpt-007',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        "You are the Head of Engineering at a startup. A major outage just took your API down for 3 hours on a weekday morning. Write a post-mortem summary for your customers. Cover: what happened, why it happened, the impact, and what you're doing to prevent it.",
      minWords: 150,
      scoringCriteria: [
        'Opens with a sincere, direct apology without making excuses',
        'Explains the root cause in plain language without excessive jargon',
        'Quantifies impact (duration, affected users/services)',
        'Commits to specific, concrete preventive actions with a timeline',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['incident-communication', 'post-mortem', 'crisis-writing'],
  },
  {
    id: 'wrt-wpt-008',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write the tooltip text for a "password strength indicator" UI component. The tooltip should explain what makes a strong password. It will appear when a user hovers over a small info (ℹ) icon next to the indicator bar.',
      minWords: 40,
      scoringCriteria: [
        'Gives specific, actionable advice (e.g., length, mix of characters)',
        'Is concise enough for a tooltip — under 30 words ideally',
        'Avoids prescriptive rules that create frustration (like "must include !@#$")',
        'Accessible and non-jargon language',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['ux-writing', 'tooltips', 'microcopy', 'security'],
  },
  {
    id: 'wrt-wpt-009',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        'Write a README section titled "Getting Started" for an open-source CLI tool called `snapdb` that creates instant database snapshots. Assume the reader is a developer. Cover: installation, basic usage, and one example command with its output.',
      minWords: 150,
      scoringCriteria: [
        'Installation command is copy-paste ready (npm install or similar)',
        'Basic usage section includes a real example command with expected output',
        'Uses code blocks correctly for commands and output',
        'Covers the happy path end-to-end in under 5 steps',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['technical-writing', 'readme', 'cli', 'open-source'],
  },
  {
    id: 'wrt-wpt-010',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write the empty state message for a task manager app when a user has completed all their tasks for the day. The message appears in the center of the screen where the task list would normally be.',
      minWords: 20,
      scoringCriteria: [
        'Celebrates the accomplishment with positive, energizing language',
        'Suggests a clear next action (e.g., add tasks for tomorrow)',
        'Is concise and fits a small empty state card',
        'Avoids generic filler phrases like "Nothing to see here"',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['ux-writing', 'empty-states', 'microcopy'],
  },
  {
    id: 'wrt-wpt-011',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'easy',
    content: {
      prompt:
        'Write a brief explanation (1-2 paragraphs) of what "version control" is for a non-technical project manager who just joined an engineering team. Avoid all code examples.',
      minWords: 80,
      scoringCriteria: [
        'Uses a non-technical analogy that resonates with a PM (e.g., Google Docs history)',
        'Explains the core value: tracking changes and collaboration',
        'Does not use code or command-line examples',
        'Ends with why this matters for their role as a PM',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['technical-writing', 'version-control', 'audience-awareness'],
  },
  {
    id: 'wrt-wpt-012',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        'Write a 3-tweet thread introducing a new developer productivity tool that automatically generates unit tests from your existing code. Write for a technical audience on X (Twitter). Each tweet must work standalone but build on the previous.',
      minWords: 60,
      scoringCriteria: [
        'Tweet 1 hooks with a specific pain point or surprising claim',
        'Tweet 2 explains the solution with enough specificity to be believable',
        'Tweet 3 ends with a clear CTA (try it, star on GitHub, etc.)',
        'Each tweet is under 280 characters and reads naturally, not like an ad',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 12,
    tags: ['social-writing', 'twitter', 'developer-tools', 'copywriting'],
  },
  {
    id: 'wrt-wpt-013',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write the placeholder text (not labels) for the following form fields in a freelance invoicing app: Client name, Project description, Due date, Amount. Good placeholder text guides without replacing labels.',
      minWords: 40,
      scoringCriteria: [
        'Placeholder text is example-based, not a repeat of the label',
        'Examples feel realistic (e.g., "Acme Corp" not "Enter name here")',
        'Avoids instructional text in placeholders (instructions belong in labels or hints)',
        'Appropriate length — each placeholder is brief and scannable',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 8,
    tags: ['ux-writing', 'forms', 'placeholders', 'microcopy'],
  },
  {
    id: 'wrt-wpt-014',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        "Write a \"permission denied\" error page (404-style full-page error) for a SaaS app. The user tried to access an admin dashboard but doesn't have the right role. Include: headline, description, and 2 action buttons.",
      minWords: 50,
      scoringCriteria: [
        'Headline is clear about what happened (not technical jargon like "403 Forbidden")',
        'Description explains the likely reason and who to contact',
        'Two action buttons cover both "go back" and "request access" paths',
        'Tone is helpful and professional, not alarming',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 10,
    tags: ['ux-writing', 'error-pages', 'permissions', 'microcopy'],
  },
  {
    id: 'wrt-wpt-015',
    track: 'writing',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Write 3 push notification variants for a fitness app reminding a user to complete their daily workout. Variant A: motivational, Variant B: informational (shows streak of 7 days), Variant C: social (a friend just worked out). Each should be one line.',
      minWords: 30,
      scoringCriteria: [
        'Each variant is genuinely distinct in tone and framing',
        'All three are under 100 characters (push notification length constraints)',
        'Variant B correctly references the 7-day streak',
        'None feel spammy or use excessive exclamation marks',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 10,
    tags: ['ux-writing', 'push-notifications', 'copywriting', 'fitness'],
  },

  // ─── CRITICAL THINKING: multiple_choice (8) ──────────────────────────────

  {
    id: 'crt-mcq-001',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'Your team is debating two features for the next sprint:\n- Feature A: RICE score 280 (Reach=1000, Impact=3, Confidence=70%, Effort=7.5 weeks)\n- Feature B: RICE score 400 (Reach=2000, Impact=3, Confidence=80%, Effort=12 weeks)\n\nUsing RICE scoring alone, which should you prioritize?',
      options: [
        'Feature A — it ships faster',
        'Feature B — it has a higher RICE score',
        'Neither — RICE scores are too close to decide',
        'Feature A — a 70% confidence should be weighted more heavily',
      ],
      correctIndex: 1,
      explanation:
        "RICE scoring (Reach × Impact × Confidence / Effort) is designed to compare features objectively. Feature B's higher score (400 vs 280) means it delivers more expected value per unit of effort, despite taking longer.",
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 8,
    tags: ['prioritization', 'rice', 'product-management'],
  },
  {
    id: 'crt-mcq-002',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question:
        'A root cause analysis (RCA) for a database outage concludes: "The engineer deleted the wrong table." What type of root cause is this?',
      options: [
        'Root cause — human error is the final answer',
        'Symptom — the real root causes are the conditions that made the mistake possible',
        'Contributing factor only — weather and time of day also matter',
        'Proximate cause — not actionable so it should be discarded',
      ],
      correctIndex: 1,
      explanation:
        '"The engineer deleted the wrong table" is the proximate cause. True RCA asks why that was possible: Was there no confirmation dialog? No backup? No staging test? Those systemic gaps are the real root causes to fix.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['root-cause-analysis', 'incident-response', 'systems-thinking'],
  },
  {
    id: 'crt-mcq-003',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'An A/B test runs for 3 days. Variant B shows a 12% lift in conversion (p=0.03). Your CEO wants to ship Variant B immediately. What is the most important concern?',
      options: [
        'p=0.03 means the result is not statistically significant',
        'The test may not have run long enough to capture a full weekly cycle of user behavior',
        'A 12% lift is too small to be meaningful',
        'You should always run tests for exactly 14 days, no exceptions',
      ],
      correctIndex: 1,
      explanation:
        'Three days is often insufficient for A/B tests because user behavior varies by day of week. A test running only Mon-Wed may miss Friday/weekend traffic patterns that could reverse the result. The p-value is fine (0.03 < 0.05), but external validity is the concern.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 10,
    tags: ['ab-testing', 'statistics', 'experimentation'],
  },
  {
    id: 'crt-mcq-004',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'A company is deciding between building its own authentication system vs. using Auth0. The team lead says "we should build it — our needs are unique." What logical fallacy might this argument rely on?',
      options: [
        'Appeal to authority',
        'Not Invented Here (NIH) syndrome masking as differentiation',
        'Sunk cost fallacy',
        'Appeal to tradition',
      ],
      correctIndex: 1,
      explanation:
        'NIH syndrome is the tendency to reject external solutions in favor of building in-house, often framed as "our needs are unique." Auth (SAML, OAuth, MFA, etc.) is a solved problem. Building it from scratch is rarely the right call unless there is a genuine, specific technical reason.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 8,
    tags: ['system-design', 'build-vs-buy', 'cognitive-bias'],
  },
  {
    id: 'crt-mcq-005',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'Your startup serves 10,000 users. A candidate system design uses a microservices architecture with 12 services and a Kubernetes cluster. What is the most significant risk?',
      options: [
        'Kubernetes is not suitable for production workloads',
        'Operational complexity and overhead will outweigh the scalability benefits at this scale',
        'Microservices are insecure and should not be used for startups',
        'The design will not scale past 10,000 users',
      ],
      correctIndex: 1,
      explanation:
        'Microservices introduce significant distributed systems complexity (service discovery, network latency, distributed tracing, deployment pipelines). At 10K users, a well-structured monolith or mini-services approach typically delivers faster iteration with lower ops burden. Premature decomposition is a common trap.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 10,
    tags: ['system-design', 'microservices', 'scalability', 'trade-offs'],
  },
  {
    id: 'crt-mcq-006',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: {
      question:
        'A company is considering using facial recognition to automatically check in employees at the office. Which ethical concern is most significant?',
      options: [
        'Facial recognition systems are too slow for a busy office',
        'Biometric data is sensitive and cannot be changed if compromised; consent and data governance are critical',
        'It would eliminate the need for security badges, which employees like',
        'The technology is not mature enough to work reliably indoors',
      ],
      correctIndex: 1,
      explanation:
        'Unlike passwords, biometric data (faces, fingerprints) cannot be reset if breached. Deploying it requires explicit informed consent, strong data governance, and consideration of failure modes (false positives/negatives affecting specific demographics). The convenience trade-off must be weighed carefully.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 8,
    tags: ['ethics', 'biometrics', 'privacy', 'data-governance'],
  },
  {
    id: 'crt-mcq-007',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: {
      question:
        "Your engineering manager wants to increase team velocity by adding 3 developers mid-sprint. Based on Brooks's Law, what is the most likely outcome?",
      options: [
        'Velocity increases linearly with each new developer added',
        'Velocity initially decreases because ramp-up time and coordination overhead outweigh new output',
        'Velocity stays exactly the same',
        'Velocity increases only if the sprint has more than 2 weeks remaining',
      ],
      correctIndex: 1,
      explanation:
        "Brooks's Law states: \"Adding manpower to a late software project makes it later.\" New developers require onboarding, increase communication overhead (O(n²) channels for n people), and distract senior engineers who must mentor them.",
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 7,
    tags: ['engineering-management', 'brooks-law', 'team-dynamics'],
  },
  {
    id: 'crt-mcq-008',
    track: 'critical_thinking',
    type: 'multiple_choice',
    difficulty: 'hard',
    content: {
      question:
        'A stakeholder asks you to "just add one more column to the database" 2 days before launch. The column would require a migration on a 10M-row table. What is the most important risk to communicate?',
      options: [
        'Migrations always fail on large tables',
        'Adding a column near launch risks extended downtime or data corruption if the migration runs during peak traffic without proper precautions',
        'The database cannot hold more than 10 million rows',
        'Stakeholders should not request database changes',
      ],
      correctIndex: 1,
      explanation:
        'Schema migrations on large tables can lock rows for minutes, causing downtime. Safe approaches (online schema change tools, zero-downtime migration patterns) take time to implement and test properly. This is a risk/timeline conversation, not a technical refusal.',
    } satisfies MultipleChoiceContent,
    estimatedMinutes: 10,
    tags: ['system-design', 'database', 'migrations', 'risk-management'],
  },

  // ─── CRITICAL THINKING: writing_prompt (7) ───────────────────────────────

  {
    id: 'crt-wpt-001',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        'Your team has three features to build next quarter but only has capacity for two. Use the ICE scoring framework (Impact, Confidence, Ease) to prioritize. Feature A: adds social sharing, Feature B: improves search speed by 3x, Feature C: adds a premium analytics dashboard. Write your analysis and recommendation.',
      minWords: 120,
      scoringCriteria: [
        'Correctly applies ICE scoring (rates each dimension 1-10, multiplies)',
        'Makes reasonable assumptions about scores with brief justification',
        'Recommends two features with a clear rationale',
        'Considers second-order effects (e.g., which features help retention vs. acquisition)',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['prioritization', 'ice-scoring', 'product-strategy'],
  },
  {
    id: 'crt-wpt-002',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        'Your company stores user data in a single AWS region (us-east-1). A new enterprise customer in Germany requires that their data never leave the EU due to GDPR. Write a brief technical recommendation for how to accommodate this without rebuilding your entire infrastructure.',
      minWords: 120,
      scoringCriteria: [
        'Identifies data residency as the core constraint',
        'Proposes a specific, feasible solution (e.g., multi-region deployment, EU-specific Firestore instance, tenant-based routing)',
        'Addresses the compliance requirement explicitly (GDPR data residency)',
        'Notes implementation complexity and a rough migration approach',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['system-design', 'gdpr', 'data-residency', 'compliance'],
  },
  {
    id: 'crt-wpt-003',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        "A product manager wants to ship a feature that tracks every click a user makes on your app and sends it to a third-party analytics vendor. As the lead engineer, write a short response to the PM explaining your concerns and proposing conditions under which you'd be comfortable proceeding.",
      minWords: 100,
      scoringCriteria: [
        'Raises privacy/consent concerns clearly (GDPR, CCPA depending on user base)',
        "Questions whether the third-party vendor's data handling meets your privacy policy",
        'Proposes specific conditions: user consent, data minimization, vendor DPA review',
        'Maintains a collaborative, not obstructionist, tone',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 12,
    tags: ['ethics', 'privacy', 'analytics', 'stakeholder-communication'],
  },
  {
    id: 'crt-wpt-004',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'easy',
    content: {
      prompt:
        'You are a senior engineer on a team where a junior engineer repeatedly skips writing tests for their PRs, saying "tests slow me down." Write how you would address this in a 1:1. Focus on the conversation approach, not just the rule.',
      minWords: 100,
      scoringCriteria: [
        'Leads with curiosity rather than criticism (asks why they feel slowed down)',
        'Explains the long-term cost of missing tests in specific terms',
        'Offers actionable support (pair programming, test examples, better tooling)',
        'Sets a clear expectation while preserving psychological safety',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 12,
    tags: ['engineering-management', 'mentoring', 'code-quality', 'communication'],
  },
  {
    id: 'crt-wpt-005',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        'Your startup is evaluating whether to build a native mobile app or a Progressive Web App (PWA). You have 2 engineers and 6 months of runway. Write a recommendation, covering the trade-offs of each approach for your specific constraints.',
      minWords: 150,
      scoringCriteria: [
        'Correctly identifies key native advantages (push notifications, app store distribution, device APIs)',
        'Correctly identifies PWA advantages (single codebase, instant updates, no app store approval)',
        'Weighs the constraints (2 engineers, 6-month runway) in the recommendation',
        'Makes a clear final recommendation with justification, not just "it depends"',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['mobile', 'pwa', 'native', 'build-strategy', 'trade-offs'],
  },
  {
    id: 'crt-wpt-006',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'medium',
    content: {
      prompt:
        "An A/B test on your checkout flow ran for 2 weeks. Variant B (a simplified form) shows a 6% lift in conversion (p=0.048). However, the average order value for Variant B is 8% lower. Should you ship Variant B? Write your analysis.",
      minWords: 100,
      scoringCriteria: [
        'Correctly identifies the revenue trade-off (more conversions × lower AOV)',
        'Calculates or estimates the net revenue impact before making a recommendation',
        'Notes the borderline p-value (0.048) and considers running the test longer to confirm',
        'Makes a clear recommendation with conditions (e.g., "ship if net revenue is positive")',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['ab-testing', 'conversion', 'revenue-analysis', 'data-driven'],
  },
  {
    id: 'crt-wpt-007',
    track: 'critical_thinking',
    type: 'writing_prompt',
    difficulty: 'hard',
    content: {
      prompt:
        "Your company's most popular API endpoint is receiving 10x its normal traffic following a mention on Hacker News. Your current infrastructure is struggling. Write a short incident response plan covering the next 4 hours, including both immediate mitigation and communication.",
      minWords: 150,
      scoringCriteria: [
        'Identifies immediate mitigation steps (rate limiting, CDN caching, horizontal scaling)',
        'Prioritizes protecting paid/existing users over absorbing all new traffic',
        'Includes a status page or communication plan for affected users',
        'Separates short-term (4 hours) from medium-term (24-72 hours) actions',
      ],
    } satisfies WritingPromptContent,
    estimatedMinutes: 15,
    tags: ['incident-response', 'scalability', 'traffic-spike', 'crisis-management'],
  },
];
