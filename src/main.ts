import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  const globalPrefix = `${apiPrefix}/${apiVersion}`;

  app.setGlobalPrefix(globalPrefix, {
    exclude: ['docs'],
  });

  // Global interceptors
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(reflector),
    new LoggingInterceptor(),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AI Document Summarizer Service')
    .setDescription(
      'Service to upload, extract, and analyze documents using OpenRouter LLM.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('Authentication')
    .addTag('Documents')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get<string>('PORT', '3000');
  const env = configService.get<string>('NODE_ENV', 'development');

  await app.listen(port);

  console.log(`
      ------------
      AI Document Summarizer Service Started!
      Environment: ${env}
      API: http://localhost:${port}/${globalPrefix}
      API Docs: http://localhost:${port}/docs
      ------------
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});