import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import {
  DetailedAbilitiesAnalysisData,
  DetailedAbilitiesTemplateData,
} from './types';

@Injectable()
export class DetailedAbilitiesDataConverter
  implements
    DataConverter<DetailedAbilitiesAnalysisData, DetailedAbilitiesTemplateData>
{
  convert(data: DetailedAbilitiesAnalysisData): DetailedAbilitiesTemplateData {
    return {
      subject_analyses:
        data.subjectAnalyses?.map((subject) => ({
          subject_name: subject.subjectName || '',
          summary: subject.summary || '',
          analysis: subject.analysis || '',
          evaluation: subject.evaluation || '',
          key_points: subject.keyPoints || [],
        })) || [],
      comprehensive_conclusion: {
        conclusion: data.comprehensiveConclusion?.conclusion || '',
        strengths: data.comprehensiveConclusion?.strengths || [],
        weaknesses: data.comprehensiveConclusion?.weaknesses || [],
        recommendations: data.comprehensiveConclusion?.recommendations || [],
      },
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
