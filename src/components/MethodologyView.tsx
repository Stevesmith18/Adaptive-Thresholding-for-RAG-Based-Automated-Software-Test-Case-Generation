import React from 'react';
import {
  FileText,
  Workflow,
  Cpu,
  Layers,
  CheckCircle2,
  Code2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Research Methodology & Formal Mathematical Framework
        </h1>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>IEEE Access (2026) Base Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Thresholding Research Extension</span>
          <span aria-hidden="true">·</span>
          <span>Directional Partially Weighted Ensemble</span>
        </div>
      </div>

      {/* High-Level Architecture Flowchart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            End-to-End System Pipeline Architecture
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Combines non-parametric retrieval memory with directional ensemble LLMs and data-driven threshold filtering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Phase 1</span>
            <h3 className="text-xs font-bold text-slate-900">RAG Ingestion</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Industrial testing documentation segmented into 1,000-character chunks with 200-character overlap. Vectorized via Sentence Transformers and stored in vector memory.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Phase 2</span>
            <h3 className="text-xs font-bold text-slate-900">PARTS Prompting</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Structured prompt combining Persona, Aim, Recipients, Theme, and Structure with top-5 retrieved chunks to eliminate hallucinations.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">Phase 3</span>
            <h3 className="text-xs font-bold text-slate-900">Directional Ensemble</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Softmax-weighted predictions across Claude, GPT-4o, Gemini, Qwen, and Mistral with partial correctness credit (1.0 for full, 0.5 for partial).
            </p>
          </div>

          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase">Extension</span>
            <h3 className="text-xs font-bold text-indigo-950">Adaptive Thresholding</h3>
            <p className="text-[11px] text-indigo-900/80 leading-relaxed">
              Replaces static 0.80 cutoff with validation-calibrated optimal threshold τ* maximizing F1, rescuing valid state and boundary test cases.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Formulations Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          Core Mathematical Formulations (IEEE Access 2026 Paper)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Equation 9 & 10 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-[11px] font-bold text-slate-700 block">
              1. Softmax Model Weight Allocation (Eq. 9 & 10)
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>m̄_i = (Accuracy_i + F1_i) / 2</div>
              <div className="text-slate-500">w_i = exp((m̄_i - max(m̄)) / λ) / Σ exp((m̄_j - max(m̄)) / λ)</div>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Weights models proportionally based on combined Accuracy and F1. Claude-Sonnet-4 achieved highest weight (0.393), followed by Gemini (0.343) and GPT-4o (0.264).
            </p>
          </div>

          {/* Equation 11 & 12 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-[11px] font-bold text-slate-700 block">
              2. Prediction-to-Score Conversion & Ensemble (Eq. 11 & 12)
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>Score_i[t] = 1.0 (TP/TN) | 0.5 (Partial) | 0.0 (FP/FN)</div>
              <div className="text-slate-500">FinalScore[t] = Σ (w_i · Score_i[t])</div>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ensures partial correctness is credited (50%) without equating incomplete specifications with full correctness.
            </p>
          </div>

          {/* Equation 13 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-mono text-[11px] font-bold text-slate-700 block">
              3. Decision-Rule–Based Evaluation Mechanism (Eq. 13)
            </span>
            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>Pass: sim ≥ 0.85 ∧ f(t)=1 ∧ c(t)=1</div>
              <div>PartialPass: sim ≥ 0.85 ∧ f(t)=1 ∧ c(t)=0</div>
              <div>Related: 0.50 ≤ sim &lt; 0.85 ∧ f(t)=0</div>
              <div>Not Related: sim &lt; 0.50</div>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Explicitly decouples topical semantic relevance from functional validity f(t) and test element completeness c(t).
            </p>
          </div>

          {/* Proposed Adaptive Formulation */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
            <span className="font-mono text-[11px] font-bold text-indigo-950 block">
              4. Proposed Adaptive Threshold Selection Extension
            </span>
            <div className="bg-white p-3 rounded-lg border border-indigo-200 font-mono text-[11px] text-slate-800 space-y-1">
              <div>{'τ* = argmax_{τ ∈ [0.60, 0.90]} F1(ValidationSet, τ)'}</div>
              <div className="text-slate-500">{'τ*_safe = argmax_{τ, P(τ) ≥ P_min} F1(ValidationSet, τ)'}</div>
            </div>
            <p className="text-indigo-900/80 text-[11px] leading-relaxed">
              Selected on labelled validation data, frozen, and evaluated on unseen test requirements without leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Complexity and Scalability */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Algorithmic Complexity & Scalability (Paper Eq. 2 & 3)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block font-sans text-[11px]">Time Complexity</span>
            <span className="text-sm font-bold text-slate-900">O(m · k · n · t)</span>
            <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
              m = models (5), k = folds (5), n = requirements (16), t = candidates
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block font-sans text-[11px]">Space Complexity</span>
            <span className="text-sm font-bold text-slate-900">O(m · k · n)</span>
            <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
              Linear scaling confirmed with R² ≈ 0.99
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
