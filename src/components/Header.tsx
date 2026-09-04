import React from 'react';
import { TabType } from '../types';
import { APP_ASSETS } from '../data/initialData';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSearch: () => void;
  onOpenInspector: () => void;
  onShowToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenInspector,
  onShowToast
}) => {
  const isFieldMapper = activeTab === 'fields';

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
      <div className={`${isFieldMapper ? 'h-16' : 'h-20'} px-pad-screen-horizontal flex items-center justify-between gap-2 max-w-2xl mx-auto`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isFieldMapper ? (
            <>
              <button
                aria-label="Go back to Home"
                onClick={() => setActiveTab('home')}
                className="w-touch-target-min h-touch-target-min -ml-2 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
              <img
                alt="AgriSurvey Logo"
                className="h-7 w-auto object-contain cursor-pointer"
                src={APP_ASSETS.logo}
                onClick={() => setActiveTab('home')}
              />
              <h1 className="font-bold text-[20px] text-on-surface truncate ml-1">
                Gps Boundary Mapper
              </h1>
            </>
          ) : (
            <>
              <img
                alt="AgriSurvey Logo"
                className="h-8 w-auto object-contain flex-shrink-0 cursor-pointer"
                src={APP_ASSETS.logo}
                onClick={() => setActiveTab('home')}
              />
              <div className="flex flex-col min-w-0 cursor-pointer" onClick={() => setActiveTab('home')}>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[20px] text-primary truncate leading-tight">
                    AgriSurvey
                  </span>
                  <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                    v3.4
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="text-[11px] text-secondary truncate font-semibold">
                    DB Online / Sync Ready
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isFieldMapper ? (
            <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="text-[11px] text-secondary font-semibold">Ready</span>
            </div>
          ) : (
            <>
              <button
                aria-label="Global Search"
                onClick={onOpenSearch}
                className="w-touch-target-min h-touch-target-min flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">search</span>
              </button>
              <button
                aria-label="Notifications"
                onClick={() => onShowToast('Offline database synced · 14 Sats connected · No alerts')}
                className="w-touch-target-min h-touch-target-min relative flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error"></span>
              </button>
            </>
          )}

          <button
            onClick={onOpenInspector}
            aria-label="Inspector Profile"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 ml-1 hover:ring-2 hover:ring-secondary transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </button>
        </div>
      </div>
    </header>
  );
};
