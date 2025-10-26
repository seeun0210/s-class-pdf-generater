import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import { MindMapAnalysisData, MindMapTemplateData } from './types';

@Injectable()
export class MindMapDataConverter
  implements DataConverter<MindMapAnalysisData, MindMapTemplateData>
{
  convert(data: MindMapAnalysisData): MindMapTemplateData {
    return {
      central_theme: {
        theme: data.centralTheme?.theme || '',
        description: data.centralTheme?.description || '',
        color: data.centralTheme?.color || '',
      },
      main_branches:
        data.mainBranches?.map((branch) => ({
          id: branch.id || '',
          name: branch.name || '',
          description: branch.description || '',
          color: branch.color || '',
          priority: branch.priority || 0,
        })) || [],
      sub_branches:
        data.subBranches?.map((branch) => ({
          id: branch.id || '',
          parent_id: branch.parentId || '',
          name: branch.name || '',
          description: branch.description || '',
          color: branch.color || '',
        })) || [],
      connections:
        data.connections?.map((connection) => ({
          from_id: connection.fromId || '',
          to_id: connection.toId || '',
          relationship: connection.relationship || '',
          strength: connection.strength || 0,
        })) || [],
      comprehensive_conclusion: {
        conclusion: data.comprehensiveConclusion?.conclusion || '',
        insights: data.comprehensiveConclusion?.insights || [],
        patterns: data.comprehensiveConclusion?.patterns || [],
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
