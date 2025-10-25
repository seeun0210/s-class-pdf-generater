import { Module } from '@nestjs/common';
import { DataConverterFactory } from './data-converter.factory';
import { CreativeActivityDataConverter } from './creative-activity-data.converter';

@Module({
  providers: [DataConverterFactory, CreativeActivityDataConverter],
  exports: [DataConverterFactory],
})
export class ConverterModule {}
