import { useState, useEffect, useCallback } from 'react';
import { FileSearch, LogOut, Loader2, AlertCircle } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { Candidate, ScoredCandidate, ResumeSource } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { rankCandidates } from '@/lib/multiResumeAnalyzer';
import { LoginScreen } from '@/components/LoginScreen';
import { Sidebar } from '@/components/Sidebar';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CandidatePreview } from '@/components/CandidatePreview';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Sidebar state
  const [jobDescription, setJobDescription] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [techfetchEmail, setTechfetchEmail] = useState('');
  const [techfetchPassword, setTechfetchPassword] = useState('');
  const [uploadedCandidates, setUploadedCandidates] = useState<Candidate[]>([]);
  const [techfetchCandidates, setTechfetchCandidates] = useState<Candidate[]>([]);
  const [techfetchLoading, setTechfetchLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchResultCount, setSearchResultCount] = useState(0);
  const [searchSourceLabel, setSearchSourceLabel] = useState('');

  // Results state
  const [results, setResults] = useState<ScoredCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<ResumeSource>('upload');

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setAuthReady(true);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Pre-fill techfetch email with the logged-in user's email
  useEffect(() => {
    if (session?.user?.email && !techfetchEmail) {
      setTechfetchEmail(session.user.email);
    }
  }, [session]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setResults([]);
    setUploadedCandidates([]);
    setTechfetchCandidates([]);
  }, []);

  // ── TechFetch search ──
  const handleTechfetchSearch = async () => {
    if (!techfetchEmail || !techfetchPassword || !searchKeywords.trim()) return;
    setTechfetchLoading(true);
    setSearchError('');
    setUploadError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/techfetch-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          keywords: searchKeywords,
          state: stateFilter,
          email: techfetchEmail,
          password: techfetchPassword,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Search failed (${response.status})`);
      }

      const data = await response.json();
      if (!data.candidates || !Array.isArray(data.candidates)) {
        throw new Error('Unexpected response format from search service');
      }

      setTechfetchCandidates(data.candidates);
      setSearchResultCount(data.candidates.length);
      setSearchSourceLabel(data.source === 'techfetch' ? 'TechFetch' : 'TechFetch (demo data)');
      setResults([]);
      setActiveSource('techfetch');
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search TechFetch');
      setTechfetchCandidates([]);
      setSearchResultCount(0);
    } finally {
      setTechfetchLoading(false);
    }
  };

  // ── Analyze & rank ──
  const handleAnalyze = async () => {
    if (jobDescription.trim().length < 50) return;

    const candidates = activeSource === 'techfetch' ? techfetchCandidates : uploadedCandidates;
    if (candidates.length === 0) return;

    setLoading(true);
    setTimeout(async () => {
      const scored = rankCandidates(candidates, jobDescription);
      setResults(scored);
      setLoading(false);

      // Save to search history
      if (session?.user?.email) {
        await supabase.from('search_history').insert({
          user_email: session.user.email,
          job_description: jobDescription.slice(0, 5000),
          state_filter: stateFilter !== 'ALL' ? stateFilter : null,
          source: activeSource,
          candidate_count: candidates.length,
          top_score: scored[0]?.score || 0,
        });
      }
    }, 600);
  };

  const activeCandidates = activeSource === 'techfetch' ? techfetchCandidates : uploadedCandidates;
  const hasCandidates = activeCandidates.length > 0;
  const hasJd = jobDescription.trim().length >= 50;

  // ── Loading screen while auth initializes ──
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  // ── Login screen ──
  if (!session) {
    return <LoginScreen onAuthSuccess={() => {}} />;
  }

  // ── Main dashboard ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FileSearch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Resume Match</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5">TechFetch resume ranking</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{session.user.email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard layout: sidebar + results */}
      <div className="relative max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6">
          {/* Left: search & input controls */}
          <div className="lg:sticky lg:top-[88px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto pr-1">
            <Sidebar
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              stateFilter={stateFilter}
              onStateFilterChange={setStateFilter}
              searchKeywords={searchKeywords}
              onSearchKeywordsChange={setSearchKeywords}
              onTechfetchSearch={handleTechfetchSearch}
              uploadedCandidates={uploadedCandidates}
              onUploadCandidates={(cands) => {
                setUploadedCandidates(cands);
                setActiveSource('upload');
              }}
              onClearUploads={() => {
                setUploadedCandidates([]);
                if (activeSource === 'upload') setResults([]);
              }}
              onAnalyze={handleAnalyze}
              loading={loading}
              techfetchLoading={techfetchLoading}
              techfetchEmail={techfetchEmail}
              techfetchPassword={techfetchPassword}
              onTechfetchCredsChange={(email, password) => {
                setTechfetchEmail(email);
                setTechfetchPassword(password);
              }}
              hasCandidates={hasCandidates}
              hasJd={hasJd}
              uploadError={uploadError}
              onUploadError={setUploadError}
            />
          </div>

          {/* Right: ranked results or candidate preview */}
          <div className="min-w-0">
            {/* Search error banner */}
            {searchError && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-rose-300">Search failed</p>
                  <p className="text-xs text-rose-400/70 mt-0.5">{searchError}</p>
                </div>
              </div>
            )}

            {/* Zero results from search */}
            {searchResultCount === 0 && activeSource === 'techfetch' && !techfetchLoading && !searchError && techfetchCandidates.length === 0 && (
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-300">No candidates found</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">Try different keywords or set the state filter to All States.</p>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                <p className="text-sm text-slate-400">Scoring and ranking candidates...</p>
              </div>
            ) : results.length > 0 ? (
              <ResultsPanel results={results} source={activeSource} />
            ) : activeCandidates.length > 0 ? (
              <CandidatePreview
                candidates={activeCandidates}
                source={activeSource}
                sourceLabel={activeSource === 'techfetch' ? searchSourceLabel : undefined}
                hasJd={hasJd}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                  <FileSearch className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-1">No candidates yet</h3>
                <p className="text-sm text-slate-500 max-w-xs">
                  Search TechFetch or upload resumes to get started. Then add a job description and click "Score & Rank".
                </p>

                <div className="flex gap-3 mt-6">
                  <div className={`rounded-lg border px-3 py-2 text-xs ${hasJd ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                    {hasJd ? 'Job description ready' : 'No job description'}
                  </div>
                  <div className={`rounded-lg border px-3 py-2 text-xs ${hasCandidates ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                    {hasCandidates ? `${activeCandidates.length} candidates ready` : 'No candidates'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
