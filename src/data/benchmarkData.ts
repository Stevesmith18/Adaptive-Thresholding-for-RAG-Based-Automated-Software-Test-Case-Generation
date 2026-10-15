export interface TestCase {
  id: string;
  condition: string;
  exampleData: string;
  expectedResult: string;
  testType: 'Positive' | 'Negative' | 'Boundary' | 'State Transition' | 'Edge Case';
  goldStandard: boolean;
  modelPredictions?: {
    claude?: 'TP' | 'TN' | 'TPPartial' | 'TNPartial' | 'FP' | 'FN' | 'Related';
    gpt4o?: 'TP' | 'TN' | 'TPPartial' | 'TNPartial' | 'FP' | 'FN' | 'Related';
    gemini?: 'TP' | 'TN' | 'TPPartial' | 'TNPartial' | 'FP' | 'FN' | 'Related';
    qwen?: 'TP' | 'TN' | 'TPPartial' | 'TNPartial' | 'FP' | 'FN' | 'Related';
    mistral?: 'TP' | 'TN' | 'TPPartial' | 'TNPartial' | 'FP' | 'FN' | 'Related';
  };
  similarityScore: number;
  groundTruthLabel: 1 | 0; // 1 = valid acceptable test case, 0 = invalid / distractor
  functionalCorrectness: 1 | 0; // f(t)
  completeness: 1 | 0; // c(t)
}

export interface SoftwareRequirement {
  id: string;
  title: string;
  technique: 'BVA' | 'EP' | 'Use Case' | 'State Transition';
  level: 'Level-1 (Very Low)' | 'Level-2 (Low)' | 'Level-3 (Moderate)' | 'Level-4 (High)';
  split: 'training' | 'testing';
  source: 'Real Project' | 'Kaggle' | 'ISTQB';
  businessDomain: string;
  totalTC: number;
  description: string;
  ragContext: string[];
  goldCases: TestCase[];
}

export interface RAGDocumentChunk {
  id: string;
  title: string;
  domain: string;
  content: string;
  technique: 'BVA' | 'EP' | 'Use Case' | 'State Transition' | 'General';
}

export const RAG_KNOWLEDGE_BASE: RAGDocumentChunk[] = [
  {
    id: "KB-01",
    title: "ISTQB Boundary Value Analysis (BVA) Guidelines",
    domain: "Software Quality Engineering",
    technique: "BVA",
    content: "Boundary Value Analysis (BVA) tests conditions at the boundaries of input equivalence classes. For numeric ranges [min, max], standard 2-value BVA tests {min, max} and off-points {min-1, max+1}. For 3-value BVA, {min-1, min, min+1} and {max-1, max, max+1} are validated. In financial transfers, test zero balances, exactly equal balance-to-transfer amount, and balance + ₹1 increments."
  },
  {
    id: "KB-02",
    title: "Equivalence Partitioning (EP) Specification Standard",
    domain: "Software Quality Engineering",
    technique: "EP",
    content: "Equivalence Partitioning divides input domain into valid and invalid equivalence classes where system behavior is hypothesized to be identical. Each valid partition must be covered by at least one test case. Each invalid partition must be tested individually in isolation to ensure masking effects do not hide validation failures."
  },
  {
    id: "KB-03",
    title: "Agile Acceptance Criteria & User Story Format (PARTS/XP)",
    domain: "Agile Development",
    technique: "Use Case",
    content: "Acceptance Test-Driven Development (ATDD) requires user stories formatted as: 'As a [role], I want [goal], so that [purpose].' PARTS prompts require explicit Persona, Aim, Recipients, Theme, and Structure. Structured tabular output must enumerate Test Case ID, Condition, Concrete Example Data, and Deterministic Expected Result."
  },
  {
    id: "KB-04",
    title: "State Transition Testing & Event-Driven Oracles",
    domain: "Enterprise Systems",
    technique: "State Transition",
    content: "State Transition testing models system lifecycle states (e.g., Pending, Confirmed, Shipped, Expired). Test cases must assert initial valid state, incoming event/trigger, transition guard condition, target resulting state, and boundary timeout conditions (e.g. 180-day expiration window)."
  },
  {
    id: "KB-05",
    title: "Banking Ledger & Transaction Guard Invariants",
    domain: "Banking and Financial Services",
    technique: "BVA",
    content: "Financial transaction engines enforce strict invariant: Account Balance >= Transfer Amount + Transaction Fee. If Available Balance < Transfer Amount, transaction status MUST immediately transition to 'REJECTED_INSUFFICIENT_FUNDS' without partial debiting."
  },
  {
    id: "KB-06",
    title: "Customer Loyalty & Reward Point Validity Rules",
    domain: "E-Commerce and Retail",
    technique: "State Transition",
    content: "Reward points become redeemable on day 1 of product confirmation. Validity period is exactly 180 calendar days. At day <= 180, points discount applies. At day >= 181, point redemption is rejected with 'POINTS_EXPIRED'. Transactions with expired points without redemption attempt proceed at standard undiscounted total."
  },
  {
    id: "KB-07",
    title: "Logistics Dispatch & Weight Category Partitioning",
    domain: "Logistics",
    technique: "EP",
    content: "Logistics freight routing classifies parcels: Light (<5kg, air express eligible), Standard (5kg to 30kg, ground transport), Heavy (>30kg to 70kg, freight surcharge applies), Overweight (>70kg, requires specialized carrier authorization). Negative and non-numeric inputs trigger input validation exception."
  },
  {
    id: "KB-08",
    title: "Automotive Speed Regulator & Cruise Control State Machine",
    domain: "Automotive",
    technique: "State Transition",
    content: "Adaptive Cruise Control (ACC) states: Off, Standby, Active, Override. Speed setting allows integer values between 30 km/h and 180 km/h. Brake pedal press forces instantaneous state shift to Standby. Resume button restores previously latched target velocity."
  }
];

