import { useState } from 'react';
import {
  Trophy, ChevronDown, ChevronUp, Check, X, MapPin,
  Briefcase, Clock, TrendingUp, Award, FileSearch,
} from 'lucide-react';
import type { ScoredCandidate } from '@/types';

interface ResultsPanelProps {
  results: ScoredCandidate[];
  source: 'techfetch' | 'upload';
}

export function ResultsPanel({ results, source }: ResultsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
          <FileSearch className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-1">No results yet</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Search TechFetch or upload resumes, then add a job description and click "Score & Rank" to see ranked candidates.
        </p>
      </div>
    );
  }

  const topScore = results[0]?.score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'from-emerald-500 to-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-500/30' };
    if (score >= 50) return { bg: 'from-blue-500 to-blue-400', text: 'text-blue-400', ring: 'ring-blue-500/30' };
    if (score >= 30) return { bg: 'from-amber-500 to-amber-400', text: 'text-amber-400', ring: 'ring-amber-500/30' };
    return { bg: 'from-rose-500 to-rose-400', text: 'text-rose-400', ring: 'ring-rose-500/30' };
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-200">Ranked Candidates</h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            {results.length} candidate{results.length !== 1 ? 's' : ''}
          </span>
          <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-400">
            Source: {source === 'techfetch' ? 'TechFetch' : 'Upload'}
          </span>
        </div>
      </div>

      {/* Top score banner */}
      {topScore > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-900/30 px-4 py-3 mb-2">
          <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300">
              Top match: <span className="font-semibold text-slate-100">{results[0].candidate.name}</span>
              {' — '}{results[0].candidate.title}
            </p>
          </div>
          <span className={`text-lg font-bold tabular-nums ${getScoreColor(topScore).text}`}>
            {topScore}%
          </span>
        </div>
      )}

      {/* Ranked list */}
      {results.map((scored, index) => {
        const isExpanded = expandedId === scored.candidate.id;
        const color = getScoreColor(scored.score);
        const matchedNames = scored.matchedKeywords.map((m) => m.keyword);
        const missingNames = scored.missingKeywords.slice(0, 6).map((m) => m.keyword);

        return (
          <div
            key={scored.candidate.id}
            className={`rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all hover:border-slate-700 ${isExpanded ? 'ring-1 ' + color.ring : ''}`}
          >
            {/* Candidate row */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : scored.candidate.id)}
            >
              {/* Rank number */}
              <div className="flex-shrink-0 w-8 text-center">
                {index < 3 ? (
                  <span className={`text-lg font-bold ${
                    index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-400' : 'text-orange-400'
                  }`}>
                    {index + 1}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-slate-600">{index + 1}</span>
                )}
              </div>

              {/* Score circle */}
              <div className="flex-shrink-0 relative w-14 h-14">
                <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                  <circle
                    cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
                    className={color.text}
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - scored.score / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold tabular-nums ${color.text}`}>{scored.score}</span>
                </div>
              </div>

              {/* Candidate info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-100 truncate">{scored.candidate.name}</h3>
                  {scored.candidate.state && (
                    <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      {scored.candidate.state}
                    </span>
                  )}
                </div>
                {scored.candidate.title && (
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" />
                    {scored.candidate.title}
                    {scored.candidate.experience > 0 && (
                      <span className="text-slate-600">· {scored.candidate.experience} yrs exp</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{scored.explanation}</p>
              </div>

              {/* Matched keywords preview */}
              <div className="hidden md:flex flex-wrap gap-1.5 max-w-[200px] flex-shrink-0">
                {matchedNames.slice(0, 3).map((kw) => (
                  <span key={kw} className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                    {kw}
                  </span>
                ))}
                {matchedNames.length > 3 && (
                  <span className="text-xs text-slate-500 py-0.5">+{matchedNames.length - 3}</span>
                )}
              </div>

              {/* Expand toggle */}
              <div className="flex-shrink-0 text-slate-500">
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-slate-800 p-4 space-y-4 bg-slate-950/40">
                {/* Matched keywords */}
                {matchedNames.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Matched Skills ({matchedNames.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedNames.map((kw) => (
                        <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs text-emerald-300">
                          <Check className="w-3 h-3" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing keywords */}
                {missingNames.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" />
                      Missing from JD ({scored.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingNames.map((kw) => (
                        <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-rose-500/5 border border-rose-500/15 px-2.5 py-1 text-xs text-rose-400/70">
                          <X className="w-3 h-3" />
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category breakdown */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Category Breakdown
                  </p>
                  <div className="space-y-2">
                    {scored.categoryScores.filter((cs) => cs.total > 0).map((cs) => (
                      <div key={cs.category} className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-32 flex-shrink-0">{cs.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                            style={{ width: `${cs.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 tabular-nums w-12 text-right">{cs.matched}/{cs.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resume snippet */}
                {scored.candidate.resumeText && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                      <FileSearch className="w-3.5 h-3.5" />
                      Resume Excerpt
                    </p>
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 leading-relaxed max-h-40 overflow-y-auto">
                      {scored.candidate.resumeText.slice(0, 600)}
                      {scored.candidate.resumeText.length > 600 && '...'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
