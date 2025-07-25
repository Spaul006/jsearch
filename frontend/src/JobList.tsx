import React, { useState, useEffect, useRef } from 'react';
import JobCard from './JobCard';

interface JobListProps {
  jobs: any[];
  loading?: boolean;
  onGenerateCoverLetter?: (idx: number) => void;
  expandedIdx?: number | null;
  setExpandedIdx?: (idx: number | null) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading, onGenerateCoverLetter, expandedIdx, setExpandedIdx }) => {
  const [localExpandedIdx, setLocalExpandedIdx] = useState<number | null>(null);
  const actualExpandedIdx = expandedIdx !== undefined ? expandedIdx : localExpandedIdx;
  const actualSetExpandedIdx = setExpandedIdx || setLocalExpandedIdx;

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    if (actualExpandedIdx !== null && cardRefs.current[actualExpandedIdx]) {
      cardRefs.current[actualExpandedIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [actualExpandedIdx]);

  const handleExpand = (idx: number) => {
    actualSetExpandedIdx(actualExpandedIdx === idx ? null : idx);
  };

  return (
    <section className="job-list-section">
      <h2>Latest Jobs</h2>
      {loading ? (
        <div style={{textAlign:'center',padding:'2rem'}}>
          <div className="spinner" style={{ border: '3px solid #e5e7eb', borderTop: '3px solid #2563eb', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Finding jobs for you...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{textAlign:'center',color:'#888',padding:'2rem'}}>No jobs found. Try uploading your resume and searching!</div>
      ) : (
        <div className="job-list">
          {jobs.map((job, idx) => (
            <div
              key={idx}
              ref={el => { cardRefs.current[idx] = el; }}
            >
              <JobCard
                company={job.company_name || job.employer_name || job.company || 'N/A'}
                title={job.job_title || job.title || 'N/A'}
                location={job.location || job.job_location || 'N/A'}
                posted={job.posted_at || job.date_posted || job.posted || ''}
                companyLogo={job.company_logo_url ? (
                  <img
                    src={job.company_logo_url}
                    alt={job.company_name || job.employer_name || job.company || 'Company Logo'}
                    style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#fff' }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
                highlight={actualExpandedIdx === idx}
                expanded={actualExpandedIdx === idx}
                onExpand={() => handleExpand(idx)}
                job={job}
                onGenerateCoverLetter={onGenerateCoverLetter ? () => onGenerateCoverLetter(idx) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default JobList; 