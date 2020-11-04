import {Context, ValidationError} from 'io-ts';
import {Reporter} from "io-ts/lib/Reporter";
import {fold} from 'fp-ts/Either';
import {ErrorDetail} from "enonic-fp/errors";
import {localizeFirst} from "enonic-fp/i18n";
import {pipe} from "fp-ts/pipeable";
import {getOrElse} from "fp-ts/Option";

export function getErrorDetailReporter(i18nKey?: string): Reporter<Array<ErrorDetail>> {
  return {
    report: fold(
      (es) => es.map(err => validationErrorToErrorDetail(err, i18nKey)),
      () => []
    )
  }
}

function validationErrorToErrorDetail(err: ValidationError, i18nPrefix = "errors"): ErrorDetail {
  const key = getPathInInterface(err.context);

  return pipe(
    getMessageKeys(key, isLastEmpty(err.context), i18nPrefix),
    localizeFirst,
    getOrElse(() => err.message ?? 'Invalid value'),
    (message) => (
      {
        key,
        message
      }
    )
  );
}

function getMessageKeys(key: string, fieldIsEmpty: boolean, i18nPrefix?: string) {
  const keyedMessageKeys = [
    `${i18nPrefix}.bad-request-error.${key}`,
    `${i18nPrefix}.400.${key}`,
    `${i18nPrefix}.${key}`
  ];

  const emptyMessageKeys =  [
    `errors.bad-request-error.defaultEmpty`,
    `errors.400.defaultEmpty`
  ];

  const defaultMessageKeys = [
    `${i18nPrefix}.bad-request-error`,
    `${i18nPrefix}.400`,
    `errors.bad-request-error.default`,
    `errors.400.default`
  ];

  return keyedMessageKeys
    .concat(fieldIsEmpty ? emptyMessageKeys : [])
    .concat(defaultMessageKeys);
}

/**
 * Used for i18n to differenciate empty value
 */
function isLastEmpty(context: Context): boolean {
  const entries = context.filter(c => c.key !== "");
  const last = entries[entries.length - 1];

  return (last.actual === undefined)
    || (last.actual === null)
    || isString(last.actual)
      ? last.actual?.length === 0
      : false
}

function isString(s: unknown): s is string {
  return typeof s === "string";
}

function getPathInInterface(context: Context): string {
  return context
    .filter(c => c.key !== "")
    .map(c => c.key)
    .join('.')
}
