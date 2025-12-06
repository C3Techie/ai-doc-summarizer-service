# AI Document Summarizer Service

A NestJS-based microservice for document upload, text extraction, and AI-powered analysis using OpenRouter LLM. Built with JWT authentication, UUID-based IDs, and HNG SDK response patterns.

## Features

- **Document Upload**: Accept PDF and DOCX files (max 5MB)
- **Text Extraction**: Automatically extract text from uploaded documents using pdf-parse and mammoth
- **AI Analysis**: Use OpenRouter LLM to generate summaries and extract metadata
- **JWT Authentication**: Secure signup/login with Bearer token authentication
- **RESTful API**: Clean, well-documented REST endpoints following HNG SDK pattern
- **MongoDB Storage**: Persistent storage with UUID primary keys
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
│   │   ├── user.schema.ts               # User Mongoose schema with UUID
│   │   ├── auth.service.ts              # Signup, login, JWT generation
│   │   ├── auth.controller.ts           # Auth endpoints
│   │   ├── jwt.strategy.ts              # Passport JWT strategy
│   │   ├── jwt-auth.guard.ts            # JWT guard for protected routes
│   │   └── auth.module.ts               # Auth module configuration
│   ├── documents/
│   │   ├── dtos/                        # Data Transfer Objects
│   │   ├── docs/                        # Swagger decorators
│   │   ├── model-actions/               # Database operations layer
│   │   ├── document.schema.ts           # Mongoose schema with UUID
│   │   ├── documents.service.ts         # Business logic
│   │   ├── documents.controller.ts      # API endpoints (JWT protected)
│   │   └── documents.module.ts          # Module configuration
│   ├── file-storage/
│   │   ├── file-storage.service.ts      # Local file storage (S3-ready)
│   │   └── file-storage.module.ts
│   ├── text-extraction/
│   │   ├── text-extraction.service.ts   # PDF/DOCX text extraction
│   │   └── text-extraction.module.ts
│   └── openrouter/
│       ├── openrouter.service.ts        # LLM API integration
│       └── openrouter.module.ts
└── main.ts                              # Bootstrap with interceptors, Swagger, etc.
```

### Key Patterns

1. **HNG SDK Response Format**: All responses wrapped in `{message: string, data: T}`
2. **UUID Primary Keys**: Documents and users use UUID v4 instead of MongoDB ObjectId
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
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
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
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
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
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "originalName": "invoice.pdf",
    "mimetype": "application/pdf",
    "size": 1024000,
    "storagePath": "/uploads/abc123.pdf",
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
      "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
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

# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# File Storage
STORAGE_PATH=./uploads
```

4. **Start MongoDB:**
```bash
# Local MongoDB
mongod --dbpath ~/data/db

# Or use MongoDB Atlas connection string in .env
```

5. **Run the application:**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

6. **Access Swagger Documentation:**
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

### Key Libraries

**OpenRouter** - Integrates multiple LLM providers (GPT-4, Claude, etc.) through a single API, enabling flexible AI-powered document analysis without vendor lock-in. Provides cost-effective access to various models for text summarization and metadata extraction.

**Mammoth** - Extracts text content from DOCX files by parsing the underlying XML structure. Essential for processing Microsoft Word documents without requiring Microsoft Office installation.

**pdf-parse** - Converts PDF documents to plain text for analysis. Lightweight library that handles various PDF formats without external dependencies.

**UUID** - Generates universally unique identifiers for documents instead of sequential MongoDB ObjectIds. Ensures better security and follows HNG SDK pattern for distributed systems.

**bcrypt** - Hashes user passwords using industry-standard bcrypt algorithm. Provides secure password storage with configurable salt rounds.

## Development

### Project Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and orchestration
- **Model Actions**: Database operations (CRUD)
- **DTOs**: Data validation and transformation
- **Schemas**: Mongoose models with UUID primary keys
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
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `STORAGE_PATH` | Local file storage path | `./uploads` | No |

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

- [ ] S3/MinIO integration for cloud storage
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
