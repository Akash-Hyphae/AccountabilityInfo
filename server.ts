import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDatabase, db } from './server/db.ts';
import { authenticateUser, AuthRequest, generateToken, hashPassword, comparePassword } from './server/auth.ts';
import { generateQuickInsight, generateDeepProductivityAnalysis } from './server/gemini.ts';

dotenv.config();

const PORT = 3000;

// Email validator regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startServer() {
  const app = express();

  // Core Middlewares
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json({ limit: '5mb' }));

  // Initialize Database asynchronously (MongoDB Atlas or persistent fallback)
  initDatabase().catch(err => {
    console.warn('Database initialization warning:', err);
  });

  // ===================== AUTHENTICATION ENDPOINTS ===================== //

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'A valid name is required.' });
        return;
      }
      if (!email || !EMAIL_REGEX.test(email.trim())) {
        res.status(400).json({ error: 'A valid email address is required.' });
        return;
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match.' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existing = await db.getUserByEmail(normalizedEmail);
      if (existing) {
        res.status(400).json({ error: 'An account with this email already exists.' });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await db.createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(normalizedEmail)}`
      });

      const userId = (newUser.id || (newUser._id ? newUser._id.toString() : '') || `user-${Date.now()}`);
      const token = generateToken(userId, newUser.email);

      res.status(201).json({
        user: {
          id: userId,
          name: newUser.name,
          email: newUser.email,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt
        },
        token
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err?.message || 'Registration failed. Please try again.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await db.getUserByEmail(normalizedEmail);
      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const userId = user.id || user._id.toString();
      const token = generateToken(userId, user.email);

      res.json({
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        },
        token
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  // Demo Login (Instant pre-populated access for evaluation)
  app.post('/api/auth/demo', async (req: Request, res: Response) => {
    try {
      const demoUser = await db.getUserByEmail('demo@accountability.info');
      if (!demoUser) {
        res.status(404).json({ error: 'Demo account not initialized.' });
        return;
      }

      const userId = demoUser.id || demoUser._id.toString();
      const token = generateToken(userId, demoUser.email);

      res.json({
        user: {
          id: userId,
          name: demoUser.name,
          email: demoUser.email,
          avatarUrl: demoUser.avatarUrl,
          createdAt: demoUser.createdAt
        },
        token
      });
    } catch (err) {
      console.error('Demo login error:', err);
      res.status(500).json({ error: 'Demo login failed.' });
    }
  });

  // Logout
  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully.' });
  });

  // Forgot password
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ error: 'Valid email is required.' });
      return;
    }
    res.json({ message: `A password reset link has been dispatched to ${email.trim()}.` });
  });

  // Get current user profile
  app.get('/api/auth/me', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const user = await db.getUserById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      res.json({
        user: {
          id: user.id || user._id.toString(),
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
  });

  // ===================== TASKS ENDPOINTS ===================== //

  // Get tasks for date (Filtered strictly by authenticated user)
  app.get('/api/tasks', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const tasks = await db.getTasks(req.userId!, date);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  });

  // Create task
  app.post('/api/tasks', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, priority, date, dueDate } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Task title is required.' });
        return;
      }

      const validPriorities = ['highest', 'medium', 'least', 'other'];
      const taskPriority = validPriorities.includes(priority) ? priority : 'medium';
      const targetDate = date || new Date().toISOString().split('T')[0];

      const task = await db.createTask({
        userId: req.userId!,
        title: title.trim(),
        description: (description || '').trim(),
        priority: taskPriority,
        completed: false,
        date: targetDate,
        dueDate: dueDate || targetDate
      });

      res.status(201).json(task);
    } catch (err) {
      console.error('Task creation error:', err);
      res.status(500).json({ error: 'Failed to create task.' });
    }
  });

  // Update task (Filtered strictly by user and ID)
  app.put('/api/tasks/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates: any = {};

      if (req.body.title !== undefined) updates.title = req.body.title.trim();
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.priority !== undefined) updates.priority = req.body.priority;
      if (req.body.completed !== undefined) updates.completed = Boolean(req.body.completed);
      if (req.body.order !== undefined) updates.order = Number(req.body.order);
      if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate;

      const updated = await db.updateTask(id, req.userId!, updates);
      if (!updated) {
        res.status(404).json({ error: 'Task not found or unauthorized.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update task.' });
    }
  });

  // Delete task
  app.delete('/api/tasks/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const deleted = await db.deleteTask(req.params.id, req.userId!);
      if (!deleted) {
        res.status(404).json({ error: 'Task not found or unauthorized.' });
        return;
      }
      res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete task.' });
    }
  });

  // ===================== PLANNER ENDPOINTS ===================== //

  // Get planner for date
  app.get('/api/planner/:date', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.params;
      const planner = await db.getPlanner(req.userId!, date);
      res.json(planner);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch hourly planner.' });
    }
  });

  // Add custom planner row
  app.post('/api/planner', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date, time, plannedTask, actualTask, isCompleted } = req.body;

      if (!time || typeof time !== 'string') {
        res.status(400).json({ error: 'Time block label is required.' });
        return;
      }

      const item = await db.addPlannerItem({
        userId: req.userId!,
        date: date || new Date().toISOString().split('T')[0],
        time: time.trim(),
        plannedTask: (plannedTask || '').trim(),
        actualTask: (actualTask || '').trim(),
        isCompleted: Boolean(isCompleted)
      });

      res.status(201).json(item);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add planner item.' });
    }
  });

  // Update planner row
  app.put('/api/planner/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates: any = {};

      if (req.body.plannedTask !== undefined) updates.plannedTask = req.body.plannedTask;
      if (req.body.actualTask !== undefined) updates.actualTask = req.body.actualTask;
      if (req.body.isCompleted !== undefined) updates.isCompleted = Boolean(req.body.isCompleted);
      if (req.body.time !== undefined) updates.time = req.body.time;

      const updated = await db.updatePlannerItem(id, req.userId!, updates);
      if (!updated) {
        res.status(404).json({ error: 'Planner item not found or unauthorized.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update planner item.' });
    }
  });

  // Delete planner row
  app.delete('/api/planner/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      await db.deletePlannerItem(req.params.id, req.userId!);
      res.json({ message: 'Planner row removed.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete planner row.' });
    }
  });

  // ===================== REFLECTION ENDPOINTS ===================== //

  // Get reflection
  app.get('/api/reflection/:date', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.params;
      const reflection = await db.getReflection(req.userId!, date);
      res.json(reflection || { date, mistakes: [], improvements: [], notes: '' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch reflection.' });
    }
  });

  // Save reflection
  app.post('/api/reflection', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date, mistakes, improvements, notes } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const saved = await db.saveReflection(req.userId!, targetDate, {
        mistakes: Array.isArray(mistakes) ? mistakes.filter(Boolean) : [],
        improvements: Array.isArray(improvements) ? improvements.filter(Boolean) : [],
        notes: (notes || '').trim()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save reflection.' });
    }
  });

  app.put('/api/reflection/:date', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.params;
      const { mistakes, improvements, notes } = req.body;

      const saved = await db.saveReflection(req.userId!, date, {
        mistakes: Array.isArray(mistakes) ? mistakes.filter(Boolean) : [],
        improvements: Array.isArray(improvements) ? improvements.filter(Boolean) : [],
        notes: typeof notes === 'string' ? notes.trim() : ''
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update reflection.' });
    }
  });

  // ===================== DAILY ANALYSIS ENDPOINTS ===================== //

  // Helper to clamp score 1-10
  const clampScore = (v: any, def: number) => {
    const num = Number(v);
    if (isNaN(num)) return def;
    return Math.max(1, Math.min(10, num));
  };

  // Get daily analysis
  app.get('/api/analysis/:date', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.params;
      const analysis = await db.getAnalysis(req.userId!, date);
      res.json(analysis || {
        date,
        tasksCompleted: 0,
        totalTasks: 0,
        productivity: 7,
        focus: 7,
        distractions: 3,
        energy: 7,
        isGoodDay: true,
        notes: ''
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch daily analysis.' });
    }
  });

  // Save daily analysis
  app.post('/api/analysis', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date, tasksCompleted, totalTasks, productivity, focus, distractions, energy, isGoodDay, notes } = req.body;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const saved = await db.saveAnalysis(req.userId!, targetDate, {
        tasksCompleted: Math.max(0, Number(tasksCompleted) || 0),
        totalTasks: Math.max(0, Number(totalTasks) || 0),
        productivity: clampScore(productivity, 7),
        focus: clampScore(focus, 7),
        distractions: clampScore(distractions, 3),
        energy: clampScore(energy, 7),
        isGoodDay: isGoodDay !== undefined ? Boolean(isGoodDay) : true,
        notes: typeof notes === 'string' ? notes.trim() : ''
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save daily analysis.' });
    }
  });

  app.put('/api/analysis/:date', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { date } = req.params;
      const { tasksCompleted, totalTasks, productivity, focus, distractions, energy, isGoodDay, notes } = req.body;

      const saved = await db.saveAnalysis(req.userId!, date, {
        tasksCompleted: Math.max(0, Number(tasksCompleted) || 0),
        totalTasks: Math.max(0, Number(totalTasks) || 0),
        productivity: clampScore(productivity, 7),
        focus: clampScore(focus, 7),
        distractions: clampScore(distractions, 3),
        energy: clampScore(energy, 7),
        isGoodDay: isGoodDay !== undefined ? Boolean(isGoodDay) : true,
        notes: typeof notes === 'string' ? notes.trim() : ''
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update daily analysis.' });
    }
  });

  // ===================== GOALS ENDPOINTS ===================== //

  app.get('/api/goals', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const goals = await db.getGoals(req.userId!);
      res.json(goals);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch goals.' });
    }
  });

  app.post('/api/goals', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, category, targetDate, progress, status } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Goal title is required.' });
        return;
      }
      if (!targetDate) {
        res.status(400).json({ error: 'Target completion date is required.' });
        return;
      }

      const goal = await db.createGoal({
        userId: req.userId!,
        title: title.trim(),
        description: (description || '').trim(),
        category: category || 'Personal',
        targetDate,
        progress: Math.max(0, Math.min(100, Number(progress) || 0)),
        status: status || 'In Progress'
      });

      res.status(201).json(goal);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create goal.' });
    }
  });

  app.put('/api/goals/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates: any = {};

      if (req.body.title !== undefined) updates.title = req.body.title.trim();
      if (req.body.description !== undefined) updates.description = req.body.description.trim();
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.targetDate !== undefined) updates.targetDate = req.body.targetDate;
      if (req.body.progress !== undefined) updates.progress = Math.max(0, Math.min(100, Number(req.body.progress) || 0));
      if (req.body.status !== undefined) updates.status = req.body.status;

      const updated = await db.updateGoal(id, req.userId!, updates);
      if (!updated) {
        res.status(404).json({ error: 'Goal not found or unauthorized.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update goal.' });
    }
  });

  app.delete('/api/goals/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      await db.deleteGoal(req.params.id, req.userId!);
      res.json({ message: 'Goal deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete goal.' });
    }
  });

  // ===================== HABITS ENDPOINTS ===================== //

  app.get('/api/habits', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const habits = await db.getHabits(req.userId!);
      res.json(habits);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch habits.' });
    }
  });

  app.post('/api/habits', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { title, category, icon } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'Habit title is required.' });
        return;
      }

      const habit = await db.createHabit({
        userId: req.userId!,
        title: title.trim(),
        category: (category || 'General').trim(),
        icon: icon || 'Sprout'
      });

      res.status(201).json(habit);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create habit.' });
    }
  });

  app.put('/api/habits/:id/toggle', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const date = req.body.date || new Date().toISOString().split('T')[0];
      const updated = await db.toggleHabit(req.params.id, req.userId!, date);
      if (!updated) {
        res.status(404).json({ error: 'Habit not found or unauthorized.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to toggle habit status.' });
    }
  });

  app.delete('/api/habits/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      await db.deleteHabit(req.params.id, req.userId!);
      res.json({ message: 'Habit removed successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete habit.' });
    }
  });

  // ===================== FOCUS SESSIONS ENDPOINTS ===================== //

  app.get('/api/focus', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const sessions = await db.getFocusSessions(req.userId!);
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch focus sessions.' });
    }
  });

  app.post('/api/focus', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { taskId, taskTitle, durationMinutes, type } = req.body;

      const duration = Math.max(1, Number(durationMinutes) || 25);
      const sessionType = type === 'break' ? 'break' : 'work';

      const session = await db.createFocusSession({
        userId: req.userId!,
        taskId,
        taskTitle: (taskTitle || 'Deep Focus Session').trim(),
        durationMinutes: duration,
        type: sessionType
      });

      res.status(201).json(session);
    } catch (err) {
      res.status(500).json({ error: 'Failed to log focus session.' });
    }
  });

  // ===================== NOTES ENDPOINTS ===================== //

  app.get('/api/notes', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const notes = await db.getNotes(req.userId!);
      res.json(notes);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notes.' });
    }
  });

  app.post('/api/notes', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { title, content, tags, isPinned } = req.body;

      const note = await db.createNote({
        userId: req.userId!,
        title: (title || 'Untitled Note').trim(),
        content: content || '',
        tags: Array.isArray(tags) ? tags : [],
        isPinned: Boolean(isPinned)
      });

      res.status(201).json(note);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create note.' });
    }
  });

  app.put('/api/notes/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates: any = {};

      if (req.body.title !== undefined) updates.title = req.body.title.trim();
      if (req.body.content !== undefined) updates.content = req.body.content;
      if (req.body.tags !== undefined && Array.isArray(req.body.tags)) updates.tags = req.body.tags;
      if (req.body.isPinned !== undefined) updates.isPinned = Boolean(req.body.isPinned);

      const updated = await db.updateNote(id, req.userId!, updates);
      if (!updated) {
        res.status(404).json({ error: 'Note not found or unauthorized.' });
        return;
      }
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update note.' });
    }
  });

  app.delete('/api/notes/:id', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      await db.deleteNote(req.params.id, req.userId!);
      res.json({ message: 'Note deleted successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete note.' });
    }
  });

  // ===================== ANALYTICS ENDPOINTS ===================== //

  app.get('/api/analytics', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string, 10) || 7;
      const analytics = await db.getAnalytics(req.userId!, days);
      res.json(analytics);
    } catch (err) {
      res.status(500).json({ error: 'Failed to aggregate analytics.' });
    }
  });

  // ===================== AI INTELLIGENCE ENDPOINTS (Backend-Only Gemini) ===================== //

  // Quick Daily AI Insight
  app.get('/api/ai/quick-insight', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const [tasks, analysis, reflection, planner] = await Promise.all([
        db.getTasks(req.userId!, date),
        db.getAnalysis(req.userId!, date),
        db.getReflection(req.userId!, date),
        db.getPlanner(req.userId!, date)
      ]);

      const tasksCompleted = tasks.filter((t: any) => t.completed).length;
      const insight = await generateQuickInsight({
        tasksCompleted,
        totalTasks: tasks.length,
        productivity: analysis?.productivity || 7,
        focus: analysis?.focus || 7,
        mistakes: reflection?.mistakes || [],
        improvements: reflection?.improvements || [],
        plannedVsActual: planner?.map((p: any) => ({ planned: p.plannedTask, actual: p.actualTask })) || []
      });

      res.json({ insight, date });
    } catch (err) {
      console.error('Quick insight error:', err);
      res.status(500).json({ error: 'Could not generate AI insight.' });
    }
  });

  // Deep Gemini Productivity Analysis
  app.post('/api/ai/analyze', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { period } = req.body;
      let daysCount = 7;
      let periodName = 'Last Week';

      const p = String(period || '').toLowerCase().trim();
      if (p === 'month' || p === 'last-month' || p === 'last month' || p === '30d') {
        daysCount = 30;
        periodName = 'Last Month';
      } else if (p === '3months' || p === 'last-3-months' || p === 'last 3 months' || p === '90d') {
        daysCount = 90;
        periodName = 'Last 3 Months';
      } else if (p === '6months' || p === 'last-6-months' || p === 'last 6 months' || p === '180d') {
        daysCount = 180;
        periodName = 'Last 6 Months';
      }

      const userData = await db.getAllUserDataForAi(req.userId!, daysCount);
      const analysis = await generateDeepProductivityAnalysis(periodName, userData);

      res.json(analysis);
    } catch (err: any) {
      console.error('AI analyze error:', err);
      res.status(500).json({ error: 'AI analysis failed. Please try again.' });
    }
  });

  // ===================== SETTINGS & PROFILE ===================== //

  app.put('/api/settings/profile', authenticateUser, async (req: AuthRequest, res: Response) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'A valid name is required.' });
        return;
      }

      const updated = await db.updateUser(req.userId!, { name: name.trim() });
      if (!updated) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      res.json({
        message: 'Profile updated successfully.',
        user: {
          id: updated.id || updated._id.toString(),
          name: updated.name,
          email: updated.email
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // Health check endpoint (Reports database status)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'accountabilityInfo',
      mongoConnected: db.isMongoDBActive(),
      timestamp: new Date().toISOString()
    });
  });

  // ===================== VITE MIDDLEWARE / PRODUCTION STATIC ASSETS ===================== //

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`accountabilityInfo server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
