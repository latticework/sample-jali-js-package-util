import { Injectable } from '@angular/core';

import { Errors, Iterables, TypeGuards } from '@jali-ms/util';

import { Greeting } from '../../entities/greeting';
import { Message } from '../../entities/message';

// Demonstrates:
// - module Errors
//   - http://jali-ms.io/reference/0.1/manual/overview.html#module-jali-ms-util-errors
//
//   - util.Errors.verifyBoolean
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-verifyBoolean
//
//   - util.Errors.verifyDefined:
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-verifyDefined
//
//   - util.Errors.verifyIterable:
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-verifyIterable
//
//   - util.Errors.verifyNotWhitespace:
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-verifyNotWhitespace
//
// - module Iterables
//   - http://jali-ms.io/reference/0.1/manual/overview.html#module-jali-ms-util-iterables
//
//   - util.Iterables.map:
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-map
//
// - module TypeGuards
//   - http://jali-ms.io/reference/0.1/manual/overview.html#module-jali-ms-util-type-guards
//
//   - util.TypeGuards.isError
//     - http://jali-ms.io/reference/0.1/function/index.html#static-function-map

@Injectable()
export class GreetingService {
  public constructor() { }

  /**
   * Calls the service host to generate greetings for the specified names
   * @param names name or names for which greetings will be generated
   * @param verify `true` if client should verify input; otherwise, `false`
   */
  public getGreetings(names: string | Iterable<string>, verify: boolean = false): Iterable<Greeting> {
    Errors.verifyBoolean('verify', verify);

    // Define local helper function.
    const buildErrorResult = (details: string) => [{
      name: 'missing',
      text: 'missing',
      details: details
    }];

    // Perform optional parameter validation.
    if (verify) {
      try
      {
        Errors.verifyDefined('names', names);
      }
      catch (e) {
        const details = TypeGuards.isError(e)
          ? `Error: '${e.name}: ${e.message}\nStack Trace: ${e.stack}'`
          : `Error: ${e.toString()}`;

        if (TypeGuards.isError(e)) {
          return buildErrorResult(details);
        }
      }

      try {
        if (typeof names === 'string') {
          Errors.verifyNotWhitespace('names', names);
        }
        else {
          Errors.verifyIterable('names', names);

          let index = -1;
          for (let name of names) {
            ++index;
            Errors.verifyNotWhitespace('names', name, `'names' element '${index}' is invalid.`);
          }
        }
      }
      catch (e) {
        const details = TypeGuards.isError(e)
          ? `Error: '${e.name}: ${e.message}\nStack Trace: ${e.stack}'`
          : `Error: ${e.toString()}`;

        if (TypeGuards.isError(e)) {
          return buildErrorResult(details);
        }
      }
    }

    // Build and send HTTP request to express server.
    const parameters = `?names=${[...(Iterables.map(names, n => `names=${n}`))].join('&')}`;
    const uri = `/api/greeting${parameters}`;

    // Switch to async/await semantics which are a lot easier to follow than callbacks.
    (async () => {
      var response = await fetch(uri, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Get result.
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.indexOf('application/json') !== -1;

      const text = await response.text();
      const message = isJson ? (await response.json()) as Message : undefined;

      // Process results.

      // If invalid.
      if (!isJson) {
        const details =
          `Error: Response '${response.status} ${response.statusText}' with invalid content. ` +
          `Content: '${text}'`;

        return buildErrorResult(details);
      }

      if (!response.ok) {
        // If invalid.
        var errors = message.errors;

        if (errors == undefined || !TypeGuards.isIterable(errors)) {
          const details = `Error: No data returned`;

          return buildErrorResult(details);
        }

        // Valid server errors.
        const details = [...errors].join('\n');

        return buildErrorResult(details);
      }

      const greetings = message.data;

      // If invalid.
      if (greetings == undefined || !TypeGuards.isIterable(greetings)) {
        const details = `Error: No data returned`;

        return buildErrorResult(details);
      }

      // Valid server data.
      return greetings;
    })();
  }
}
