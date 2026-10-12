import { useState, useRef } from 'react';
import {
  Briefcase, FileText, Upload, Search, MapPin, Loader2,
  Sparkles, FileUp, X, Trash2, User,
} from 'lucide-react';
import type { Candidate, ResumeSource } from '@/types';
import { parseFile } from '@/lib/fileParser';
import { supabase } from '@/lib/supabaseClient';

const US_STATES = [
  'ALL', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
  'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX',
  'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

interface SidebarProps {
  jobDescription: string;
  onJobDescriptionChange: (v: string) => void;
  stateFilter: string;
  onStateFilterChange: (v: string) => void;
  searchKeywords: string;
  onSearchKeywordsChange: (v: string) => void;
  onTechfetchSearch: () => void;
  uploadedCandidates: Candidate[];
  onUploadCandidates: (candidates: Candidate[]) => void;
  onClearUploads: () => void;
  onAnalyze: () => void;
  loading: boolean;
  techfetchLoading: boolean;
  techfetchEmail: string;
  techfetchPassword: string;
  onTechfetchCredsChange: (email: string, password: string) => void;
  hasCandidates: boolean;
  hasJd: boolean;
  uploadError: string;
  onUploadError: (msg: string) => void;
}

export function Sidebar(props: SidebarProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadLoading(true);
    props.onUploadError('');

    try {
    const newCandidates: Candidate[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await parseFile(file);
        const name = extractNameFromText(text) || file.name.replace(/\.(pdf|docx?)$/i, '');
        newCandidates.push({
          id: `upload-${Date.now()}-${i}`,
          name,
          title: extractTitleFromText(text),
          state: extractStateFromText(text),
          skills: [],
          experience: 0,
          resumeText: text,
        });
      } catch (err: any) {
        props.onUploadError(`${file.name}: ${err.message}`);
      }
    }
    if (newCandidates.length > 0) {
      props.onUploadCandidates([...props.uploadedCandidates, ...newCandidates]);
    }
    } catch (err: any) {
      props.onUploadError(err.message || 'Failed to upload files');
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canAnalyze = props.hasJd && props.hasCandidates;

  return (
    <div className="space-y-5">
      {/* Job Description */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
            <Briefcase className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-200">Job Description</h3>
            <p className="text-xs text-slate-500">{props.jobDescription.trim().split(/\s+/).filter(Boolean).length} words</p>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all">
            <FileUp className="w-3.5 h-3.5" />
            PDF/Word
            <input
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  parseFile(f).then((text) => props.onJobDescriptionChange(text)).catch((err) => props.onUploadError(`JD file: ${err.message}`));
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />
          </label>
        </div>
        <textarea
          value={props.jobDescription}
          onChange={(e) => props.onJobDescriptionChange(e.target.value)}
          placeholder="Paste a job description here, or upload a PDF/Word file..."
          className="w-full h-48 resize-none rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
        />
      </div>

      {/* State filter */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">State Filter</h3>
        </div>
        <select
          value={props.stateFilter}
          onChange={(e) => props.onStateFilterChange(e.target.value)}
          className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
        >
          {US_STATES.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All States' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Tab switcher: TechFetch Search vs Direct Upload */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="flex gap-1 mb-4 p-1 bg-slate-950/60 rounded-lg">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
              activeTab === 'search' ? 'bg-slate-800 text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            TechFetch Search
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Resumes
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">TechFetch Email</label>
              <input
                type="email"
                value={props.techfetchEmail}
                onChange={(e) => props.onTechfetchCredsChange(e.target.value, props.techfetchPassword)}
                placeholder="your@techfetch.com"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">TechFetch Password</label>
              <input
                type="password"
                value={props.techfetchPassword}
                onChange={(e) => props.onTechfetchCredsChange(props.techfetchEmail, e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Search Keywords</label>
              <input
                type="text"
                value={props.searchKeywords}
                onChange={(e) => props.onSearchKeywordsChange(e.target.value)}
                placeholder="e.g. React Python AWS"
                className="w-full rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <button
              onClick={props.onTechfetchSearch}
              disabled={props.techfetchLoading || !props.techfetchEmail || !props.techfetchPassword || !props.searchKeywords.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {props.techfetchLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching TechFetch...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search Resumes
                </>
              )}
            </button>
            <p className="text-xs text-slate-600 leading-relaxed">
              Uses your TechFetch.com credentials to search candidate resumes.
              Falls back to demo data if the API is unavailable.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="cursor-pointer border-2 border-dashed border-slate-700 rounded-xl py-10 px-6 text-center hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all"
            >
              {uploadLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  <p className="text-sm text-slate-400">Parsing files...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <FileUp className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">Drop resume files here</p>
                  <p className="text-xs text-slate-500">PDF or Word (.docx) — click or drag</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {props.uploadedCandidates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {props.uploadedCandidates.length} resume{props.uploadedCandidates.length !== 1 ? 's' : ''} uploaded
                  </span>
                  <button
                    onClick={props.onClearUploads}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>
                {props.uploadedCandidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-2.5 rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2">
                    <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-300 truncate flex-1">{c.name}</span>
                    <button
                      onClick={() => props.onUploadCandidates(props.uploadedCandidates.filter((x) => x.id !== c.id))}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {props.uploadError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">
                {props.uploadError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analyze button */}
      <button
        onClick={props.onAnalyze}
        disabled={!canAnalyze || props.loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
      >
        {props.loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Scoring candidates...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Score & Rank Candidates
          </>
        )}
      </button>
      {!canAnalyze && (
        <p className="text-xs text-slate-600 text-center">
          {!props.hasJd ? 'Add a job description' : !props.hasCandidates ? 'Search or upload resumes to begin' : ''}
        </p>
      )}
    </div>
  );
}

// ── Text extraction helpers for uploaded resumes ──
function extractNameFromText(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  // First non-empty line that looks like a name (no numbers, < 50 chars)
  for (const line of lines.slice(0, 5)) {
    if (line.length < 50 && !line.includes('@') && !/\d{3}/.test(line) && /[a-zA-Z]/.test(line)) {
      return line;
    }
  }
  return '';
}

function extractTitleFromText(text: string): string {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 10)) {
    if (/engineer|developer|designer|analyst|manager|architect|scientist|consultant|specialist/i.test(line) && line.length < 80) {
      return line;
    }
  }
  return '';
}

function extractStateFromText(text: string): string {
  const statePattern = /\b([A-Z]{2})\b/;
  const match = text.match(statePattern);
  if (match) return match[1];
  return '';
}
