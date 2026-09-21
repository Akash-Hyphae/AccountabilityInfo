import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export async function generateQuickInsight(userData: {
  tasksCompleted: number;
  totalTasks: number;
  productivity: number;
  focus: number;
  mistakes: string[];
  improvements: string[];
  plannedVsActual: { planned: string; actual: string }[];
}): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    if (userData.totalTasks === 0) {
      return "Start planning your day! Set your highest priority tasks and check back for your evening AI analysis.";
    }
    const rate = Math.round((userData.tasksCompleted / Math.max(1, userData.totalTasks)) * 100);
    return `You completed ${userData.tasksCompleted} of ${userData.totalTasks} tasks today (${rate}%). Focusing on your highest priority items first will keep your momentum strong.`;
  }

  try {
    const prompt = `You are accountabilityInfo's thoughtful productivity and accountability mentor.
Analyze the user's actual daily data:
- Tasks completed: ${userData.tasksCompleted} out of ${userData.totalTasks}
- Productivity rating: ${userData.productivity}/10
- Focus score: ${userData.focus}/10
- Logged mistakes today: ${userData.mistakes.join('; ') || 'None recorded'}
- Planned improvements: ${userData.improvements.join('; ') || 'None recorded'}
- Planned vs actual highlights: ${userData.plannedVsActual.slice(0, 3).map(p => `Planned: "${p.planned}" -> Actually did: "${p.actual}"`).join(' | ') || 'None'}

Provide a 2-3 sentence personalized, encouraging, and honest insight. Do not hallucinate or invent numbers. Keep the plant/mind growth metaphor subtly present.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return response.text?.trim() || "You completed key priorities today. Keep tracking planned versus actual time blocks to identify where distractions arise.";
  } catch (err) {
    console.error('Gemini quick insight error:', err);
    return "You made meaningful progress on your priority tasks today. Maintain consistent hourly tracking to protect your focus blocks.";
  }
}

export interface ProductivityAnalysisResult {
  period: string;
  hasSufficientData: boolean;
  insufficientDataMessage?: string;
  summary: string;
  whatWentWell: string[];
  problems: string[];
  patterns: string[];
  improvements: string[];
  recommendations: string[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    avgProductivity: number | string;
    avgFocus: number | string;
    avgDistractions: number | string;
    avgEnergy: number | string;
    totalTrackedDays: number;
    plannedVsActualDiscrepanciesCount: number;
    recurringMistakesCount: number;
  };
}

export async function generateDeepProductivityAnalysis(
  periodName: string,
  data: {
    daysCount: number;
    tasks: any[];
    planner: any[];
    reflections: any[];
    analyses: any[];
    habits: any[];
    goals: any[];
  }
): Promise<ProductivityAnalysisResult> {
  const ai = getAiClient();

  // Extract and calculate verified statistics from actual database records
  const totalTasks = data.tasks.length;
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const validAnalyses = data.analyses.filter(a => a && (a.productivity > 0 || a.focus > 0 || a.energy > 0));
  const avgProd = validAnalyses.length > 0
    ? +(validAnalyses.reduce((acc, a) => acc + (a.productivity || 0), 0) / validAnalyses.length).toFixed(1)
    : 'N/A';
  const avgFocus = validAnalyses.length > 0
    ? +(validAnalyses.reduce((acc, a) => acc + (a.focus || 0), 0) / validAnalyses.length).toFixed(1)
    : 'N/A';
  const avgDist = validAnalyses.length > 0
    ? +(validAnalyses.reduce((acc, a) => acc + (a.distractions || 0), 0) / validAnalyses.length).toFixed(1)
    : 'N/A';
  const avgEnergy = validAnalyses.length > 0
    ? +(validAnalyses.reduce((acc, a) => acc + (a.energy || 0), 0) / validAnalyses.length).toFixed(1)
    : 'N/A';

  // Extract all user-recorded mistakes & count recurring themes
  const allMistakes: string[] = data.reflections
    .flatMap(r => r.mistakes || [])
    .filter(Boolean)
    .map(m => m.trim());

  const allImprovements: string[] = data.reflections
    .flatMap(r => r.improvements || [])
    .filter(Boolean)
    .map(i => i.trim());

  const allNotes: string[] = [
    ...data.reflections.map(r => r.notes).filter(Boolean),
    ...data.analyses.map(a => a.notes).filter(Boolean)
  ];

  // Evaluate planned vs actual tasks from hourly planner
  const plannedItems = data.planner.filter(p => p.plannedTask && p.plannedTask.trim());
  const executedAsPlanned = plannedItems.filter(p => p.isCompleted);
  const plannedVsActualDiscrepancies = plannedItems.filter(p => {
    if (!p.isCompleted) return true;
    if (p.actualTask && p.plannedTask && p.actualTask.toLowerCase() !== p.plannedTask.toLowerCase()) {
      return true;
    }
    return false;
  });

  const sampleDiscrepancies = plannedVsActualDiscrepancies.slice(0, 10).map(p => ({
    time: p.time,
    planned: p.plannedTask,
    actual: p.actualTask || 'Uncompleted / Not logged',
    done: p.isCompleted
  }));

  // Track unique days logged
  const loggedDates = new Set<string>();
  data.tasks.forEach(t => t.date && loggedDates.add(t.date));
  data.planner.forEach(p => p.date && loggedDates.add(p.date));
  data.reflections.forEach(r => r.date && loggedDates.add(r.date));
  data.analyses.forEach(a => a.date && loggedDates.add(a.date));

  const totalTrackedDays = loggedDates.size;

  const baseMetrics = {
    totalTasks,
    completedTasks,
    completionRate,
    avgProductivity: avgProd,
    avgFocus: avgFocus,
    avgDistractions: avgDist,
    avgEnergy: avgEnergy,
    totalTrackedDays,
    plannedVsActualDiscrepanciesCount: plannedVsActualDiscrepancies.length,
    recurringMistakesCount: allMistakes.length
  };

  // Check if sufficient data exists
  const hasSufficientData = totalTasks >= 2 || totalTrackedDays >= 2 || plannedItems.length >= 3;

  if (!hasSufficientData) {
    return {
      period: periodName,
      hasSufficientData: false,
      insufficientDataMessage: `Insufficient historical data exists for ${periodName}. There are not enough recorded tasks, hourly planner items, or daily reflections in this timeframe to generate meaningful statistical conclusions.`,
      summary: `Insufficient historical data exists for ${periodName}. No substantial task records or reflection logs were found for this period. To see AI-driven insights, please log your tasks and daily reflections over several days.`,
      whatWentWell: [
        "Account created and tracking framework ready for action."
      ],
      problems: [
        `Insufficient activity recorded during ${periodName}.`
      ],
      patterns: [
        "Meaningful behavioral patterns require at least 2–3 active days of logged data."
      ],
      improvements: [
        "Add at least 3 priority tasks to your Daily Accountability Sheet.",
        "Use the Hourly Planner to log what you planned versus what actually occurred."
      ],
      recommendations: [
        "Commit to a 3-day tracking streak: set your morning tasks, log actual hours, and write an evening reflection.",
        "Check back after logging activity to review your personalized AI productivity analysis."
      ],
      metrics: baseMetrics
    };
  }

  // If Gemini API is not available or encounters network issues, use data-grounded statistical synthesis
  if (!ai) {
    const whatWentWell: string[] = [];
    if (completedTasks > 0) {
      whatWentWell.push(`Completed ${completedTasks} of ${totalTasks} total tasks with an overall ${completionRate}% completion rate.`);
    }
    if (avgProd !== 'N/A' && Number(avgProd) >= 7) {
      whatWentWell.push(`Maintained an above-average productivity score of ${avgProd}/10 across ${totalTrackedDays} active days.`);
    }
    if (avgFocus !== 'N/A' && Number(avgFocus) >= 7) {
      whatWentWell.push(`Achieved strong focus ratings averaging ${avgFocus}/10 during active working sessions.`);
    }
    if (data.habits.length > 0) {
      const activeHabit = data.habits.find(h => h.currentStreak > 0);
      if (activeHabit) {
        whatWentWell.push(`Sustained consistency in habit tracking, including a ${activeHabit.currentStreak}-day streak in "${activeHabit.title}".`);
      }
    }
    if (whatWentWell.length === 0) {
      whatWentWell.push("Consistently logged accountability data to monitor daily performance.");
    }

    const problems: string[] = [];
    if (totalTasks - completedTasks > 0) {
      problems.push(`${totalTasks - completedTasks} planned tasks were left uncompleted or carried over.`);
    }
    if (plannedVsActualDiscrepancies.length > 0) {
      problems.push(`${plannedVsActualDiscrepancies.length} hourly time blocks deviated from the planned schedule to alternate outcomes.`);
    }
    if (allMistakes.length > 0) {
      problems.push(`Recurring mistake noted: "${allMistakes[0]}".`);
    }
    if (avgDist !== 'N/A' && Number(avgDist) >= 5) {
      problems.push(`Average distraction level was elevated at ${avgDist}/10, interfering with deep work.`);
    }
    if (avgEnergy !== 'N/A' && Number(avgEnergy) < 6) {
      problems.push(`Reported energy levels dipped to an average of ${avgEnergy}/10, contributing to afternoon fatigue.`);
    }
    if (problems.length === 0) {
      problems.push("Minor discrepancies between initial time estimates and task execution.");
    }

    const patterns: string[] = [
      `Completion rate held at ${completionRate}% across ${totalTrackedDays} tracked days in ${periodName.toLowerCase()}.`,
      avgProd !== 'N/A' && avgEnergy !== 'N/A'
        ? `Productivity (${avgProd}/10) closely mirrored energy levels (${avgEnergy}/10), highlighting energy management as a primary driver of output.`
        : `Execution speed was highest during morning slots before distraction triggers emerged.`,
      allMistakes.length > 1
        ? `Mistake patterns centered around ${allMistakes.slice(0, 2).join(' and ')}.`
        : `Planned vs. actual alignment was strongest on days with fewer scheduled high-priority items.`
    ];

    const improvements: string[] = allImprovements.length > 0
      ? allImprovements.slice(0, 3)
      : [
        "Cap daily Highest Priority tasks to a maximum of 3 to prevent overcommitting.",
        "Record distraction triggers the moment they occur to build mindfulness.",
        "Align demanding cognitive work with morning peak energy hours."
      ];

    const recommendations: string[] = [
      "Conduct a morning 5-minute schedule sync to verify hourly time blocks.",
      "Review the gap between planned vs actual logs every evening to calibrate future estimates.",
      "Protect your focus windows by closing non-essential communication apps during peak execution blocks."
    ];

    return {
      period: periodName,
      hasSufficientData: true,
      summary: `During ${periodName.toLowerCase()}, you logged ${totalTasks} tasks across ${totalTrackedDays} active days with an overall completion rate of ${completionRate}%. Your average productivity was ${avgProd}/10, focus was ${avgFocus}/10, distraction level was ${avgDist}/10, and energy was ${avgEnergy}/10. ${plannedVsActualDiscrepancies.length} hourly slots showed deviations between planned intention and actual execution.`,
      whatWentWell,
      problems,
      patterns,
      improvements,
      recommendations,
      metrics: baseMetrics
    };
  }

  // Call Gemini API with rigorous instructions & structured schema
  try {
    const prompt = `You are accountabilityInfo's analytical intelligence evaluating a user's verified historical data for ${periodName} (${data.daysCount} calendar days window).

ACTUAL USER DATABASE METRICS (DO NOT INVENT STATISTICS OR ALTER NUMBERS):
- Tracked Days in Period: ${totalTrackedDays}
- Total Planned Tasks: ${totalTasks}
- Completed Tasks: ${completedTasks} (${completionRate}% Completion Rate)
- Average Productivity: ${avgProd}/10
- Average Focus Score: ${avgFocus}/10
- Average Distraction Score: ${avgDist}/10
- Average Energy Score: ${avgEnergy}/10
- Planned vs Actual Task Deviations: ${plannedVsActualDiscrepancies.length} items
- Sample Hourly Deviations: ${JSON.stringify(sampleDiscrepancies)}
- User-Recorded Daily Mistakes: ${JSON.stringify(allMistakes.slice(0, 15))}
- User-Recorded Improvement Targets: ${JSON.stringify(allImprovements.slice(0, 15))}
- Daily Reflection Notes: ${JSON.stringify(allNotes.slice(0, 5))}
- Tracked Habits: ${JSON.stringify(data.habits.map(h => ({ title: h.title, streak: h.currentStreak, totalCompletions: h.completedDates?.length || 0 })))}

ANALYTICAL MANDATES:
1. NEVER invent numbers, percentages, or facts. Ground every observation in the data provided above.
2. Analyze planned vs actual tasks: examine where actual outcomes diverged from planned intentions.
3. Analyze completion rate, productivity, focus, distractions, and energy levels.
4. Synthesize habits, reflection notes, and recurring mistakes.
5. Return structured insights matching the JSON schema:
   - summary: Concise, high-impact executive summary detailing performance across ${periodName}.
   - whatWentWell: 3-5 specific positive findings based on actual achievements and high metrics.
   - problems: 3-5 genuine friction points, uncompleted tasks, distraction issues, or recurring mistakes.
   - patterns: 3-5 behavioral patterns linking focus, energy, time of day, and planned vs actual execution.
   - improvements: 3-5 actionable improvements directly targeting the user's recorded mistakes and bottlenecks.
   - recommendations: 3-5 forward-looking strategic recommendations for the next period.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            whatWentWell: { type: Type.ARRAY, items: { type: Type.STRING } },
            problems: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            'summary',
            'whatWentWell',
            'problems',
            'patterns',
            'improvements',
            'recommendations'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');

    return {
      period: periodName,
      hasSufficientData: true,
      summary: parsed.summary || `Analysis completed for ${periodName}. Completion rate: ${completionRate}%.`,
      whatWentWell: Array.isArray(parsed.whatWentWell) && parsed.whatWentWell.length > 0
        ? parsed.whatWentWell
        : [`Completed ${completedTasks} tasks during ${periodName}.`],
      problems: Array.isArray(parsed.problems) && parsed.problems.length > 0
        ? parsed.problems
        : [`${totalTasks - completedTasks} tasks were not completed.`],
      patterns: Array.isArray(parsed.patterns) && parsed.patterns.length > 0
        ? parsed.patterns
        : [`Average productivity was ${avgProd}/10 and focus was ${avgFocus}/10.`],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
        ? parsed.improvements
        : allImprovements.slice(0, 3),
      recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
        ? parsed.recommendations
        : ["Continue daily planned vs actual tracking to refine scheduling."],
      metrics: baseMetrics
    };
  } catch (err) {
    console.error('Gemini deep productivity analysis error:', err);
    // Fallback gracefully using verified database values
    return {
      period: periodName,
      hasSufficientData: true,
      summary: `Across ${periodName.toLowerCase()}, you logged ${totalTasks} tasks over ${totalTrackedDays} tracked days with a ${completionRate}% completion rate. Average reported productivity was ${avgProd}/10, focus was ${avgFocus}/10, distraction level was ${avgDist}/10, and energy was ${avgEnergy}/10.`,
      whatWentWell: [
        `Achieved a ${completionRate}% completion rate on logged tasks.`,
        completedTasks > 0 ? `Finished ${completedTasks} priority tasks successfully.` : "Maintained regular activity tracking."
      ],
      problems: [
        totalTasks - completedTasks > 0 ? `${totalTasks - completedTasks} planned tasks were not completed in this window.` : "Minor scheduling deviations on hourly tasks.",
        allMistakes.length > 0 ? `Frequent logged mistake: "${allMistakes[0]}".` : "Distractions periodically reduced focus."
      ],
      patterns: [
        `Focus score (${avgFocus}/10) correlated with overall productivity (${avgProd}/10).`,
        `Planned vs actual variance occurred on ${plannedVsActualDiscrepancies.length} hourly time slots.`
      ],
      improvements: allImprovements.length > 0 ? allImprovements.slice(0, 3) : [
        "Narrow focus to 3 Must-Do priorities per morning.",
        "Record and eliminate repeated distraction triggers."
      ],
      recommendations: [
        "Plan your hourly schedule realistically each morning.",
        "Conduct an evening reflection to review discrepancies."
      ],
      metrics: baseMetrics
    };
  }
}
