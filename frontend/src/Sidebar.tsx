import React from 'react';

interface SidebarProps {
  onResumeUpload: (file: File | null) => void;
  resumeFile?: File | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onResumeUpload, resumeFile }) => (
  <aside className="sidebar">
    <div className="sidebar-box upload-box">
      <div className="upload-icon" style={{ fontSize: 48, color: '#2563eb', marginBottom: 12 }}>
        <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#e5e7eb"/></svg>
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Upload Your Resume</h3>
      <p style={{ color: '#444', fontSize: '1rem', marginBottom: 16 }}>Get personalized job matches by uploading your PDF resume.</p>
      <label htmlFor="resume-upload" className="upload-btn" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', borderRadius: 6, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginBottom: 8 }}>
        {resumeFile ? 'Replace PDF Resume' : 'Choose PDF Resume'}
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={e => onResumeUpload(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
      </label>
      {resumeFile && (
        <div style={{ color: '#2563eb', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#2563eb"/><path d="M6 10.5l2.5 2.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {resumeFile.name}
        </div>
      )}
      <div style={{ fontSize: '0.9rem', color: '#888' }}>PDF files only</div>
    </div>
  </aside>
);

export default Sidebar; 