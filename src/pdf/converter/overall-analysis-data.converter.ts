import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import { OverallAnalysisData, OverallTemplateData } from './types';

@Injectable()
export class OverallAnalysisDataConverter
  implements DataConverter<OverallAnalysisData, OverallTemplateData>
{
  convert(data: OverallAnalysisData): OverallTemplateData {
    return {
      non_curriculum_evaluation: {
        evaluation: data.nonCurriculumEvaluation?.evaluation || '',
      },
      career_competency_evaluation: {
        evaluation: data.careerCompetencyEvaluation?.evaluation || '',
      },
      community_competency_evaluation: {
        evaluation: data.communityCompetencyEvaluation?.evaluation || '',
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
