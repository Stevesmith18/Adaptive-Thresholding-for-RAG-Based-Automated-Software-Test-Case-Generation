import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, FileCode } from 'lucide-react';

interface PythonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonModal: React.FC<PythonModalProps> = ({ isOpen, onClose }) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'threshold' | 'pipeline' | 'requirements'>('threshold');

  if (!isOpen) return null;

  const pythonAdaptiveThresholdCode = `"""
Adaptive Thresholding for RAG-Based Automated Software Test Case Generation
Extending IEEE Access (2026): Sisomboon et al.

Module: src/adaptive_threshold.py
"""

import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score

def evaluate_threshold(scores, labels, threshold):
    \"\"\"
    Evaluates binary test case candidate acceptance at a given similarity cutoff.
    scores: list or np.array of float semantic similarity scores [0.0, 1.0]
    labels: list or np.array of binary gold-standard validity labels (1 = valid, 0 = invalid)
    threshold: float cutoff in [0.60, 0.90]
    \"\"\"
    preds = [1 if s >= threshold else 0 for s in scores]
    
    tp = sum(1 for p, y in zip(preds, labels) if p == 1 and y == 1)
    fp = sum(1 for p, y in zip(preds, labels) if p == 1 and y == 0)
    fn = sum(1 for p, y in zip(preds, labels) if p == 0 and y == 1)
    tn = sum(1 for p, y in zip(preds, labels) if p == 0 and y == 0)
    
    total_pos = tp + fn
    total_neg = fp + tn
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    accuracy = (tp + tn) / len(labels) if len(labels) > 0 else 0.0
    
    far = fp / total_neg if total_neg > 0 else 0.0
    frr = fn / total_pos if total_pos > 0 else 0.0
    coverage = (tp + tn) / len(labels) * 100.0 if len(labels) > 0 else 0.0
    
    return {
        "threshold": round(float(threshold), 3),
        "f1": round(float(f1), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "accuracy": round(float(accuracy), 4),
        "coverage": round(float(coverage), 2),
        "false_acceptance_rate": round(float(far), 4),
        "false_rejection_rate": round(float(frr), 4),
        "tp": tp, "fp": fp, "fn": fn, "tn": tn
    }

def select_threshold(scores, labels, min_precision=None):
    \"\"\"
    Select the threshold that maximizes validation F1.
    CRITICAL: Call this function ONLY on validation data (REQ1-8).
    Freeze the selected threshold before evaluating on the unseen test set (REQ9-16).
    \"\"\"
    candidates = np.arange(0.60, 0.901, 0.01)
    results = [
        evaluate_threshold(scores, labels, t)
        for t in candidates
    ]
    
    eligible = results
    if min_precision is not None:
        filtered = [r for r in results if r["precision"] >= min_precision]
        if len(filtered) > 0:
            eligible = filtered
            
    best = max(
        eligible,
        key=lambda row: (
            row["f1"],
            row["precision"],
            -row["threshold"]  # prefer lower threshold if tied to maintain high coverage
        )
    )
    return best, results

if __name__ == "__main__":
    # Benchmark validation data sample (REQ1 to REQ8)
    validation_scores = [
        0.96, 0.94, 0.95, 0.86, 0.87, 0.85, 0.84, 0.81, 
        0.88, 0.76, 0.73, 0.92, 0.91, 0.83, 0.87, 0.74, 
        0.68, 0.64, 0.58, 0.77
    ]
    validation_labels = [
        1, 1, 1, 1, 1, 1, 1, 1, 
        1, 1, 1, 1, 1, 1, 1, 1, 
        0, 0, 0, 1
    ]
    
    best, all_results = select_threshold(validation_scores, validation_labels)
    print("=" * 60)
    print("ADAPTIVE THRESHOLD CALIBRATION RESULTS (VALIDATION SET)")
    print("=" * 60)
    print(f"Optimal Threshold (tau*): {best['threshold']}")
    print(f"Validation F1-Score:      {best['f1'] * 100:.2f}%")
    print(f"Validation Precision:     {best['precision'] * 100:.2f}%")
    print(f"Validation Recall:        {best['recall'] * 100:.2f}%")
    print(f"False Rejection Rate:     {best['false_rejection_rate'] * 100:.2f}%")
    print(f"Test Coverage:            {best['coverage']:.2f}%")
    print("=" * 60)
`;

  const pythonPipelineCode = `"""
Pipeline Experiment: Baseline (0.80) vs. Adaptive Threshold on Unseen Test Requirements
Module: eval_pipeline.py
"""
import numpy as np
from scipy import stats
from adaptive_threshold import evaluate_threshold, select_threshold

def evaluate_on_test_set(test_scores, test_labels, baseline_thresh=0.80, adaptive_thresh=0.75):
    print("Evaluating Baseline Method E1 (tau = 0.80)...")
    res_baseline = evaluate_threshold(test_scores, test_labels, baseline_thresh)
    
    print(f"Evaluating Proposed Adaptive Method E2 (tau* = {adaptive_thresh})...")
    res_adaptive = evaluate_threshold(test_scores, test_labels, adaptive_thresh)
    
    print("\\n" + "=" * 65)
    print(f"{'Metric':<25} | {'Baseline (0.80)':<18} | {'Adaptive (tau*)':<18}")
    print("-" * 65)
    print(f"{'Test Coverage (%)':<25} | {res_baseline['coverage']:<18} | {res_adaptive['coverage']:<18}")
    print(f"{'F1-Score (%)':<25} | {res_baseline['f1']*100:<18.2f} | {res_adaptive['f1']*100:<18.2f}")
    print(f"{'Precision (%)':<25} | {res_baseline['precision']*100:<18.2f} | {res_adaptive['precision']*100:<18.2f}")
    print(f"{'Recall (%)':<25} | {res_baseline['recall']*100:<18.2f} | {res_adaptive['recall']*100:<18.2f}")
    print(f"{'False Rejection (%)':<25} | {res_baseline['false_rejection_rate']*100:<18.2f} | {res_adaptive['false_rejection_rate']*100:<18.2f}")
    print(f"{'False Acceptance (%)':<25} | {res_baseline['false_acceptance_rate']*100:<18.2f} | {res_adaptive['false_acceptance_rate']*100:<18.2f}")
    print("=" * 65)
    return res_baseline, res_adaptive

if __name__ == "__main__":
    # Unseen testing dataset (REQ9 to REQ16)
    test_scores = [0.94, 0.92, 0.91, 0.89, 0.88, 0.87, 0.93, 0.90, 0.84, 0.89, 0.91, 0.82, 0.95, 0.86, 0.84, 0.91, 0.94, 0.95, 0.93, 0.81, 0.92, 0.89, 0.85, 0.86, 0.91, 0.83, 0.77, 0.85, 0.92, 0.94, 0.81, 0.88, 0.90, 0.89, 0.82, 0.93, 0.90, 0.92, 0.89, 0.87, 0.88, 0.86, 0.84, 0.91, 0.79, 0.65, 0.61]
    test_labels = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]
    
    evaluate_on_test_set(test_scores, test_labels, baseline_thresh=0.80, adaptive_thresh=0.75)
`;

  const requirementsTxt = `# Python dependencies for Adaptive RAG Automated Testing Project
python>=3.10
numpy>=1.24.0
pandas>=2.0.0
scikit-learn>=1.3.0
scipy>=1.11.0
sentence-transformers>=2.2.0
langchain>=0.1.0
langchain-community>=0.0.10
faiss-cpu>=1.7.4
pypdf>=3.17.0
streamlit>=1.30.0
matplotlib>=3.7.0
python-dotenv>=1.0.0
`;

  const handleCopy = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/75">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Academic Project Python Source Code
              </h3>
              <p className="text-[11px] text-slate-500">
                Reproducible Python 3.11 scripts for local execution, experiments, and thesis submission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('threshold')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'threshold'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              adaptive_threshold.py
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              eval_pipeline.py
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'requirements'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              requirements.txt
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const code =
                  activeTab === 'threshold'
                    ? pythonAdaptiveThresholdCode
                    : activeTab === 'pipeline'
                      ? pythonPipelineCode
                      : requirementsTxt;
                const name =
                  activeTab === 'threshold'
                    ? 'adaptive_threshold.py'
                    : activeTab === 'pipeline'
                      ? 'eval_pipeline.py'
                      : 'requirements.txt';
                handleCopy(code, name);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              {copiedFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const code =
                  activeTab === 'threshold'
                    ? pythonAdaptiveThresholdCode
                    : activeTab === 'pipeline'
                      ? pythonPipelineCode
                      : requirementsTxt;
                const name =
                  activeTab === 'threshold'
                    ? 'adaptive_threshold.py'
                    : activeTab === 'pipeline'
                      ? 'eval_pipeline.py'
                      : 'requirements.txt';
                handleDownload(code, name);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Viewport */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
          <pre className="select-text whitespace-pre">
            {activeTab === 'threshold'
              ? pythonAdaptiveThresholdCode
              : activeTab === 'pipeline'
                ? pythonPipelineCode
                : requirementsTxt}
          </pre>
        </div>
      </div>
    </div>
  );
};
