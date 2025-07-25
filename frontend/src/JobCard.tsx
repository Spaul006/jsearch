import React from 'react';

interface JobCardProps {
  companyLogo?: React.ReactNode;
  company: string;
  title: string;
  location: string;
  posted: string;
  highlight?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
  job?: any;
  onGenerateCoverLetter?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  companyLogo, company, title, location, posted, highlight,
  expanded, onExpand, job, onGenerateCoverLetter
}) => {
  const matchScore = job && typeof job.match_score === 'number' ? job.match_score : null;
  const applyLink = job && (job.job_apply_link || job.apply_link || job.job_url);
  const briefDesc = job && job.job_description ? job.job_description.slice(0, 120) + (job.job_description.length > 120 ? '...' : '') : '';

  return (
    <div
      className={`job-card-main${highlight ? ' highlight' : ''}${expanded ? ' expanded' : ''}`}
      onClick={onExpand}
      style={{ cursor: 'pointer', flexDirection: 'column', position: 'relative' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <div className="job-card-logo">{companyLogo}</div>
        <div className="job-card-info">
          <div className="job-card-company">{company}</div>
          <div className="job-card-title">{title}</div>
          {briefDesc && (
            <div className="job-card-brief-desc" style={{ color: '#555', fontSize: '0.97em', marginTop: 2 }}>{briefDesc}</div>
          )}
        </div>
        <div className="job-card-meta" style={{ alignItems: 'flex-end' }}>
          <span>{location}</span>
          <span>• {posted}</span>
          {matchScore !== null && (
            <span className="match-score" style={{ fontWeight: 600, color: '#2563eb', marginTop: 4 }}>{matchScore}% Match</span>
          )}
          {applyLink && (
            <a
              href={applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="apply-btn"
              style={{ minWidth: 90, textAlign: 'center', marginTop: 8 }}
              onClick={e => e.stopPropagation()}
            >
              Apply
            </a>
          )}
          <button
            className="cover-letter-btn"
            style={{ minWidth: 120, marginTop: 8 }}
            onClick={e => { e.stopPropagation(); onGenerateCoverLetter && onGenerateCoverLetter(); }}
          >
            Generate Cover Letter
          </button>
        </div>
      </div>
      {expanded && job && (
        <div className="job-card-details" style={{ marginTop: '1.2rem', width: '100%' }} onClick={e => e.stopPropagation()}>
          {matchScore !== null && (
            <div style={{ marginBottom: '0.7rem' }}>
              <span className="match-score" style={{ fontWeight: 600, color: '#2563eb' }}>{matchScore}% Match</span>
            </div>
          )}
          {job.job_description && (
            <div className="job-description" style={{ marginBottom: '0.7rem', color: '#333' }}>{job.job_description}</div>
          )}
          {(job.job_required_skills || job.skills) && (
            <div className="job-section" style={{ marginBottom: '0.7rem' }}>
              <div className="section-title" style={{ fontWeight: 600 }}>Required Skills</div>
              <div className="skills-tags" style={{ marginTop: '0.3rem' }}>
                {(job.job_required_skills || job.skills || []).map((skill: string, i: number) => (
                  <span className="skill-tag" key={i} style={{ background: '#e5e7eb', borderRadius: 6, padding: '2px 8px', marginRight: 6, fontSize: '0.95em' }}>{skill}</span>
                ))}
              </div>
            </div>
          )}
          {job.match_analysis && job.match_analysis.detailed_analysis && (
            <div className="job-section" style={{ marginBottom: '0.7rem' }}>
              <div className="section-title" style={{ fontWeight: 600 }}>AI Match Analysis</div>
              <div className="section-content">
                <p style={{ margin: 0 }}><strong>Analysis:</strong> {job.match_analysis.detailed_analysis}</p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {applyLink && (
              <a
                href={applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-btn"
                style={{ minWidth: 100, textAlign: 'center' }}
                onClick={e => e.stopPropagation()}
              >
                Apply Now
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard; 