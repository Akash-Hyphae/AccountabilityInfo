import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  ShieldAlert,
  Sprout,
  ArrowRight,
  ThumbsUp,
  Brain,
  BatteryCharging,
  Compass,
  FileQuestion,
  TrendingUp,
  Layers,
  Calendar
} from 'lucide-react';
import { api } from '../api/api.ts';
import { Link } from 'react-router-dom';

export const AiAnalysisPage: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | '3months' | '6months'>('week');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const periods: { id: 'week' | 'month' | '3months' | '6months'; label: string }[] = [
    { id: 'week', label: 'Last Week' },
    { id: 'month', label: 'Last Month' },
    { id: '3months', label: 'Last 3 Months' },
    { id: '6months', label: 'Last 6 Months' }
  ];

  const runAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/api/ai/analyze', { period });
      setAnalysis(res.data);
    } catch (err: any) {
      console.error('Error running AI review:', err);
      setError('Failed to run AI analysis. Please verify your connection or try again.');
    } finally {
      setLoading(false);
    }
  };

  const whatWentWellList = analysis?.whatWentWell || [];
  const problemsList = analysis?.problems || analysis?.whatWentWrong || [];
  const patternsList = analysis?.patterns || [
    ...(analysis?.productivityPatterns || []),
    ...(analysis?.focusPatterns || []),
    ...(analysis?.distractionPatterns || [])
  ];
  const improvementsList = analysis?.improvements || analysis?.suggestedImprovements || [];
  const recommendationsList = analysis?.recommendations || analysis?.nextPeriodRecommendations || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-950 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-2xs">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Gemini AI Productivity Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
            Analyzing your actual historical tasks, hourly timelines, daily reflections, energy levels, and habit trends.
          </p>
        </div>

        {/* Period Selector Tabs and Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === p.id
                    ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer min-h-[38px]"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating...' : 'Run Deep Analysis'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* When no analysis is run yet */}
      {!analysis && !loading && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Ready to Analyze Your Execution?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2 leading-relaxed">
            Select a timeframe (Last Week, Last Month, Last 3 Months, or Last 6 Months) and click "Run Deep Analysis" to synthesize your real accountability data.
          </p>
          <button
            onClick={runAnalysis}
            className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
          >
            Run Deep Analysis Now
          </button>
        </div>
      )}

      {/* Loading state with Skeleton layout */}
      {loading && (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors space-y-4">
          <Sprout className="w-10 h-10 text-emerald-500 animate-bounce mx-auto" />
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Evaluating Historical Records...
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Analyzing planned vs. actual outcomes, focus zones, energy scores, and recurring reflections without inventing statistics.
            </p>
          </div>
          <div className="max-w-md mx-auto space-y-2 pt-4">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse w-3/4 mx-auto" />
          </div>
        </div>
      )}

      {/* Insufficient Data State */}
      {analysis && !loading && analysis.hasSufficientData === false && (
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 shadow-xs space-y-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                {analysis.period}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                Insufficient Historical Data
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                {analysis.insufficientDataMessage || analysis.summary}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-amber-200/70 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Next Steps to Unlock Insights:
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-400">
              {analysis.recommendations?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/accountability"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
            >
              <span>Go to Daily Accountability Sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Structured Analysis Results (Sufficient Data) */}
      {analysis && !loading && analysis.hasSufficientData !== false && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1e293b] border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                Period: {analysis.period}
              </span>
              {analysis.metrics?.totalTrackedDays !== undefined && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {analysis.metrics.totalTrackedDays} Active Days Tracked
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Executive Summary
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Verified Grounded Metrics Cards */}
          {analysis.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Completion Rate</div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {analysis.metrics.completionRate}%
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {analysis.metrics.completedTasks}/{analysis.metrics.totalTasks} Tasks
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Avg Productivity</div>
                <div className="text-lg sm:text-xl font-black text-amber-500 mt-1">
                  {analysis.metrics.avgProductivity !== 'N/A' ? `${analysis.metrics.avgProductivity}/10` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Self-reported</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Avg Focus</div>
                <div className="text-lg sm:text-xl font-black text-sky-500 mt-1">
                  {analysis.metrics.avgFocus !== 'N/A' ? `${analysis.metrics.avgFocus}/10` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Deep zone metric</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Avg Distractions</div>
                <div className="text-lg sm:text-xl font-black text-rose-500 mt-1">
                  {analysis.metrics.avgDistractions !== 'N/A' ? `${analysis.metrics.avgDistractions}/10` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Friction index</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Avg Energy</div>
                <div className="text-lg sm:text-xl font-black text-blue-500 mt-1">
                  {analysis.metrics.avgEnergy !== 'N/A' ? `${analysis.metrics.avgEnergy}/10` : '—'}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Vitality level</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 shadow-xs text-center transition-colors">
                <div className="text-[10px] font-semibold text-gray-500 uppercase">Timeline Variance</div>
                <div className="text-lg sm:text-xl font-black text-purple-500 mt-1">
                  {analysis.metrics.plannedVsActualDiscrepanciesCount}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">Planned vs Actual</div>
              </div>
            </div>
          )}

          {/* Two Column: What Went Well & Problems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Went Well */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-emerald-200/80 dark:border-emerald-950 shadow-xs transition-colors">
              <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100 dark:border-emerald-900/40 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  What Went Well
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {whatWentWellList.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Problems */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-rose-200/80 dark:border-rose-950 shadow-xs transition-colors">
              <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100 dark:border-rose-900/40 mb-3">
                <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  Problems & Bottlenecks
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {problemsList.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Patterns Section */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-amber-200/80 dark:border-amber-950 shadow-xs transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-amber-100 dark:border-amber-900/40 mb-3">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                Identified Behavioral Patterns
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {patternsList.map((item: string, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-amber-50/40 dark:bg-gray-800/60 border border-amber-100/70 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300">
                  <span className="text-amber-500 font-bold mr-1.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column: Improvements & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Improvements */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-purple-200/80 dark:border-purple-950 shadow-xs transition-colors">
              <div className="flex items-center gap-2 pb-3 border-b border-purple-100 dark:border-purple-900/40 mb-3">
                <Zap className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  Concrete Improvements
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {improvementsList.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/30">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 w-4">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#1e293b] border border-emerald-200/80 dark:border-emerald-950 shadow-xs transition-colors">
              <div className="flex items-center gap-2 pb-3 border-b border-emerald-100 dark:border-emerald-900/40 mb-3">
                <Compass className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                  Next Period Recommendations
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {recommendationsList.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30">
                    <Sprout className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
