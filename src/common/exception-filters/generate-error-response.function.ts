import { Request } from 'express';
import { ErrorResponse } from './error-response.interface';

export function generateErrorResponse(params: {
  request: Request;
  statusCode: number;
  message: string | string[];
  errorType: ErrorResponse['errorType'];
  error?: string;
}): ErrorResponse {
  return {
    statusCode: params.statusCode,
    message: params.message,
    method: params.request.method,
    path: params.request.url,
    timestamp: new Date().toISOString(),
    errorType: params.errorType,
    error: params.error,
  };
}
