import React from 'react';

const suggestions = [
  { company: 'MICROSOFT', title: 'Designer 2 (Teams)', location: 'Vancouver, BC', posted: '2 days ago' },
  { company: 'ELECTRONIC ARTS', title: 'Experience Designer', location: 'Vancouver, BC', posted: '3 days ago' },
  { company: 'VIAFOURA', title: 'Product Designer', location: 'Vancouver, BC', posted: '6 days ago' },
  { company: 'CIBC', title: 'UX Designer', location: 'Toronto, ON', posted: '12 days ago' },
];

const SuggestedJobs: React.FC = () => (
  <section className="suggested-jobs">
    <h2>Something you might like...</h2>
    <div className="suggested-jobs-list">
      {suggestions.map((job, idx) => (
        <div className="suggested-job-card" key={idx}>
          <div className="suggested-job-company">{job.company}</div>
          <div className="suggested-job-title">{job.title}</div>
          <div className="suggested-job-location">{job.location}</div>
          <div className="suggested-job-posted">Posted {job.posted}</div>
        </div>
      ))}
    </div>
  </section>
);

export default SuggestedJobs; 