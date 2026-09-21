import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, ArrowRight, Sprout } from 'lucide-react';
import { api } from '../../api/api.ts';

interface AiInsightCardProps {
  date: string;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ date }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchInsight = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/ai/quick-insight?date=${date}`);
      setInsight(res.data.insight);
    } catch (err) {
      console.error('Failed to load AI insight:', err);
      setInsight('Track your highest priority tasks and log planned vs actual hours to unlock tailored insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [date]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-emerald-950/30 dark:via-[#1e293b] dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-900/60 p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
              <span>Nurture Insight</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                Gemini Intelligence
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personalized accountability feedback from today's logged performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInsight}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            title="Refresh insight"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/ai-analysis')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/50 transition-colors"
          >
            <span>Deep Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Insight text */}
      <div className="min-h-[48px] flex items-center">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
            <Sprout className="w-4 h-4 text-emerald-500 animate-bounce" />
            <span>Analyzing your planned tasks, focus rating, and mistakes...</span>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            "{insight}"
          </p>
        )}
      </div>
    </div>
  );
};
