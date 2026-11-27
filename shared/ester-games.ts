export const esterGameModes = ["speed", "verdict", "calculation", "equation"] as const;
export type EsterGameMode = (typeof esterGameModes)[number];

export type EsterGameQuestion = {
  id: string;
  prompt: string;
  options: string[];
  statements: string[];
};

export type EsterGameReview = {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
};
