export type CreativeActivityAnalysisData = {
  autonomousActivity: {
    summary?: string;
    analysis?: string;
    evaluation?: string;
  };
  clubActivity: {
    summary?: string;
    analysis?: string;
    evaluation?: string;
  };
  careerActivity: {
    summary?: string;
    analysis?: string;
    evaluation?: string;
  };
  volunteerActivity: {
    summary?: string;
    analysis?: string;
    evaluation?: string;
  };
  comprehensiveConclusion: {
    conclusion?: string;
  };
  crossValidation: {
    evaluation?: string;
  };
};

export type CreativeActivityTemplateData = {
  creative_activity: {
    autonomous_activity: {
      summary: string;
      analysis: string;
      evaluation: string;
    };
    club_activity: {
      summary: string;
      analysis: string;
      evaluation: string;
    };
    career_activity: {
      summary: string;
      analysis: string;
      evaluation: string;
    };
    volunteer_activity: {
      summary: string;
      analysis: string;
      evaluation: string;
    };
    comprehensive_conclusion: {
      conclusion: string;
    };
  };
  cross_validation: {
    evaluation: string;
  };
  generatedAt: string;
};
