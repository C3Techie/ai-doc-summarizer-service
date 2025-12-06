import {
  Injectable,
  UnsupportedMediaTypeException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as fs from 'fs';
import * as sysMsg from '../../constants/system.messages';

/**
 * Service for extracting text from various document formats
 * Supports PDF and DOCX files
 */
@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  /**
   * Extracts text from a file based on its mimetype
   */
  async extractTextFromFile(
    filePath: string,
    mimetype: string,
  ): Promise<string> {
    if (mimetype === 'application/pdf') {
      return this.extractTextFromPdf(filePath);
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.extractTextFromDocx(filePath);
    } else {
      throw new UnsupportedMediaTypeException(sysMsg.UNSUPPORTED_FILE_TYPE);
    }
  }

  /**
   * Extracts text from a PDF file
   */
  private async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      this.logger.log(`${sysMsg.TEXT_EXTRACTION_SUCCESS} (PDF): ${filePath}`);
      return data.text;
    } catch (error) {
      this.logger.error(
        `${sysMsg.TEXT_EXTRACTION_PDF_FAILED}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        sysMsg.TEXT_EXTRACTION_PDF_FAILED,
      );
    }
  }

  /**
   * Extracts text from a DOCX file
   */
  private async extractTextFromDocx(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      this.logger.log(`${sysMsg.TEXT_EXTRACTION_SUCCESS} (DOCX): ${filePath}`);
      return result.value;
    } catch (error) {
      this.logger.error(
        `${sysMsg.TEXT_EXTRACTION_DOCX_FAILED}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        sysMsg.TEXT_EXTRACTION_DOCX_FAILED,
      );
    }
  }
}