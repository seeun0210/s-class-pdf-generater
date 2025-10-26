export type MindMapAnalysisData = {
  centralTheme: {
    theme?: string;
    description?: string;
    color?: string;
  };
  mainBranches: Array<{
    id?: string;
    name?: string;
    description?: string;
    color?: string;
    priority?: number;
  }>;
  subBranches: Array<{
    id?: string;
    parentId?: string;
    name?: string;
    description?: string;
    color?: string;
  }>;
  connections: Array<{
    fromId?: string;
    toId?: string;
    relationship?: string;
    strength?: number;
  }>;
  comprehensiveConclusion: {
    conclusion?: string;
    insights?: string[];
    patterns?: string[];
  };
};

export type MindMapTemplateData = {
  central_theme: {
    theme: string;
    description: string;
    color: string;
  };
  main_branches: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    priority: number;
  }>;
  sub_branches: Array<{
    id: string;
    parent_id: string;
    name: string;
    description: string;
    color: string;
  }>;
  connections: Array<{
    from_id: string;
    to_id: string;
    relationship: string;
    strength: number;
  }>;
  comprehensive_conclusion: {
    conclusion: string;
    insights: string[];
    patterns: string[];
  };
  generatedAt: string;
};
