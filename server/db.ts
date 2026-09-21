import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  Task,
  DailyPlanner,
  DailyReflection,
  DailyAnalysis,
  Goal,
  Habit,
  FocusSession,
  Note
} from './models.ts';

// Check if MongoDB is available
const MONGODB_URI = process.env.MONGODB_URI;
let isMongoConnected = false;

// Disable command buffering globally so queries never hang if connection is unavailable
mongoose.set('bufferCommands', false);

export function isMongoReady(): boolean {
  return isMongoConnected && !!mongoose.connection && mongoose.connection.readyState === 1;
}

// File-based persistent fallback storage directory and file
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface InMemoryStore {
  users: any[];
  tasks: any[];
  planner: any[];
  reflections: any[];
  analyses: any[];
  goals: any[];
  habits: any[];
  focusSessions: any[];
  notes: any[];
}

let store: InMemoryStore = {
  users: [],
  tasks: [],
  planner: [],
  reflections: [],
  analyses: [],
  goals: [],
  habits: [],
  focusSessions: [],
  notes: []
};

// Seed demo data
function seedInitialData() {
  const demoUserId = 'demo-user-123';
  const hashedPassword = bcrypt.hashSync('demouser123', 10);

  // Today's date in local format (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Generate dates for past 7 days
  const pastDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    pastDates.push(d.toISOString().split('T')[0]);
  }

  store.users = [
    {
      id: demoUserId,
      _id: demoUserId,
      name: 'Alex Rivera',
      email: 'demo@accountability.info',
      password: hashedPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Seed tasks inspired by the screenshot & prompt
  store.tasks = [
    {
      id: 'task-1',
      _id: 'task-1',
      userId: demoUserId,
      title: 'Complete DSA practice (Binary Trees)',
      description: 'Solve 3 LeetCode problems on tree traversals',
      priority: 'highest',
      completed: true,
      dueDate: today,
      date: today,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      _id: 'task-2',
      userId: demoUserId,
      title: 'Finish project API & JWT authentication',
      description: 'Implement Express middleware and protected routes',
      priority: 'highest',
      completed: true,
      dueDate: today,
      date: today,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-3',
      _id: 'task-3',
      userId: demoUserId,
      title: 'Prepare interview questions on System Design',
      description: 'Study caching strategies & rate limiting',
      priority: 'highest',
      completed: false,
      dueDate: today,
      date: today,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-4',
      _id: 'task-4',
      userId: demoUserId,
      title: 'Read OS concepts (Processes & Threads)',
      description: 'Operating Systems chapter 4 concurrency',
      priority: 'medium',
      completed: true,
      dueDate: today,
      date: today,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-5',
      _id: 'task-5',
      userId: demoUserId,
      title: 'Practice SQL aggregations & indexing queries',
      description: 'HackerRank 15 query challenges',
      priority: 'medium',
      completed: false,
      dueDate: today,
      date: today,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-6',
      _id: 'task-6',
      userId: demoUserId,
      title: 'Organize project repository notes & docs',
      description: 'Clean up README and update API documentation',
      priority: 'least',
      completed: false,
      dueDate: today,
      date: today,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-7',
      _id: 'task-7',
      userId: demoUserId,
      title: 'Morning 4km run & stretch',
      description: 'Cardio routine in the park',
      priority: 'other',
      completed: true,
      dueDate: today,
      date: today,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-8',
      _id: 'task-8',
      userId: demoUserId,
      title: 'Read 20 pages of "Atomic Habits"',
      description: 'Focus on habit stacking chapter',
      priority: 'other',
      completed: true,
      dueDate: today,
      date: today,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Seed hourly planner matching the screenshot's hourly schedule
  const times = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
    '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
  ];

  const defaultPlans: Record<string, { planned: string; actual: string; done: boolean }> = {
    '7:00 AM': { planned: 'Morning Run & Hydration', actual: '4km run completed, feeling fresh', done: true },
    '8:00 AM': { planned: 'DSA Practice (Tree Traversals)', actual: 'Completed 2 problems, reviewed BFS', done: true },
    '9:00 AM': { planned: 'Project Architecture & Backend Setup', actual: 'Configured Express, Mongoose & auth middleware', done: true },
    '10:00 AM': { planned: 'API Endpoints Development', actual: 'Built tasks, planner & reflection routes', done: true },
    '11:00 AM': { planned: 'Code Review & Testing', actual: 'Tested routes with Postman, fixed CORS', done: true },
    '1:00 PM': { planned: 'OS Concepts Reading', actual: 'Read chapter on threads and semaphore locks', done: true },
    '2:00 PM': { planned: 'Deep Work: Frontend Dashboard', actual: 'Got distracted checking notifications for 20 mins', done: false },
    '3:00 PM': { planned: 'Hourly Planner & Priority UI', actual: 'Built UI cards matching reference layout', done: true },
    '4:00 PM': { planned: 'Gemini AI Integration', actual: 'Configured backend AI analysis controller', done: true },
    '6:00 PM': { planned: 'Workout & Meditation', actual: '15 min mindfulness session', done: true },
    '8:00 PM': { planned: 'Daily Reflection & Planning Tomorrow', actual: 'Logged mistakes and prepared tomorrow priorities', done: true }
  };

  store.planner = times.map((t, idx) => {
    const item = defaultPlans[t] || { planned: '', actual: '', done: false };
    return {
      id: `planner-${idx}`,
      _id: `planner-${idx}`,
      userId: demoUserId,
      date: today,
      time: t,
      plannedTask: item.planned,
      actualTask: item.actual,
      isCompleted: item.done,
      order: idx
    };
  });

  // Seed reflections
  store.reflections = [
    {
      id: 'reflection-today',
      _id: 'reflection-today',
      userId: demoUserId,
      date: today,
      mistakes: [
        'Checked social media notifications during the 2:00 PM deep work block',
        'Did not take a proper 5-minute break after the intensive 10:00 AM coding sprint',
        'Underestimated time required for the SQL aggregation queries'
      ],
      improvements: [
        'Place phone in airplane mode in another room during Pomodoro sessions',
        'Stick strictly to 25/5 Pomodoro intervals with standing stretches',
        'Break down complex database queries into smaller sub-tasks'
      ],
      notes: 'Overall a very solid day of progress! Built out the core accountability components and felt the mental clarity of distinguishing planned tasks from honest reality.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Seed analyses for past days
  pastDates.forEach((dStr, idx) => {
    store.analyses.push({
      id: `analysis-${dStr}`,
      _id: `analysis-${dStr}`,
      userId: demoUserId,
      date: dStr,
      tasksCompleted: 6 - (idx % 3),
      totalTasks: 8,
      productivity: Math.max(5, 8 - (idx % 3)),
      focus: Math.max(6, 9 - ((idx * 2) % 4)),
      distractions: Math.min(6, 2 + (idx % 4)),
      energy: Math.max(5, 8 - (idx % 4)),
      isGoodDay: idx !== 4,
      notes: idx === 0 ? 'High energy and strong focus on highest priority tasks.' : 'Good consistency maintained.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Seed goals
  store.goals = [
    {
      id: 'goal-1',
      _id: 'goal-1',
      userId: demoUserId,
      title: 'Master Data Structures & Algorithms',
      description: 'Solve 150 LeetCode Medium/Hard questions across Trees, Graphs, and DP.',
      category: 'Career',
      targetDate: '2026-11-30',
      progress: 68,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal-2',
      _id: 'goal-2',
      userId: demoUserId,
      title: 'Ship Full-Stack Accountability Platform',
      description: 'Deploy production application with real-time tracking, AI insights, and mobile support.',
      category: 'Career',
      targetDate: '2026-10-15',
      progress: 92,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal-3',
      _id: 'goal-3',
      userId: demoUserId,
      title: 'Run Half Marathon (21.1 km)',
      description: 'Build weekly mileage to 35km and finish under 2 hours.',
      category: 'Fitness',
      targetDate: '2026-12-20',
      progress: 45,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'goal-4',
      _id: 'goal-4',
      userId: demoUserId,
      title: 'Read 12 Non-Fiction Books This Year',
      description: 'Focus on psychology, behavioral habits, and distributed systems.',
      category: 'Personal',
      targetDate: '2026-12-31',
      progress: 75,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Seed habits
  store.habits = [
    {
      id: 'habit-1',
      _id: 'habit-1',
      userId: demoUserId,
      title: 'DSA Practice',
      category: 'Study',
      icon: 'Code',
      currentStreak: 12,
      longestStreak: 24,
      completedDates: pastDates.slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-2',
      _id: 'habit-2',
      userId: demoUserId,
      title: 'Morning Exercise & Run',
      category: 'Fitness',
      icon: 'Activity',
      currentStreak: 8,
      longestStreak: 15,
      completedDates: pastDates.slice(0, 6),
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-3',
      _id: 'habit-3',
      userId: demoUserId,
      title: 'Reading (30 Mins)',
      category: 'Personal',
      icon: 'BookOpen',
      currentStreak: 14,
      longestStreak: 21,
      completedDates: pastDates.slice(0, 4),
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-4',
      _id: 'habit-4',
      userId: demoUserId,
      title: 'Deep Coding Session',
      category: 'Study',
      icon: 'Terminal',
      currentStreak: 9,
      longestStreak: 18,
      completedDates: pastDates.slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-5',
      _id: 'habit-5',
      userId: demoUserId,
      title: 'Meditation & Breathwork',
      category: 'Health',
      icon: 'Sprout',
      currentStreak: 6,
      longestStreak: 12,
      completedDates: pastDates.slice(0, 4),
      createdAt: new Date().toISOString()
    },
    {
      id: 'habit-6',
      _id: 'habit-6',
      userId: demoUserId,
      title: 'Hydration (3 Liters)',
      category: 'Health',
      icon: 'Droplets',
      currentStreak: 22,
      longestStreak: 30,
      completedDates: pastDates,
      createdAt: new Date().toISOString()
    }
  ];

  // Seed focus sessions
  store.focusSessions = [
    {
      id: 'focus-1',
      userId: demoUserId,
      taskTitle: 'DSA Practice (Binary Trees)',
      durationMinutes: 50,
      type: 'work',
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'focus-2',
      userId: demoUserId,
      taskTitle: 'Project Architecture & Backend',
      durationMinutes: 50,
      type: 'work',
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'focus-3',
      userId: demoUserId,
      taskTitle: 'Break & Hydration',
      durationMinutes: 10,
      type: 'break',
      completedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Seed notes
  store.notes = [
    {
      id: 'note-1',
      _id: 'note-1',
      userId: demoUserId,
      title: 'Mindfulness & The Plant Metaphor',
      content: 'Treat your brain like a living bonsai. If you don’t water it with daily focus, good sleep, and reflection, it withers. When you water it with small consistent acts of discipline, it flourishes naturally.',
      tags: ['Mindset', 'Growth', 'Philosophy'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'note-2',
      _id: 'note-2',
      userId: demoUserId,
      title: 'Operating System Review Checklist',
      content: '1. Virtual memory & paging\n2. Mutexes vs Semaphores\n3. Deadlock four conditions (Mutual exclusion, Hold & wait, No preemption, Circular wait)\n4. Context switching overhead',
      tags: ['Study', 'Computer Science'],
      isPinned: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Load or save file-backed store
function loadStoreFromFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(raw);
    } else {
      seedInitialData();
      saveStoreToFile();
    }
  } catch (err) {
    console.warn('Could not read store file, initializing in-memory store:', err);
    seedInitialData();
  }
}

function saveStoreToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store to file:', err);
  }
}

// Initialize persistent storage immediately on module load
loadStoreFromFile();

// Initialize database (MongoDB Atlas or Fallback Persistent Store)
export async function initDatabase() {
  loadStoreFromFile();

  if (MONGODB_URI) {
    try {
      console.log('Attempting connection to MongoDB Atlas...');
      mongoose.connection.on('connected', () => {
        isMongoConnected = true;
        console.log('MongoDB connection active and verified.');
      });
      mongoose.connection.on('error', (err: any) => {
        console.warn('MongoDB connection error:', err?.message || err);
        isMongoConnected = false;
      });
      mongoose.connection.on('disconnected', () => {
        isMongoConnected = false;
        console.warn('MongoDB disconnected. Fallback active.');
      });

      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000
      });
      isMongoConnected = mongoose.connection.readyState === 1;
      console.log('Connected successfully to MongoDB Atlas!');

      // Seed demo user into MongoDB if collection is fresh
      try {
        const existingUser = await User.findOne({ email: 'demo@accountability.info' });
        if (!existingUser && store.users.length > 0) {
          await User.create(store.users[0]);
        }
      } catch (seedErr) {
        console.warn('Demo user seed warning (non-fatal):', seedErr);
      }
    } catch (err: any) {
      console.warn('MongoDB Atlas connection failed or timed out. Operating seamlessly with persistent storage.', err.message || err);
      isMongoConnected = false;
      mongoose.disconnect().catch(() => {});
    }
  } else {
    console.log('No MONGODB_URI provided in environment. Running with verified persistent storage engine.');
  }
}

// =================== DATA ACCESS LAYER =================== //

export const db = {
  // Is MongoDB connection currently verified?
  isMongoDBActive(): boolean {
    return isMongoReady();
  },

  // Users
  async getUserByEmail(email: string) {
    const norm = email.toLowerCase().trim();
    if (isMongoReady()) {
      try {
        const user = await User.findOne({ email: norm });
        if (user) return user.toJSON ? user.toJSON() : user;
      } catch (err) {
        console.warn('MongoDB getUserByEmail failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.users.find(u => u.email.toLowerCase() === norm) || null;
  },

  async getUserById(id: string) {
    if (isMongoReady()) {
      try {
        const user = await User.findById(id);
        if (user) return user.toJSON ? user.toJSON() : user;
      } catch (err) {
        console.warn('MongoDB getUserById failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.users.find(u => (u.id === id || u._id === id)) || null;
  },

  async createUser(userData: any) {
    const norm = userData.email.toLowerCase().trim();
    let createdUser: any = null;

    if (isMongoReady()) {
      try {
        const user = await User.create({
          ...userData,
          email: norm
        });
        createdUser = user.toJSON ? user.toJSON() : user;
      } catch (err) {
        console.warn('MongoDB createUser failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }

    if (!createdUser) {
      createdUser = {
        ...userData,
        email: norm,
        id: `user-${Date.now()}`,
        _id: `user-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Always mirror created user to persistent store to guarantee offline resilience
    const localId = createdUser.id || (createdUser._id ? createdUser._id.toString() : `user-${Date.now()}`);
    const userToSave = {
      ...createdUser,
      id: localId,
      _id: localId,
      password: userData.password // keep hashed password for local authentication
    };
    store.users = store.users.filter(u => u.email.toLowerCase() !== norm);
    store.users.push(userToSave);
    saveStoreToFile();

    return userToSave;
  },

  async updateUser(id: string, updates: any) {
    if (isMongoReady()) {
      try {
        const user = await User.findByIdAndUpdate(id, updates, { new: true });
        if (user) return user.toJSON ? user.toJSON() : user;
      } catch (err) {
        console.warn('MongoDB updateUser failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.users.findIndex(u => u.id === id || u._id === id);
    if (idx === -1) return null;
    store.users[idx] = { ...store.users[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoreToFile();
    return store.users[idx];
  },

  // Tasks (Strictly isolated by userId)
  async getTasks(userId: string, date: string) {
    if (isMongoReady()) {
      try {
        return await Task.find({ userId, date }).sort({ order: 1, createdAt: 1 });
      } catch (err) {
        console.warn('MongoDB getTasks failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.tasks
      .filter(t => t.userId === userId && t.date === date)
      .sort((a, b) => a.order - b.order);
  },

  async createTask(taskData: any) {
    if (isMongoReady()) {
      try {
        const task = await Task.create(taskData);
        return task.toJSON ? task.toJSON() : task;
      } catch (err) {
        console.warn('MongoDB createTask failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      _id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      completed: !!taskData.completed,
      order: taskData.order || store.tasks.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.tasks.push(newTask);
    saveStoreToFile();
    return newTask;
  },

  async updateTask(id: string, userId: string, updates: any) {
    if (isMongoReady()) {
      try {
        return await Task.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
      } catch (err) {
        console.warn('MongoDB updateTask failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const taskIndex = store.tasks.findIndex(t => (t.id === id || t._id === id) && t.userId === userId);
    if (taskIndex === -1) return null;
    store.tasks[taskIndex] = { ...store.tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
    saveStoreToFile();
    return store.tasks[taskIndex];
  },

  async deleteTask(id: string, userId: string) {
    if (isMongoReady()) {
      try {
        return await Task.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('MongoDB deleteTask failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const initialLen = store.tasks.length;
    store.tasks = store.tasks.filter(t => !((t.id === id || t._id === id) && t.userId === userId));
    saveStoreToFile();
    return store.tasks.length !== initialLen;
  },

  // Hourly Planner (Strictly isolated by userId)
  async getPlanner(userId: string, date: string) {
    if (isMongoReady()) {
      try {
        const items = await DailyPlanner.find({ userId, date }).sort({ order: 1 });
        if (items && items.length > 0) return items;
      } catch (err) {
        console.warn('MongoDB getPlanner failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    } else {
      const items = store.planner.filter(p => p.userId === userId && p.date === date).sort((a, b) => a.order - b.order);
      if (items && items.length > 0) return items;
    }

    // Default 6am - 9pm hourly slots if not yet initialized for this user on this date
    const times = [
      '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM',
      '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
      '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM'
    ];
    const generated = times.map((t, idx) => ({
      id: `plan-${date}-${idx}`,
      _id: `plan-${date}-${idx}`,
      userId,
      date,
      time: t,
      plannedTask: '',
      actualTask: '',
      isCompleted: false,
      order: idx
    }));

    if (isMongoReady()) {
      try {
        return await DailyPlanner.insertMany(generated);
      } catch (err) {
        console.warn('MongoDB DailyPlanner.insertMany failed, using local store:', err);
        isMongoConnected = false;
      }
    }
    store.planner.push(...generated);
    saveStoreToFile();
    return generated;
  },

  async updatePlannerItem(id: string, userId: string, updates: any) {
    if (isMongoReady()) {
      try {
        return await DailyPlanner.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
      } catch (err) {
        console.warn('MongoDB updatePlannerItem failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.planner.findIndex(p => (p.id === id || p._id === id) && p.userId === userId);
    if (idx === -1) return null;
    store.planner[idx] = { ...store.planner[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoreToFile();
    return store.planner[idx];
  },

  async addPlannerItem(data: any) {
    if (isMongoReady()) {
      try {
        const item = await DailyPlanner.create(data);
        return item.toJSON ? item.toJSON() : item;
      } catch (err) {
        console.warn('MongoDB addPlannerItem failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newItem = {
      ...data,
      id: `plan-${Date.now()}`,
      _id: `plan-${Date.now()}`,
      order: data.order || store.planner.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.planner.push(newItem);
    saveStoreToFile();
    return newItem;
  },

  async deletePlannerItem(id: string, userId: string) {
    if (isMongoReady()) {
      try {
        return await DailyPlanner.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('MongoDB deletePlannerItem failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    store.planner = store.planner.filter(p => !((p.id === id || p._id === id) && p.userId === userId));
    saveStoreToFile();
    return true;
  },

  // Reflections (Strictly isolated by userId)
  async getReflection(userId: string, date: string) {
    if (isMongoReady()) {
      try {
        return await DailyReflection.findOne({ userId, date });
      } catch (err) {
        console.warn('MongoDB getReflection failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.reflections.find(r => r.userId === userId && r.date === date) || null;
  },

  async saveReflection(userId: string, date: string, data: any) {
    if (isMongoReady()) {
      try {
        return await DailyReflection.findOneAndUpdate(
          { userId, date },
          { ...data, userId, date },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.warn('MongoDB saveReflection failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.reflections.findIndex(r => r.userId === userId && r.date === date);
    if (idx !== -1) {
      store.reflections[idx] = {
        ...store.reflections[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveStoreToFile();
      return store.reflections[idx];
    } else {
      const newRef = {
        ...data,
        id: `ref-${date}`,
        _id: `ref-${date}`,
        userId,
        date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.reflections.push(newRef);
      saveStoreToFile();
      return newRef;
    }
  },

  // Daily Analysis (Strictly isolated by userId)
  async getAnalysis(userId: string, date: string) {
    if (isMongoReady()) {
      try {
        return await DailyAnalysis.findOne({ userId, date });
      } catch (err) {
        console.warn('MongoDB getAnalysis failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.analyses.find(a => a.userId === userId && a.date === date) || null;
  },

  async saveAnalysis(userId: string, date: string, data: any) {
    if (isMongoReady()) {
      try {
        return await DailyAnalysis.findOneAndUpdate(
          { userId, date },
          { ...data, userId, date },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.warn('MongoDB saveAnalysis failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.analyses.findIndex(a => a.userId === userId && a.date === date);
    if (idx !== -1) {
      store.analyses[idx] = {
        ...store.analyses[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      saveStoreToFile();
      return store.analyses[idx];
    } else {
      const newAna = {
        ...data,
        id: `ana-${date}`,
        _id: `ana-${date}`,
        userId,
        date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.analyses.push(newAna);
      saveStoreToFile();
      return newAna;
    }
  },

  // Strategic Goals (Strictly isolated by userId)
  async getGoals(userId: string) {
    if (isMongoReady()) {
      try {
        return await Goal.find({ userId }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('MongoDB getGoals failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.goals.filter(g => g.userId === userId);
  },

  async createGoal(data: any) {
    if (isMongoReady()) {
      try {
        const goal = await Goal.create(data);
        return goal.toJSON ? goal.toJSON() : goal;
      } catch (err) {
        console.warn('MongoDB createGoal failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newGoal = {
      ...data,
      id: `goal-${Date.now()}`,
      _id: `goal-${Date.now()}`,
      progress: data.progress || 0,
      status: data.status || 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.goals.push(newGoal);
    saveStoreToFile();
    return newGoal;
  },

  async updateGoal(id: string, userId: string, updates: any) {
    if (isMongoReady()) {
      try {
        return await Goal.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
      } catch (err) {
        console.warn('MongoDB updateGoal failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.goals.findIndex(g => (g.id === id || g._id === id) && g.userId === userId);
    if (idx === -1) return null;
    store.goals[idx] = { ...store.goals[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoreToFile();
    return store.goals[idx];
  },

  async deleteGoal(id: string, userId: string) {
    if (isMongoReady()) {
      try {
        return await Goal.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('MongoDB deleteGoal failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    store.goals = store.goals.filter(g => !((g.id === id || g._id === id) && g.userId === userId));
    saveStoreToFile();
    return true;
  },

  // Habits (Strictly isolated by userId)
  async getHabits(userId: string) {
    if (isMongoReady()) {
      try {
        return await Habit.find({ userId });
      } catch (err) {
        console.warn('MongoDB getHabits failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.habits.filter(h => h.userId === userId);
  },

  async createHabit(data: any) {
    if (isMongoReady()) {
      try {
        const habit = await Habit.create(data);
        return habit.toJSON ? habit.toJSON() : habit;
      } catch (err) {
        console.warn('MongoDB createHabit failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newHabit = {
      ...data,
      id: `habit-${Date.now()}`,
      _id: `habit-${Date.now()}`,
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.habits.push(newHabit);
    saveStoreToFile();
    return newHabit;
  },

  async toggleHabit(id: string, userId: string, date: string) {
    if (isMongoReady()) {
      try {
        const habit = await Habit.findOne({ _id: id, userId });
        if (habit) {
          const idx = habit.completedDates.indexOf(date);
          if (idx > -1) {
            habit.completedDates.splice(idx, 1);
          } else {
            habit.completedDates.push(date);
          }
          habit.currentStreak = habit.completedDates.length;
          habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
          await habit.save();
          return habit.toJSON ? habit.toJSON() : habit;
        }
      } catch (err) {
        console.warn('MongoDB toggleHabit failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.habits.findIndex(h => (h.id === id || h._id === id) && h.userId === userId);
    if (idx === -1) return null;
    const habit = store.habits[idx];
    const dateIdx = habit.completedDates.indexOf(date);
    if (dateIdx > -1) {
      habit.completedDates.splice(dateIdx, 1);
    } else {
      habit.completedDates.push(date);
    }
    habit.currentStreak = habit.completedDates.length;
    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
    saveStoreToFile();
    return habit;
  },

  async deleteHabit(id: string, userId: string) {
    if (isMongoReady()) {
      try {
        return await Habit.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('MongoDB deleteHabit failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    store.habits = store.habits.filter(h => !((h.id === id || h._id === id) && h.userId === userId));
    saveStoreToFile();
    return true;
  },

  // Focus Sessions (Strictly isolated by userId)
  async getFocusSessions(userId: string) {
    if (isMongoReady()) {
      try {
        return await FocusSession.find({ userId }).sort({ completedAt: -1 });
      } catch (err) {
        console.warn('MongoDB getFocusSessions failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.focusSessions.filter(f => f.userId === userId);
  },

  async createFocusSession(data: any) {
    if (isMongoReady()) {
      try {
        const session = await FocusSession.create(data);
        return session.toJSON ? session.toJSON() : session;
      } catch (err) {
        console.warn('MongoDB createFocusSession failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newSession = {
      ...data,
      id: `focus-${Date.now()}`,
      _id: `focus-${Date.now()}`,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    store.focusSessions.push(newSession);
    saveStoreToFile();
    return newSession;
  },

  // Notes (Strictly isolated by userId)
  async getNotes(userId: string) {
    if (isMongoReady()) {
      try {
        return await Note.find({ userId }).sort({ isPinned: -1, updatedAt: -1 });
      } catch (err) {
        console.warn('MongoDB getNotes failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    return store.notes.filter(n => n.userId === userId).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  },

  async createNote(data: any) {
    if (isMongoReady()) {
      try {
        const note = await Note.create(data);
        return note.toJSON ? note.toJSON() : note;
      } catch (err) {
        console.warn('MongoDB createNote failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const newNote = {
      ...data,
      id: `note-${Date.now()}`,
      _id: `note-${Date.now()}`,
      tags: data.tags || [],
      isPinned: !!data.isPinned,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.notes.push(newNote);
    saveStoreToFile();
    return newNote;
  },

  async updateNote(id: string, userId: string, updates: any) {
    if (isMongoReady()) {
      try {
        return await Note.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
      } catch (err) {
        console.warn('MongoDB updateNote failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    const idx = store.notes.findIndex(n => (n.id === id || n._id === id) && n.userId === userId);
    if (idx === -1) return null;
    store.notes[idx] = { ...store.notes[idx], ...updates, updatedAt: new Date().toISOString() };
    saveStoreToFile();
    return store.notes[idx];
  },

  async deleteNote(id: string, userId: string) {
    if (isMongoReady()) {
      try {
        return await Note.findOneAndDelete({ _id: id, userId });
      } catch (err) {
        console.warn('MongoDB deleteNote failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }
    store.notes = store.notes.filter(n => !((n.id === id || n._id === id) && n.userId === userId));
    saveStoreToFile();
    return true;
  },

  // Aggregated Analytics data (Calculated accurately for the authenticated user)
  async getAnalytics(userId: string, daysCount: number) {
    const today = new Date();
    const dateList: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    let userTasks: any[] = [];
    let userAnalyses: any[] = [];
    let userHabits: any[] = [];

    if (isMongoReady()) {
      try {
        userTasks = await Task.find({ userId, date: { $in: dateList } });
        userAnalyses = await DailyAnalysis.find({ userId, date: { $in: dateList } });
        userHabits = await Habit.find({ userId });
      } catch (err) {
        console.warn('MongoDB getAnalytics query failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }

    if (!isMongoReady() || (!userTasks.length && !userAnalyses.length && !userHabits.length && store.tasks.length)) {
      userTasks = store.tasks.filter(t => t.userId === userId && dateList.includes(t.date));
      userAnalyses = store.analyses.filter(a => a.userId === userId && dateList.includes(a.date));
      userHabits = store.habits.filter(h => h.userId === userId);
    }

    const dailyTrends = dateList.map(dateStr => {
      const dayTasks = userTasks.filter(t => t.date === dateStr);
      const completedTasks = dayTasks.filter(t => t.completed).length;
      const dayAnalysis = userAnalyses.find(a => a.date === dateStr);

      const dayShort = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

      return {
        date: dateStr,
        day: dayShort,
        totalTasks: dayTasks.length || (dayAnalysis ? dayAnalysis.totalTasks : 0),
        completedTasks: dayTasks.length ? completedTasks : (dayAnalysis ? dayAnalysis.tasksCompleted : 0),
        tasksCompleted: dayTasks.length ? completedTasks : (dayAnalysis ? dayAnalysis.tasksCompleted : 0),
        productivity: dayAnalysis ? dayAnalysis.productivity : 7,
        focus: dayAnalysis ? dayAnalysis.focus : 7,
        distractions: dayAnalysis ? dayAnalysis.distractions : 3,
        energy: dayAnalysis ? dayAnalysis.energy : 7
      };
    });

    const totalTasks = dailyTrends.reduce((acc, c) => acc + c.totalTasks, 0);
    const completedTasks = dailyTrends.reduce((acc, c) => acc + c.completedTasks, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const recordedAnalyses = dailyTrends.filter(t => t.productivity > 0);
    const avgProd = recordedAnalyses.length ? +(recordedAnalyses.reduce((acc, c) => acc + c.productivity, 0) / recordedAnalyses.length).toFixed(1) : 7.0;
    const avgFocus = recordedAnalyses.length ? +(recordedAnalyses.reduce((acc, c) => acc + c.focus, 0) / recordedAnalyses.length).toFixed(1) : 7.0;
    const avgDistraction = recordedAnalyses.length ? +(recordedAnalyses.reduce((acc, c) => acc + c.distractions, 0) / recordedAnalyses.length).toFixed(1) : 3.0;
    const avgEnergy = recordedAnalyses.length ? +(recordedAnalyses.reduce((acc, c) => acc + c.energy, 0) / recordedAnalyses.length).toFixed(1) : 7.0;

    const priorityBreakdown = [
      { name: 'Highest Priority', completed: userTasks.filter(t => t.priority === 'highest' && t.completed).length, total: userTasks.filter(t => t.priority === 'highest').length },
      { name: 'Medium Priority', completed: userTasks.filter(t => t.priority === 'medium' && t.completed).length, total: userTasks.filter(t => t.priority === 'medium').length },
      { name: 'Least Priority', completed: userTasks.filter(t => t.priority === 'least' && t.completed).length, total: userTasks.filter(t => t.priority === 'least').length },
      { name: 'Other Tasks', completed: userTasks.filter(t => t.priority === 'other' && t.completed).length, total: userTasks.filter(t => t.priority === 'other').length }
    ];

    const habitCompletionData = userHabits.map(h => ({
      name: h.title,
      completionRate: Math.round(((h.completedDates || []).length / Math.max(1, daysCount)) * 100),
      streak: h.currentStreak || 0
    }));

    return {
      dailyTrends,
      trendData: dailyTrends,
      taskStats: {
        completionRate,
        completedTasks,
        totalTasks
      },
      averages: {
        productivity: avgProd,
        focus: avgFocus,
        distractions: avgDistraction,
        energy: avgEnergy
      },
      summary: {
        avgProductivity: avgProd,
        avgFocus: avgFocus,
        avgDistraction: avgDistraction,
        avgEnergy: avgEnergy,
        completionRate,
        completedTasks,
        totalTasks
      },
      priorityBreakdown,
      habitCompletionData
    };
  },

  // Gather isolated user data for Gemini AI analysis
  async getAllUserDataForAi(userId: string, daysCount: number) {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - daysCount);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    if (isMongoReady()) {
      try {
        const [tasks, planner, reflections, analyses, habits, goals] = await Promise.all([
          Task.find({ userId, date: { $gte: cutoffStr } }),
          DailyPlanner.find({ userId, date: { $gte: cutoffStr } }),
          DailyReflection.find({ userId, date: { $gte: cutoffStr } }),
          DailyAnalysis.find({ userId, date: { $gte: cutoffStr } }),
          Habit.find({ userId }),
          Goal.find({ userId })
        ]);

        return {
          daysCount,
          tasks,
          planner,
          reflections,
          analyses,
          habits,
          goals
        };
      } catch (err) {
        console.warn('MongoDB getAllUserDataForAi failed, falling back to local store:', err);
        isMongoConnected = false;
      }
    }

    return {
      daysCount,
      tasks: store.tasks.filter(t => t.userId === userId && t.date >= cutoffStr),
      planner: store.planner.filter(p => p.userId === userId && p.date >= cutoffStr),
      reflections: store.reflections.filter(r => r.userId === userId && r.date >= cutoffStr),
      analyses: store.analyses.filter(a => a.userId === userId && a.date >= cutoffStr),
      habits: store.habits.filter(h => h.userId === userId),
      goals: store.goals.filter(g => g.userId === userId)
    };
  }
};
