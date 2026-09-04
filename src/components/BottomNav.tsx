import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'dashboard' },
    { id: 'farmers', label: 'Farmers', icon: 'groups' },
    { id: 'fields', label: 'Fields', icon: 'explore' },
    { id: 'surveys', label: 'Surveys', icon: 'assignment' },
    { id: 'reports', label: 'Reports', icon: 'description' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.06)] border-t border-outline-variant/20">
      <div className="flex justify-around items-center h-16 px-1 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] h-touch-target-min transition-colors cursor-pointer ${
                isActive
                  ? 'text-primary font-bold scale-[1.03]'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  isActive ? "font-bold text-primary-container" : ""
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-bold text-primary' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
