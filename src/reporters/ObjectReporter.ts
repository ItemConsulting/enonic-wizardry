import { Context, ValidationError } from 'io-ts';
import { Reporter } from "io-ts/lib/Reporter";
import { fold } from 'fp-ts/lib/Either';

interface InvalidError {
  key: string;
  message: string;
}

export interface ErrorsByKey {
  [key: string]: Array<string>;
}

function getPathInInterface(context: Context): string {
  return context
    .filter(c => c.key !== "")
    .map(c => c.key)
    .join('.')
}

function getMessage(e: ValidationError): InvalidError {
  return e.message !== undefined
    ? {
      key: getPathInInterface(e.context),
      message: e.message
    }
    : {
      key: getPathInInterface(e.context),
      message: `Invalid value`
    }
}

function errorsByKey(arr: Array<InvalidError>): ErrorsByKey {
 return arr.reduce((res: ErrorsByKey, value: InvalidError) => {
    res[value.key] = (res[value.key] || []).concat([value.message]);
    return res;
  }, {});
}

export const ObjectReporter: Reporter<ErrorsByKey> = {
  report: (validation) =>
    errorsByKey(
      fold(
        (es: Array<ValidationError>) => es.map(getMessage),
        () => []
      )(validation)
    )
};
