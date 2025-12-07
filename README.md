# AI Document Summarizer Service

A NestJS-based microservice for document upload, text extraction, and AI-powered analysis using OpenRouter LLM. Built with JWT authentication and HNG SDK response patterns.

## Features

- **Document Upload**: Accept PDF and DOCX files (max 5MB)
- **MinIO Object Storage**: Secure file storage using MinIO for scalability and S3 compatibility
- **Text Extraction**: Automatically extract text from uploaded documents using pdf-parse and mammoth
- **AI Analysis**: Use OpenRouter LLM to generate summaries and extract metadata
- **JWT Authentication**: Secure signup/login with Bearer token authentication
- **RESTful API**: Clean, well-documented REST endpoints following HNG SDK pattern
- **MongoDB Storage**: Persistent storage with MongoDB ObjectId primary keys
- **Swagger Documentation**: Interactive API documentation at `/docs` with Bearer auth

## Architecture

This project follows the **HNG SDK pattern** with clean separation of concerns:

### Layer Structure

```
src/
├── common/
│   ├── base/
│   │   └── abstract-model-action.ts      # Base CRUD operations for Mongoose
│   ├── decorators/
│   │   └── skip-wrap.decorator.ts        # Decorator to skip response wrapping
│   ├── interceptors/
│   │   ├── response-transform.interceptor.ts  # Auto-wrap responses in {message, data}
│   │   └── logging.interceptor.ts        # HTTP request/response logging
│   ├── interfaces/
│   │   └── api-response.interface.ts     # ApiResponse<T> and PaginatedResponse<T>
│   └── types/
│       └── index.ts                      # Shared TypeScript types
├── constants/
│   └── system.messages.ts                # Centralized system messages
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── auth.dto.ts              # Signup, Login DTOs
│   │   ├── docs/
│   │   │   └── auth.swagger.ts          # Swagger decorators for auth endpoints
│   │   ├── user.schema.ts               # User Mongoose schema
│   │   ├── auth.service.ts              # Signup, login, JWT generation
│   │   ├── auth.controller.ts           # Auth endpoints
│   │   ├── jwt.strategy.ts              # Passport JWT strategy
│   │   ├── jwt-auth.guard.ts            # JWT guard for protected routes
│   │   └── auth.module.ts               # Auth module configuration
│   ├── documents/
│   │   ├── dtos/                        # Data Transfer Objects
│   │   ├── docs/                        # Swagger decorators
│   │   ├── model-actions/               # Database operations layer
│   │   ├── document.schema.ts           # Mongoose schema
│   │   ├── documents.service.ts         # Business logic
│   │   ├── documents.controller.ts      # API endpoints (JWT protected)
│   │   └── documents.module.ts          # Module configuration
│   ├── file-storage/
│   │   ├── file-storage.service.ts      # MinIO object storage integration
│   │   └── file-storage.module.ts
│   ├── text-extraction/
│   │   ├── text-extraction.service.ts   # PDF/DOCX text extraction from buffers
│   │   └── text-extraction.module.ts
│   └── openrouter/
│       ├── openrouter.service.ts        # LLM API integration
│       └── openrouter.module.ts
└── main.ts                              # Bootstrap with interceptors, Swagger, etc.
```

### Key Patterns

1. **HNG SDK Response Format**: All responses wrapped in `{message: string, data: T}`
2. **MongoDB ObjectId**: Documents and users use MongoDB's native ObjectId for primary keys
3. **AbstractModelAction**: Standardized CRUD operations for Mongoose models
4. **System Messages**: Centralized message constants for consistency
5. **Service Layer**: Business logic orchestration
6. **Model Actions**: Database access abstraction
7. **DTOs**: Input validation and response formatting
8. **Response Transform Interceptor**: Automatically wraps all responses
9. **JWT Authentication**: Protects all document endpoints

## API Endpoints

### Authentication

#### Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-12-06T10:00:00.000Z"
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "createdAt": "2024-12-06T10:00:00.000Z"
  }
}
```

### Documents (Requires JWT Authentication)

All document endpoints require `Authorization: Bearer {token}` header.

#### 1. Upload Document
```http
POST /api/v1/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": <binary>
}
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "data": {
    "id": "507f191e810c19729de860ea",
    "originalName": "invoice.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "analysisStatus": "PENDING",
    "extractedText": "This is the extracted text...",
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:00:00.000Z"
  }
}
```

#### 2. Analyze Document
```http
POST /api/v1/documents/{id}/analyze
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Analysis completed successfully",
  "data": {
    "id": "507f191e810c19729de860ea",
    "analysisStatus": "COMPLETED",
    "summary": "This document is an invoice for services rendered...",
    "documentType": "invoice",
    "extractedMetadata": {
      "date": "2024-12-06",
      "sender": "Acme Corp",
      "totalAmount": "$1,234.50",
      "keywords": ["invoice", "payment", "services"]
    },
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:01:30.000Z"
  }
}
```

#### 3. Get Document
```http
GET /api/v1/documents/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Document fetched successfully",
  "data": {
    "id": "507f191e810c19729de860ea",
    "originalName": "invoice.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "storagePath": "a1b2c3d4e5f6-1234567890.pdf",
    "extractedText": "Full extracted text...",
    "summary": "Document summary...",
    "documentType": "invoice",
    "extractedMetadata": {...},
    "analysisStatus": "COMPLETED",
    "createdAt": "2024-12-06T10:00:00.000Z",
    "updatedAt": "2024-12-06T10:01:30.000Z"
  }
}
```

#### 4. List Documents
```http
GET /api/v1/documents?page=1&limit=20&analysisStatus=COMPLETED&documentType=invoice
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Documents fetched successfully",
  "data": [
    {
      "id": "507f191e810c19729de860ea",
      "originalName": "invoice.pdf",
      "documentType": "invoice",
      "analysisStatus": "COMPLETED",
      ...
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "total_pages": 3,
    "has_next": true,
    "has_previous": false
  }
}
```

#### 5. Delete Document
```http
DELETE /api/v1/documents/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Document deleted successfully",
  "data": null
}
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- MinIO (local or cloud)
- OpenRouter API key

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/C3Techie/ai-doc-summarizer-service.git
cd ai-doc-summarizer-service
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file (copy from `.env.example`):
```env
# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=api
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/aidocsummarizer

# MinIO Configuration
MINIO_ENDPOINT=http://127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=aidocs

# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# File Storage (Fallback)
STORAGE_PATH=./uploads
```

4. **Start MongoDB:**
```bash
# Local MongoDB
mongod --dbpath ~/data/db

# Or use MongoDB Atlas connection string in .env
```

5. **Start MinIO:**
```bash
# Windows
C:/minio/minio.exe server C:/minio/data --console-address ":9001"

# Linux/macOS
minio server ~/minio/data --console-address ":9001"

# MinIO Console: http://localhost:9001
# MinIO API: http://localhost:9000
# Default credentials: minioadmin / minioadmin
```

6. **Run the application:**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

7. **Access Swagger Documentation:**
Open browser to `http://localhost:3000/docs`

## Usage Flow

1. **Signup**: Create a user account via `POST /api/v1/auth/signup`
2. **Login**: Get JWT token via `POST /api/v1/auth/login`
3. **Authorize**: In Swagger, click "Authorize" button and enter: `Bearer {your-token}`
4. **Upload**: Upload a PDF or DOCX file via `POST /api/v1/documents/upload`
5. **Analyze**: Trigger AI analysis via `POST /api/v1/documents/{id}/analyze`
6. **Retrieve**: Get full document with analysis via `GET /api/v1/documents/{id}`

## Technology Stack

### Core Framework
- **NestJS**: TypeScript framework for scalable server-side applications
- **MongoDB + Mongoose**: NoSQL database with ODM for flexible document storage
- **MinIO**: S3-compatible object storage for scalable file management

### Key Libraries

**MinIO Client** - High-performance object storage SDK for Node.js with S3-compatible API. Provides secure, scalable file storage with built-in bucket management, metadata support, and seamless cloud migration path. Enables local development with production-ready infrastructure.

