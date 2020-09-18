import {Context, ValidationError} from 'io-ts';
import {Reporter} from "io-ts/lib/Reporter";
import {fold} from 'fp-ts/Either';
import {ErrorDetail} from "enonic-fp/errors";

export const ErrorDetailReporter: Reporter<Array<ErrorDetail>> = {
  report: fold(
    (es) => es.map(validationErrorToErrorDetail),
    () => []
  )
};

function validationErrorToErrorDetail(err: ValidationError): ErrorDetail {
  return {
    key: getPathInInterface(err.context),
    message: err.message ?? 'Invalid value'
  };
}

function getPathInInterface(context: Context): string {
  return context
    .filter(c => c.key !== "")
    .map(c => c.key)
    .join('.')
}