export const BENCHMARK_REQUIREMENTS: SoftwareRequirement[] = [
  // TRAINING SET (REQ 1 - REQ 8)
  {
    id: "REQ1",
    title: "Savings Account Minimum Deposit Rule",
    technique: "BVA",
    level: "Level-1 (Very Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking and Financial Services",
    totalTC: 3,
    description: "A customer opening a new savings account must make an initial deposit of at least ₹1,000. Any deposit amount below ₹1,000 must be rejected with an informative error message.",
    ragContext: ["KB-01", "KB-05"],
    goldCases: [
      {
        id: "REQ1-TC01",
        condition: "Deposit amount is strictly below minimum threshold (₹999)",
        exampleData: "Initial deposit = ₹999.00",
        expectedResult: "Account creation rejected; error 'Minimum initial deposit of ₹1,000 required' displayed.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.93,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ1-TC02",
        condition: "Deposit amount exactly matches minimum requirement (₹1,000)",
        exampleData: "Initial deposit = ₹1,000.00",
        expectedResult: "Account created successfully with initial active balance ₹1,000.00.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.95,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ1-TC03",
        condition: "Deposit amount is one unit above minimum threshold (₹1,001)",
        exampleData: "Initial deposit = ₹1,001.00",
        expectedResult: "Account created successfully with initial active balance ₹1,001.00.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ2",
    title: "Tax Identification Number (TIN) Partitioning",
    technique: "EP",
    level: "Level-1 (Very Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking and Financial Services",
    totalTC: 2,
    description: "The system must accept valid 10-digit alphanumeric Tax Identification Numbers (TIN) consisting of 5 uppercase letters, 4 digits, and 1 uppercase letter. All strings failing this format must be flagged invalid.",
    ragContext: ["KB-02"],
    goldCases: [
      {
        id: "REQ2-TC01",
        condition: "Valid 10-character formatted TIN matching regex pattern",
        exampleData: "TIN = 'ABCDE1234F'",
        expectedResult: "Validation passes; tax profile linked successfully.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ2-TC02",
        condition: "Invalid TIN format containing illegal special characters or incorrect length",
        exampleData: "TIN = 'ABCDE12#4F'",
        expectedResult: "Validation fails with error 'Invalid Tax Identification Number format'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ3",
    title: "ATM Daily Cash Withdrawal Limits",
    technique: "BVA",
    level: "Level-2 (Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking and Financial Services",
    totalTC: 5,
    description: "An ATM cardholder may withdraw between ₹100 and ₹25,000 per single day in multiples of ₹100. Withdrawals outside this boundary or non-multiples of ₹100 must be rejected.",
    ragContext: ["KB-01", "KB-05"],
    goldCases: [
      {
        id: "REQ3-TC01",
        condition: "Withdrawal amount below minimum bound (₹0 or ₹50)",
        exampleData: "Amount = ₹50",
        expectedResult: "Transaction rejected; error 'Minimum withdrawal is ₹100'.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.88,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ3-TC01_CANDIDATE_FP",
        condition: "Withdrawal with invalid pin code retry",
        exampleData: "Pin = '9999'",
        expectedResult: "Pin rejected after 3 attempts.",
        testType: "Negative",
        goldStandard: false,
        modelPredictions: { claude: 'Related', gpt4o: 'FP', gemini: 'Related', qwen: 'FP', mistral: 'FP' },
        similarityScore: 0.64,
        groundTruthLabel: 0,
        functionalCorrectness: 0,
        completeness: 0
      },
      {
        id: "REQ3-TC02",
        condition: "Withdrawal exact lower boundary (₹100)",
        exampleData: "Amount = ₹100",
        expectedResult: "Cash dispensed ₹100; receipt generated.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.96,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ3-TC03",
        condition: "Withdrawal nominal valid amount (₹5,000)",
        exampleData: "Amount = ₹5,000",
        expectedResult: "Cash dispensed ₹5,000; ledger debited.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ3-TC04",
        condition: "Withdrawal exact upper boundary (₹25,000)",
        exampleData: "Amount = ₹25,000",
        expectedResult: "Cash dispensed ₹25,000; daily cap reached flag activated.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.95,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ3-TC05",
        condition: "Withdrawal exceeding daily maximum (₹25,100)",
        exampleData: "Amount = ₹25,100",
        expectedResult: "Transaction rejected; error 'Daily limit ₹25,000 exceeded'.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ4",
    title: "Dual Condition Credit Card Loan Eligibility (Age & Monthly Income)",
    technique: "BVA",
    level: "Level-2 (Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking and Financial Services",
    totalTC: 8,
    description: "Loan applicant must be aged between 21 and 60 years inclusive AND earn a verifiable monthly salary of at least ₹30,000. Boundary analysis on both variables is required.",
    ragContext: ["KB-01", "KB-05"],
    goldCases: [
      {
        id: "REQ4-TC01",
        condition: "Age 20 (sub-boundary), Salary ₹30,000 (valid boundary)",
        exampleData: "Age = 20, Salary = ₹30,000",
        expectedResult: "Application rejected due to underage criteria.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.86,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC02",
        condition: "Age 21 (valid boundary), Salary ₹30,000 (valid boundary)",
        exampleData: "Age = 21, Salary = ₹30,000",
        expectedResult: "Eligible for credit review.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TPPartial', qwen: 'TPPartial', mistral: 'TPPartial' },
        similarityScore: 0.87,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC03",
        condition: "Age 60 (valid boundary), Salary ₹30,000 (valid boundary)",
        exampleData: "Age = 60, Salary = ₹30,000",
        expectedResult: "Eligible for credit review.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TPPartial', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.85,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC04",
        condition: "Age 61 (upper sub-boundary), Salary ₹30,000",
        exampleData: "Age = 61, Salary = ₹30,000",
        expectedResult: "Application rejected due to over-age criteria.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TPPartial', mistral: 'TPPartial' },
        similarityScore: 0.84,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC05",
        condition: "Age 35, Salary ₹29,999 (sub-boundary)",
        exampleData: "Age = 35, Salary = ₹29,999",
        expectedResult: "Application rejected due to insufficient monthly income.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'FP', gemini: 'TPPartial', qwen: 'TP', mistral: 'FP' },
        similarityScore: 0.81,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC06",
        condition: "Age 35, Salary ₹30,001 (nominal positive)",
        exampleData: "Age = 35, Salary = ₹30,001",
        expectedResult: "Eligible for credit review.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.88,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ4-TC07",
        condition: "Age 20, Salary ₹29,999 (double invalid boundary)",
        exampleData: "Age = 20, Salary = ₹29,999",
        expectedResult: "Application rejected; both age and income failure flags reported.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TPPartial', gpt4o: 'FP', gemini: 'TP', qwen: 'TPPartial', mistral: 'FP' },
        similarityScore: 0.76,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 0
      },
      {
        id: "REQ4-TC08",
        condition: "Age 61, Salary ₹29,999 (double invalid boundary)",
        exampleData: "Age = 61, Salary = ₹29,999",
        expectedResult: "Application rejected; both age and income failure flags reported.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'FP', gemini: 'TPPartial', qwen: 'FP', mistral: 'FP' },
        similarityScore: 0.73,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 0
      }
    ]
  },
  {
    id: "REQ5",
    title: "Omnichannel Checkout with Store Credit",
    technique: "Use Case",
    level: "Level-3 (Moderate)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking & Retail Integrations",
    totalTC: 2,
    description: "User checks out using combined store credit and credit card. If store credit exceeds total, entire amount is settled with store credit and card is not charged.",
    ragContext: ["KB-03", "KB-06"],
    goldCases: [
      {
        id: "REQ5-TC01",
        condition: "Store credit balance is greater than shopping cart order total",
        exampleData: "Cart total = ₹2,500, Store credit = ₹3,000",
        expectedResult: "Order paid in full via store credit; remaining store credit balance ₹500; external card untouched.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ5-TC02",
        condition: "Store credit is partial; remainder successfully charged to primary card",
        exampleData: "Cart total = ₹2,500, Store credit = ₹1,000, Card limit = ₹50,000",
        expectedResult: "Store credit deducted ₹1,000; card charged remaining ₹1,500; order confirmed.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TPPartial', gemini: 'TPPartial', qwen: 'TPPartial', mistral: 'TPPartial' },
        similarityScore: 0.85,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ6",
    title: "Fund Transfer Insufficient Balance Invariant",
    technique: "BVA",
    level: "Level-1 (Very Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking",
    totalTC: 3,
    description: "A banking system must reject a transfer when the available balance is less than the transfer amount.",
    ragContext: ["KB-01", "KB-05"],
    goldCases: [
      {
        id: "REQ6-TC01",
        condition: "Available balance is strictly greater than transfer amount",
        exampleData: "Balance = ₹1,000, Transfer = ₹500",
        expectedResult: "Transfer succeeds; remaining balance updated to ₹500.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.96,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ6-TC02",
        condition: "Available balance is exactly equal to transfer amount",
        exampleData: "Balance = ₹500, Transfer = ₹500",
        expectedResult: "Transfer succeeds; remaining balance updated to ₹0.00.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ6-TC03",
        condition: "Available balance is less than transfer amount",
        exampleData: "Balance = ₹300, Transfer = ₹500",
        expectedResult: "Transfer rejected with 'Insufficient funds'; balance remains unchanged at ₹300.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.95,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ7",
    title: "Fixed Deposit Tenure Thresholds",
    technique: "BVA",
    level: "Level-1 (Very Low)",
    split: "training",
    source: "Real Project",
    businessDomain: "Banking",
    totalTC: 3,
    description: "Fixed deposit tenure must be between 7 days and 3,650 days (10 years). Tenures outside this range must be rejected.",
    ragContext: ["KB-01", "KB-05"],
    goldCases: [
      {
        id: "REQ7-TC01",
        condition: "Tenure below minimum duration (6 days)",
        exampleData: "Tenure = 6 days",
        expectedResult: "Submission rejected; minimum duration is 7 days.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ7-TC02",
        condition: "Tenure at minimum valid duration (7 days)",
        exampleData: "Tenure = 7 days",
        expectedResult: "Deposit booked successfully with 7-day rate.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.93,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ7-TC03",
        condition: "Tenure at maximum boundary (3,650 days)",
        exampleData: "Tenure = 3,650 days",
        expectedResult: "Deposit booked successfully with 10-year senior/regular rate.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ8",
    title: "Customer Reward Points 180-Day Expiration Lifecycle",
    technique: "State Transition",
    level: "Level-4 (High)",
    split: "training",
    source: "Real Project",
    businessDomain: "E-Commerce and Retail",
    totalTC: 4,
    description: "Reward points are approved upon confirmation of goods receipt. The confirmation date is day 1 of the 180-day validity period. If a customer attempts to redeem points after 180 days, the redemption must be rejected.",
    ragContext: ["KB-04", "KB-06"],
    goldCases: [
      {
        id: "REQ8-TC01",
        condition: "Points confirmed and elapsed age is strictly less than 180 days",
        exampleData: "Age = 120 days, Points = 500",
        expectedResult: "Discount applied successfully to current order.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ8-TC02",
        condition: "Points exactly 180 days old redeemed at final valid day",
        exampleData: "Age = 180 days, Points = 500",
        expectedResult: "Discount applied successfully; points marked utilized.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'FN', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.83,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ8-TC03",
        condition: "Points greater than 180 days old attempted redemption",
        exampleData: "Age = 181 days, Points = 500",
        expectedResult: "Redemption rejected; discount not applied; expired status displayed.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TN', gpt4o: 'TN', gemini: 'TN', qwen: 'TN', mistral: 'TN' },
        similarityScore: 0.87,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ8-TC04",
        condition: "Points older than 180 days but no redemption attempted",
        exampleData: "Age = 200 days, Redemption = No",
        expectedResult: "Transaction completed without applying discount.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TN', gpt4o: 'TN', gemini: 'FP', qwen: 'FP', mistral: 'FP' },
        similarityScore: 0.74,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 0
      },
      {
        id: "REQ8-TC05_DISTRACTOR",
        condition: "Points earned during promotional holiday event without receipt",
        exampleData: "Unconfirmed receipt, holiday bonus",
        expectedResult: "Points remain in pending unapproved state.",
        testType: "Negative",
        goldStandard: false,
        modelPredictions: { claude: 'Related', gpt4o: 'Related', gemini: 'Related', qwen: 'Related', mistral: 'FP' },
        similarityScore: 0.68,
        groundTruthLabel: 0,
        functionalCorrectness: 0,
        completeness: 0
      }
    ]
  },

  // TESTING SET (REQ 9 - REQ 16) - UNSEEN IN TRAINING/CALIBRATION
  {
    id: "REQ9",
    title: "Automotive Fuel Efficiency Rating Partitions",
    technique: "EP",
    level: "Level-1 (Very Low)",
    split: "testing",
    source: "Kaggle",
    businessDomain: "Automotive",
    totalTC: 6,
    description: "Categorize automotive vehicle emission and mileage into classes: Category A (>= 22 km/l), Category B (16 to 21.9 km/l), Category C (10 to 15.9 km/l), and Category D (< 10 km/l). Negative or invalid values must raise error.",
    ragContext: ["KB-02", "KB-08"],
    goldCases: [
      {
        id: "REQ9-TC01",
        condition: "Vehicle with high efficiency rating >= 22 km/l",
        exampleData: "Mileage = 25.4 km/l",
        expectedResult: "Assigned Category A (Eco-Friendly / Low Tax tier).",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ9-TC02",
        condition: "Vehicle with standard efficiency in [16, 21.9]",
        exampleData: "Mileage = 18.2 km/l",
        expectedResult: "Assigned Category B.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ9-TC03",
        condition: "Vehicle with moderate efficiency in [10, 15.9]",
        exampleData: "Mileage = 12.0 km/l",
        expectedResult: "Assigned Category C.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ9-TC04",
        condition: "Vehicle with heavy consumption < 10 km/l",
        exampleData: "Mileage = 7.5 km/l",
        expectedResult: "Assigned Category D (High Emissions tier).",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ9-TC05",
        condition: "Invalid negative numerical input",
        exampleData: "Mileage = -5.0 km/l",
        expectedResult: "Input validation error 'Mileage cannot be negative'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.88,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ9-TC06",
        condition: "Non-numeric input string",
        exampleData: "Mileage = 'Twenty'",
        expectedResult: "Type parse error 'Numerical input required'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.87,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ10",
    title: "Logistics Parcel Freight Weight Tiers",
    technique: "EP",
    level: "Level-1 (Very Low)",
    split: "testing",
    source: "Kaggle",
    businessDomain: "Logistics",
    totalTC: 7,
    description: "Determine parcel delivery dispatch class based on weight: Light (0.1 to 4.9 kg), Standard (5.0 to 30.0 kg), Heavy (30.1 to 70.0 kg), and Overweight (>70 kg requiring special handling permit).",
    ragContext: ["KB-02", "KB-07"],
    goldCases: [
      {
        id: "REQ10-TC01",
        condition: "Parcel in Light weight partition",
        exampleData: "Weight = 2.4 kg",
        expectedResult: "Air Express Courier assigned; base air rate.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.93,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC02",
        condition: "Parcel in Standard ground partition",
        exampleData: "Weight = 15.0 kg",
        expectedResult: "Standard Ground fleet route assigned.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC03",
        condition: "Parcel in Heavy freight surcharge partition",
        exampleData: "Weight = 45.0 kg",
        expectedResult: "Heavy pallet shipping with ₹500 surcharge.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.90,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC04",
        condition: "Parcel in Overweight permit partition",
        exampleData: "Weight = 85.0 kg",
        expectedResult: "Routed to Freight Authorization desk for permit inspection.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'FN', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.84,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC05",
        condition: "Zero parcel weight",
        exampleData: "Weight = 0.0 kg",
        expectedResult: "Rejected: 'Weight must be greater than zero'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC06",
        condition: "Negative weight input",
        exampleData: "Weight = -2.5 kg",
        expectedResult: "Validation exception triggered.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ10-TC07",
        condition: "Invalid parcel unit string",
        exampleData: "Weight = '10lbs' (system expects kg)",
        expectedResult: "Unit validation error.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.82,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ11",
    title: "User Password Complexity Rules (ISTQB Sample)",
    technique: "EP",
    level: "Level-1 (Very Low)",
    split: "testing",
    source: "ISTQB",
    businessDomain: "Generic Business Application",
    totalTC: 3,
    description: "Password must be 8–16 characters long and include at least one uppercase letter, one digit, and one symbol. Valid passwords proceed; passwords missing any category are rejected.",
    ragContext: ["KB-02"],
    goldCases: [
      {
        id: "REQ11-TC01",
        condition: "Valid password meeting all length and character classes",
        exampleData: "Password = 'P@ssword123'",
        expectedResult: "Accepted; password strength rated 'Strong'.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.95,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ11-TC02",
        condition: "Password missing uppercase character",
        exampleData: "Password = 'p@ssword123'",
        expectedResult: "Rejected: 'Must contain at least one uppercase letter'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TPPartial' },
        similarityScore: 0.86,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ11-TC03",
        condition: "Password length less than 8 characters",
        exampleData: "Password = 'P@1a'",
        expectedResult: "Rejected: 'Must be at least 8 characters long'.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'FP' },
        similarityScore: 0.84,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ12",
    title: "E-Commerce Promotional Discount Coupon Range (ISTQB)",
    technique: "BVA",
    level: "Level-1 (Very Low)",
    split: "testing",
    source: "ISTQB",
    businessDomain: "E-Commerce and Retail",
    totalTC: 5,
    description: "Discount coupon percentage accepts integer values from 5% to 50% inclusive. Sub-boundary (4%) and super-boundary (51%) coupons must be refused.",
    ragContext: ["KB-01", "KB-06"],
    goldCases: [
      {
        id: "REQ12-TC01",
        condition: "Discount percentage strictly below minimum (4%)",
        exampleData: "Discount = 4%",
        expectedResult: "Coupon code rejected; minimum permissible discount is 5%.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ12-TC02",
        condition: "Discount percentage exact minimum (5%)",
        exampleData: "Discount = 5%",
        expectedResult: "Coupon accepted; 5% deduction applied to order total.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ12-TC03",
        condition: "Discount nominal valid (25%)",
        exampleData: "Discount = 25%",
        expectedResult: "Coupon accepted; 25% deduction applied.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.95,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ12-TC04",
        condition: "Discount percentage exact maximum (50%)",
        exampleData: "Discount = 50%",
        expectedResult: "Coupon accepted; 50% deduction applied to order total.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.93,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ12-TC05",
        condition: "Discount percentage exceeds maximum limit (51%)",
        exampleData: "Discount = 51%",
        expectedResult: "Coupon rejected; maximum allowable discount is 50%.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'FN', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.81,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ13",
    title: "Student Course Enrollment Prerequisites",
    technique: "Use Case",
    level: "Level-2 (Low)",
    split: "testing",
    source: "Kaggle",
    businessDomain: "Education Management System",
    totalTC: 4,
    description: "A student may enroll in Advanced Database Systems only if they have passed CS101 (Intro to CS) and their account holds no administrative holds. Waitlist triggers if course section is full.",
    ragContext: ["KB-03"],
    goldCases: [
      {
        id: "REQ13-TC01",
        condition: "Student passed prerequisite and zero financial holds; seats available",
        exampleData: "Prereq CS101 = Grade B, Holds = None, Seats = 5",
        expectedResult: "Student enrolled directly; confirmation sent.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ13-TC02",
        condition: "Student lacks CS101 prerequisite completion",
        exampleData: "Prereq CS101 = Not Taken",
        expectedResult: "Enrollment blocked; error 'Prerequisite CS101 required'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ13-TC03",
        condition: "Student account has outstanding tuition hold",
        exampleData: "Prereq = Passed, Holds = 'Tuition Balance Overdue'",
        expectedResult: "Enrollment blocked; error 'Account hold active'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'FP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.85,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ13-TC04",
        condition: "Eligible student enrolling when section capacity is 0",
        exampleData: "Prereq = Passed, Holds = None, Available Seats = 0",
        expectedResult: "Prompted with waitlist option; position #1 assigned upon opt-in.",
        testType: "Edge Case",
        goldStandard: true,
        modelPredictions: { claude: 'TPPartial', gpt4o: 'TPPartial', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.86,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ14",
    title: "Multiplayer Matchmaking Elo Rating & Regional Ping",
    technique: "Use Case",
    level: "Level-2 (Low)",
    split: "testing",
    source: "Kaggle",
    businessDomain: "Gaming and Entertainment Software",
    totalTC: 4,
    description: "Matchmaker pairs two players if difference in skill Elo <= 150 AND round-trip network latency between client and server <= 60ms. If queue time exceeds 90s, Elo tolerance expands to 300.",
    ragContext: ["KB-03"],
    goldCases: [
      {
        id: "REQ14-TC01",
        condition: "Players within tight Elo delta (<=150) and low latency (<=60ms)",
        exampleData: "Player A Elo 1400, Player B Elo 1480, Ping = 35ms",
        expectedResult: "Instant competitive lobby match confirmed.",
        testType: "Positive",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ14-TC02",
        condition: "High network latency (>60ms) prevents match pairing",
        exampleData: "Elo delta = 40, Ping = 120ms",
        expectedResult: "Pairing rejected for ranked mode; routing to regional relay.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'FP', gemini: 'TPPartial', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.83,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ14-TC03",
        condition: "Queue duration > 90 seconds expands tolerance window",
        exampleData: "Queue time = 105s, Elo delta = 240 (<=300), Ping = 40ms",
        expectedResult: "Expanded matchmaking rule triggers; match formed.",
        testType: "Edge Case",
        goldStandard: true,
        modelPredictions: { claude: 'TPPartial', gpt4o: 'FP', gemini: 'TPPartial', qwen: 'TPPartial', mistral: 'TP' },
        similarityScore: 0.77,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 0
      },
      {
        id: "REQ14-TC04",
        condition: "Elo delta exceeds even relaxed queue threshold (>300)",
        exampleData: "Queue time = 120s, Elo delta = 550, Ping = 25ms",
        expectedResult: "Players not matched; search continues.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.85,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ15",
    title: "Industrial Robotic Arm Emergency Brake State Machine",
    technique: "State Transition",
    level: "Level-3 (Moderate)",
    split: "testing",
    source: "Real Project",
    businessDomain: "Industrial Workflow System",
    totalTC: 7,
    description: "The robotic controller operates in States: IDLE, RUNNING, PAUSED, E-STOPPED, MAINTENANCE. E-stop sensor trigger halts motion in <50ms and locks system into E-STOPPED until physical safety key reset.",
    ragContext: ["KB-04"],
    goldCases: [
      {
        id: "REQ15-TC01",
        condition: "State IDLE receives START command with safety interlock closed",
        exampleData: "Current state = IDLE, Command = START, Interlock = Closed",
        expectedResult: "Transitions to RUNNING; servos energized.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC02",
        condition: "State RUNNING receives emergency stop signal",
        exampleData: "Current state = RUNNING, Event = E_STOP_PRESSED",
        expectedResult: "Transitions to E-STOPPED; motor brakes applied in <50ms.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.94,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC03",
        condition: "State E-STOPPED receives START command without safety key reset",
        exampleData: "Current state = E-STOPPED, Event = START, Key = Not Reset",
        expectedResult: "Command ignored; remains E-STOPPED; alarm buzzer sounds.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TPPartial', qwen: 'TPPartial', mistral: 'TPPartial' },
        similarityScore: 0.81,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC04",
        condition: "State E-STOPPED receives physical safety key turn",
        exampleData: "Current state = E-STOPPED, Event = KEY_TURNED",
        expectedResult: "Transitions to IDLE state; alarms clear.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.88,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC05",
        condition: "State RUNNING receives PAUSE event",
        exampleData: "Current state = RUNNING, Event = PAUSE",
        expectedResult: "Transitions to PAUSED; tool head decelerates gently.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.90,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC06",
        condition: "State PAUSED receives RESUME event",
        exampleData: "Current state = PAUSED, Event = RESUME",
        expectedResult: "Transitions to RUNNING; resumes path trajectory.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ15-TC07",
        condition: "State IDLE receives MAINTENANCE diagnostic mode switch",
        exampleData: "Current state = IDLE, Event = ENTER_MAINTENANCE",
        expectedResult: "Transitions to MAINTENANCE; telemetry logs opened.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TPPartial', gpt4o: 'TP', gemini: 'TPPartial', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.82,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  },
  {
    id: "REQ16",
    title: "Order Fulfillment Return Lifecycle (E-Commerce & Retail)",
    technique: "State Transition",
    level: "Level-3 (Moderate)",
    split: "testing",
    source: "Real Project",
    businessDomain: "E-Commerce and Retail",
    totalTC: 10,
    description: "Item return lifecycle transitions: DELIVERED -> RETURN_REQUESTED -> RETURN_APPROVED (or REJECTED) -> PICKUP_SCHEDULED -> IN_TRANSIT -> WAREHOUSE_INSPECTED -> REFUND_ISSUED (or RETURN_VOIDED). 30-day window limits request eligibility.",
    ragContext: ["KB-04", "KB-06"],
    goldCases: [
      {
        id: "REQ16-TC01",
        condition: "Return requested within 30 days of delivery",
        exampleData: "Days since delivery = 14",
        expectedResult: "State transitions to RETURN_REQUESTED; return label generated.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.93,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC02",
        condition: "Return requested on exact 30th day boundary",
        exampleData: "Days since delivery = 30",
        expectedResult: "State transitions to RETURN_REQUESTED.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.90,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC03",
        condition: "Return requested on day 31 (exceeded policy limit)",
        exampleData: "Days since delivery = 31",
        expectedResult: "Request rejected with '30-day return window expired'.",
        testType: "Boundary",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.92,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC04",
        condition: "Support agent approves valid request",
        exampleData: "Current state = RETURN_REQUESTED, Event = AGENT_APPROVE",
        expectedResult: "Transitions to RETURN_APPROVED.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.89,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC05",
        condition: "Courier pickup booked",
        exampleData: "Current state = RETURN_APPROVED, Event = SCHEDULE_PICKUP",
        expectedResult: "Transitions to PICKUP_SCHEDULED.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.87,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC06",
        condition: "Courier scans parcel at pickup",
        exampleData: "Current state = PICKUP_SCHEDULED, Event = SCAN_PICKED_UP",
        expectedResult: "Transitions to IN_TRANSIT.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.88,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC07",
        condition: "Warehouse receives parcel and runs QA inspection (Passed)",
        exampleData: "Current state = IN_TRANSIT, Event = QA_PASS",
        expectedResult: "Transitions to WAREHOUSE_INSPECTED.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.86,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC08",
        condition: "QA inspection failed due to customer damage",
        exampleData: "Current state = IN_TRANSIT, Event = QA_FAIL_DAMAGED",
        expectedResult: "Transitions to RETURN_VOIDED; item returned to customer without refund.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TPPartial', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.84,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC09",
        condition: "Payment gateway processes refund",
        exampleData: "Current state = WAREHOUSE_INSPECTED, Event = REFUND_SUBMITTED",
        expectedResult: "Transitions to REFUND_ISSUED; credit applied to source account.",
        testType: "State Transition",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'TP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.91,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      },
      {
        id: "REQ16-TC10",
        condition: "Customer attempts second return request on already refunded order",
        exampleData: "Current state = REFUND_ISSUED, Event = REQUEST_RETURN",
        expectedResult: "Rejected: 'Order return already finalized'.",
        testType: "Negative",
        goldStandard: true,
        modelPredictions: { claude: 'TP', gpt4o: 'TP', gemini: 'FP', qwen: 'TP', mistral: 'TP' },
        similarityScore: 0.79,
        groundTruthLabel: 1,
        functionalCorrectness: 1,
        completeness: 1
      }
    ]
  }
];
