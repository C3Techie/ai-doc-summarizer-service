import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { Document, DocumentSchema } from "./document.schema";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { DocumentModelAction } from "./model-actions";
import { OpenrouterModule } from "../openrouter/openrouter.module";
import { TextExtractionModule } from "../text-extraction/text-extraction.module";
import { FileStorageModule } from "../file-storage/file-storage.module";

/**
 * Documents module
 * Handles all document-related operations including upload, analysis, and retrieval
 */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    OpenrouterModule,
    TextExtractionModule,
    FileStorageModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentModelAction],
  exports: [DocumentsService, DocumentModelAction],
})
export class DocumentsModule {}
