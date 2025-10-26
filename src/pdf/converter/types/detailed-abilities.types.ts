export type DetailedAbilitiesAnalysisData = {
  subjectAnalyses: Array<{
    subjectName?: string;
    summary?: string;
    analysis?: string;
    evaluation?: string;
    keyPoints?: string[];
  }>;
  comprehensiveConclusion: {
    conclusion?: string;
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
};

export type DetailedAbilitiesTemplateData = {
  subject_analyses: Array<{
    subject_name: string;
    summary: string;
    analysis: string;
    evaluation: string;
    key_points: string[];
  }>;
  comprehensive_conclusion: {
    conclusion: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  generatedAt: string;
};
