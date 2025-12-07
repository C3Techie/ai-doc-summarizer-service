import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AbstractModelAction } from "../../../common/base";
import { Document, DocumentDocument } from "../document.schema";

/**
 * Model action for Document entity
 * Provides standardized CRUD operations following the HNG SDK pattern
 */
@Injectable()
export class DocumentModelAction extends AbstractModelAction<Document> {
  constructor(
    @InjectModel(Document.name)
    private documentModel: Model<DocumentDocument>,
  ) {
    // @ts-expect-error - Type assertion needed due to Mongoose Model generic complexity
    super(documentModel);
  }
}
