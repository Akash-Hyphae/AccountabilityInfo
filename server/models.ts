import mongoose, { Schema, Document, Model } from 'mongoose';

// Helper transform function to convert _id to id and clean up __v and sensitive fields
const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_: any, ret: any) => {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      delete ret.__v;
      return ret;
    }
  }
};

// ================= USER SCHEMA & MODEL ================= //
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  avatarUrl: { type: String, default: '' }
}, {
  ...schemaOptions,
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: any) => {
      if (ret._id) ret.id = ret._id.toString();
      delete ret.password; // Strip password hash from all JSON outputs
      delete ret.__v;
      return ret;
    }
  }
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ================= TASK SCHEMA & MODEL ================= //
export interface ITask extends Document {
  userId: string;
  title: string;
  description?: string;
  priority: 'highest' | 'medium' | 'least' | 'other';
  completed: boolean;
  dueDate?: string;
  date: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const TaskSchema = new Schema<ITask>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: [true, 'Task title is required'], trim: true },
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: {
      values: ['highest', 'medium', 'least', 'other'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium',
    index: true
  },
  completed: { type: Boolean, default: false },
  dueDate: { type: String },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  order: { type: Number, default: 0 }
}, schemaOptions);

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

// ================= DAILY PLANNER SCHEMA & MODEL ================= //
export interface IDailyPlanner extends Document {
  userId: string;
  date: string;
  time: string;
  plannedTask: string;
  actualTask: string;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DailyPlannerSchema = new Schema<IDailyPlanner>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  time: { type: String, required: true },
  plannedTask: { type: String, default: '' },
  actualTask: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, schemaOptions);

export const DailyPlanner: Model<IDailyPlanner> = mongoose.models.DailyPlanner || mongoose.model<IDailyPlanner>('DailyPlanner', DailyPlannerSchema);

// ================= DAILY REFLECTION SCHEMA & MODEL ================= //
export interface IDailyReflection extends Document {
  userId: string;
  date: string;
  mistakes: string[];
  improvements: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DailyReflectionSchema = new Schema<IDailyReflection>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  mistakes: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  notes: { type: String, default: '' }
}, schemaOptions);

export const DailyReflection: Model<IDailyReflection> = mongoose.models.DailyReflection || mongoose.model<IDailyReflection>('DailyReflection', DailyReflectionSchema);

// ================= DAILY ANALYSIS SCHEMA & MODEL ================= //
export interface IDailyAnalysis extends Document {
  userId: string;
  date: string;
  tasksCompleted: number;
  totalTasks: number;
  productivity: number;
  focus: number;
  distractions: number;
  energy: number;
  isGoodDay: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DailyAnalysisSchema = new Schema<IDailyAnalysis>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  tasksCompleted: { type: Number, default: 0, min: 0 },
  totalTasks: { type: Number, default: 0, min: 0 },
  productivity: { type: Number, default: 7, min: 1, max: 10 },
  focus: { type: Number, default: 7, min: 1, max: 10 },
  distractions: { type: Number, default: 3, min: 1, max: 10 },
  energy: { type: Number, default: 7, min: 1, max: 10 },
  isGoodDay: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, schemaOptions);

export const DailyAnalysis: Model<IDailyAnalysis> = mongoose.models.DailyAnalysis || mongoose.model<IDailyAnalysis>('DailyAnalysis', DailyAnalysisSchema);

// ================= GOAL SCHEMA & MODEL ================= //
export interface IGoal extends Document {
  userId: string;
  title: string;
  description?: string;
  category: 'Career' | 'Study' | 'Health' | 'Fitness' | 'Personal' | 'Finance' | 'Other';
  targetDate: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  createdAt: Date;
  updatedAt: Date;
}

export const GoalSchema = new Schema<IGoal>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: [true, 'Goal title is required'], trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Career', 'Study', 'Health', 'Fitness', 'Personal', 'Finance', 'Other'],
    default: 'Personal'
  },
  targetDate: { type: String, required: [true, 'Target date is required'] },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    default: 'In Progress'
  }
}, schemaOptions);

export const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

// ================= HABIT SCHEMA & MODEL ================= //
export interface IHabit extends Document {
  userId: string;
  title: string;
  category: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const HabitSchema = new Schema<IHabit>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: [true, 'Habit title is required'], trim: true },
  category: { type: String, default: 'General' },
  icon: { type: String, default: 'Sprout' },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completedDates: { type: [String], default: [] }
}, schemaOptions);

export const Habit: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

// ================= FOCUS SESSION SCHEMA & MODEL ================= //
export interface IFocusSession extends Document {
  userId: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  type: 'work' | 'break';
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const FocusSessionSchema = new Schema<IFocusSession>({
  userId: { type: String, required: true, index: true },
  taskId: { type: String },
  taskTitle: { type: String, default: 'Deep Focus Session' },
  durationMinutes: { type: Number, required: true, default: 25 },
  type: { type: String, enum: ['work', 'break'], default: 'work' },
  completedAt: { type: Date, default: Date.now }
}, schemaOptions);

export const FocusSession: Model<IFocusSession> = mongoose.models.FocusSession || mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);

// ================= NOTE SCHEMA & MODEL ================= //
export interface INote extends Document {
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NoteSchema = new Schema<INote>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: [true, 'Note title is required'], trim: true },
  content: { type: String, default: '' },
  tags: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, schemaOptions);

export const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
