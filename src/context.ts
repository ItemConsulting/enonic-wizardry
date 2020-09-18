import {run} from "enonic-fp/context";

export const runAsSuperUser = run({
  user: {
    login: "su",
    idProvider: 'system'
  }
});

export const runInDraftContext = run({
  branch: 'draft'
});
