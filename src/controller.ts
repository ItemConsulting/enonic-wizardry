import {EnonicError, EnonicErrorKey, isBadRequestError, Response} from "enonic-fp/lib/common";
import { localize } from "enonic-fp/lib/i18n";
import { getOrElse } from 'fp-ts/lib/Option'
import {IO, io, map} from "fp-ts/lib/IO";

export const defaultStatusNumbers: { [key in EnonicErrorKey]: number } = {
  "BadRequestError": 400,
  "UnauthorizedError": 401,
  "ForbiddenError": 403,
  "NotFoundError": 404,
  "MethodNotAllowedError": 405,
  "InternalServerError": 500,
  "BadGatewayError": 502,
  "PublishError": 500,
};

function contentType(body: any): string {
  return (typeof body === "string")
    ? 'text/html'
    : 'application/json';
}

export function status(status: number, body?: string | object): IO<Response> {
  return io.of({
    status,
    body,
    contentType: contentType(body)
  })
}

export function errorResponse(i18nPrefix: string, debug = false): (err: EnonicError) => IO<Response> {
  return (err: EnonicError): IO<Response> => {
    const i18nKey = `${i18nPrefix}.${err.errorKey}`;



    return status(defaultStatusNumbers[err.errorKey], {
      message: getOrElse(() => i18nKey)(localize({ key: i18nKey })),
      cause: debug && !isBadRequestError(err)
        ? err.cause
        : undefined,
      errors: isBadRequestError(err)
        ? err.errors
        : undefined
    });
  };
}

export const ok = (body: any): IO<Response> => status(200, body);

export const created = (body: any): IO<Response> => status(201, body);

export const noContent = (): IO<Response> => io.of<Response>({ status: 204, body: ''});

export const redirect = (redirect: string): IO<Response> => io.of<Response>({
  applyFilters: false,
  postProcess: false,
  redirect,
  status: 303,
  body: ''
});

export const badRequest = (body: any): IO<Response> => status(400, body);

export const unauthorized = (body: any): IO<Response> => status(401, body);

export const forbidden = (body: any): IO<Response> =>  status(403, body);

export const notFound = (body: any): IO<Response> =>  status(404, body);

export const methodNotAllowed = (body: any): IO<Response> =>  status(405, body);

export const internalServerError = (body: any): IO<Response> =>  status(500, body);

export const badGateway = (body: any): IO<Response> =>  status(502, body);

export function setTotal(total: number, response: IO<Response>): IO<Response> {
  return map((res: Response) => {
    res.headers = {
      'X-Total-Count': String(total)
    };
    return res;
  })(response);
}
