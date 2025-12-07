import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import {
  DocumentResponseDto,
  PaginatedDocumentsResponseDto,
  AnalyzeDocumentDto,
  ListDocumentsQueryDto,
} from './dtos';
import {
  DocsUploadDocument,
  DocsListDocuments,
  DocsAnalyzeDocument,
  DocsGetDocumentById,
  DocsDeleteDocument,
} from './docs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Controller for document operations
 * Handles upload, analysis, retrieval, and listing of documents
 */
@ApiTags('Documents')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /documents/upload
   * Uploads a document file, extracts text, and stores it
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @DocsUploadDocument()
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({
            fileType:
              'application/(pdf|vnd\\.openxmlformats-officedocument\\.wordprocessingml\\.document)',
          }),
        ],
        errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.documentsService.uploadDocument(file);
  }

  /**
   * GET /documents
   * Lists all documents with optional filtering and pagination
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @DocsListDocuments()
  async listDocuments(
    @Query() query: ListDocumentsQueryDto,
  ) {
    return this.documentsService.listDocuments(query);
  }

  /**
   * POST /documents/:id/analyze
   * Analyzes a document using AI/LLM
   */
  @Post(':id/analyze')
  @HttpCode(HttpStatus.CREATED)
  @DocsAnalyzeDocument()
  async analyzeDocument(
    @Param('id') id: string,
    @Body() analyzeDto?: AnalyzeDocumentDto,
  ) {
    return this.documentsService.analyzeDocument(
      id,
      analyzeDto?.forceReAnalysis,
    );
  }

  /**
   * GET /documents/:id
   * Retrieves a single document by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @DocsGetDocumentById()
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  /**
   * DELETE /documents/:id
   * Soft deletes a document
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @DocsDeleteDocument()
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}
