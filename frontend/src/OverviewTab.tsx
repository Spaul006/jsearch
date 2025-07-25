import React from 'react';

interface OverviewTabProps {
  jobs: any[];
  onJobSelect?: (idx: number) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ jobs, onJobSelect }) => (
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
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left' }}>Apply</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => {
              const applyLink = job.job_apply_link || job.apply_link || job.job_url;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.7rem 1rem' }}>
                    <span
                      style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => onJobSelect && onJobSelect(idx)}
                    >
                      {job.job_title || job.title || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem 1rem' }}>{job.company_name || job.employer_name || job.company || 'N/A'}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{job.location || job.job_location || 'N/A'}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>{typeof job.match_score === 'number' ? job.match_score + '%' : 'N/A'}</td>
                  <td style={{ padding: '0.7rem 1rem' }}>
                    {applyLink ? (
                      <a
                        href={applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply-btn"
                        style={{ minWidth: 80, textAlign: 'center', display: 'inline-block', padding: '0.4rem 1rem', borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Apply
                      </a>
                    ) : (
                      <button disabled style={{ minWidth: 80, textAlign: 'center', padding: '0.4rem 1rem', borderRadius: 6, background: '#e5e7eb', color: '#888', fontWeight: 600, border: 'none' }}>
                        No Link
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default OverviewTab; 