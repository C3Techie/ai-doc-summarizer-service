import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentDocument } from "../document.schema";
import { Exclude, Expose } from "class-transformer";
import { AnalysisStatus, DocumentType } from "../document.schema";
import { ExtractedMetadata } from "../../../common/types";

/**
 * Response DTO for document operations
 */
@Exclude()
export class DocumentResponseDto {
  @Expose()
  @ApiProperty({
    description: "Unique identifier of the document",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: "Original filename of the uploaded document",
    example: "invoice_2024.pdf",
  })
  originalName: string;

  @Expose()
  @ApiProperty({
    description: "MIME type of the document",
    example: "application/pdf",
  })
  mimetype: string;

  @Expose()
  @ApiProperty({
    description: "Size of the document in bytes",
    example: 1024000,
  })
  size: number;

  @Expose()
  @ApiProperty({
    description: "Current analysis status of the document",
    enum: AnalysisStatus,
    example: AnalysisStatus.COMPLETED,
  })
  analysisStatus: AnalysisStatus;

  @Expose()
  @ApiProperty({
    description: "Extracted text content from the document",
    example: "This is the extracted text...",
  })
  extractedText: string;

  @Expose()
  @ApiPropertyOptional({
    description: "AI-generated summary of the document",
    example: "This document is an invoice for services rendered...",
  })
  summary?: string;

  @Expose()
  @ApiPropertyOptional({
    description: "Detected document type",
    enum: DocumentType,
    example: DocumentType.INVOICE,
  })
  documentType?: DocumentType;

  @Expose()
  @ApiPropertyOptional({
    description: "Extracted metadata from the document",
    example: {
      date: "2024-12-06",
      sender: "Acme Corp",
      totalAmount: "$1,234.50",
      keywords: ["invoice", "payment", "services"],
    },
  })
  extractedMetadata?: ExtractedMetadata;

  @Expose()
  @ApiProperty({
    description: "Timestamp when the document was created",
    example: "2024-12-06T10:00:00.000Z",
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: "Timestamp when the document was last updated",
    example: "2024-12-06T10:30:00.000Z",
  })
  updatedAt: Date;

  constructor(partial: Partial<DocumentResponseDto>) {
    // Convert Mongoose document to plain object if needed
    const plain =
      partial &&
      typeof (partial as Record<string, unknown>).toObject === "function"
        ? (partial as DocumentDocument).toObject()
        : partial;

    this.id = plain.id || plain._id;
    this.originalName = plain.originalName;
    this.mimetype = plain.mimetype;
    this.size = plain.size;
    this.analysisStatus = plain.analysisStatus;
    this.extractedText = plain.extractedText;
    this.summary = plain.summary;
    this.documentType = plain.documentType;
    this.extractedMetadata = plain.extractedMetadata;
    this.createdAt = plain.createdAt;
    this.updatedAt = plain.updatedAt;
  }
}

/**
 * Response DTO for paginated document list
 */
export class PaginatedDocumentsResponseDto {
  @ApiProperty({
    type: [DocumentResponseDto],
    description: "Array of documents",
  })
  documents: DocumentResponseDto[];

  @ApiProperty({
    description: "Pagination metadata",
    example: {
      total: 100,
      page: 1,
      limit: 20,
      total_pages: 5,
      has_next: true,
      has_previous: false,
    },
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}
