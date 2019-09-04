import * as context from "enonic-fp/lib/context";

export function runAsSuperUser<A, B>(f: (p:A) => B) : (p: A) => B {
  return (params: A) => context.run({
    repository: 'com.enonic.cms.default',
    branch: 'draft',
    user: {
      login: 'su',
      idProvider: 'system'
    },
    principals: ["role:system.admin"]
  }, () => f(params));
}

export function runInDraftContext<A, B>(f: (p: A) =>  B) : (p: A) => B {
  return (params: A) => context.run({
    branch: 'draft'
  }, () => f(params));
}
