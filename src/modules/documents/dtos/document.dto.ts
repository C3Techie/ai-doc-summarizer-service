import { IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO for uploading a document
 */
export class UploadDocumentDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "The document file (PDF or DOCX, max 5MB)",
  })
  file: Express.Multer.File;
}

/**
 * DTO for analyzing a document (body placeholder)
 */
export class AnalyzeDocumentDto {
  @ApiPropertyOptional({
    description: "Optional: Force re-analysis even if already completed",
    example: false,
  })
  @IsOptional()
  forceReAnalysis?: boolean;
}

/**
 * DTO for query parameters when listing documents
 */
export class ListDocumentsQueryDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: "Number of documents per page",
    example: 20,
    default: 20,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: "Filter by analysis status",
    enum: ["PENDING", "ANALYZING", "COMPLETED", "FAILED"],
  })
  @IsOptional()
  @IsString()
  analysisStatus?: string;

  @ApiPropertyOptional({
    description: "Filter by document type",
    enum: ["invoice", "CV", "report", "letter", "contract", "article", "other"],
  })
  @IsOptional()
  @IsString()
  documentType?: string;
}
