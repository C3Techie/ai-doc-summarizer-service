import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

/**
 * Swagger decorator for signup endpoint
 */
export function DocsSignup() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'Create a new user account with email and password',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'SecurePass123!',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'User registered successfully',
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              email: { type: 'string', example: 'user@example.com' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiConflictResponse({
      description: 'User already exists',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 409 },
          message: { type: 'string', example: 'User with this email already exists' },
          error: { type: 'string', example: 'Conflict' },
        },
      },
    }),
  );
}

/**
 * Swagger decorator for login endpoint
 */
export function DocsLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Authenticate user and receive JWT token',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'SecurePass123!',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Login successful',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              email: { type: 'string', example: 'user@example.com' },
              firstName: { type: 'string', example: 'John' },
              lastName: { type: 'string', example: 'Doe' },
              token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Invalid credentials' },
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    }),
  );
}
