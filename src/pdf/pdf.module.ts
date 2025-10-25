import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfGrpcController } from './pdf-grpc.controller';
import { ConverterModule } from './converter/converter.module';

@Module({
  imports: [ConverterModule],
  controllers: [PdfGrpcController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
