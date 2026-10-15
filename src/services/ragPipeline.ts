import { RAG_KNOWLEDGE_BASE, RAGDocumentChunk } from '../data/benchmarkData.ts';

export type PromptTemplateType = 'PARTS' | 'RICEE' | 'UserStory';

/**
 * Calculates cosine similarity between two bag-of-words / frequency vectors
 */
export function calculateTextCosineSimilarity(text1: string, text2: string): number {
  const tokenize = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  };

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();

  for (const w of words1) freq1.set(w, (freq1.get(w) || 0) + 1);
  for (const w of words2) freq2.set(w, (freq2.get(w) || 0) + 1);

  const allWords = new Set([...freq1.keys(), ...freq2.keys()]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (const w of allWords) {
    const v1 = freq1.get(w) || 0;
    const v2 = freq2.get(w) || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  }

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Retrieves top-k semantically aligned chunks from knowledge base
 */
export function retrieveContext(
  query: string,
  topK = 5,
  minRetrievalThreshold = 0.15
): { chunk: RAGDocumentChunk; similarity: number }[] {
  const scored = RAG_KNOWLEDGE_BASE.map(chunk => {
    // Combine title and content
    const similarity = calculateTextCosineSimilarity(query, `${chunk.title} ${chunk.content} ${chunk.domain}`);
    return { chunk, similarity };
  });

  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .filter(item => item.similarity >= minRetrievalThreshold || RAG_KNOWLEDGE_BASE.length <= topK)
    .slice(0, topK);
}

/**
 * Formats structured prompt based on the chosen template
 */
export function buildPrompt(
  requirement: string,
  technique: string,
  retrievedChunks: { chunk: RAGDocumentChunk; similarity: number }[],
  templateType: PromptTemplateType = 'PARTS'
): string {
  const contextString = retrievedChunks
    .map((c, i) => `[Source ${i + 1}: ${c.chunk.title}]\n${c.chunk.content}`)
    .join('\n\n');

  if (templateType === 'PARTS') {
    return `PERSONA: As A Professional software tester.
AIM: I WANT to generate test cases covering both functional and error scenarios from this condition: "${requirement}".
AND I WANT the test cases to be relevant to the requirement type (${technique}), whether it involves business rules, state transitions, input validation, or system behavior.
RECIPIENT: SO THAT consumers, developers, and QA teams can verify the correctness of the system under various conditions.
THEME: Use a formal, test-driven specification style and objective verification criteria.
STRUCTURE: Present ONLY the test cases in a clean JSON array with the following fields for each test case:
- "id": string (e.g. "TC01", "TC02")
- "condition": string (clear logical precondition or boundary condition)
- "exampleData": string (concrete input parameters)
- "expectedResult": string (deterministic system outcome)
- "testType": string ("Positive" | "Negative" | "Boundary" | "State Transition" | "Edge Case")
AND Do NOT include any introductory or concluding markdown chat text.
AND Relevant Information Extracted from the Document:
${contextString}`;
  }

  if (templateType === 'RICEE') {
    return `ROLE: Professional software tester,
INSTRUCTION: Generate test cases covering both functional and error scenarios from this condition: "${requirement}".
CONTEXT: Relevant Information Extracted from the Document:
${contextString}
EXAMPLE: Present ONLY the test cases in a JSON array format with fields: "id", "condition", "exampleData", "expectedResult", "testType".
EXCLUSION: Exclude any introductory, conversational, or concluding text.`;
  }

  // User Story template
  return `AS A Professional software tester,
I WANT to generate test cases covering both functional and error scenarios from this condition: "${requirement}",
AND I WANT the test cases to be relevant to the requirement type (${technique}), whether it involves business rules, state transitions, input validation, or system behavior,
AND: Present ONLY the test cases in a JSON array format with fields: "id", "condition", "exampleData", "expectedResult", "testType",
SO THAT consumers, developers, and QA teams can verify the correctness of the system under various conditions.
AND Do NOT include any introductory or concluding text.
AND Relevant Information Extracted from the Document:
${contextString}`;
}
