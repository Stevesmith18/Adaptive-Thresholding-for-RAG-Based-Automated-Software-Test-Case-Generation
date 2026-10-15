import React from 'react';
import { Sparkles, Code2, Play } from 'lucide-react';

export type ActiveTab = 'workbench' | 'calibration' | 'evaluation' | 'dataset' | 'methodology';

interface TopNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPythonModal: () => void;
  onQuickGenerate: () => void;
  isGenerating?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenPythonModal,
  onQuickGenerate,
  isGenerating = false,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
      {/* Zone 1: Brand wordmark (single element, no descriptor tags or pills) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight">
          AR
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Adaptive RAG TestGen
        </span>
      </div>

      {/* Zone 2: 5 clean single-line nav links */}
      <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => onTabChange('workbench')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'workbench'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Workbench
        </button>
        <button
          onClick={() => onTabChange('calibration')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'calibration'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Calibration Lab
        </button>
        <button
          onClick={() => onTabChange('evaluation')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'evaluation'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Baseline vs Adaptive
        </button>
        <button
          onClick={() => onTabChange('dataset')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dataset'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dataset & Gold Keys
        </button>
        <button
          onClick={() => onTabChange('methodology')}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'methodology'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Paper Methodology
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPythonModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
          title="View Python Source Code for Academic Project"
        >
          <Code2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Python Code</span>
        </button>
        <button
          onClick={onQuickGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isGenerating ? 'Generating...' : 'Run Generation'}</span>
        </button>
      </div>
    </header>
  );
};
