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
    this.converterRecord = {
      creative_activity: this.creativeActivityDataConverter,
      detailed_abilities: this.detailedAbilitiesDataConverter,
      mindmap: this.mindMapDataConverter,
      overall_analysis: this.overallAnalysisDataConverter,
    };
  }

  getConverter({ analysisType }: { analysisType: string }): DataConverter {
    const converter = this.converterRecord[analysisType];
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
