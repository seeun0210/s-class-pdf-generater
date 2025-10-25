import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import {
  CreativeActivityAnalysisData,
  CreativeActivityTemplateData,
} from './type';

@Injectable()
export class CreativeActivityDataConverter
  implements
    DataConverter<CreativeActivityAnalysisData, CreativeActivityTemplateData>
{
  convert(data: CreativeActivityAnalysisData): CreativeActivityTemplateData {
    return {
      creative_activity: {
        autonomous_activity: {
          summary: data.creativeActivity?.autonomousActivity?.summary || '',
          analysis: data.creativeActivity?.autonomousActivity?.analysis || '',
          evaluation:
            data.creativeActivity?.autonomousActivity?.evaluation || '',
        },
        club_activity: {
          summary: data.creativeActivity?.clubActivity?.summary || '',
          analysis: data.creativeActivity?.clubActivity?.analysis || '',
          evaluation: data.creativeActivity?.clubActivity?.evaluation || '',
        },
        career_activity: {
          summary: data.creativeActivity?.careerActivity?.summary || '',
          analysis: data.creativeActivity?.careerActivity?.analysis || '',
          evaluation: data.creativeActivity?.careerActivity?.evaluation || '',
        },
        volunteer_activity: {
          summary: data.creativeActivity?.volunteerActivity?.summary || '',
          analysis: data.creativeActivity?.volunteerActivity?.analysis || '',
          evaluation:
            data.creativeActivity?.volunteerActivity?.evaluation || '',
        },
        comprehensive_conclusion: {
          conclusion:
            data.creativeActivity?.comprehensiveConclusion?.conclusion || '',
        },
      },
      cross_validation: {
        evaluation: data.creativeActivity?.crossValidation?.evaluation || '',
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
