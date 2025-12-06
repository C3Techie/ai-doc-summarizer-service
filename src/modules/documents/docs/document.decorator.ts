import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentSwagger } from './document.swagger';
import {
  DocumentResponseDto,
  PaginatedDocumentsResponseDto,
  UploadDocumentDto,
  AnalyzeDocumentDto,
} from '../dtos';

/**
 * Decorator for Upload Document endpoint
 */
export const DocsUploadDocument = () => {
  const { operation, responses } = DocumentSwagger.endpoints.upload;

  return applyDecorators(
    ApiOperation(operation),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description: 'Document file to upload',
      type: UploadDocumentDto,
    }),
    ApiResponse({
      ...responses.created,
      type: DocumentResponseDto,
    }),
    ApiResponse(responses.badRequest),
    ApiResponse(responses.unsupportedMediaType),
    ApiResponse(responses.internalError),
  );
};

/**
 * Decorator for List Documents endpoint
 */
export const DocsListDocuments = () => {
  const { operation, parameters, responses } = DocumentSwagger.endpoints.list;

  return applyDecorators(
    ApiOperation(operation),
    ApiQuery(parameters.page),
    ApiQuery(parameters.limit),
    ApiQuery(parameters.analysisStatus),
    ApiQuery(parameters.documentType),
    ApiResponse({
      ...responses.ok,
      type: PaginatedDocumentsResponseDto,
    }),
  );
};

/**
 * Decorator for Analyze Document endpoint
 */
export const DocsAnalyzeDocument = () => {
  const { operation, parameters, responses } = DocumentSwagger.endpoints.analyze;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiBody({
      description: 'Analysis options',
      type: AnalyzeDocumentDto,
      required: false,
    }),
    ApiResponse({
      ...responses.ok,
      type: DocumentResponseDto,
    }),
    ApiResponse(responses.notFound),
    ApiResponse(responses.badRequest),
    ApiResponse(responses.internalError),
  );
};

/**
 * Decorator for Get Document by ID endpoint
 */
export const DocsGetDocumentById = () => {
  const { operation, parameters, responses } = DocumentSwagger.endpoints.getById;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiResponse({
      ...responses.ok,
      type: DocumentResponseDto,
    }),
    ApiResponse(responses.notFound),
    ApiResponse(responses.badRequest),
  );
};

/**
 * Decorator for Delete Document endpoint
 */
export const DocsDeleteDocument = () => {
  const { operation, parameters, responses } = DocumentSwagger.endpoints.delete;

  return applyDecorators(
    ApiOperation(operation),
    ApiParam(parameters.id),
    ApiResponse(responses.ok),
    ApiResponse(responses.notFound),
    ApiResponse(responses.badRequest),
  );
};
