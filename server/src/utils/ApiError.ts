export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (msg: string): ApiError => new ApiError(400, msg);
export const unauthorized = (msg = 'Unauthorized'): ApiError => new ApiError(401, msg);
export const forbidden = (msg = 'Forbidden'): ApiError => new ApiError(403, msg);
export const notFound = (msg = 'Not found'): ApiError => new ApiError(404, msg);
export const conflict = (msg: string): ApiError => new ApiError(409, msg);
