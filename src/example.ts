import { ObjectId } from 'mongodb';
import { type Static, Type, Utils } from 'typebox-utils';
import { Database } from './index';

// Connect to MongoDB with auth
const db = new Database('mongodb://root:rootpassword@localhost:27017');

export async function example() {
  await db.initialize('test');

  // Define your schema with ObjectId
  const UserSchema = Type.Object(
    {
      _id: Type.Optional(Utils.ObjectId()),
      name: Type.String(),
      age: Type.Number(),
      email: Type.String({ format: 'email' }),
      createdAt: Type.Optional(Type.Date({ default: new Date() })),
      updatedAt: Type.Optional(Type.Date({ default: new Date() })),
      x: Type.Optional(Type.Object({ a: Type.String() }, { default: { a: 'b' } }))
    },
    { additionalProperties: false }
  );

  type User = Static<typeof UserSchema>;

  // Get a typed collection with validation
  const userCollection = db.collection<User>('users', {
    schema: UserSchema,
    indexes: [
      {
        // Create a unique index on email field
        keys: { email: 1 },
        options: { unique: false }
      },
      {
        // Create a compound index on firstName and lastName
        keys: { firstName: 1, lastName: 1 }
      }
    ]
  });
  const _id = new ObjectId();

  const user = {
    _id: _id,
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  } satisfies User;
  // Insert a document - this will be validated
  // const result = await userCollection.insertMany([user, user].map(u => ({ ...u, _id: new ObjectId() })));
  console.log(await userCollection.insertOne(user), _id);
}
