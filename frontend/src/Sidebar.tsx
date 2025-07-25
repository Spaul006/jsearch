import React from 'react';

interface SidebarProps {
  onResumeUpload: (file: File | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onResumeUpload }) => (
  <aside className="sidebar">
    <div className="sidebar-box">
      <h3>Upload Your Resume</h3>
      <p>Upload your PDF resume to get personalized job matches.</p>
      <input
        type="file"
        accept=".pdf"
        onChange={e => onResumeUpload(e.target.files?.[0] || null)}
        style={{ margin: '12px 0', fontSize: '1rem' }}
      />
      <p style={{ fontSize: '0.85rem', color: '#888' }}>PDF files only</p>
    </div>
  </aside>
);

export default Sidebar; 