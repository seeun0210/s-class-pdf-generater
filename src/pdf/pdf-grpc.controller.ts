// src/pdf/pdf-grpc.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { PdfService } from './pdf.service';
import {
  PdfGenerationRequest,
  PdfGenerationResponse,
  PdfGenerationServiceControllerMethods,
} from 'src/pdf-generation';

@Controller()
@PdfGenerationServiceControllerMethods()
export class PdfGrpcController {
  private readonly logger = new Logger(PdfGrpcController.name);

  constructor(private readonly pdfService: PdfService) {}

  async generatePdf(
    request: PdfGenerationRequest,
  ): Promise<PdfGenerationResponse> {
    try {
      // gRPC 필드명 변환 (snake_case -> camelCase or vice versa)
      const analysisType = request.analysisType;
      const templateName = request.templateName;
      const analysisData = request.analysisData;

      const pdfBuffer = await this.pdfService.generate({
        analysisType,
        templateName,
        analysisData,
        options: request.options,
      });

      return {
        success: true,
        message: 'PDF generated successfully',
        pdfData: pdfBuffer,
        fileName: `${request.analysisType}_analysis.pdf`,
      };
    } catch (error) {
      this.logger.error(
        `gRPC PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        message: `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pdfData: Buffer.alloc(0),
        fileName: '',
      };
    }
  }
}
