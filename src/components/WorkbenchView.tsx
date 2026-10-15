import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Copy,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { BENCHMARK_REQUIREMENTS, SoftwareRequirement } from '../data/benchmarkData.ts';
import { PromptTemplateType } from '../services/ragPipeline.ts';

interface WorkbenchViewProps {
  currentRequirement: string;
  setCurrentRequirement: (req: string) => void;
  technique: 'BVA' | 'EP' | 'Use Case' | 'State Transition';
  setTechnique: (tech: 'BVA' | 'EP' | 'Use Case' | 'State Transition') => void;
  templateType: PromptTemplateType;
  setTemplateType: (tmpl: PromptTemplateType) => void;
  thresholdMode: 'adaptive' | 'baseline' | 'custom';
  setThresholdMode: (mode: 'adaptive' | 'baseline' | 'custom') => void;
  customThreshold: number;
  setCustomThreshold: (val: number) => void;
  frozenOptimalThreshold: number;
  ensembleModelCount: number;
  setEnsembleModelCount: (count: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatedResult: any;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  currentRequirement,
  setCurrentRequirement,
  technique,
  setTechnique,
  templateType,
  setTemplateType,
  thresholdMode,
  setThresholdMode,
  customThreshold,
  setCustomThreshold,
  frozenOptimalThreshold,
  ensembleModelCount,
  setEnsembleModelCount,
  onGenerate,
  isGenerating,
  generatedResult,
}) => {
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active numerical threshold
  const activeCutoff = thresholdMode === 'adaptive'
    ? frozenOptimalThreshold
    : thresholdMode === 'baseline'
      ? 0.80
      : customThreshold;

  const handlePresetSelect = (reqId: string) => {
    const found = BENCHMARK_REQUIREMENTS.find(r => r.id === reqId);
    if (found) {
      setCurrentRequirement(found.description);
      setTechnique(found.technique);
    }
  };

  const handleExportCSV = () => {
    if (!generatedResult?.testCases) return;
    const headers = ['Test ID', 'Condition', 'Example Data', 'Expected Result', 'Test Type', 'Similarity Score', 'Decision', 'Accepted (Active)', 'Accepted (Baseline 0.80)'];
    const rows = generatedResult.testCases.map((tc: any) => [
      `"${tc.id}"`,
      `"${tc.condition.replace(/"/g, '""')}"`,
      `"${tc.exampleData.replace(/"/g, '""')}"`,
      `"${tc.expectedResult.replace(/"/g, '""')}"`,
      `"${tc.testType}"`,
      tc.similarityScore.toFixed(3),
      `"${tc.decision}"`,
      tc.isAccepted ? 'YES' : 'NO',
      tc.baselineAccepted ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `generated_test_cases_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyResultsJSON = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(JSON.stringify(generatedResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Automated Acceptance Test Generator
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>IEEE Access Base Paper + Adaptive Filtering Extension</span>
            <span aria-hidden="true">·</span>
            <span>RAG Document Retrieval</span>
            <span aria-hidden="true">·</span>
            <span>Directional Ensemble Scoring</span>
          </div>
        </div>

        {/* Preset Quick Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Presets:</span>
          <button
            onClick={() => handlePresetSelect('REQ6')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap transition-colors"
          >
            REQ6 (Banking Transfer BVA)
          </button>
          <button
            onClick={() => handlePresetSelect('REQ8')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap transition-colors"
          >
            REQ8 (Reward Points ST)
          </button>
          <button
            onClick={() => handlePresetSelect('REQ12')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap transition-colors"
          >
            REQ12 (Coupon Range BVA)
          </button>
          <button
            onClick={() => handlePresetSelect('REQ16')}
            className="px-2.5 py-1 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-700 whitespace-nowrap transition-colors"
          >
            REQ16 (E-Commerce Returns ST)
          </button>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirement & Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-900 tracking-wide">
                Software Requirement Specification
              </label>
              <span className="text-xs text-slate-500 font-mono">
                {currentRequirement.length} chars
              </span>
            </div>
            <textarea
              value={currentRequirement}
              onChange={(e) => setCurrentRequirement(e.target.value)}
              rows={4}
              placeholder="Enter natural language requirement (e.g. A banking system must reject a transfer when the available balance is less than the transfer amount)..."
              className="w-full text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all font-sans"
            />

            {/* Technique & Template Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Closed-Box Testing Technique
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['BVA', 'EP', 'Use Case', 'State Transition'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTechnique(t)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md text-left transition-colors truncate ${
                        technique === t
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Prompt Engineering Template
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'PARTS', name: 'Google PARTS', desc: 'Highest overall coverage' },
                    { id: 'RICEE', name: 'RICEE Framework', desc: 'Role & Context constraints' },
                    { id: 'UserStory', name: 'Agile User Story', desc: 'XP Persona format' },
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setTemplateType(tmpl.id as PromptTemplateType)}
                      className={`px-2.5 py-1.5 text-xs text-left rounded-md transition-colors flex items-center justify-between ${
                        templateType === tmpl.id
                          ? 'bg-slate-900 text-white font-medium'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tmpl.name}</span>
                      <span className={`text-[11px] ${templateType === tmpl.id ? 'text-slate-300' : 'text-slate-500'}`}>
                        {tmpl.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RAG Context Retrieval Info Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-semibold text-slate-900">
                  RAG Document Retrieval Module
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Top-5 Chunks · Retrieval Threshold τ = 0.75
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Domain testing rules, boundary standards, and state machine invariants are extracted from the vector database and dynamically injected into the generation prompt.
            </p>

            {generatedResult?.retrievedChunks ? (
              <div className="space-y-2">
                {generatedResult.retrievedChunks.map((item: any, i: number) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">{item.chunk.title}</span>
                      <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                        sim: {item.similarity.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 text-[11px]">{item.chunk.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center border border-dashed border-slate-200">
                Context chunks will be retrieved automatically during test generation.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Threshold Control & Ensemble Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Threshold Selection Module */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-semibold text-slate-900">
                  Output-Filtering Threshold Module
                </h3>
              </div>
              <div className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                τ = {activeCutoff.toFixed(2)}
              </div>
            </div>

            {/* Threshold Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
              <button
                onClick={() => setThresholdMode('adaptive')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors text-center ${
                  thresholdMode === 'adaptive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Adaptive (τ*)
              </button>
              <button
                onClick={() => setThresholdMode('baseline')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors text-center ${
                  thresholdMode === 'baseline'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Baseline (0.80)
              </button>
              <button
                onClick={() => setThresholdMode('custom')}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors text-center ${
                  thresholdMode === 'custom'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Probe
              </button>
            </div>

            {/* Threshold Explanation */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1.5 mb-4">
              {thresholdMode === 'adaptive' ? (
                <>
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Validation-Calibrated Optimal Cutoff</span>
                  </div>
                  <p className="text-slate-600">
                    Selected via grid search across validation data to maximize F1-score without test set leakage. Allows rescue of valid boundary and state test cases.
                  </p>
                </>
              ) : thresholdMode === 'baseline' ? (
                <>
                  <div className="font-semibold text-slate-800">Base Paper Static Baseline (0.80)</div>
                  <p className="text-slate-600">
                    Rigid candidate cutoff from the IEEE Access paper. In complex state transitions, this static threshold can over-filter and reject valid edge cases.
                  </p>
                </>
              ) : (
                <>
                  <div className="font-semibold text-slate-800">Manual Experimental Probe</div>
                  <p className="text-slate-600">
                    Adjust the slider below to observe how candidate filtering changes in real-time.
                  </p>
                </>
              )}
            </div>

            {/* Threshold Slider for Custom Probe */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>0.50 (Permissive)</span>
                <span>Active: {activeCutoff.toFixed(2)}</span>
                <span>0.95 (Strict)</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={activeCutoff}
                onChange={(e) => {
                  setThresholdMode('custom');
                  setCustomThreshold(parseFloat(e.target.value));
                }}
                className="w-full accent-slate-900 cursor-pointer"
              />
            </div>

            {/* Model Ensemble Selection */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Directional Partially Weighted Ensemble (Paper Eq. 9–12)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 3, label: '3 Models', desc: 'Claude + GPT-4o + Gemini' },
                  { count: 4, label: '4 Models', desc: '+ Qwen3-Coder' },
                  { count: 5, label: '5 Models', desc: '+ Mistral-Small' },
                ].map(item => (
                  <button
                    key={item.count}
                    onClick={() => setEnsembleModelCount(item.count)}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      ensembleModelCount === item.count
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 truncate ${ensembleModelCount === item.count ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Run Generation CTA */}
            <button
              onClick={onGenerate}
              disabled={isGenerating || !currentRequirement.trim()}
              className="w-full mt-5 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold tracking-wide rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Executing RAG Pipeline & Scoring...' : 'Generate & Filter Test Cases'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Test Cases Results Table */}
      {generatedResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Candidate Test Cases & Decision Rules
                </h2>
                <span className="text-xs font-mono text-slate-500">
                  ({generatedResult.stats.acceptedUnderActive} of {generatedResult.stats.totalCandidates} accepted)
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span>Active Cutoff: <strong className="text-slate-700 font-mono">τ = {generatedResult.activeThreshold.toFixed(2)}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Baseline Cutoff: <strong className="text-slate-700 font-mono">0.80</strong></span>
                {generatedResult.stats.netDifference !== 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-700 font-semibold font-mono">
                      {generatedResult.stats.netDifference > 0 ? `+${generatedResult.stats.netDifference}` : generatedResult.stats.netDifference} cases rescued by adaptive cutoff
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={copyResultsJSON}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>

          {/* High-Density Data Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 whitespace-nowrap">Test ID</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Condition & Precondition</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Concrete Example Input</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Expected System Result</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Type</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Similarity (τ)</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Decision (Eq. 13)</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Adaptive Filter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {generatedResult.testCases.map((tc: any) => {
                  const isSavedByAdaptive = tc.isAccepted && !tc.baselineAccepted;
                  return (
                    <tr
                      key={tc.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isSavedByAdaptive ? 'bg-emerald-50/40' : !tc.isAccepted ? 'opacity-60 bg-slate-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {tc.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {tc.condition}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 bg-slate-50/80 rounded px-2 py-1 my-1 block">
                        {tc.exampleData}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {tc.expectedResult}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                        {tc.testType}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                tc.similarityScore >= 0.85
                                  ? 'bg-emerald-600'
                                  : tc.similarityScore >= 0.75
                                    ? 'bg-blue-600'
                                    : 'bg-amber-600'
                              }`}
                              style={{ width: `${Math.min(100, tc.similarityScore * 100)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {tc.similarityScore.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            tc.decision === 'Pass'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tc.decision === 'Partial Pass'
                                ? 'bg-blue-100 text-blue-800'
                                : tc.decision === 'Related'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tc.decision}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {tc.isAccepted ? (
                          <div className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepted</span>
                            {isSavedByAdaptive && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded ml-1 font-mono">
                                Rescued
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Filtered</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Callout Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-slate-800">
                Evaluation Summary & Decision Analysis
              </span>
              <p className="text-slate-600">
                Similarity scores measure semantic proximity to reference specifications. Final correctness is governed by formal decision rules (Eq. 13) separating relevance from functional accuracy.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div>
                <span className="text-slate-500">Active (τ={generatedResult.activeThreshold.toFixed(2)}): </span>
                <strong className="text-slate-900">{generatedResult.stats.acceptedUnderActive} Accepted</strong>
              </div>
              <div className="border-l border-slate-300 pl-4">
                <span className="text-slate-500">Baseline (0.80): </span>
                <strong className="text-slate-700">{generatedResult.stats.acceptedUnderBaseline} Accepted</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
