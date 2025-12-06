import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sysMsg from '../../constants/system.messages';

/**
 * Service for handling file storage operations
 * Supports local storage with future S3/Minio integration capability
 */
@Injectable()
export class FileStorageService {
  private readonly storagePath: string;
  private readonly logger = new Logger(FileStorageService.name);

  constructor(private configService: ConfigService) {
    this.storagePath =
      this.configService.get<string>('STORAGE_PATH') ||
      path.join(process.cwd(), 'uploads');
    this.ensureStorageDirectory();
  }

  /**
   * Ensures the storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      this.logger.log(sysMsg.STORAGE_DIRECTORY_ENSURED + `: ${this.storagePath}`);
    } catch (error) {
      this.logger.error(`${sysMsg.STORAGE_SETUP_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.STORAGE_SETUP_FAILED);
    }
  }

  /**
   * Saves a file to storage and returns the file path
   */
  async saveFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`;
    const filePath = path.join(this.storagePath, uniqueFilename);

    try {
      await fs.writeFile(filePath, file.buffer);
      this.logger.log(`${sysMsg.FILE_SAVED}: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`${sysMsg.FILE_SAVE_FAILED}: ${error.message}`);
      throw new InternalServerErrorException(sysMsg.FILE_SAVE_FAILED);
    }
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.log(`${sysMsg.FILE_DELETED}: ${filePath}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`${sysMsg.FILE_DELETE_FAILED}: ${error.message}`);
        throw new InternalServerErrorException(sysMsg.FILE_DELETE_FAILED);
      }
    }
  }

  /**
   * Checks if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the storage path for reference
   */
  getStoragePath(): string {
    return this.storagePath;
  }
}