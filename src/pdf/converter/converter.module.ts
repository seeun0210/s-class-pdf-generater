import { Module } from '@nestjs/common';
import { DataConverterFactory } from './data-converter.factory';
import { CreativeActivityDataConverter } from './creative-activity-data.converter';
import { DetailedAbilitiesDataConverter } from './detailed-abilities.data.converter';
import { MindMapDataConverter } from './mindmap-data.converter';
import { OverallAnalysisDataConverter } from './overall-analysis-data.converter';

@Module({
  providers: [
    DataConverterFactory,
    CreativeActivityDataConverter,
    DetailedAbilitiesDataConverter,
    MindMapDataConverter,
    OverallAnalysisDataConverter,
  ],
  exports: [DataConverterFactory],
})
export class ConverterModule {}
