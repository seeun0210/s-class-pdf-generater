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
      evaluations:
        data.evaluations?.map((evalData) => ({
          subject: evalData.subject || '',
          status: evalData.status || '',
          evidence: evalData.evidence || '',
          assessment: evalData.assessment || '',
        })) || [],
      generatedAt: new Date().toLocaleString('ko-KR'),
    };
  }
}
