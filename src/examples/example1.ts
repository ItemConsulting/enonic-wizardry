import {fold} from "fp-ts/lib/IOEither";
import {pipe} from "fp-ts/lib/pipeable";
import {Request, Response} from "enonic-types/controller";
import {errorResponse, ok} from "enonic-fp/controller";
import {Article} from "../../site/content-types/article/article";
import {getContentByIds} from "../content";
import {forceArray} from "enonic-fp/array";

export function get(req: Request): Response { // 2
  const keys: Array<string> = forceArray(req.params.key) // ["key1", "key2", "key3"]

  const program = pipe( // 3
    getContentByIds<Article>(keys),
    fold( // 6
      errorResponse(req), // 7
      ok // 8
    )
  );

  return program(); // 9
}
