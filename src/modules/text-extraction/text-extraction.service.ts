import {
  Injectable,
  UnsupportedMediaTypeException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as pdf from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as sysMsg from '../../constants/system.messages';

/**
 * Service for extracting text from various document formats
 * Supports PDF and DOCX files from buffer data
 */
@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);

  /**
   * Extracts text from a file buffer based on its mimetype
   */
  async extractTextFromBuffer(
    fileBuffer: Buffer,
    mimetype: string,
    filename: string,
  ): Promise<string> {
    if (mimetype === 'application/pdf') {
      return this.extractTextFromPdf(fileBuffer, filename);
    } else if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.extractTextFromDocx(fileBuffer, filename);
    } else {
      throw new UnsupportedMediaTypeException(sysMsg.UNSUPPORTED_FILE_TYPE);
    }
  }

  /**
   * Extracts text from a PDF buffer
   */
  private async extractTextFromPdf(dataBuffer: Buffer, filename: string): Promise<string> {
    try {
      const data = await pdf(dataBuffer);
      this.logger.log(`${sysMsg.TEXT_EXTRACTION_SUCCESS} (PDF): ${filename}`);
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
   * Extracts text from a DOCX buffer
   */
  private async extractTextFromDocx(dataBuffer: Buffer, filename: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      this.logger.log(`${sysMsg.TEXT_EXTRACTION_SUCCESS} (DOCX): ${filename}`);
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