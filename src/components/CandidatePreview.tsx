import { MapPin, Briefcase, Clock, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Candidate } from '@/types';

interface CandidatePreviewProps {
  candidates: Candidate[];
  source: 'techfetch' | 'upload';
  sourceLabel?: string;
  hasJd: boolean;
}

export function CandidatePreview({ candidates, source, sourceLabel, hasJd }: CandidatePreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2.5">
          <Search className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-200">Candidates Found</h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
          </span>
          {sourceLabel && (
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-400">
              {sourceLabel}
            </span>
          )}
        </div>
      </div>

      {!hasJd && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <AlertCircle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            Add a job description and click "Score & Rank Candidates" to see match scores.
          </p>
        </div>
      )}

      {candidates.map((c, index) => (
        <div
          key={c.id}
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-sm font-medium text-slate-600">{index + 1}</span>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-400">
                {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-100">{c.name}</h3>
                {c.state && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {c.state}
                  </span>
                )}
              </div>
              {c.title && (
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" />
                  {c.title}
                  {c.experience > 0 && (
                    <span className="text-slate-600">· {c.experience} yrs exp</span>
                  )}
                </p>
              )}
              {c.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.skills.slice(0, 8).map((s) => (
                    <span key={s} className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                      {s}
                    </span>
                  ))}
                  {c.skills.length > 8 && (
                    <span className="text-xs text-slate-500 py-0.5">+{c.skills.length - 8}</span>
                  )}
                </div>
              )}
              {c.resumeText && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                  {c.resumeText.slice(0, 200)}...
                </p>
              )}
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500/30 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
