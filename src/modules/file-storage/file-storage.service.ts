import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Client from "minio";
import * as crypto from "crypto";
import * as path from "path";
import * as sysMsg from "../../constants/system.messages";

/**
 * Service for handling file storage operations using MinIO
 * Supports MinIO object storage with fallback to local storage
 */
@Injectable()
export class FileStorageService {
  private readonly minioClient: Client.Client;
  private readonly bucket: string;
  private readonly useMinIO: boolean;
  private readonly logger = new Logger(FileStorageService.name);

  constructor(private configService: ConfigService) {
    const minioEndpoint = this.configService.get<string>("MINIO_ENDPOINT");
    const minioAccessKey = this.configService.get<string>("MINIO_ACCESS_KEY");
    const minioSecretKey = this.configService.get<string>("MINIO_SECRET_KEY");
    this.bucket = this.configService.get<string>("MINIO_BUCKET") || "aidocs";

    // Check if MinIO is configured
    this.useMinIO = !!(minioEndpoint && minioAccessKey && minioSecretKey);

    if (this.useMinIO) {
      try {
        // Parse endpoint to get host and port
        const url = new URL(minioEndpoint);
        const useSSL = url.protocol === "https:";
        const port = url.port ? parseInt(url.port) : useSSL ? 443 : 9000;

        this.minioClient = new Client.Client({
          endPoint: url.hostname,
          port: port,
          useSSL: useSSL,
          accessKey: minioAccessKey,
          secretKey: minioSecretKey,
        });

        this.initializeMinIO();
      } catch (error) {
        this.logger.error(
          `${sysMsg.MINIO_CONNECTION_FAILED}: ${error.message}`,
        );
        throw new InternalServerErrorException(sysMsg.STORAGE_SETUP_FAILED);
      }
    } else {
      this.logger.warn("MinIO not configured. Using local storage fallback.");
    }
  }

  /**
   * Initializes MinIO by ensuring the bucket exists
   */
  private async initializeMinIO(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucket);

      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucket, "us-east-1");
        this.logger.log(`${sysMsg.MINIO_BUCKET_CREATED}: ${this.bucket}`);
      } else {
        this.logger.log(`${sysMsg.MINIO_BUCKET_EXISTS}: ${this.bucket}`);
      }

      this.logger.log(sysMsg.MINIO_INITIALIZED);
    } catch (error) {
      this.logger.error(`${sysMsg.STORAGE_SETUP_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.STORAGE_SETUP_FAILED);
    }
  }

  /**
   * Saves a file to MinIO and returns the object key
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomBytes(16).toString("hex")}-${Date.now()}${fileExtension}`;

    try {
      const metadata = {
        "Content-Type": file.mimetype,
        "X-Original-Name": file.originalname,
      };

      await this.minioClient.putObject(
        this.bucket,
        uniqueFilename,
        file.buffer,
        file.size,
        metadata,
      );

      this.logger.log(`${sysMsg.FILE_SAVED}: ${uniqueFilename}`);
      return uniqueFilename;
    } catch (error) {
      this.logger.error(`${sysMsg.MINIO_UPLOAD_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.FILE_SAVE_FAILED);
    }
  }

  /**
   * Deletes a file from MinIO
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, objectKey);
      this.logger.log(`${sysMsg.FILE_DELETED}: ${objectKey}`);
    } catch (error) {
      this.logger.error(`${sysMsg.MINIO_DELETE_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.FILE_DELETE_FAILED);
    }
  }

  /**
   * Checks if a file exists in MinIO
   */
  async fileExists(objectKey: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucket, objectKey);
      return true;
    } catch (error) {
      if (error.code === "NotFound") {
        return false;
      }
      throw error;
    }
  }

  /**
   * Gets a file from MinIO as a buffer
   */
  async getFile(objectKey: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(
        this.bucket,
        objectKey,
      );
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on("data", (chunk) => chunks.push(chunk));
        dataStream.on("end", () => resolve(Buffer.concat(chunks)));
        dataStream.on("error", reject);
      });
    } catch (error) {
      this.logger.error(`${sysMsg.FILE_SAVE_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.FILE_SAVE_FAILED);
    }
  }

  /**
   * Gets the bucket name for reference
   */
  getBucketName(): string {
    return this.bucket;
  }
}
