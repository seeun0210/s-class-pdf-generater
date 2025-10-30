export type MindMapAnalysisData = {
  careerPath?: string;
  allActivities?: Array<{
    id?: number;
    name?: string;
    group?: string;
    grade?: string;
    description?: string;
  }>;
  coreActivityIds?: number[];
  links?: Array<{
    source?: number;
    target?: number;
  }>;
  summary?: {
    title?: string;
    introduction?: string;
    keywords?: string;
    strengths?: string;
    conclusion?: string;
  };
  inDepthAnalysis?: {
    connectivity?: {
      introduction?: string;
      horizontal?: string;
      vertical?: string;
    };
    deepening?: {
      introduction?: string;
      deepening?: string;
      expansion?: string;
    };
  };
};

export type MindMapTemplateData = {
  career_path: string;
  all_activities: Array<{
    id: number;
    name: string;
    group: string;
    grade: string;
    description: string;
  }>;
  core_activity_ids: number[];
  links: Array<{
    source: number;
    target: number;
  }>;
  summary: {
    title: string;
    introduction: string;
    keywords: string;
    strengths: string;
    conclusion: string;
  };
  in_depth_analysis: {
    connectivity: {
      introduction: string;
      horizontal: string;
      vertical: string;
    };
    deepening: {
      introduction: string;
      deepening: string;
      expansion: string;
    };
  };
  generatedAt: string;
};
