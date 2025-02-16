import { type Db, MongoClient } from 'mongodb';

import type { DbOptions, MongoClientOptions, Document as MongoDocument } from 'mongodb';
import { Collection } from './Collection';
import type { CollectionOptions } from './Collection';

export class Database extends MongoClient {
  #db!: Db;
  #collections: Map<string, Collection<any>> = new Map();

  constructor(uri: string, options?: MongoClientOptions) {
    super(uri, options);
  }

  collection<T extends MongoDocument>(name: string, options: CollectionOptions): Collection<T> {
    if (!this.#collections.has(name)) {
      const collection = this.#db.collection<T>(name);
      this.#collections.set(name, new Collection(collection, name, options));
    }
    return this.#collections.get(name) as Collection<T>;
  }

  async initialize(dbName: string, options?: DbOptions) {
    this.#db = this.db(dbName, options);
    await this.#db.command({ ping: 1 });
  }
}
