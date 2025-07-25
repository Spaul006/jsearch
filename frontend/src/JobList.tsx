import React from 'react';
import JobCard from './JobCard';

interface JobListProps {
  jobs: any[];
  loading?: boolean;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading }) => (
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
          <JobCard
            key={idx}
            company={job.company_name || job.employer_name || job.company || 'N/A'}
            title={job.job_title || job.title || 'N/A'}
            location={job.location || job.job_location || 'N/A'}
            posted={job.posted_at || job.date_posted || job.posted || ''}
            companyLogo={null}
            highlight={idx === 0}
          />
        ))}
      </div>
    )}
  </section>
);

export default JobList; 