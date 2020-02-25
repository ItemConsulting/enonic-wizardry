import { EnonicError, EnonicErrorKey, isBadRequestError } from "enonic-fp/lib/errors";
import { Response } from "enonic-types/lib/controller";
import { localize } from "enonic-fp/lib/i18n";
import { getOrElse } from 'fp-ts/lib/Option'
import { IO, io } from "fp-ts/lib/IO";
import { getUnsafeRenderer } from "enonic-fp/lib/thymeleaf";
import { ResourceKey } from "enonic-types/lib/thymeleaf";

export const defaultStatusNumbers: { [key in EnonicErrorKey]: number } = {
  "BadRequestError": 400,
  "UnauthorizedError": 401,
  "ForbiddenError": 403,
  "NotFoundError": 404,
  "MethodNotAllowedError": 405,
  "TooManyRequestsError": 429,
  "InternalServerError": 500,
  "BadGatewayError": 502,
  "PublishError": 500
};

function contentType(body: any): string {
  return (typeof body === "string")
    ? 'text/html'
    : 'application/json';
}

export function status(statusOrError: number | EnonicError, body: string | object = '', other: Partial<Response> = {}): IO<Response> {
  const status = (typeof statusOrError == 'number')
    ? statusOrError
    : defaultStatusNumbers[statusOrError.errorKey];

  return io.of({
    contentType: contentType(body),
    ...other,
    status,
    body
  })
}

/**
 * Creates a Json Response based on an EnonicError
 */
export function errorResponse(i18nPrefix: string, debug = false): (err: EnonicError) => IO<Response> {
  return (err: EnonicError): IO<Response> => {
    const i18nKey = `${i18nPrefix}.${err.errorKey}`;

    return status(err, {
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

/**
 * Creates a Response based on a thymeleaf view, and an EnonicError
 */
export function unsafeRenderErrorPage(view: ResourceKey): (err: EnonicError) => IO<Response> {
  return (err: EnonicError): IO<Response> => status(err, getUnsafeRenderer<EnonicError>(view)(err));
}

export const ok = (body: any, other: Partial<Response> = {}): IO<Response> => status(200, body, other);

export const created = (body: any, other: Partial<Response> = {}): IO<Response> => status(201, body, other);

export const noContent = (other: Partial<Response> = {}): IO<Response> => io.of<Response>({
  ...other,
  status: 204,
  body: ''
});

export const redirect = (redirect: string): IO<Response> => io.of<Response>({
  applyFilters: false,
  postProcess: false,
  redirect,
  status: 303,
  body: ''
});

export const badRequest = (body: any, other: Partial<Response> = {}): IO<Response> => status(400, body, other);

export const unauthorized = (body: any, other: Partial<Response> = {}): IO<Response> => status(401, body, other);

export const forbidden = (body: any, other: Partial<Response> = {}): IO<Response> =>  status(403, body, other);

export const notFound = (body: any, other: Partial<Response> = {}): IO<Response> =>  status(404, body, other);

export const methodNotAllowed = (body: any, other: Partial<Response> = {}): IO<Response> =>  status(405, body, other);

export const internalServerError = (body: any, other: Partial<Response> = {}): IO<Response> =>  status(500, body, other);

export const badGateway = (body: any, other: Partial<Response> = {}): IO<Response> =>  status(502, body, other);
