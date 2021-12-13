import { run } from "enonic-fp/context";
import { chain, IOEither } from "fp-ts/IOEither";
import { ContextAttributes, RunContext } from "/lib/xp/context";

export function chainRun<Attributes extends ContextAttributes>(
  runContext: RunContext<Attributes>
): <E, A, B>(
  f: (a: A) => IOEither<E, B>
) => (ma: IOEither<E, A>) => IOEither<E, B> {
  return <E, A, B>(f: (a: A) => IOEither<E, B>) =>
    chain<E, A, B>((a: A) => run(runContext)(f(a)));
}

export const runAsSuperUser = run({
  user: {
    login: "su",
    idProvider: "system",
  },
});

export const runInDraftContext = run({
  branch: "draft",
});

export const chainRunAsSuperUser = chainRun({
  user: {
    login: "su",
    idProvider: "system",
  },
});

export const chainRunInDraftContext = chainRun({
  branch: "draft",
});
