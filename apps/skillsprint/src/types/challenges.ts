import type { TrackId } from '../lib/config';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeKind =
  | 'fill_in_blank'
  | 'multiple_choice'
  | 'code_reading'
  | 'writing_prompt'
  | 'design_critique';

interface BaseChallenge {
  id: string;
  trackId: TrackId;
  difficulty: Difficulty;
}

export interface FillInBlankChallenge extends BaseChallenge {
  type: 'fill_in_blank';
  content: {
    codeSnippet: string;
    language: string;
    correctAnswer: string;
  };
}

export interface MultipleChoiceChallenge extends BaseChallenge {
  type: 'multiple_choice';
  content: {
    question: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
  };
}

export interface CodeReadingChallenge extends BaseChallenge {
  type: 'code_reading';
  content: {
    codeSnippet: string;
    language: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
  };
}

export interface WritingPromptChallenge extends BaseChallenge {
  type: 'writing_prompt';
  content: {
    prompt: string;
    context?: string;
    minWords: number;
  };
}

export interface DesignCritiqueChallenge extends BaseChallenge {
  type: 'design_critique';
  content: {
    imageUri: string;
    context: string;
    critiqueFields: string[];
  };
}

export type Challenge =
  | FillInBlankChallenge
  | MultipleChoiceChallenge
  | CodeReadingChallenge
  | WritingPromptChallenge
  | DesignCritiqueChallenge;
