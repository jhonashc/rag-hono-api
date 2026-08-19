import type { ZodType } from 'zod';

import type {
  Validator,
  ValidationResult,
} from '@/validation/validator.interface';

export class ZodAdapter implements Validator {
  validate<T>(schema: unknown, data: unknown): ValidationResult<T> {
    const zodSchema = schema as ZodType<T>;
    const result = zodSchema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }
}
