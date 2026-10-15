export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  trainingAccuracy: number;
  trainingF1: number;
  meanPerformance: number; // m_bar_i = (Accuracy + F1) / 2
}

export const EVALUATED_MODELS: Record<string, ModelConfig> = {
  claude: {
    id: "claude",
    name: "Claude-Sonnet-4",
    provider: "Anthropic",
    trainingAccuracy: 0.95,
    trainingF1: 1.00,
    meanPerformance: 0.975,
  },
  gpt4o: {
    id: "gpt4o",
    name: "ChatGPT-4o",
    provider: "OpenAI",
    trainingAccuracy: 0.51,
    trainingF1: 0.80,
    meanPerformance: 0.655,
  },
  gemini: {
    id: "gemini",
    name: "Gemini-2.5-Flash",
    provider: "Google",
    trainingAccuracy: 0.94,
    trainingF1: 0.80,
    meanPerformance: 0.870,
  },
  qwen: {
    id: "qwen",
    name: "Qwen3-Coder (480B)",
    provider: "Alibaba",
    trainingAccuracy: 0.91,
    trainingF1: 0.81,
    meanPerformance: 0.860,
  },
  mistral: {
    id: "mistral",
    name: "Mistral-Small-3.2 (24B)",
    provider: "MistralAI",
    trainingAccuracy: 0.91,
    trainingF1: 0.81,
    meanPerformance: 0.860,
  }
};

/**
 * Calculates normalized softmax model weights using Equation (10):
 * w_i = exp((m_bar_i - max(m_bar)) / lambda) / sum(exp((m_bar_j - max(m_bar)) / lambda))
 */
export function computeSoftmaxWeights(modelIds: string[], lambda = 1.0): Record<string, number> {
  const models = modelIds.map(id => EVALUATED_MODELS[id]).filter(Boolean);
  if (models.length === 0) return {};

  const maxM = Math.max(...models.map(m => m.meanPerformance));
  const expValues = models.map(m => Math.exp((m.meanPerformance - maxM) / lambda));
  const sumExp = expValues.reduce((a, b) => a + b, 0);

  const weights: Record<string, number> = {};
  models.forEach((m, idx) => {
    weights[m.id] = Math.round((expValues[idx] / sumExp) * 1000) / 1000;
  });

  return weights;
}

// Fixed calibrated weights from paper Table 6 / Section IV-A-4:
export const PAPER_ENSEMBLE_WEIGHTS = {
  threeModel: {
    claude: 0.393,
    gpt4o: 0.264,
    gemini: 0.343,
  },
  fourModel: {
    claude: 0.292,
    gpt4o: 0.196,
    gemini: 0.254,
    qwen: 0.257,
  },
  fiveModel: {
    claude: 0.232,
    gpt4o: 0.156,
    gemini: 0.202,
    qwen: 0.205,
    mistral: 0.205,
  }
};

/**
 * Graded score mapping from paper Eq. (11):
 * 1.0 if TP or TN
 * 0.5 if TPPartial or TNPartial
 * 0.0 if FP or FN
 */
export function convertPredictionToScore(predictionOutcome: string): number {
  if (predictionOutcome === 'TP' || predictionOutcome === 'TN') {
    return 1.0;
  }
  if (predictionOutcome === 'TPPartial' || predictionOutcome === 'TNPartial' || predictionOutcome === 'Partial') {
    return 0.5;
  }
  return 0.0;
}

/**
 * Decision rule classification from paper Eq. (13) and Table 4:
 * Pass: sim >= 0.85 and f(t) = 1 and c(t) = 1
 * Partial Pass: sim >= 0.85 and f(t) = 1 and c(t) = 0
 * Related: 0.50 <= sim < 0.85 and f(t) = 0
 * Not Related: sim < 0.50
 */
export function classifyDecisionRule(
  similarity: number,
  functionalCorrectness: 1 | 0,
  completeness: 1 | 0,
  thetaSem = 0.85,
  thetaRel = 0.50
): 'Pass' | 'Partial Pass' | 'Related' | 'Not Related' {
  if (similarity >= thetaSem && functionalCorrectness === 1 && completeness === 1) {
    return 'Pass';
  }
  if (similarity >= thetaSem && functionalCorrectness === 1 && completeness === 0) {
    return 'Partial Pass';
  }
  if (similarity >= thetaRel && similarity < thetaSem && functionalCorrectness === 0) {
    return 'Related';
  }
  return 'Not Related';
}
