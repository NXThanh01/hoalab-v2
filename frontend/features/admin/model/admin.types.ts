export type QuestionType = "multiple_choice" | "essay" | "equation";
export type Difficulty = "easy" | "medium" | "hard";

export type QuestionRecord = {
  id: string;
  type: QuestionType;
  subject: string;
  gradeLevel: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  points: number;
  createdAt: string;
};

export type ExamRecord = {
  id: string;
  title: string;
  description: string;
  gradeLevel: number;
  folderId: string | null;
  kind: "quiz" | "exam";
  durationMinutes: number;
  passScore: number;
  status: "draft" | "published" | "archived";
  startsAt: string | null;
  endsAt: string | null;
  questionCount: number;
  questionIds: string[];
  createdAt: string;
};

export type ExamFolderRecord = {
  id: string;
  name: string;
  gradeLevel: number;
  description: string;
  color: string;
  examCount: number;
  createdAt: string;
};

export type AttemptRecord = {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  score: number;
  passed: boolean;
  tabSwitches: number;
  fullscreenExits: number;
  elapsedSeconds: number;
  submittedAt: string | null;
};

export type AdminOverview = {
  students: number;
  questions: number;
  exams: number;
  attempts: number;
  averageScore: number;
  passRate: number;
  integrityFlags: number;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType: string;
    entityId: string;
    createdAt: string;
  }>;
};

export type VideoCheckpointRecord = {
  id: string;
  timeSeconds: number;
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type LessonContentRecord = {
  id: string;
  gradeLevel: number;
  textbookSeries: string;
  chapterId: string;
  lessonNumber: number;
  title: string;
  videoUrl: string;
  status: "draft" | "published";
  checkpoints: VideoCheckpointRecord[];
  updatedAt: string;
};
