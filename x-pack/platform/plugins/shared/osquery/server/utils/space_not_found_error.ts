/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Thrown by {@link OsqueryAppContextService.getActiveSpace} when the Kibana
 * space referenced by an incoming request URL does not exist. Route handlers
 * wrapped by `withMissingSpaceHandler` translate this to a 404 response.
 *
 * See issue elastic/kibana#275119.
 */
export class SpaceNotFoundError extends Error {
  constructor(public readonly spaceId: string) {
    super(`Space '${spaceId}' not found`);
    this.name = 'SpaceNotFoundError';
  }
}
