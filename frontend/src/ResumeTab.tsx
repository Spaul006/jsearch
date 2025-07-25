import React from 'react';

interface ResumeTabProps {
  resumeFile?: File | null;
  resumeData?: any;
}

const ResumeTab: React.FC<ResumeTabProps> = ({ resumeFile, resumeData }) => (
  <div style={{ padding: '2rem' }}>
    <h2>Your Resume</h2>
    {!resumeFile ? (
      <div style={{ color: '#888', marginTop: '1.5rem' }}>No resume uploaded yet.</div>
    ) : (
      <>
        <div style={{ fontWeight: 600, color: '#2563eb', marginBottom: 12 }}>
          <span role="img" aria-label="file">📄</span> {resumeFile.name}
        </div>
        <div style={{ marginTop: 24 }}>
          <h3>Insights</h3>
          <div style={{ color: '#444', fontSize: '1.05rem' }}>
            {/* Placeholder for insights, e.g. skills, education, etc. */}
            {resumeData ? (
              <>
                {resumeData.skills && (
                  <div><strong>Skills:</strong> {resumeData.skills.join(', ')}</div>
                )}
                {resumeData.education && (
                  <div><strong>Education:</strong> {resumeData.education}</div>
                )}
                {resumeData.experience && (
                  <div><strong>Experience:</strong> {resumeData.experience.length} items</div>
                )}
                {resumeData.projects && (
                  <div><strong>Projects:</strong> {resumeData.projects.length} projects</div>
                )}
              </>
            ) : (
              <div>No insights available yet.</div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
);

export default ResumeTab; 