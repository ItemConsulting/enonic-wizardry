import * as context from "enonic-fp/lib/context";

export function runAsSuperUser<T>(f: () => T) {
  return context.run({
    repository: 'com.enonic.cms.default',
    branch: 'draft',
    user: {
      login: 'su',
      idProvider: 'system'
    },
    principals: ["role:system.admin"]
  }, f);
}

export function runInDraftContext<T>(f: () => T) {
  return context.run({
    branch: 'draft'
  }, f);
}
