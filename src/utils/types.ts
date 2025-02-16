import { FormatRegistry, type TSchema, Type } from '@sinclair/typebox';
import { ObjectId } from 'mongodb';

// Register ObjectId format validator
FormatRegistry.Set('ObjectId', (value: unknown) => {
  if (value instanceof ObjectId) return true;
  if (typeof value !== 'string') return false;
  return ObjectId.isValid(value);
});

FormatRegistry.Set('email', (v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v));
FormatRegistry.Set('mobile', (v: string) => /^[0-9]{10}$/.test(v));

// Export helper for ObjectId with proper typing
export const TypeboxObjectId = () =>
  Type.Object(
    {
      _bsontype: Type.Optional(Type.String()),
      id: Type.Optional(Type.Any())
    },
    {
      $id: 'ObjectId',
      typeofFormat: 'object',
      validate(value: unknown): value is ObjectId {
        if (value instanceof ObjectId) return true;
        if (typeof value === 'string' && ObjectId.isValid(value)) {
          return true;
        }
        return false;
      }
    }
  ) as unknown as TSchema & { static: ObjectId };

export const TypeboxObjectIdStringified = () =>
  Type.String({
    $id: 'ObjectIdString',
    format: 'ObjectId',
    validate(value: unknown): value is string {
      if (typeof value !== 'string') return false;
      return ObjectId.isValid(value);
    }
  });
