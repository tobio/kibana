/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { KibanaResponseFactory, RouteMethod } from '@kbn/core/server';
import type {
  RequestHandler,
  RequestHandlerContextBase,
} from '@kbn/core-http-server';
import { SpaceNotFoundError } from '../../utils/space_not_found_error';

/**
 * Wraps an Osquery route handler so a {@link SpaceNotFoundError} thrown while
 * resolving the active Kibana space is returned to the caller as a 404 instead
 * of bubbling out as a generic 500. See issue elastic/kibana#275119.
 */
export const withMissingSpaceHandler =
  <
    P,
    Q,
    B,
    Context extends RequestHandlerContextBase = RequestHandlerContextBase,
    Method extends RouteMethod = any,
    ResponseFactory extends KibanaResponseFactory = KibanaResponseFactory
  >(
    handler: RequestHandler<P, Q, B, Context, Method, ResponseFactory>
  ): RequestHandler<P, Q, B, Context, Method, ResponseFactory> =>
  async (context, request, response) => {
    try {
      return await handler(context, request, response);
    } catch (err) {
      if (err instanceof SpaceNotFoundError) {
        return response.notFound({
          body: { message: `Space '${err.spaceId}' not found` },
        });
      }

      throw err;
    }
  };