**OpenRouter** - Integrates multiple LLM providers (GPT-4, Claude, etc.) through a single API, enabling flexible AI-powered document analysis without vendor lock-in. Provides cost-effective access to various models for text summarization and metadata extraction.

**Mammoth** - Extracts text content from DOCX files by parsing the underlying XML structure. Essential for processing Microsoft Word documents without requiring Microsoft Office installation.

**pdf-parse** - Converts PDF documents to plain text for analysis. Lightweight library that handles various PDF formats without external dependencies.

**bcrypt** - Hashes user passwords using industry-standard bcrypt algorithm. Provides secure password storage with configurable salt rounds.

## Development

### Project Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and orchestration
- **Model Actions**: Database operations (CRUD)
- **DTOs**: Data validation and transformation
- **Schemas**: Mongoose models with MongoDB ObjectId
- **Guards**: JWT authentication protection
- **Interceptors**: Response transformation and logging
- **Decorators**: Custom metadata for routes

### Adding New Features

1. Define schema in module's `*.schema.ts`
2. Create DTOs for validation in `dto/` folder
3. Create Swagger decorators in `docs/` folder
4. Implement model action methods
5. Add business logic in service
6. Create controller endpoints with guards
7. Update Swagger documentation

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npm run build
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `development` | No |
| `API_PREFIX` | API route prefix | `api` | No |
| `API_VERSION` | API version | `v1` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/aidocsummarizer` | Yes |
| `MINIO_ENDPOINT` | MinIO server endpoint | `http://127.0.0.1:9000` | Yes |
| `MINIO_ACCESS_KEY` | MinIO access key | `minioadmin` | Yes |
| `MINIO_SECRET_KEY` | MinIO secret key | `minioadmin` | Yes |
| `MINIO_BUCKET` | MinIO bucket name | `aidocs` | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `STORAGE_PATH` | Fallback storage path | `./uploads` | No |

### File Limits

- **Max file size**: 5MB
- **Supported formats**: PDF (`.pdf`), DOCX (`.docx`)
- **Max text length**: 200,000 characters (auto-truncated)

### JWT Configuration

- **Token expiration**: 24 hours
- **Algorithm**: HS256
- **Bearer format**: `Authorization: Bearer {token}`

## Error Handling

All errors follow HNG SDK consistent format:

```json
{
  "statusCode": 404,
  "message": "Document not found",
  "error": "Not Found"
}
```

### Common Error Codes

- `400`: Bad Request (invalid input, validation failed)
- `401`: Unauthorized (missing or invalid JWT token)
- `404`: Not Found (document or user doesn't exist)
- `409`: Conflict (user already exists)
- `415`: Unsupported Media Type (invalid file type)
- `500`: Internal Server Error

## System Messages

All user-facing messages are centralized in `src/constants/system.messages.ts` for consistency and easy localization. Examples:

- `DOCUMENT_UPLOADED`: "Document uploaded successfully"
- `ANALYSIS_COMPLETED`: "Analysis completed successfully"
- `DOCUMENT_NOT_FOUND`: "Document not found"
- `INVALID_CREDENTIALS`: "Invalid credentials"

## Security

- ✅ **JWT Authentication**: All document endpoints protected
- ✅ **Password Hashing**: bcrypt with 10 salt rounds
- ✅ **Input Validation**: class-validator on all DTOs
- ✅ **CORS Enabled**: Configurable origin restrictions
- ✅ **File Type Validation**: Only PDF and DOCX allowed
- ✅ **File Size Limit**: 5MB maximum
- ✅ **No Sensitive Data Exposure**: Passwords excluded from responses

## Future Enhancements

- [x] MinIO object storage integration
- [ ] S3 cloud storage support
- [ ] Batch document processing
- [ ] Webhook notifications on analysis completion
- [ ] Document versioning
- [ ] Advanced search with full-text indexing
- [ ] Role-based access control (RBAC)
- [ ] Rate limiting per user
- [ ] Redis caching layer
- [ ] Document sharing between users
- [ ] Audit logs for all operations

## License

UNLICENSED

## Author

HNG Internship - Task 4: AI Document Summarizer
