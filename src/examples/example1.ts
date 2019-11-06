  import {fold, map} from "fp-ts/lib/IOEither";
  import { pipe } from "fp-ts/lib/pipeable";
  import { Request, Response } from "enonic-types/lib/controller";
  import { get as getContent } from "enonic-fp/lib/content";
  import { errorResponse, ok } from "../controller";
  import { Article } from "../../site/content-types/article/article";
  import { getContentDataWithId } from "../content"; // 1

  export function get(req: Request): Response { // 2
    const program = pipe( // 3
      getContent<Article>({ // 4
        key: req.params.key!
      }),
      map(getContentDataWithId), // 5
      fold( // 6
        errorResponse('article.error'), // 7
        ok // 8
      )
    );

    return program(); // 9
  }
