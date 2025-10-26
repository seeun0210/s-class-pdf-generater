export type OverallAnalysisData = {
  studentProfile: {
    personalityType?: string;
    learningStyle?: string;
    motivationType?: string;
    careerOrientation?: string;
  };
  coreCompetencies: Array<{
    competencyName?: string;
    level?: number;
    description?: string;
    evidence?: string[];
  }>;
  growthAreas: Array<{
    areaName?: string;
    currentLevel?: number;
    targetLevel?: number;
    description?: string;
    actionItems?: string[];
  }>;
  recommendations: Array<{
    category?: string;
    title?: string;
    description?: string;
    priority?: number;
    actionSteps?: string[];
  }>;
  comprehensiveConclusion: {
    overallAssessment?: string;
    keyStrengths?: string[];
    developmentAreas?: string[];
    futureDirection?: string;
  };
};

export type OverallTemplateData = {
  student_profile: {
    personality_type: string;
    learning_style: string;
    motivation_type: string;
    career_orientation: string;
  };
  core_competencies: Array<{
    competency_name: string;
    level: number;
    description: string;
    evidence: string[];
  }>;
  growth_areas: Array<{
    area_name: string;
    current_level: number;
    target_level: number;
    description: string;
    action_items: string[];
  }>;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: number;
    action_steps: string[];
  }>;
  comprehensive_conclusion: {
    overall_assessment: string;
    key_strengths: string[];
    development_areas: string[];
    future_direction: string;
  };
  generatedAt: string;
};
