export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  method: string;
  path: string;
  timestamp: string;
  errorType: 'HTTP_EXCEPTION' | 'REDIS_EXCEPTION' | 'PRISMA_ORM_EXCEPTION';
  error?: string;
}


