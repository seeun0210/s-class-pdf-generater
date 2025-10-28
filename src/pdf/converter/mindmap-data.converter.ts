import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import { MindMapAnalysisData, MindMapTemplateData } from './types';

@Injectable()
export class MindMapDataConverter
  implements DataConverter<MindMapAnalysisData, MindMapTemplateData>
{
  convert(data: MindMapAnalysisData): MindMapTemplateData {
    return {
      career_path: data.careerPath || '',
      all_activities:
        data.allActivities?.map((activity) => ({
          id: activity.id || 0,
          name: activity.name || '',
          group: activity.group || '',
          grade: activity.grade || '',
          description: activity.description || '',
        })) || [],
      core_activity_ids: data.coreActivityIds || [],
      links:
        data.links?.map((link) => ({
          source: link.source || 0,
          target: link.target || 0,
        })) || [],
      summary: {
        title: data.summary?.title || '',
        introduction: data.summary?.introduction || '',
        keywords: data.summary?.keywords || '',
        strengths: data.summary?.strengths || '',
        conclusion: data.summary?.conclusion || '',
      },
      in_depth_analysis: {
        connectivity: {
          introduction: data.inDepthAnalysis?.connectivity?.introduction || '',
          horizontal: data.inDepthAnalysis?.connectivity?.horizontal || '',
          vertical: data.inDepthAnalysis?.connectivity?.vertical || '',
        },
        deepening: {
          introduction: data.inDepthAnalysis?.deepening?.introduction || '',
          deepening: data.inDepthAnalysis?.deepening?.deepening || '',
          expansion: data.inDepthAnalysis?.deepening?.expansion || '',
        },
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
