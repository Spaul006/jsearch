import React from 'react';

interface SidebarNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { key: 'resume', label: 'Resume' },
  { key: 'jobs', label: 'Jobs' },
  { key: 'overview', label: 'Overview' },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ currentTab, onTabChange }) => (
  <nav className="sidebar-nav">
    <ul>
      {tabs.map(tab => (
        <li
          key={tab.key}
          className={currentTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
          style={{
            cursor: 'pointer',
            padding: '1rem 1.5rem',
            background: currentTab === tab.key ? '#2563eb' : 'transparent',
            color: currentTab === tab.key ? '#fff' : '#222',
            fontWeight: 600,
            borderRadius: 8,
            marginBottom: 8,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          {tab.label}
        </li>
      ))}
    </ul>
  </nav>
);

export default SidebarNav; 