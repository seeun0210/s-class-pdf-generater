export type DetailedAbilitiesAnalysisData = {
  evaluations?: Array<{
    subject?: string;
    status?: string;
    evidence?: string;
    assessment?: string;
  }>;
};

export type DetailedAbilitiesTemplateData = {
  evaluations: Array<{
    subject: string;
    status: string;
    evidence: string;
    assessment: string;
  }>;
  generatedAt: string;
};
