/**
 * Response validation utilities for API responses
 * Ensures API responses match expected DTO interfaces
 */

/**
 * Validates that a response object contains all required fields
 * @param data - The response data to validate
 * @param requiredFields - Array of field names that must be present
 * @param typeName - Name of the DTO type for error messages
 * @returns The validated data cast to type T
 * @throws Error if validation fails
 */
export function validateResponse<T>(
  data: any,
  requiredFields: (keyof T)[],
  typeName: string
): T {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid ${typeName}: expected object, got ${typeof data}`);
  }

  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new Error(
      `Invalid ${typeName}: missing required fields: ${missingFields.join(', ')}`
    );
  }

  return data as T;
}

/**
 * Validates that a response is an array and all items contain required fields
 * @param data - The response data to validate (should be an array)
 * @param requiredFields - Array of field names that must be present in each item
 * @param typeName - Name of the DTO type for error messages
 * @returns The validated array cast to type T[]
 * @throws Error if validation fails
 */
export function validateArrayResponse<T>(
  data: any,
  requiredFields: (keyof T)[],
  typeName: string
): T[] {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${typeName}[]: expected array, got ${typeof data}`);
  }

  return data.map((item, index) => {
    try {
      return validateResponse<T>(item, requiredFields, typeName);
    } catch (error) {
      throw new Error(`Invalid ${typeName}[${index}]: ${(error as Error).message}`);
    }
  });
}

/**
 * Strips fields from an object that are not in the allowed fields list
 * @param data - The object to clean
 * @param allowedFields - Array of field names that should be kept
 * @returns A new object containing only the allowed fields
 */
export function stripExtraFields<T>(data: any, allowedFields: (keyof T)[]): T {
  const cleaned: any = {};
  
  for (const field of allowedFields) {
    if (field in data) {
      cleaned[field] = data[field];
    }
  }
  
  return cleaned as T;
}
