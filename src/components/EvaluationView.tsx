import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  ShieldCheck,
  Download,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { MethodComparisonResult } from '../services/adaptiveThreshold.ts';

interface EvaluationViewProps {
  comparisonData: {
    e1Baseline: MethodComparisonResult;
    e2Adaptive: MethodComparisonResult;
    e3Constrained: MethodComparisonResult;
    validationAdaptiveOptimal: number;
    validationConstrainedOptimal: number;
  } | null;
  activeFrozenThreshold: number;
  onRunReEvaluation: () => void;
  isEvaluating: boolean;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  comparisonData,
  activeFrozenThreshold,
  onRunReEvaluation,
  isEvaluating,
}) => {
  const [selectedTechniqueFilter, setSelectedTechniqueFilter] = useState<string>('all');

  if (!comparisonData) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Evaluation Suite Initializing</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Computing baseline vs. adaptive metrics across 5 cross-validation folds on unseen test requirements (REQ9–REQ16)...
          </p>
        </div>
        <button
          onClick={onRunReEvaluation}
          disabled={isEvaluating}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {isEvaluating ? 'Running Evaluation...' : 'Run Benchmark Evaluation'}
        </button>
      </div>
    );
  }

  const { e1Baseline, e2Adaptive, e3Constrained } = comparisonData;
  const methods = [e1Baseline, e2Adaptive, e3Constrained];

  const handleExportCSV = () => {
    const headers = [
      'Method ID',
      'Method Name',
      'Filtering Cutoff (tau)',
      'Coverage (%)',
      '95% CI Lower',
      '95% CI Upper',
      'Accuracy (%)',
      'Precision (%)',
      'Recall (%)',
      'F1-Score (%)',
      'False Rejection Rate (%)',
      'False Acceptance Rate (%)'
    ];

    const rows = methods.map(m => [
      `"${m.methodId}"`,
      `"${m.methodName}"`,
      m.thresholdUsed.toFixed(2),
      m.metrics.coverage.toFixed(2),
      m.ciCoverage.lower.toFixed(2),
      m.ciCoverage.upper.toFixed(2),
      (m.metrics.accuracy * 100).toFixed(2),
      (m.metrics.precision * 100).toFixed(2),
      (m.metrics.recall * 100).toFixed(2),
      (m.metrics.f1 * 100).toFixed(2),
      (m.metrics.falseRejectionRate * 100).toFixed(2),
      (m.metrics.falseAcceptanceRate * 100).toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `baseline_vs_adaptive_evaluation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Baseline vs. Adaptive Empirical Evaluation
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Evaluated strictly on Unseen Test Set (REQ9–REQ16, 54 test cases)</span>
            <span aria-hidden="true">·</span>
            <span>Zero Test Data Leakage</span>
            <span aria-hidden="true">·</span>
            <span>5-Fold Cross Validation (95% CI)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Benchmark CSV</span>
          </button>
          <button
            onClick={onRunReEvaluation}
            disabled={isEvaluating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <span>{isEvaluating ? 'Re-evaluating...' : 'Re-Run Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Key Finding Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map((method, idx) => {
          const isAdaptive = method.isAdaptive;
          const isBest = method.methodId === 'E2';
          return (
            <div
              key={method.methodId}
              className={`p-5 rounded-xl border transition-all ${
                isBest
                  ? 'bg-white border-indigo-300 shadow-xs ring-1 ring-indigo-100'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  Experiment {method.methodId}
                </span>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  τ = {method.thresholdUsed.toFixed(2)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {method.methodName}
              </h3>
              <p className="text-[11px] text-slate-500 mb-4 line-clamp-2">
                {method.objective}
              </p>

              {/* Core Metrics */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Test Coverage (Eq. 4):</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {method.metrics.coverage.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      95% CI: [{method.ciCoverage.lower.toFixed(1)}%, {method.ciCoverage.upper.toFixed(1)}%]
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">F1-Score:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-700 tabular-nums">
                      {(method.metrics.f1 * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      (P: {(method.metrics.precision * 100).toFixed(1)}% · R: {(method.metrics.recall * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">False Rejection (FRR):</span>
                  <span className={`font-mono font-semibold tabular-nums ${
                    method.metrics.falseRejectionRate < 0.10 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {(method.metrics.falseRejectionRate * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">False Acceptance (FAR):</span>
                  <span className="font-mono font-semibold text-slate-700 tabular-nums">
                    {(method.metrics.falseAcceptanceRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Comparative Benchmark Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Controlled Experimental Evaluation Matrix (Table Reproducing Paper Benchmarks)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compares fixed baseline filtering against validation-selected adaptive filtering with 95% Confidence Intervals computed via Student's t-distribution across 5 runs (Eq. 14).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-2.5 px-3 whitespace-nowrap">Method & Setup</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Filtering Cutoff (τ)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Coverage (%)</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">95% CI (n=5)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Precision</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Recall</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">F1-Score</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">False Rejection</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">False Acceptance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {methods.map((m) => {
                const isAdaptive = m.isAdaptive;
                const isOptimal = m.methodId === 'E2';
                return (
                  <tr
                    key={m.methodId}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      isOptimal ? 'bg-indigo-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans text-slate-900 font-semibold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isOptimal && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                        <span>[{m.methodId}] {m.methodName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-bold tabular-nums">
                      {m.thresholdUsed.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {m.metrics.coverage.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 tabular-nums whitespace-nowrap">
                      [{m.ciCoverage.lower.toFixed(1)}%, {m.ciCoverage.upper.toFixed(1)}%]
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {(m.metrics.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">
                      {(m.metrics.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700 tabular-nums">
                      {(m.metrics.f1 * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 tabular-nums">
                      {(m.metrics.falseRejectionRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700 tabular-nums">
                      {(m.metrics.falseAcceptanceRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technique Breakdown: Where Does Adaptive Thresholding Help Most? */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Test Coverage by Software Testing Technique (%)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            As documented in Section VI-B of the paper, Equivalence Partitioning (EP) and Boundary Value Analysis (BVA) achieve near-perfect baseline coverage, whereas Use Case (UC) and State Transition (ST) testing present complex sequential logic where adaptive thresholding yields major gains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['EP', 'BVA', 'Use Case', 'State Transition'] as const).map(technique => {
            const e1Tech = e1Baseline.techniqueBreakdown.find(t => t.technique === technique);
            const e2Tech = e2Adaptive.techniqueBreakdown.find(t => t.technique === technique);

            const baselineCoverage = e1Tech?.coverage || 0;
            const adaptiveCoverage = e2Tech?.coverage || 0;
            const delta = adaptiveCoverage - baselineCoverage;

            return (
              <div key={technique} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{technique}</span>
                  {delta > 0 && (
                    <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      +{delta.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Baseline (0.80):</span>
                      <span className="font-mono font-semibold text-slate-700">{baselineCoverage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-500" style={{ width: `${baselineCoverage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Adaptive (τ*):</span>
                      <span className="font-mono font-bold text-indigo-700">{adaptiveCoverage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600" style={{ width: `${adaptiveCoverage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 font-mono">
                  {e2Tech?.acceptedCases} of {e2Tech?.totalCases} test cases accepted
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Confusion Matrices */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Classification Confusion Matrices (Unseen Test Set)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Observe how E2 (Adaptive) minimizes False Negatives (FN) while maintaining controlled False Positives (FP).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {methods.map(m => (
            <div key={m.methodId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">[{m.methodId}] {m.methodName}</span>
                <span className="font-mono text-xs text-slate-500">τ = {m.thresholdUsed.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] text-emerald-800 uppercase block font-sans font-medium">True Pos (TP)</span>
                  <span className="text-lg font-bold text-emerald-900">{m.confusionMatrix.tp}</span>
                </div>
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-[10px] text-rose-800 uppercase block font-sans font-medium">False Pos (FP)</span>
                  <span className="text-lg font-bold text-rose-900">{m.confusionMatrix.fp}</span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[10px] text-amber-800 uppercase block font-sans font-medium">False Neg (FN)</span>
                  <span className="text-lg font-bold text-amber-900">{m.confusionMatrix.fn}</span>
                </div>
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg">
                  <span className="text-[10px] text-slate-700 uppercase block font-sans font-medium">True Neg (TN)</span>
                  <span className="text-lg font-bold text-slate-900">{m.confusionMatrix.tn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
