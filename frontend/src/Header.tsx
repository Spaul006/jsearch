import React from 'react';

interface HeaderProps {
  jobTitle: string;
  setJobTitle: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  radius: number;
  setRadius: (v: number) => void;
  additional: string;
  setAdditional: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
  resumeFile?: File | null;
  onResumeUpload?: (file: File | null) => void;
}

const Header: React.FC<HeaderProps> = ({
  jobTitle,
  setJobTitle,
  location,
  setLocation,
  radius,
  setRadius,
  additional,
  setAdditional,
  onSearch,
  loading,
  resumeFile,
  onResumeUpload
}) => (
  <header className="header">
    <div className="logo-search-container">
      <form className="search-bar" onSubmit={onSearch}>
        <div className="search-fields">
          <label>WHAT</label>
          <input
            type="text"
            placeholder="e.g. junior designer, UX"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            style={{ width: 160 }}
          />
          <label>WHERE</label>
          <input
            type="text"
            placeholder="e.g. Vancouver, Toronto"
            value={location}
            onChange={e => setLocation(e.target.value)}
            style={{ width: 160 }}
          />
          <input
            type="number"
            min={1}
            max={100}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
            style={{ width: 60 }}
            title="Radius (miles)"
          />
          <input
            type="text"
            placeholder="Additional filters"
            value={additional}
            onChange={e => setAdditional(e.target.value)}
            style={{ width: 120 }}
          />
        </div>
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'SEARCH'}
        </button>
        {onResumeUpload && (
          <label htmlFor="header-resume-upload" className="header-upload-btn" style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center', cursor: 'pointer', background: '#2563eb', color: '#fff', borderRadius: 6, padding: '0.4rem 1rem', fontWeight: 600, fontSize: '0.95rem', transition: 'background 0.2s' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ marginRight: 6 }}><path fill="currentColor" d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#e5e7eb"/></svg>
            {resumeFile ? (resumeFile.name.length > 18 ? resumeFile.name.slice(0, 15) + '...' : resumeFile.name) : 'Upload Resume'}
            <input
              id="header-resume-upload"
              type="file"
              accept=".pdf"
              onChange={e => onResumeUpload(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </form>
    </div>
  </header>
);

export default Header; 