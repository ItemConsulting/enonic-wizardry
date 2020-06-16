# Enonic Wizardry

[![npm version](https://badge.fury.io/js/enonic-wizardry.svg)](https://badge.fury.io/js/enonic-wizardry)

Functional utility library for Enonic XP. This library is intended to house reusable and tested code blocks based on [enonic-fp](https://github.com/ItemConsulting/enonic-fp) that can be used in every project.

## Enonic-fp

*Enonic-wizardry* is intended to supplement *enonic-fp* with common patterns. It would be very uncommon to use this library without also using *enonic-fp*.

## Code generation

We recommend using this library together with its sister library: [enonic-ts-codegen](https://github.com/ItemConsulting/enonic-ts-codegen). *enonic-ts-codegen* will create TypeScript `interfaces` for your content-types. Those interfaces will be very useful together with this library.

## Building the project

```bash
npm run build
```

## Usage

### Get content by key service

In this example we have a service that returns an article by the `key` as json. Or if something goes wrong, we return 
an _Internal Server Error_ instead.

```typescript
import { fold, map } from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Request, Response } from "enonic-types/lib/controller";
import { get as getContent } from "enonic-fp/lib/content";
import { errorResponse, ok } from "enonic-wizardry/lib/controller";
import { getContentDataWithId } from "enonic-wizardry/lib/content";
import { Article } from "../../site/content-types/article/article"; // 1

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
```

 1. We import an `interface Article { ... }` generated by [enonic-ts-codegen](https://github.com/ItemConsulting/enonic-ts-codegen).
 2. We use the imported `Request` and `Response` to control the shape of our controller.
 3. We use the `pipe` function from *fp-ts* to pipe the result of one function into the next one.
 4. We use the `get` function from `content` – here renamed `getContent` so it won't collide with the `get` function in the controller – to return some content where the type is `IOEither<EnonicError, Content<Article>>`.
 5. If we don't want to expose too much about the internal system, maybe we just want to return the `data` of the `Content`. But if we want to do operations on this data, we are going to need the `_id` of the content. The `getContentDataWithId<A>(content: Content<A>): WithId<A>` function takes content as input, and returns the union of the `data` and `{ _id: string }`.
 6. The last thing we usually do in a controller is to unpack the `IOEither`. This is done with `fold(handleError, handleSuccess)`.
 7. The `errorResponse(i18nPrefix: string)` function returns a new function that can be used as a _callback_ by `fold`. This "new function", takes the `EnonicError` object as a parameter, and creates a Json response with the correct status number, based on the `errorKey` of the `EnonicError`. 
 8. We pass the `ok` function to `fold` as the second parameter. The `ok` creates a `Response` where the `status` is `200`, and the parameter is the `body`. The content-type dependent on whether the parameter is a `string` (text/html), or anything else (application/json).
 9. We have so far constructed a constant `program` of type `IO<Response>`, but we have not yet performed a single sideeffect. It's time to perform those side effects, so we run the `IO` by calling it.

## API

 * [Content](./src/content.ts)
   * `publishFromDraftToMaster`
   * `publishContentByKey`
   * `applyChangesToData`
   * `createAndPublish`
   * `deleteAndPublish`
   * `modifyAndPublish`
   * `getContentDataWithId`
   * `createMediaFromAttachment`
   
 * [Context](./src/context.ts)
   * `runAsSuperUser`
   * `runInDraftContext`
   
 * [Controller](./src/controller.ts)
   * `status`
   * `errorResponse`
   * `unsafeRenderErrorPage`
   * `ok`
   * `created`
   * `noContent`
   * `redirect`
   * `badRequest`
   * `unauthorized`
   * `forbidden`
   * `notFound`
   * `methodNotAllowed`
   * `internalServerError`
   * `badGateway`
   
 * [Utils](src/array.ts)
   * `substringAfter`
   * `json`
   * `getUuidFromPath`
   * `forceArray`
   * `forceReadonlyArray`
   * `uuidv4`
   
 * [Validation](./src/validation.ts)
   * `validate`
