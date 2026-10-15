/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNavigation, ActiveTab } from './components/TopNavigation.tsx';
import { WorkbenchView } from './components/WorkbenchView.tsx';
import { CalibrationLabView } from './components/CalibrationLabView.tsx';
import { EvaluationView } from './components/EvaluationView.tsx';
import { DatasetExplorerView } from './components/DatasetExplorerView.tsx';
import { MethodologyView } from './components/MethodologyView.tsx';
import { PythonModal } from './components/PythonModal.tsx';
import { PromptTemplateType } from './services/ragPipeline.ts';
import { BENCHMARK_REQUIREMENTS } from './data/benchmarkData.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workbench');
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);

  // Workbench Form State
  const defaultReq = BENCHMARK_REQUIREMENTS.find(r => r.id === 'REQ6')?.description ||
    'A banking system must reject a transfer when the available balance is less than the transfer amount.';
  const [currentRequirement, setCurrentRequirement] = useState<string>(defaultReq);
  const [technique, setTechnique] = useState<'BVA' | 'EP' | 'Use Case' | 'State Transition'>('BVA');
  const [templateType, setTemplateType] = useState<PromptTemplateType>('PARTS');
  const [thresholdMode, setThresholdMode] = useState<'adaptive' | 'baseline' | 'custom'>('adaptive');
  const [customThreshold, setCustomThreshold] = useState<number>(0.75);
  const [frozenOptimalThreshold, setFrozenOptimalThreshold] = useState<number>(0.75);
  const [ensembleModelCount, setEnsembleModelCount] = useState<number>(3);

  // Generation Results
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);

  // Calibration & Evaluation Data
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Load initial calibration and evaluation data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Calibrate on validation split (REQ1-8)
      const calRes = await fetch('/api/calibrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minPrecision: 0.85 }),
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        setCalibrationData(calData);
        if (calData.optimalThreshold) {
          setFrozenOptimalThreshold(calData.optimalThreshold);
          setCustomThreshold(calData.optimalThreshold);
        }
      }

      // 2. Evaluate on unseen test split (REQ9-16)
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adaptiveThreshold: 0.75, precisionFloor: 0.85 }),
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setComparisonData(evalData);
      }
    } catch (err) {
      console.warn('Backend API warming up, using local calibration defaults:', err);
    }
  };

  const handleGenerate = async () => {
    if (!currentRequirement.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementText: currentRequirement,
          technique,
          templateType,
          thresholdMode,
          customThreshold: thresholdMode === 'adaptive' ? frozenOptimalThreshold : customThreshold,
          ensembleModelCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedResult(data);
      } else {
        const err = await res.json();
        alert(`Generation notice: ${err.error || 'Server processing error'}`);
      }
    } catch (err) {
      console.error('Failed to generate test cases:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFreezeThreshold = async (newThreshold: number) => {
    setFrozenOptimalThreshold(newThreshold);
    setCustomThreshold(newThreshold);

    // Re-evaluate test set with frozen threshold
    setIsEvaluating(true);
    try {
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adaptiveThreshold: newThreshold, precisionFloor: 0.85 }),
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setComparisonData(evalData);
      }
    } catch (err) {
      console.error('Failed to re-evaluate with frozen threshold:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRunReEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adaptiveThreshold: frozenOptimalThreshold, precisionFloor: 0.85 }),
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        setComparisonData(evalData);
      }
    } catch (err) {
      console.error('Failed to run re-evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Run initial generation on first mount if none exists
  useEffect(() => {
    if (!generatedResult && currentRequirement) {
      handleGenerate();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Contract Navigation */}
      <TopNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onQuickGenerate={handleGenerate}
        isGenerating={isGenerating}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'workbench' && (
          <WorkbenchView
            currentRequirement={currentRequirement}
            setCurrentRequirement={setCurrentRequirement}
            technique={technique}
            setTechnique={setTechnique}
            templateType={templateType}
            setTemplateType={setTemplateType}
            thresholdMode={thresholdMode}
            setThresholdMode={setThresholdMode}
            customThreshold={customThreshold}
            setCustomThreshold={setCustomThreshold}
            frozenOptimalThreshold={frozenOptimalThreshold}
            ensembleModelCount={ensembleModelCount}
            setEnsembleModelCount={setEnsembleModelCount}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generatedResult={generatedResult}
          />
        )}

        {activeTab === 'calibration' && (
          <CalibrationLabView
            sweepData={calibrationData?.sweepData || []}
            optimalThreshold={calibrationData?.optimalThreshold || 0.75}
            constrainedThreshold={calibrationData?.constrainedThreshold || 0.79}
            activeFrozenThreshold={frozenOptimalThreshold}
            onFreezeThreshold={handleFreezeThreshold}
            sampleCount={calibrationData?.sampleCount || 31}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView
            comparisonData={comparisonData}
            activeFrozenThreshold={frozenOptimalThreshold}
            onRunReEvaluation={handleRunReEvaluation}
            isEvaluating={isEvaluating}
          />
        )}

        {activeTab === 'dataset' && <DatasetExplorerView />}

        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>Adaptive Thresholding for RAG Automated Software Test Case Generation</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>IEEE Access 2026 Reference Implementation</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Validation Optimal τ* = {frozenOptimalThreshold.toFixed(2)} · Baseline τ = 0.80
          </div>
        </div>
      </footer>

      {/* Python Code Export Modal */}
      <PythonModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
