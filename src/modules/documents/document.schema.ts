import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongooseDocument } from 'mongoose';
import { ExtractedMetadata } from '../../common/types';

export type DocumentDocument = Document & MongooseDocument;

/**
 * Analysis status enum for document processing
 */
export enum AnalysisStatus {
  PENDING = 'PENDING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Document types that can be detected
 */
export enum DocumentType {
  INVOICE = 'invoice',
  CV = 'CV',
  REPORT = 'report',
  LETTER = 'letter',
  CONTRACT = 'contract',
  ARTICLE = 'article',
  OTHER = 'other',
}

/**
 * Document schema for storing uploaded files and their analysis
 */
@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    getters: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    getters: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Document {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ required: true })
  size: number; // in bytes

  @Prop({ required: true, unique: true })
  storagePath: string; // The path where the raw file is stored (local/S3/Minio)

  @Prop({ required: true, maxlength: 200000 }) // Max character limit for text extraction
  extractedText: string;

  @Prop({
    type: String,
    enum: Object.values(AnalysisStatus),
    default: AnalysisStatus.PENDING,
  })
  analysisStatus: AnalysisStatus;

  @Prop({ default: null })
  summary?: string;

  @Prop({
    type: String,
    enum: Object.values(DocumentType),
    default: null,
  })
  documentType?: DocumentType;

  @Prop({ type: Object, default: {} })
  extractedMetadata: ExtractedMetadata; // date, sender, total amount, etc.

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  // Virtual fields for timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);

// Indexes for better query performance
DocumentSchema.index({ analysisStatus: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ isDeleted: 1 });
DocumentSchema.index({ createdAt: -1 });