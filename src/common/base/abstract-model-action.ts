import { Model, FilterQuery, UpdateQuery, ClientSession } from 'mongoose';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as sysMsg from '../../constants/system.messages';

/**
 * Pagination options for list operations
 */
export interface IPaginationPayload {
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata returned from list operations
 */
export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Transaction options for database operations
 */
export interface ITransactionOptions {
  useTransaction?: boolean;
  session?: ClientSession;
}

/**
 * Response structure for list operations
 */
export interface IListResponse<T> {
  payload: T[];
  paginationMeta: IPaginationMeta;
}

/**
 * Options for create operations
 */
export interface ICreateOptions<T> {
  createPayload: Partial<T>;
  transactionOptions?: ITransactionOptions;
}

/**
 * Options for update operations
 */
export interface IUpdateOptions<T> {
  identifierOptions: FilterQuery<T>;
  updatePayload: UpdateQuery<T>;
  transactionOptions?: ITransactionOptions;
}

/**
 * Options for get/find operations
 */
export interface IGetOptions<T> {
  identifierOptions: FilterQuery<T>;
  select?: string | string[];
  populate?: string | string[];
}

/**
 * Options for list operations
 */
export interface IListOptions<T> {
  filterRecordOptions?: FilterQuery<T>;
  select?: string | string[];
  populate?: string | string[];
  sort?: Record<string, 1 | -1 | 'asc' | 'desc'>;
  paginationPayload?: IPaginationPayload;
}

/**
 * Options for find operations (returns array without pagination)
 */
export interface IFindOptions<T> {
  findOptions: FilterQuery<T>;
  select?: string | string[];
  populate?: string | string[];
  sort?: Record<string, 1 | -1 | 'asc' | 'desc'>;
  transactionOptions?: ITransactionOptions;
}

/**
 * Response structure for find operations
 */
export interface IFindResponse<T> {
  payload: T[];
}

/**
 * Abstract base class for Mongoose model actions
 * Provides standardized CRUD operations similar to TypeORM AbstractModelAction
 */
export abstract class AbstractModelAction<T> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Creates a new document in the database
   */
  async create(options: ICreateOptions<T>): Promise<T> {
    const { createPayload, transactionOptions } = options;

    try {
      const session = transactionOptions?.session;
      const created = await this.model.create(
        [createPayload],
        session ? { session } : undefined,
      );
      return created[0] as T;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_CREATE_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Updates a document in the database
   */
  async update(options: IUpdateOptions<T>): Promise<T> {
    const { identifierOptions, updatePayload, transactionOptions } = options;

    try {
      const session = transactionOptions?.session;
      const updated = await this.model.findOneAndUpdate(
        identifierOptions,
        updatePayload,
        {
          new: true,
          session,
        },
      );

      if (!updated) {
        throw new NotFoundException(sysMsg.DOCUMENT_NOT_FOUND_FOR_UPDATE);
      }

      return updated as T;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_UPDATE_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Gets a single document by identifier
   */
  async get(options: IGetOptions<T>): Promise<T | null> {
    const { identifierOptions, select, populate } = options;

    try {
      let query = this.model.findOne(identifierOptions);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((path) => (query = query.populate(path)));
        } else {
          query = query.populate(populate);
        }
      }

      return await query.exec();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_GET_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Lists documents with pagination
   */
  async list(options: IListOptions<T> = {}): Promise<IListResponse<T>> {
    const {
      filterRecordOptions = {},
      select,
      populate,
      sort,
      paginationPayload = { page: 1, limit: 20 },
    } = options;

    const { page = 1, limit = 20 } = paginationPayload;
    const skip = (page - 1) * limit;

    try {
      // Build query
      let query = this.model.find(filterRecordOptions);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((path) => (query = query.populate(path)));
        } else {
          query = query.populate(populate);
        }
      }

      if (sort) {
        query = query.sort(sort);
      }

      // Execute with pagination
      const [payload, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        this.model.countDocuments(filterRecordOptions),
      ]);

      const total_pages = Math.ceil(total / limit);

      return {
        payload: payload as T[],
        paginationMeta: {
          total,
          page,
          limit,
          total_pages,
          has_next: page < total_pages,
          has_previous: page > 1,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_LIST_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Finds documents without pagination
   */
  async find(options: IFindOptions<T>): Promise<IFindResponse<T>> {
    const { findOptions, select, populate, sort, transactionOptions } = options;

    try {
      const session = transactionOptions?.session;
      let query = this.model.find(findOptions);

      if (select) {
        query = query.select(select);
      }

      if (populate) {
        if (Array.isArray(populate)) {
          populate.forEach((path) => (query = query.populate(path)));
        } else {
          query = query.populate(populate);
        }
      }

      if (sort) {
        query = query.sort(sort);
      }

      if (session) {
        query = query.session(session);
      }

      const payload = await query.exec();

      return {
        payload: payload as T[],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_FIND_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Deletes a document (hard delete)
   */
  async delete(options: IGetOptions<T>): Promise<boolean> {
    const { identifierOptions } = options;

    try {
      const result = await this.model.deleteOne(identifierOptions);
      return result.deletedCount > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_DELETE_FAILED}: ${errorMessage}`,
      );
    }
  }

  /**
   * Counts documents matching the filter
   */
  async count(filterOptions: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filterOptions);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `${sysMsg.DB_COUNT_FAILED}: ${errorMessage}`,
      );
    }
  }
}
