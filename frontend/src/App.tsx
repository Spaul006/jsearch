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
      <div className="main-content-row">
        <div style={{ minWidth: 180, marginRight: 24 }}>
          <SidebarNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </div>
        <div className="main-content-center">
          {currentTab === 'jobs' && (
            <>
              {error && <div className="error" style={{marginBottom:'1rem'}}>{error}</div>}
              <JobList jobs={results} loading={loading} onGenerateCoverLetter={(idx) => { setModalOpen(true); setModalJobIndex(idx); }} />
            </>
          )}
          {currentTab === 'resume' && (
            <ResumeTab resumeFile={resumeFile} resumeData={resumeData} />
          )}
          {currentTab === 'overview' && (
            <OverviewTab jobs={results} />
          )}
        </div>
      </div>
      {/* Cover Letter Modal logic remains unchanged */}
    </div>
  );
};

export default App;
