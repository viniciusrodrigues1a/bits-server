import { HttpResponse } from '../protocols';
import { statusCodes } from '../helpers';

export function okResponse(body: any): HttpResponse {
  return {
    statusCode: statusCodes.ok,
    body,
  };
}

export function notFoundResponse(message: string): HttpResponse {
  return {
    statusCode: statusCodes.notFound,
    body: { error: true, message },
  };
}

export function serverErrorResponse(): HttpResponse {
  return {
    statusCode: statusCodes.serverError,
    body: { error: true, message: 'Internal server error' },
  };
}
