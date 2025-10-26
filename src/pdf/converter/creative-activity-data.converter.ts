import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import {
  CreativeActivityAnalysisData,
  CreativeActivityTemplateData,
} from './types';

@Injectable()
export class CreativeActivityDataConverter
  implements
    DataConverter<CreativeActivityAnalysisData, CreativeActivityTemplateData>
{
  convert(data: CreativeActivityAnalysisData): CreativeActivityTemplateData {
    return {
      creative_activity: {
        autonomous_activity: {
          summary: data.autonomousActivity?.summary || '',
          analysis: data.autonomousActivity?.analysis || '',
          evaluation: data.autonomousActivity?.evaluation || '',
        },
        club_activity: {
          summary: data.clubActivity?.summary || '',
          analysis: data.clubActivity?.analysis || '',
          evaluation: data.clubActivity?.evaluation || '',
        },
        career_activity: {
          summary: data.careerActivity?.summary || '',
          analysis: data.careerActivity?.analysis || '',
          evaluation: data.careerActivity?.evaluation || '',
        },
        volunteer_activity: {
          summary: data.volunteerActivity?.summary || '',
          analysis: data.volunteerActivity?.analysis || '',
          evaluation: data.volunteerActivity?.evaluation || '',
        },
        comprehensive_conclusion: {
          conclusion: data.comprehensiveConclusion?.conclusion || '',
        },
      },
      cross_validation: {
        evaluation: data.crossValidation?.evaluation || '',
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
