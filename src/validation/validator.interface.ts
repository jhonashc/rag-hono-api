interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface Validator {
  validate<T>(schema: unknown, data: unknown): ValidationResult<T>;
}
