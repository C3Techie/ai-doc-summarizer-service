import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import * as sysMsg from '../../constants/system.messages';
import type { DocumentFilterOptions } from '../../common/types';
import { ApiResponse, PaginatedResponse } from '../../common/interfaces';
import { DocumentModelAction } from './model-actions';
import { DocumentResponseDto, PaginatedDocumentsResponseDto, ListDocumentsQueryDto } from './dtos';
import { AnalysisStatus, DocumentType, DocumentDocument } from './document.schema';
import { OpenrouterService } from '../openrouter/openrouter.service';
import { TextExtractionService } from '../text-extraction/text-extraction.service';
import { FileStorageService } from '../file-storage/file-storage.service';

/**
 * Main service for document operations
 * Orchestrates file upload, text extraction, storage, and AI analysis
 */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly MAX_TEXT_LENGTH = 200000;

  constructor(
    private readonly documentModelAction: DocumentModelAction,
    private readonly openrouterService: OpenrouterService,
    private readonly textExtractionService: TextExtractionService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  /**
   * Uploads a document, extracts text, and stores it in the database
   */
  async uploadDocument(
    file: Express.Multer.File,
  ): Promise<ApiResponse<DocumentResponseDto>> {
    // Save file to MinIO storage
    let objectKey: string;
    try {
      objectKey = await this.fileStorageService.saveFile(file);
    } catch (error) {
      this.logger.error(
        `${sysMsg.FILE_SAVE_FAILED} for ${file.originalname}: ${error.message}`,
      );
      throw new InternalServerErrorException(sysMsg.DOCUMENT_UPLOAD_FAILED);
    }

    // Extract text from file buffer
    let extractedText: string;
    try {
      extractedText = await this.textExtractionService.extractTextFromBuffer(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
    } catch (textExtractionError) {
      await this.fileStorageService.deleteFile(objectKey);
      this.logger.error(
        `${sysMsg.TEXT_EXTRACTION_FAILED} for ${file.originalname}: ${textExtractionError.message}`,
      );
      throw new InternalServerErrorException(
        sysMsg.DOCUMENT_UPLOAD_FAILED_TEXT_EXTRACTION,
      );
    }

    // Truncate text if necessary
    if (extractedText.length > this.MAX_TEXT_LENGTH) {
      extractedText = extractedText.substring(0, this.MAX_TEXT_LENGTH);
      this.logger.warn(`${sysMsg.TEXT_TRUNCATED} for ${file.originalname}`);
    }

    // Save document to database using model action
    try {
      const createdDocument = await this.documentModelAction.create({
        createPayload: {
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          storagePath: objectKey,
          extractedText: extractedText,
          analysisStatus: AnalysisStatus.PENDING,
        },
      });

      this.logger.log(`${sysMsg.DOCUMENT_UPLOADED}: ${file.originalname}`);
      return {
        message: sysMsg.DOCUMENT_UPLOADED,
        data: new DocumentResponseDto((createdDocument as DocumentDocument).toObject()),
      };
    } catch (dbError) {
      await this.fileStorageService.deleteFile(objectKey);
      this.logger.error(
        `${sysMsg.DOCUMENT_UPLOAD_FAILED_DATABASE_SAVE} for ${file.originalname}: ${dbError.message}`,
      );
      throw new InternalServerErrorException(
        sysMsg.DOCUMENT_UPLOAD_FAILED_DATABASE_SAVE,
      );
    }
  }

  /**
   * Retrieves a document by ID
   */
  async getDocument(id: string): Promise<ApiResponse<DocumentResponseDto>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(sysMsg.DOCUMENT_INVALID_ID);
    }

    const document = await this.documentModelAction.get({
      identifierOptions: { _id: id, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException(sysMsg.DOCUMENT_NOT_FOUND);
    }

    this.logger.log(`${sysMsg.DOCUMENT_FETCHED}: ${id}`);
    return {
      message: sysMsg.DOCUMENT_FETCHED,
      data: new DocumentResponseDto(document),
    };
  }

  /**
   * Lists documents with optional filtering and pagination
   */
  async listDocuments(
    query: ListDocumentsQueryDto,
  ): Promise<PaginatedResponse<DocumentResponseDto>> {
    const { page = 1, limit = 20, analysisStatus, documentType } = query;

    const filterOptions: DocumentFilterOptions = { isDeleted: false };
    if (analysisStatus) {
      filterOptions.analysisStatus = analysisStatus;
    }
    if (documentType) {
      filterOptions.documentType = documentType;
    }

    const { payload, paginationMeta } = await this.documentModelAction.list({
      filterRecordOptions: filterOptions,
      sort: { createdAt: -1 },
      paginationPayload: { page, limit },
    });

    return {
      message: sysMsg.DOCUMENTS_FETCHED,
      data: payload.map((doc) => new DocumentResponseDto(doc)),
      pagination: paginationMeta,
    };
  }

  /**
   * Analyzes a document using OpenRouter LLM
   */
  async analyzeDocument(
    id: string,
    forceReAnalysis = false,
  ): Promise<ApiResponse<DocumentResponseDto>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(sysMsg.DOCUMENT_INVALID_ID);
    }

    const document = await this.documentModelAction.get({
      identifierOptions: { _id: id, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException(sysMsg.DOCUMENT_NOT_FOUND);
    }

    // Check if already completed
    if (
      document.analysisStatus === AnalysisStatus.COMPLETED &&
      !forceReAnalysis
    ) {
      this.logger.log(`${sysMsg.ANALYSIS_ALREADY_COMPLETED}: ${id}`);
      return {
        message: sysMsg.ANALYSIS_ALREADY_COMPLETED,
        data: new DocumentResponseDto(document),
      };
    }

    // Update status to ANALYZING
    await this.documentModelAction.update({
      identifierOptions: { _id: id },
      updatePayload: { analysisStatus: AnalysisStatus.ANALYZING },
    });

    // Perform LLM analysis
    let analysisResult;
    try {
      analysisResult = await this.openrouterService.analyzeDocument(
        document.extractedText,
      );
    } catch (llmError) {
      await this.documentModelAction.update({
        identifierOptions: { _id: id },
        updatePayload: { analysisStatus: AnalysisStatus.FAILED },
      });
      this.logger.error(`${sysMsg.ANALYSIS_FAILED} for ${id}: ${llmError.message}`);
      throw llmError;
    }

    // Update document with analysis results
    const updatedDocument = await this.documentModelAction.update({
      identifierOptions: { _id: id },
      updatePayload: {
        summary: analysisResult.summary,
        documentType: analysisResult.documentType,
        extractedMetadata: analysisResult.extractedMetadata,
        analysisStatus: AnalysisStatus.COMPLETED,
      },
    });

    this.logger.log(`${sysMsg.ANALYSIS_COMPLETED}: ${id}`);
    return {
      message: sysMsg.ANALYSIS_COMPLETED,
      data: new DocumentResponseDto(updatedDocument),
    };
  }

  /**
   * Soft deletes a document
   */
  async deleteDocument(id: string): Promise<ApiResponse<null>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(sysMsg.DOCUMENT_INVALID_ID);
    }

    const document = await this.documentModelAction.get({
      identifierOptions: { _id: id, isDeleted: false },
    });

    if (!document) {
      throw new NotFoundException(sysMsg.DOCUMENT_NOT_FOUND);
    }

    await this.documentModelAction.update({
      identifierOptions: { _id: id },
      updatePayload: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    this.logger.log(`${sysMsg.DOCUMENT_DELETED}: ${id}`);
    return { message: sysMsg.DOCUMENT_DELETED, data: null };
  }
}