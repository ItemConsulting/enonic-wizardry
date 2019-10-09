import { run } from "enonic-fp/lib/context";
import { IO } from "fp-ts/lib/IO";

export function runAsSuperUser<A>(a: IO<A>): IO<A> {
  return run<A>({
    user: {
      login: "su",
      idProvider: 'system'
    }
  })(a);
}

export function runInDraftContext<A>(a: IO<A>): IO<A> {
  return run<A>({
    branch: 'draft'
  })(a);
}
