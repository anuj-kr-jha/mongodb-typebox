import { Collection as MongoCollection } from 'mongodb';
import type {
  Abortable,
  AggregateOptions,
  AnyBulkWriteOperation,
  BulkWriteOptions,
  ChangeStreamOptions,
  CountDocumentsOptions,
  CreateIndexesOptions,
  DeleteOptions,
  DistinctOptions,
  Document,
  DropIndexesOptions,
  EstimatedDocumentCountOptions,
  Filter,
  FindOneAndDeleteOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  FindOptions,
  IndexSpecification,
  InsertOneOptions,
  ListIndexesOptions,
  OptionalUnlessRequiredId,
  RenameOptions,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions
} from 'mongodb';
import type { TObject } from 'typebox-utils';
import { validate } from 'typebox-utils';

interface IndexDefinition {
  keys: Record<string, 1 | -1>; // 1 for ascending, -1 for descending
  options?: CreateIndexesOptions;
}

export interface CollectionOptions {
  schema: TObject;
  indexes?: IndexDefinition[];
}

export class Collection<T extends Document> {
  private collection: MongoCollection<T>;
  private indexes: IndexDefinition[];
  private schema: TObject;
  // @ts-ignore
  private collectionName: string;

  constructor(collection: MongoCollection<T>, collectionName: string, options: CollectionOptions) {
    this.collection = collection;
    this.collectionName = collectionName;
    this.indexes = options.indexes || [];
    this.schema = options.schema;
    this.createIndexes();
  }

  private async createIndexes() {
    for (const index of this.indexes) {
      await this.collection.createIndex(index.keys, index.options);
    }
  }

  #validateDocument(doc: OptionalUnlessRequiredId<T> | Partial<T>, applyDefaults = false) {
    const skipOperators = applyDefaults ? ['Convert'] : ['Convert', 'Default'];
    const [error, updatedDoc] = validate(doc, this.schema, true, skipOperators as any);
    if (error) {
      throw new Error(`Validation failed: ${error}`);
    }
    return updatedDoc;
  }

  async insertOne(doc: OptionalUnlessRequiredId<T>, options?: InsertOneOptions) {
    const updatedDoc = this.#validateDocument(doc, true);
    return this.collection.insertOne(updatedDoc as typeof doc, options);
  }

  async insertMany(docs: OptionalUnlessRequiredId<T>[], options?: BulkWriteOptions) {
    const validatedDocs = docs.map(doc => this.#validateDocument(doc, true));
    return this.collection.insertMany(validatedDocs as typeof docs, options);
  }

  async findOne(filter: Filter<T>, options?: FindOptions & Abortable) {
    return this.collection.findOne(filter, options);
  }

  async find(filter: Filter<T>, options?: FindOptions & Abortable) {
    return this.collection.find(filter, options);
  }

  async updateOne(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions) {
    return this.collection.updateOne(filter, update, options);
  }

  async updateMany(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions) {
    return this.collection.updateMany(filter, update, options);
  }

  async deleteOne(filter: Filter<T>, options?: DeleteOptions) {
    return this.collection.deleteOne(filter, options);
  }

  async deleteMany(filter: Filter<T>, options?: DeleteOptions) {
    return this.collection.deleteMany(filter, options);
  }

  async findOneAndUpdate(filter: Filter<T>, update: UpdateFilter<T>, options: FindOneAndUpdateOptions) {
    return this.collection.findOneAndUpdate(filter, update, options);
  }

  async findOneAndDelete(
    filter: Filter<T>,
    options: FindOneAndDeleteOptions & {
      includeResultMetadata: true;
    }
  ) {
    return this.collection.findOneAndDelete(filter, options);
  }

  async findOneAndReplace(filter: Filter<T>, replacement: T, options: FindOneAndReplaceOptions) {
    return this.collection.findOneAndReplace(filter, replacement, options);
  }

  async aggregate<TResult extends Document>(pipeline?: Document[], options?: AggregateOptions & Abortable) {
    return this.collection.aggregate<TResult>(pipeline, options);
  }

  async bulkWrite(operations: readonly AnyBulkWriteOperation<T>[], options?: BulkWriteOptions) {
    return this.collection.bulkWrite(operations, options);
  }

  async countDocuments(filter?: Filter<T>, options?: CountDocumentsOptions & Abortable) {
    return this.collection.countDocuments(filter, options);
  }

  async distinct(key: string, filter: Filter<T>, options: DistinctOptions) {
    return this.collection.distinct(key, filter, options);
  }

  async drop() {
    return this.collection.drop();
  }

  async estimatedDocumentCount(options?: EstimatedDocumentCountOptions) {
    return this.collection.estimatedDocumentCount(options);
  }

  async replaceOne(filter: Filter<T>, replacement: OptionalUnlessRequiredId<T>, options?: ReplaceOptions) {
    const validatedDoc = this.#validateDocument(replacement, true);
    return this.collection.replaceOne(filter, validatedDoc as typeof replacement, options);
  }

  async watch(pipeline?: Document[], options?: ChangeStreamOptions) {
    return this.collection.watch(pipeline, options);
  }

  initializeOrderedBulkOp(options?: BulkWriteOptions) {
    return this.collection.initializeOrderedBulkOp(options);
  }

  initializeUnorderedBulkOp(options?: BulkWriteOptions) {
    return this.collection.initializeUnorderedBulkOp(options);
  }

  async rename(newName: string, options?: RenameOptions) {
    return this.collection.rename(newName, options);
  }

  async createIndex(indexSpec: IndexSpecification, options?: CreateIndexesOptions) {
    return this.collection.createIndex(indexSpec, options);
  }

  async dropIndex(indexName: string, options?: DropIndexesOptions) {
    return this.collection.dropIndex(indexName, options);
  }

  async dropIndexes(options?: DropIndexesOptions) {
    return this.collection.dropIndexes(options);
  }

  async listIndexes(options?: ListIndexesOptions) {
    return this.collection.listIndexes(options);
  }

  /**
   * @internal
   * @returns The raw MongoDB collection
   */
  get rawCollection() {
    return this.collection;
  }
}
