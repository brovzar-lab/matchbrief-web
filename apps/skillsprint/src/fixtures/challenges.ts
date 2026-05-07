import type {
  Challenge,
  FillInBlankChallenge,
  MultipleChoiceChallenge,
  CodeReadingChallenge,
  WritingPromptChallenge,
  DesignCritiqueChallenge,
} from '../types/challenges';

export const FILL_IN_BLANK_FIXTURE: FillInBlankChallenge = {
  id: 'demo-fib-001',
  type: 'fill_in_blank',
  trackId: 'coding',
  difficulty: 'Medium',
  content: {
    codeSnippet:
      'function binarySearch(arr, target) {\n' +
      '  let left = 0;\n' +
      '  let right = arr.length - 1;\n' +
      '  while (left <= right) {\n' +
      '    const mid = Math.floor(\n' +
      '      (left + right) / __BLANK__\n' +
      '    );\n' +
      '    if (arr[mid] === target) return mid;\n' +
      '    if (arr[mid] < target) left = mid + 1;\n' +
      '    else right = mid - 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}',
    language: 'javascript',
    correctAnswer: '2',
  },
};

export const MULTIPLE_CHOICE_FIXTURE: MultipleChoiceChallenge = {
  id: 'demo-mc-001',
  type: 'multiple_choice',
  trackId: 'coding',
  difficulty: 'Medium',
  content: {
    question: 'What is the time complexity of binary search on a sorted array?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correctIndex: 2,
  },
};

export const CODE_READING_FIXTURE: CodeReadingChallenge = {
  id: 'demo-cr-001',
  type: 'code_reading',
  trackId: 'critical_thinking',
  difficulty: 'Hard',
  content: {
    codeSnippet:
      'function mystery(n) {\n' +
      '  if (n <= 1) return n;\n' +
      '  return mystery(n - 1) + mystery(n - 2);\n' +
      '}',
    language: 'javascript',
    question: 'What does mystery(6) return?',
    options: ['6', '8', '13', '21'],
    correctIndex: 1,
  },
};

export const WRITING_PROMPT_FIXTURE: WritingPromptChallenge = {
  id: 'demo-wp-001',
  type: 'writing_prompt',
  trackId: 'writing',
  difficulty: 'Medium',
  content: {
    prompt: 'Explain the concept of recursion to a 10-year-old.',
    context:
      'Use an analogy from everyday life. Avoid technical jargon. Your explanation should be clear enough that someone with no programming background understands it.',
    minWords: 50,
  },
};

export const DESIGN_CRITIQUE_FIXTURE: DesignCritiqueChallenge = {
  id: 'demo-dc-001',
  type: 'design_critique',
  trackId: 'design',
  difficulty: 'Medium',
  content: {
    imageUri: 'https://picsum.photos/seed/skillsprint-checkout/400/300',
    context:
      'This is a mobile checkout screen for an e-commerce app. Evaluate the design for usability and visual clarity.',
    critiqueFields: ['Visual Hierarchy', 'Call to Action', 'Accessibility'],
  },
};

export const ALL_DEMO_CHALLENGES: Challenge[] = [
  MULTIPLE_CHOICE_FIXTURE,
  FILL_IN_BLANK_FIXTURE,
  CODE_READING_FIXTURE,
  WRITING_PROMPT_FIXTURE,
  DESIGN_CRITIQUE_FIXTURE,
];
