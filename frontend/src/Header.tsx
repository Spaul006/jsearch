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
  loading
}) => (
  <header className="header">
    <div className="logo-search-container">
      <div className="logo">indeed</div>
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
      </form>
    </div>
  </header>
);

export default Header; 