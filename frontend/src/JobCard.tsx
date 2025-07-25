import React from 'react';

interface JobCardProps {
  companyLogo?: React.ReactNode;
  company: string;
  title: string;
  location: string;
  posted: string;
  highlight?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ companyLogo, company, title, location, posted, highlight }) => (
  <div className={`job-card-main${highlight ? ' highlight' : ''}`}>
    <div className="job-card-logo">{companyLogo}</div>
    <div className="job-card-info">
      <div className="job-card-company">{company}</div>
      <div className="job-card-title">{title}</div>
    </div>
    <div className="job-card-meta">
      <span>{location}</span>
      <span>• {posted}</span>
    </div>
  </div>
);

export default JobCard; 