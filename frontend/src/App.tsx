import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import SuggestedJobs from './SuggestedJobs';
import SidebarNav from './SidebarNav';
import ResumeTab from './ResumeTab';
import OverviewTab from './OverviewTab';
import JobList from './JobList';

// Types for job and resume data
interface Job {
  job_title?: string;
  title?: string;
  company_name?: string;
  employer_name?: string;
  company?: string;
  location?: string;
  job_location?: string;
  job_description?: string;
  job_required_skills?: string[];
  skills?: string[];
  job_apply_link?: string;
  apply_link?: string;
  job_url?: string;
  match_score?: number;
  match_analysis?: any;
}

interface ResumeData {
  skills?: string[];
  education?: string;
  experience?: string[];
  projects?: string[];
  interests?: string[];
}

const App: React.FC = () => {
  // Form state
  const [jobTitle, setJobTitle] = useState('Software Engineer Intern');
  const [location, setLocation] = useState('Herndon, VA');
  const [radius, setRadius] = useState(25);
  const [additional, setAdditional] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // App state
  const [results, setResults] = useState<Job[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalJobIndex, setModalJobIndex] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterLoading, setCoverLetterLoading] = useState(false);

  // Tab state
  const [currentTab, setCurrentTab] = useState('jobs');
  const [expandedJobIdx, setExpandedJobIdx] = useState<number | null>(null);

  // Add Gemini-powered job description state
  const [geminiJobText, setGeminiJobText] = useState('');
  const [geminiFilters, setGeminiFilters] = useState<any>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);

  // Modal close handler
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setCoverLetter(null);
    setCoverLetterLoading(false);
    setModalJobIndex(null);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, closeModal]);

  // Generate cover letter when modal opens
  useEffect(() => {
    const fetchCoverLetter = async () => {
      if (modalOpen && modalJobIndex !== null && results[modalJobIndex] && resumeData) {
        setCoverLetterLoading(true);
        setCoverLetter(null);
        try {
          const response = await fetch('/generate_cover_letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job: results[modalJobIndex], resume_data: resumeData }),
          });
          const data = await response.json();
          if (response.ok && data.cover_letter) {
            setCoverLetter(data.cover_letter);
          } else {
            setCoverLetter(data.error || 'Could not generate cover letter. Please try again.');
          }
        } catch (err) {
          setCoverLetter('Network error. Please try again.');
        } finally {
          setCoverLetterLoading(false);
        }
      }
    };
    if (modalOpen) fetchCoverLetter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, modalJobIndex]);

  // Handler for Gemini filter extraction
  const handleGeminiExtract = async () => {
    if (!geminiJobText.trim()) return;
    setGeminiLoading(true);
    setGeminiFilters(null);
    try {
      const response = await fetch('/api/extract_filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_text: geminiJobText }),
      });
      const data = await response.json();
      setGeminiFilters(data.filters);
      // Log extracted filters
      console.log('Gemini extracted filters:', data.filters);
      // Optionally auto-fill filter fields
      if (data.filters) {
        if (data.filters.job_title) setJobTitle(data.filters.job_title);
        if (data.filters.location) setLocation(data.filters.location);
        if (data.filters.additional) setAdditional(data.filters.additional);
        // You can add more mappings as needed
      }
    } catch (err) {
      console.error('Error extracting filters with Gemini:', err);
    } finally {
      setGeminiLoading(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setResumeData(null);

    const formData = new FormData();
    formData.append('job_title', jobTitle);
    formData.append('location', location);
    formData.append('radius', String(radius));
    formData.append('additional', additional);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }

    try {
      const response = await fetch('/api/search_jobs', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'An error occurred.');
      } else if (data.error) {
        setError(data.error);
      }
      setResults(data.results || []);
      setResumeData(data.resume_data || null);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-mockup-layout">
      <Header
        jobTitle={jobTitle}
        setJobTitle={setJobTitle}
        location={location}
        setLocation={setLocation}
        radius={radius}
        setRadius={setRadius}
        additional={additional}
        setAdditional={setAdditional}
        onSearch={handleSubmit}
        loading={loading}
        resumeFile={resumeFile}
        onResumeUpload={setResumeFile}
      />
      {/* Gemini-powered job description input */}
      {currentTab === 'jobs' && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 0 }}>
          <div className="logo-search-container" style={{ marginBottom: 0, marginTop: '-1.2rem' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 6px 0 rgba(0,0,0,0.04)',
                padding: '0.4rem 0.7rem',
              }}
            >
              <textarea
                rows={1}
                placeholder="Describe the job or internship you want..."
                value={geminiJobText}
                onChange={e => setGeminiJobText(e.target.value)}
                style={{
                  resize: 'none',
                  width: '100%',
                  minHeight: 32,
                  maxHeight: 48,
                  borderRadius: 8,
                  border: '1px solid #d1d5db',
                  padding: '0.5rem 0.8rem',
                  fontSize: '1rem',
                  background: '#f3f4f6',
                  color: '#222',
                  outline: 'none',
                  boxShadow: 'none',
                  marginBottom: 0,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  transition: 'border 0.2s',
                }}
                disabled={geminiLoading}
                onInput={e => {
                  // Auto-expand to 2 lines max
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '32px';
                  target.style.height = Math.min(target.scrollHeight, 48) + 'px';
                }}
              />
              <button
                onClick={handleGeminiExtract}
                disabled={geminiLoading || !geminiJobText.trim()}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: 8,
                  background: '#2563eb', // match .search-btn
                  color: '#fff',
                  fontWeight: 600,
                  border: 'none',
                  fontSize: '1rem',
                  cursor: geminiLoading || !geminiJobText.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 4px 0 rgba(99,102,241,0.08)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#174bbd')}
                onMouseOut={e => (e.currentTarget.style.background = '#2563eb')}
              >
                {geminiLoading ? '...' : 'Extract Filters'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="main-content-row">
        <div style={{ minWidth: 180, marginRight: 24 }}>
          <SidebarNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
        <div className="main-content-center">
          {currentTab === 'jobs' && (
            <>
              {error && <div className="error" style={{marginBottom:'1rem'}}>{error}</div>}
              <JobList
                jobs={results}
                loading={loading}
                onGenerateCoverLetter={(idx) => { setModalOpen(true); setModalJobIndex(idx); }}
                expandedIdx={expandedJobIdx}
                setExpandedIdx={setExpandedJobIdx}
              />
            </>
          )}
          {currentTab === 'resume' && (
            <ResumeTab resumeFile={resumeFile} resumeData={resumeData} />
          )}
          {currentTab === 'overview' && (
            <OverviewTab jobs={results} onJobSelect={(idx) => { setCurrentTab('jobs'); setExpandedJobIdx(idx); }} />
          )}
        </div>
      </div>
      {/* Cover Letter Modal logic remains unchanged */}
    </div>
  );
};

export default App;
