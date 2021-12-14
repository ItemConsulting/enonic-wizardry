import type { Context, ValidationError } from "io-ts";
import type { Reporter } from "io-ts/lib/Reporter";
import { fold } from "fp-ts/es6/Either";
import type { ErrorDetail } from "enonic-fp/errors";
import type { LocalizeWithPrefixParams } from "enonic-fp/controller";
import { localizeFirst } from "enonic-fp/i18n";
import { pipe } from "fp-ts/es6/function";
import { getOrElse } from "fp-ts/es6/Option";
import type { LocalizeParams } from "/lib/xp/i18n";

export function getErrorDetailReporter(
  localizeParams?: LocalizeWithPrefixParams
): Reporter<Array<ErrorDetail>> {
  return {
    report: fold(
      (es) =>
        es.map((err) => validationErrorToErrorDetail(err, localizeParams)),
      () => []
    ),
  };
}

function validationErrorToErrorDetail(
  err: ValidationError,
  localizeParams?: LocalizeWithPrefixParams
): ErrorDetail {
  const key = getPathInInterface(err.context);

  return pipe(
    getMessageKeys(key, isLastEmpty(err.context), localizeParams),
    localizeFirst,
    getOrElse(() => err.message ?? "Invalid value"),
    (message) => ({
      key,
      message,
    })
  );
}

function getMessageKeys(
  key: string,
  fieldIsEmpty: boolean,
  localizeParams?: LocalizeWithPrefixParams
): Array<LocalizeParams> {
  const i18nPrefix = localizeParams?.i18nPrefix ?? "errors";

  const keyedMessageKeys = [
    `${i18nPrefix}.bad-request-error.${key}`,
    `${i18nPrefix}.400.${key}`,
    `${i18nPrefix}.${key}`,
  ];

  const emptyMessageKeys = [
    `errors.bad-request-error.defaultEmpty`,
    `errors.400.defaultEmpty`,
  ];

  const defaultMessageKeys = [
    `${i18nPrefix}.bad-request-error`,
    `${i18nPrefix}.400`,
    `errors.bad-request-error.default`,
    `errors.400.default`,
  ];

  return keyedMessageKeys
    .concat(fieldIsEmpty ? emptyMessageKeys : [])
    .concat(defaultMessageKeys)
    .map((key) => ({
      ...localizeParams,
      key,
    }));
}

/**
 * Used for i18n to differenciate empty value
 */
function isLastEmpty(context: Context): boolean {
  const entries = context.filter((c) => c.key !== "");
  const last = entries[entries.length - 1];

  return last.actual === undefined ||
    last.actual === null ||
    isString(last.actual)
    ? last.actual?.length === 0
    : false;
}

function isString(s: unknown): s is string {
  return typeof s === "string";
}

function getPathInInterface(context: Context): string {
  return context
    .filter((c) => c.key !== "")
    .map((c) => c.key)
    .join(".");
}
