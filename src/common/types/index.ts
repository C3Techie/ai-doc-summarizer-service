/**
 * Common type definitions used across the application
 */

/**
 * Metadata that can be extracted from documents
 * Flexible structure for various document types
 */
export interface ExtractedMetadata {
  // Invoice metadata
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: number;
  currency?: string;
  vendorName?: string;
  vendorAddress?: string;

  // CV metadata
  fullName?: string;
  email?: string;
  phone?: string;
  education?: string[];
  experience?: string[];
  skills?: string[];

  // General metadata
  date?: string;
  author?: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  keywords?: string[];

  // Allow additional custom fields
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Filter options for querying documents
 */
export interface DocumentFilterOptions {
  isDeleted: boolean;
  analysisStatus?: string;
  documentType?: string;
  [key: string]: unknown;
}
