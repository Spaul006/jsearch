import React from 'react';

interface OverviewTabProps {
  jobs: any[];
}

const OverviewTab: React.FC<OverviewTabProps> = ({ jobs }) => (
  <div style={{ padding: '2rem' }}>
    <h2>All Jobs Overview</h2>
    {jobs.length === 0 ? (
      <div style={{ color: '#888', marginTop: '1.5rem' }}>No jobs found yet.</div>
    ) : (
      <div style={{ overflowX: 'auto', marginTop: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <thead>
            <tr style={{ background: '#f5f7fa' }}>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Job Title</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Company</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Match Score</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.7rem 1rem' }}>{job.job_title || job.title || 'N/A'}</td>
                <td style={{ padding: '0.7rem 1rem' }}>{job.company_name || job.employer_name || job.company || 'N/A'}</td>
                <td style={{ padding: '0.7rem 1rem' }}>{job.location || job.job_location || 'N/A'}</td>
                <td style={{ padding: '0.7rem 1rem' }}>{typeof job.match_score === 'number' ? job.match_score + '%' : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default OverviewTab; 