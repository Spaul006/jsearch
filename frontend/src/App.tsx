import React, { useState, useEffect, useCallback } from 'react';

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
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>AI Job Matcher</h1>
        <p>Find your next opportunity with AI-powered precision</p>
      </div>
      {/* Main card with form */}
      <div className="main-card">
        {/* Error display */}
        {error && <div className="error">{error}</div>}
        <form id="jobSearchForm" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="job_title">Job Title</label>
              <input type="text" id="job_title" name="job_title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input type="text" id="location" name="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
            </div>
            <div className="form-group">
              <label htmlFor="radius">Radius (miles)</label>
              <input type="number" id="radius" name="radius" min={1} max={100} value={radius} onChange={e => setRadius(Number(e.target.value))} placeholder="25" />
            </div>
            <div className="form-group">
              <label htmlFor="additional">Additional Filters</label>
              <input type="text" id="additional" name="additional" value={additional} onChange={e => setAdditional(e.target.value)} placeholder="e.g. Python, remote" />
            </div>
            <div className="resume-upload">
              <h3>Upload Resume</h3>
              <p>Get AI-powered job matching scores and recommendations</p>
              <input type="file" name="resume" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)} style={{ margin: '6px 0', fontSize: '0.8rem' }} />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>PDF files only</p>
            </div>
            <button type="submit" className="search-btn" disabled={loading}>Search Jobs</button>
          </div>
        </form>
      </div>
      {/* Loading spinner */}
      {loading && (
        <div className="loading" id="loading">
          <div className="spinner" style={{ border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Analyzing jobs and calculating match scores...</p>
        </div>
      )}
      {/* Resume summary */}
      {resumeData && (
        <div className="main-card">
          <div className="resume-info">
            <h3>Resume Summary</h3>
            <p><strong>Skills:</strong> {resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills.join(', ') : 'None detected'}</p>
            <p><strong>Education:</strong> {resumeData.education || 'Not specified'}</p>
            <p><strong>Experience:</strong> {resumeData.experience ? resumeData.experience.length : 0} items detected</p>
            <p><strong>Projects:</strong> {resumeData.projects ? resumeData.projects.length : 0} projects found</p>
          </div>
        </div>
      )}
      {/* Results summary */}
      {results.length > 0 && (
        <div className="main-card">
          <div className="results-header">
            <h2>Job Matches</h2>
            <div className="results-count">{results.length} jobs found</div>
          </div>
          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  {resumeData && <th style={{ width: 90 }}>Match</th>}
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th style={{ width: 110 }}>Apply</th>
                </tr>
              </thead>
              <tbody>
                {results.map((job, idx) => (
                  <tr key={idx}>
                    {resumeData && (
                      <td className="match-cell">
                        {typeof job.match_score === 'number' ? (
                          <span className={
                            'match-score ' +
                            (job.match_score >= 90
                              ? 'match-excellent'
                              : job.match_score >= 80
                              ? 'match-very-good'
                              : job.match_score >= 70
                              ? 'match-good'
                              : job.match_score >= 60
                              ? 'match-fair'
                              : 'match-poor')
                          }>
                            {job.match_score}%
                          </span>
                        ) : (
                          <span style={{ color: '#999' }}>N/A</span>
                        )}
                      </td>
                    )}
                    <td className="job-title-cell">
                      <div className="job-title-main">
                        <a href={`#job-detail-${idx}`} className="job-title-link">
                          {job.job_title || job.title || 'N/A'}
                        </a>
                      </div>
                      <div className="job-title-sub">
                        {(job.job_required_skills || job.skills) && (
                          <span className="skills-list">
                            {(job.job_required_skills || job.skills || []).join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="company-cell">{job.company_name || job.employer_name || job.company || 'N/A'}</td>
                    <td className="location-cell">{job.location || job.job_location || 'N/A'}</td>
                    <td className="apply-cell">
                      {job.job_apply_link ? (
                        <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer" className="apply-btn">Apply</a>
                      ) : job.apply_link ? (
                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="apply-btn">Apply</a>
                      ) : job.job_url ? (
                        <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="apply-btn">Apply</a>
                      ) : (
                        <span style={{ color: '#999' }}>No link</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Job cards with details and cover letter button */}
          {results.map((job, idx) => (
            <div className="job-card" id={`job-detail-${idx}`} key={`card-${idx}`}>
              <div className="job-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div className="job-title">{job.job_title || job.title || 'N/A'}</div>
                    <div className="job-meta">
                      <div className="job-meta-item">
                        {job.company_name || job.employer_name || job.company || 'N/A'}
                      </div>
                      <div className="job-meta-item">
                        {job.location || job.job_location || 'N/A'}
                      </div>
                    </div>
                  </div>
                  {resumeData && typeof job.match_score === 'number' && (
                    <div>
                      <span className={
                        'match-score ' +
                        (job.match_score >= 90
                          ? 'match-excellent'
                          : job.match_score >= 80
                          ? 'match-very-good'
                          : job.match_score >= 70
                          ? 'match-good'
                          : job.match_score >= 60
                          ? 'match-fair'
                          : 'match-poor')
                      }>
                        {job.match_score}% Match
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="job-content">
                {job.job_description && (
                  <div className="job-description">{job.job_description}</div>
                )}
                {resumeData && job.match_analysis && job.match_analysis.detailed_analysis && (
                  <div className="job-section">
                    <div className="section-title">AI Match Analysis</div>
                    <div className="section-content">
                      <p><strong>Analysis:</strong> {job.match_analysis.detailed_analysis}</p>
                    </div>
                  </div>
                )}
                {(job.job_required_skills || job.skills) && (
                  <div className="job-section">
                    <div className="section-title">Required Skills</div>
                    <div className="skills-tags">
                      {(job.job_required_skills || job.skills || []).map((skill, i) => (
                        <span className="skill-tag" key={i}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                  {(job.job_apply_link || job.apply_link) && (
                    <a
                      href={job.job_apply_link || job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="apply-btn"
                    >
                      Apply Now
                    </a>
                  )}
                  <button
                    className="cover-letter-btn"
                    onClick={() => {
                      setModalOpen(true);
                      setModalJobIndex(idx);
                    }}
                  >
                    Generate Cover Letter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Cover Letter Modal */}
      {modalOpen && (
        <div className="cover-letter-modal" style={{ display: 'flex' }}>
          <div className="cover-letter-modal-backdrop" onClick={closeModal}></div>
          <div className="cover-letter-modal-content">
            <button className="cover-letter-modal-close" onClick={closeModal} aria-label="Close">&times;</button>
            <div id="coverLetterModalBody">
              {coverLetterLoading ? (
                <div className="cover-letter-modal-loading">
                  <div className="spinner" style={{ border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                  <p>Generating your cover letter...</p>
                </div>
              ) : coverLetter ? (
                <div className="cover-letter-modal-result" style={{ display: 'block' }}>
                  <h3>Generated Cover Letter</h3>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{coverLetter}</pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
