import { HttpStatus } from '@nestjs/common';
import * as sysMsg from '../../../constants/system.messages';

/**
 * Swagger documentation configuration for Document endpoints
 */
export const DocumentSwagger = {
  tags: ['Documents'],
  summary: 'Document Management',
  description:
    'Endpoints for uploading, analyzing, retrieving, and managing documents with AI-powered summarization.',
  endpoints: {
    upload: {
      operation: {
        summary: 'Upload a document',
        description:
          'Accepts a PDF or DOCX file (max 5MB), extracts text, stores the file, and saves metadata to the database.',
      },
      body: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The document file (PDF or DOCX, max 5MB)',
        },
      },
      responses: {
        created: {
          status: HttpStatus.CREATED,
          description: sysMsg.DOCUMENT_UPLOADED,
        },
        badRequest: {
          status: HttpStatus.BAD_REQUEST,
          description: 'Invalid file or validation error',
        },
        unsupportedMediaType: {
          status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          description: sysMsg.UNSUPPORTED_FILE_TYPE,
        },
        internalError: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          description: sysMsg.DOCUMENT_UPLOAD_FAILED,
        },
      },
    },
    list: {
      operation: {
        summary: 'List all documents',
        description:
          'Retrieves a paginated list of documents with optional filtering by status and type.',
      },
      parameters: {
        page: {
          name: 'page',
          in: 'query',
          required: false,
          type: Number,
          description: 'Page number (default: 1)',
        },
        limit: {
          name: 'limit',
          in: 'query',
          required: false,
          type: Number,
          description: 'Items per page (default: 20)',
        },
        analysisStatus: {
          name: 'analysisStatus',
          in: 'query',
          required: false,
          enum: ['PENDING', 'ANALYZING', 'COMPLETED', 'FAILED'],
          description: 'Filter by analysis status',
        },
        documentType: {
          name: 'documentType',
          in: 'query',
          required: false,
          enum: ['invoice', 'CV', 'report', 'letter', 'contract', 'article', 'other'],
          description: 'Filter by document type',
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: 'Documents retrieved successfully',
        },
      },
    },
    analyze: {
      operation: {
        summary: 'Analyze a document',
        description:
          'Sends the extracted text to an LLM for analysis, generating a summary, document type, and metadata.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'Document ID',
          type: String,
        },
      },
      body: {
        forceReAnalysis: {
          description: 'Optional: Force re-analysis even if already completed',
          example: false,
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.ANALYSIS_COMPLETED,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.DOCUMENT_NOT_FOUND,
        },
        badRequest: {
          status: HttpStatus.BAD_REQUEST,
          description: sysMsg.DOCUMENT_INVALID_ID,
        },
        internalError: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          description: sysMsg.ANALYSIS_FAILED,
        },
      },
    },
    getById: {
      operation: {
        summary: 'Get a document by ID',
        description:
          'Returns complete document data including file info, extracted text, summary, and metadata.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'Document ID',
          type: String,
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.DOCUMENT_FETCHED,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.DOCUMENT_NOT_FOUND,
        },
        badRequest: {
          status: HttpStatus.BAD_REQUEST,
          description: sysMsg.DOCUMENT_INVALID_ID,
        },
      },
    },
    delete: {
      operation: {
        summary: 'Delete a document',
        description: 'Soft deletes a document by marking it as deleted.',
      },
      parameters: {
        id: {
          name: 'id',
          description: 'Document ID',
          type: String,
        },
      },
      responses: {
        ok: {
          status: HttpStatus.OK,
          description: sysMsg.DOCUMENT_DELETED,
        },
        notFound: {
          status: HttpStatus.NOT_FOUND,
          description: sysMsg.DOCUMENT_NOT_FOUND,
        },
        badRequest: {
          status: HttpStatus.BAD_REQUEST,
          description: sysMsg.DOCUMENT_INVALID_ID,
        },
      },
    },
  },
};
