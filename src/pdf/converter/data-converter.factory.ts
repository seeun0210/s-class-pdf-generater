import { Injectable } from '@nestjs/common';
import { DataConverter } from './data-converter.interface';
import { CreativeActivityDataConverter } from './creative-activity-data.converter';
import { DetailedAbilitiesDataConverter } from './detailed-abilities.data.converter';
import { MindMapDataConverter } from './mindmap-data.converter';
import { OverallAnalysisDataConverter } from './overall-analysis-data.converter';

@Injectable()
export class DataConverterFactory {
  private readonly converterRecord: Record<string, DataConverter>;

  constructor(
    private readonly creativeActivityDataConverter: CreativeActivityDataConverter,
    private readonly detailedAbilitiesDataConverter: DetailedAbilitiesDataConverter,
    private readonly mindMapDataConverter: MindMapDataConverter,
    private readonly overallAnalysisDataConverter: OverallAnalysisDataConverter,
  ) {
    // snake_case와 camelCase 둘 다 지원
    this.converterRecord = {
      overall: this.overallAnalysisDataConverter,
      creativeActivity: this.creativeActivityDataConverter,
      detailedAbilities: this.detailedAbilitiesDataConverter,
      mindMap: this.mindMapDataConverter,
    };
  }

  getConverter({ analysisType }: { analysisType: string }): DataConverter {
    // camelCase를 snake_case로 변환
    const normalizedType = analysisType
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase();

    // 먼저 원본 키로 확인
    let converter = this.converterRecord[analysisType];

    // 없으면 snake_case 변환된 키로 확인
    if (!converter) {
      converter = this.converterRecord[normalizedType];
    }

    // 그래도 없으면 에러
    if (!converter) {
      throw new Error(`Converter for ${analysisType} not found`);
    }

    return converter;
  }

  convert<TInput, TOutput>({
    analysisType,
    analysisData,
  }: {
    analysisType: string;
    analysisData: TInput;
  }): TOutput {
    const converter = this.getConverter({ analysisType });
    return converter.convert(analysisData) as TOutput;
  }
}
