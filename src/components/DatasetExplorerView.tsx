import React, { useState, useMemo } from 'react';
import {
  Database,
  Filter,
  Search,
  ExternalLink,
  Download,
  Tag,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { BENCHMARK_REQUIREMENTS, SoftwareRequirement } from '../data/benchmarkData.ts';

export const DatasetExplorerView: React.FC = () => {
  const [selectedSplit, setSelectedSplit] = useState<'all' | 'training' | 'testing'>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReqId, setSelectedReqId] = useState<string>('REQ8');

  const filteredRequirements = useMemo(() => {
    return BENCHMARK_REQUIREMENTS.filter(r => {
      if (selectedSplit !== 'all' && r.split !== selectedSplit) return false;
      if (selectedTechnique !== 'all' && r.technique !== selectedTechnique) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.businessDomain.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedSplit, selectedTechnique, searchQuery]);

  const activeRequirement = useMemo(() => {
    return (
      BENCHMARK_REQUIREMENTS.find(r => r.id === selectedReqId) ||
      BENCHMARK_REQUIREMENTS[0]
    );
  }, [selectedReqId]);

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(BENCHMARK_REQUIREMENTS, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `ieee_access_benchmark_dataset_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Benchmark Dataset & Gold Key Acceptance Suite
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>16 Requirements (REQ1–REQ16)</span>
            <span aria-hidden="true">·</span>
            <span>76 Ground-Truth Acceptance Test Cases</span>
            <span aria-hidden="true">·</span>
            <span>4 Closed-Box Testing Techniques</span>
          </div>
        </div>

        <button
          onClick={handleExportAllJSON}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Complete Benchmark Dataset</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
        {/* Split Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSelectedSplit('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedSplit === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (16)
          </button>
          <button
            onClick={() => setSelectedSplit('training')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedSplit === 'training'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Training / Calibration (REQ1–8)
          </button>
          <button
            onClick={() => setSelectedSplit('testing')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedSplit === 'testing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Testing (REQ9–16)
          </button>
        </div>

        {/* Technique Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Technique:</span>
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Techniques</option>
            <option value="BVA">Boundary Value Analysis (BVA)</option>
            <option value="EP">Equivalence Partitioning (EP)</option>
            <option value="Use Case">Use Case (UC)</option>
            <option value="State Transition">State Transition (ST)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requirement or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Main 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Requirements List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
          {filteredRequirements.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No software requirements matched the specified filters.
            </div>
          ) : (
            filteredRequirements.map(req => {
              const isSelected = req.id === selectedReqId;
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`w-full p-4 text-left transition-colors flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {req.id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {req.technique}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {req.split === 'training' ? 'Train' : 'Test'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 truncate">
                      {req.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{req.businessDomain}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{req.goldCases.length} Gold TCs</span>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'}`} />
                </button>
              );
            })
          )}
        </div>

        {/* Right: Selected Requirement & Gold Key Details (7 cols) */}
        {activeRequirement && (
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {activeRequirement.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeRequirement.businessDomain}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({activeRequirement.split.toUpperCase()} SET)
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {activeRequirement.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                    {activeRequirement.technique}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {activeRequirement.level}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    Source: {activeRequirement.source}
                  </span>
                </div>
              </div>

              {/* Requirement Description */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-800">
                <span className="font-semibold text-slate-900 block mb-1">Specification Text:</span>
                "{activeRequirement.description}"
              </div>

              {/* Gold Key Test Cases */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                    Gold-Standard Acceptance Test Cases ({activeRequirement.goldCases.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Verified by senior software testers & instructors
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeRequirement.goldCases.map(tc => (
                    <div
                      key={tc.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{tc.id}</span>
                          <span className="text-[11px] text-slate-500">[{tc.testType}]</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">Ground Sim:</span>
                          <strong className="text-slate-800 tabular-nums">{tc.similarityScore.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">Test Condition:</span>
                        <p className="font-medium text-slate-800">{tc.condition}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-sans">Concrete Example Input:</span>
                          <span className="font-mono text-slate-700">{tc.exampleData}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans">Expected Output Oracle:</span>
                          <span className="text-slate-700">{tc.expectedResult}</span>
                        </div>
                      </div>

                      {/* Model prediction matrix snippet */}
                      {tc.modelPredictions && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>5-Fold Outcomes:</span>
                          <div className="flex items-center gap-2">
                            <span>Claude: <strong className="text-slate-700">{tc.modelPredictions.claude || 'TP'}</strong></span>
                            <span>GPT-4o: <strong className="text-slate-700">{tc.modelPredictions.gpt4o || 'TP'}</strong></span>
                            <span>Gemini: <strong className="text-slate-700">{tc.modelPredictions.gemini || 'TP'}</strong></span>
                            <span>Qwen: <strong className="text-slate-700">{tc.modelPredictions.qwen || 'TP'}</strong></span>
                            <span>Mistral: <strong className="text-slate-700">{tc.modelPredictions.mistral || 'TP'}</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
