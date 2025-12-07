/**
 * System Messages Constants
 * Centralized repository for all system messages used across the application
 */

// ==================== GENERAL MESSAGES ====================
export const INTERNAL_SERVER_ERROR =
  "An unexpected error occurred. Please try again later.";
export const VALIDATION_ERROR = "Validation failed. Please check your input.";
export const UNAUTHORIZED_ACCESS =
  "You are not authorized to perform this action.";
export const RESOURCE_NOT_FOUND = "The requested resource was not found.";
export const DOCUMENT_NOT_FOUND_FOR_UPDATE = "Document not found for update.";

// ==================== DOCUMENT MESSAGES ====================
export const DOCUMENT_UPLOADED =
  "Document uploaded and text extracted successfully.";
export const DOCUMENT_UPLOAD_FAILED =
  "Document upload failed. Please try again.";
export const DOCUMENT_UPLOAD_FAILED_TEXT_EXTRACTION =
  "Document upload failed during text extraction.";
export const DOCUMENT_UPLOAD_FAILED_DATABASE_SAVE =
  "Document upload failed during database save.";
export const DOCUMENT_NOT_FOUND = "Document not found.";
export const DOCUMENT_FETCHED = "Document retrieved successfully.";
export const DOCUMENTS_FETCHED = "Documents retrieved successfully.";
export const DOCUMENT_DELETED = "Document deleted successfully.";
export const DOCUMENT_INVALID_ID = "Invalid document ID provided.";

// ==================== ANALYSIS MESSAGES ====================
export const ANALYSIS_INITIATED = "Document analysis initiated successfully.";
export const ANALYSIS_COMPLETED = "Document analysis completed successfully.";
export const ANALYSIS_ALREADY_COMPLETED =
  "Analysis for this document has already been completed.";
export const ANALYSIS_FAILED = "Document analysis failed. Please try again.";
export const ANALYSIS_IN_PROGRESS =
  "Document analysis is currently in progress.";

// ==================== FILE STORAGE MESSAGES ====================
export const FILE_SAVED = "File saved successfully.";
export const FILE_SAVE_FAILED = "Failed to save file.";
export const FILE_DELETED = "File deleted successfully.";
export const FILE_DELETE_FAILED = "Failed to delete file.";
export const STORAGE_SETUP_FAILED = "File storage setup failed.";
export const STORAGE_DIRECTORY_ENSURED =
  "Storage directory ensured successfully.";
export const MINIO_BUCKET_CREATED = "MinIO bucket created successfully.";
export const MINIO_BUCKET_EXISTS = "MinIO bucket already exists.";
export const MINIO_CONNECTION_FAILED = "Failed to connect to MinIO server.";
export const MINIO_UPLOAD_FAILED = "Failed to upload file to MinIO.";
export const MINIO_DELETE_FAILED = "Failed to delete file from MinIO.";
export const MINIO_INITIALIZED = "MinIO storage initialized successfully.";

// ==================== TEXT EXTRACTION MESSAGES ====================
export const TEXT_EXTRACTION_SUCCESS =
  "Text extracted successfully from document.";
export const TEXT_EXTRACTION_FAILED = "Failed to extract text from document.";
export const TEXT_EXTRACTION_PDF_FAILED = "Failed to extract text from PDF.";
export const TEXT_EXTRACTION_DOCX_FAILED = "Failed to extract text from DOCX.";
export const UNSUPPORTED_FILE_TYPE = "Only PDF and DOCX files are supported.";
export const TEXT_TRUNCATED =
  "Document text truncated to maximum allowed length.";

// ==================== OPENROUTER/LLM MESSAGES ====================
export const OPENROUTER_API_KEY_MISSING =
  "OPENROUTER_API_KEY is not configured.";
export const OPENROUTER_UNAUTHORIZED =
  "Invalid OpenRouter API key. Please check your credentials.";
export const OPENROUTER_RATE_LIMIT =
  "OpenRouter API rate limit exceeded. Please try again later.";
export const OPENROUTER_INSUFFICIENT_CREDITS =
  "Insufficient credits on OpenRouter account.";
export const LLM_ANALYSIS_SUCCESS = "LLM analysis completed successfully.";
export const LLM_ANALYSIS_FAILED =
  "Failed to analyze document with OpenRouter LLM.";
export const LLM_RESPONSE_INVALID = "LLM response is missing required fields.";

// ==================== VALIDATION MESSAGES ====================
export const FILE_TOO_LARGE =
  "File size exceeds the maximum allowed limit of 5MB.";
export const INVALID_FILE_TYPE =
  "Invalid file type. Only PDF and DOCX files are allowed.";
export const MISSING_FILE = "No file provided for upload.";
export const INVALID_OBJECT_ID = "Invalid MongoDB ObjectId format.";

// ==================== AUTHENTICATION MESSAGES ====================
export const USER_REGISTERED = "User registered successfully.";
export const LOGIN_SUCCESS = "Login successful.";
export const USER_ALREADY_EXISTS = "User with this email already exists.";
export const INVALID_CREDENTIALS = "Invalid credentials.";
export const UNAUTHORIZED = "Unauthorized access.";
export const USER_NOT_FOUND = "User not found.";

// ==================== DATABASE OPERATION MESSAGES ====================
export const DB_CREATE_FAILED = "Failed to create record in database.";
export const DB_UPDATE_FAILED = "Failed to update record in database.";
export const DB_GET_FAILED = "Failed to retrieve record from database.";
export const DB_LIST_FAILED = "Failed to list records from database.";
export const DB_FIND_FAILED = "Failed to find records in database.";
export const DB_DELETE_FAILED = "Failed to delete record from database.";
export const DB_COUNT_FAILED = "Failed to count records in database.";

// ==================== RESPONSE MESSAGES ====================
export const OPERATION_SUCCESSFUL = "Operation completed successfully.";
