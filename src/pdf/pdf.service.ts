import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import * as path from 'path';
import puppeteer, { PaperFormat } from 'puppeteer';
import * as fs from 'fs';
import { DataConverterFactory } from './converter/data-converter.factory';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly dataConverterFactory: DataConverterFactory,
  ) {}

  async generate({
    analysisType,
    templateName,
    analysisData,
    options,
  }: {
    analysisType: string;
    templateName: string;
    analysisData: unknown;
    options: unknown;
  }) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    });

    try {
      const page = await browser.newPage();

      // analysisData가 문자열이면 JSON으로 파싱
      let parsedAnalysisData = analysisData;

      if (!analysisData) {
        this.logger.warn(
          'analysisData is null or undefined, using empty object',
        );
        parsedAnalysisData = {};
      }

      if (typeof analysisData === 'string') {
        try {
          parsedAnalysisData = JSON.parse(analysisData);
        } catch (error) {
          // JSON 파싱 실패 시 그대로 사용
          this.logger.warn(
            `Failed to parse analysisData as JSON, using as-is: ${error}`,
          );
          parsedAnalysisData = analysisData;
        }
      }

      //데이터 변환기 팩토리를 사용하여 데이터 반환
      const templateData = this.dataConverterFactory.convert({
        analysisData: parsedAnalysisData,
        analysisType,
      });

      const html = this.renderTemplate({
        templateName,
        data: templateData,
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 마인드맵 렌더링을 위한 추가 대기 (Canvas/JavaScript 실행)
      if (templateName === 'mindMap' || templateName === 'mindmap-analysis') {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      const pdfOptions = {
        format: (options as { format: PaperFormat })?.format || 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: true,
        headerTemplate: `'<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
        학생부 분석 보고서
      </div>'`,
        footerTemplate: `
      <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      this.logger.log(`${analysisType} PDF 생성 완료`);
      return pdfBuffer;
    } catch (e) {
      this.logger.error('Error generating PDF:', e);
      throw e;
    } finally {
      await browser.close();
    }
  }

  private renderTemplate({
    templateName,
    data,
  }: {
    templateName: string;
    data: unknown;
  }): string {
    try {
      // 상대 경로로 템플릿 파일 경로 설정
      const templatePath = path.resolve(
        process.cwd(),
        'src',
        'templates',
        `${templateName}.hbs`,
      );

      // 파일 존재 여부 확인
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`);
      }

      const templateSource = fs.readFileSync(templatePath, 'utf8');

      // JSON helper 등록
      Handlebars.registerHelper('toJSON', function (context) {
        return JSON.stringify(context);
      });

      // eq helper 등록 (같은지 비교)
      Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
      });

      const template = Handlebars.compile(templateSource);

      return template(data);
    } catch (error) {
      this.logger.error(
        `Template rendering error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}
