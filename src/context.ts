import {run} from "enonic-fp/context";
import {chain, IOEither} from "fp-ts/IOEither";
import {RunContext} from "enonic-types/context";

export function chainRun(runContext: RunContext)
  : <E, A, B>(f: (a: A) => IOEither<E, B>) => (ma: IOEither<E, A>) => IOEither<E, B> {

  return <E, A, B>(f: (a: A) => IOEither<E, B>) => chain((a: A) => run(runContext)(f(a)))
}

export const runAsSuperUser = run({
  user: {
    login: "su",
    idProvider: 'system'
  }
});

export const runInDraftContext = run({
  branch: 'draft'
});

export const chainRunAsSuperUser = chainRun({
  user: {
    login: "su",
    idProvider: 'system'
  }
});

export const chainRunInDraftContext = chainRun({
  branch: 'draft'
});
