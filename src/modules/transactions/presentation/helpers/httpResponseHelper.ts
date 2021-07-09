import { HttpResponse } from '../protocols';
import { statusCodes } from '../helpers';

export function okResponse(body: any): HttpResponse {
  return {
    statusCode: statusCodes.ok,
    body,
  };
}
