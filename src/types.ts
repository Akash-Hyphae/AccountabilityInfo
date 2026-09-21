export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type TaskPriority = 'highest' | 'medium' | 'least' | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate?: string;
  date: string; // YYYY-MM-DD
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PlannerItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "8:00 AM"
  plannedTask: string;
  actualTask: string;
  isCompleted: boolean;
  order: number;
}

export interface DailyReflection {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  mistakes: string[];
  improvements: string[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Reflection = DailyReflection;

export interface DailyAnalysis {
  id?: string;
  userId?: string;
  date: string; // YYYY-MM-DD
  tasksCompleted: number;
  totalTasks: number;
  productivity: number; // 1-10
  focus: number; // 1-10
  distractions: number; // 1-10
  energy: number; // 1-10
  isGoodDay: boolean;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

export type GoalCategory = 'Career' | 'Study' | 'Health' | 'Fitness' | 'Personal' | 'Finance' | 'Other';
export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetDate: string;
  progress: number; // 0-100
  status: GoalStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category?: string;
  icon?: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // YYYY-MM-DD strings
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  type: 'work' | 'break';
  completedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AiAnalysisResult {
  period: string;
  summary: string;
  whatWentWell: string[];
  whatWentWrong: string[];
  recurringMistakes: string[];
  productivityPatterns: string[];
  focusPatterns: string[];
  distractionPatterns: string[];
  strongHabits: string[];
  weakHabits: string[];
  suggestedImprovements: string[];
  nextPeriodRecommendations: string[];
}
