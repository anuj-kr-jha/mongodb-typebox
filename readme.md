# TypeBox Utils

A mongodb client with TypeBox validation on Insert/InsertMany operations. It also provide Easy to use collection Interface

## Installation

```bash
npm install mongodb-typebox
```
Note: This package is a peer dependency of `@sinclair/typebox`, `typebox-utils`and `mongodb`. so you need to install them separately.

## Usage

### ESM Example
```typescript
import { ObjectId } from 'mongodb';
import { Type, Utils, createSchema, type TObjectId } from 'typebox-utils';
import { Database } from 'mongodb-typebox';

async function main() {
  // Initialize database connection
  const db = new Database('mongodb://root:rootpassword@localhost:27017');
  await db.initialize('test');

  // Define your schema with ObjectId
  const UserSchema = createSchema(
    Type.Object(
      {
        _id: Type.Optional(Utils.ObjectId()) as TObjectId,
        name: Type.String(),
        age: Type.Number(),
        email: Type.String({ format: 'email' }),
        createdAt: Type.Optional(Type.Date({ default: new Date() })),
        updatedAt: Type.Optional(Type.Date({ default: new Date() }))
      },
      { additionalProperties: false }
    )
  );

  // Extract type for the document
  type TUser = Static<typeof UserSchema>;

  // Get a typed collection with validation
  const userCollection = db.collection<TUser>('users', {
    schema: UserSchema,
    indexes: [
      {
        keys: { email: 1 },
        options: { unique: true }
      }
    ]
  });

  // Insert a document - this will be validated
  const user = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  };

  const result = await userCollection.insertOne(user);
  console.log(result);
}

main().catch(console.error);
```

### CommonJS Example
```javascript
const { ObjectId } = require('mongodb');
const { Type, Utils, createSchema } = require('typebox-utils');
const { Database } = require('mongodb-typebox');

async function main() {
  // Initialize database connection
  const db = new Database('mongodb://root:rootpassword@localhost:27017');
  await db.initialize('test');

  // Define your schema with ObjectId
  const UserSchema = createSchema(
    Type.Object(
      {
        _id: Type.Optional(Utils.ObjectId()),
        name: Type.String(),
        age: Type.Number(),
        email: Type.String({ format: 'email' }),
        createdAt: Type.Optional(Type.Date({ default: new Date() })),
        updatedAt: Type.Optional(Type.Date({ default: new Date() }))
      },
      { additionalProperties: false }
    )
  );

  // Get a typed collection with validation
  const userCollection = db.collection('users', {
    schema: UserSchema,
    indexes: [
      {
        keys: { email: 1 },
        options: { unique: true }
      }
    ]
  });

  // Insert a document - this will be validated
  const user = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  };

  const result = await userCollection.insertOne(user);
  console.log(result);
}

main().catch(console.error);
```

## Peer Dependencies

- [`@sinclair/typebox`](https://www.npmjs.com/package/@sinclair/typebox): Core validation library
- [`typebox-utils`](https://www.npmjs.com/package/typebox-utils): TypeBox utilities
- [`mongodb`](https://www.npmjs.com/package/mongodb): MongoDB driver

## License

MIT © [Anuj Kumar Jha](https://github.com/anuj-kr-jha)

## Contributing
