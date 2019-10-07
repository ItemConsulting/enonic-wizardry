import { Either, isLeft, left, right } from "fp-ts/lib/Either";

export interface Validator {
  [key: string]: Array<ValidatorFunction>;
}

export interface ValidatorFunction {
  (value: any): Either<string, any>;
}

export interface Errors {
  errors: ErrorMap;
}

export interface ErrorMap {
  [key: string]: Array<Error>;
}

export type Error = string;

export function createValidator(
  validFunction: (value: any) => boolean,
  errorMessage: string
): ValidatorFunction {
  return x => (!validFunction(x) ? left(errorMessage) : right(x));
}

export function validate<T extends { [key: string]: any }>(
  obj: T,
  validator: Validator
): Either<Errors, T> {
  const errors: Errors = {
    errors: Object.keys(validator).reduce((result, key) => {
      return {
        ...result,
        [key]: validator[key]
          .map(f => f(obj[key]))
          .filter(isLeft)
          .map(err => err.left)
      };
    }, {})
  };

  const errorCount = Object.values(errors.errors)
    .map(array => array.length)
    .reduce((sum, next) => sum + next);

  return errorCount > 0 ? left(errors) : right(obj);
}
