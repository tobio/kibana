/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreStart } from '@kbn/core-lifecycle-server';
import { SavedObjectsClient } from '@kbn/core-saved-objects-api-server-internal';
import { kibanaRequestFactory } from '@kbn/core-http-server-utils';
import { asSpaceId, DEFAULT_SPACE_ID } from '@kbn/core-spaces-common';
import { SECURITY_EXTENSION_ID } from '@kbn/core-saved-objects-server';
import type { KibanaRequest } from '@kbn/core-http-server';
import type { OsqueryAppContext } from '../lib/osquery_app_context_services';

export { SpaceNotFoundError } from './space_not_found_error';

type OsqueryContextForSpaceId = Pick<OsqueryAppContext, 'getStartServices'> & {
  service: Pick<OsqueryAppContext['service'], 'getActiveSpace'>;
};

export async function getInternalSavedObjectsClient(coreStart: CoreStart) {
  return new SavedObjectsClient(coreStart.savedObjects.createInternalRepository());
}

export function getInternalSavedObjectsClientForSpaceId(
  coreStart: CoreStart,
  spaceId?: string
): SavedObjectsClient {
  const request = kibanaRequestFactory({
    headers: {},
    route: { settings: {} },
    url: { href: '', hash: '' } as URL,
    raw: { req: { url: '/' } } as any,
    spaceId: spaceId ? asSpaceId(spaceId) : undefined,
  });

  // soClient as kibana internal users, be careful on how you use it, security is not enabled
  return coreStart.savedObjects.getScopedClient(request, {
    excludedExtensions: [SECURITY_EXTENSION_ID],
  }) as SavedObjectsClient;
}

export async function createInternalSavedObjectsClientForSpaceId(
  osqueryContext: OsqueryContextForSpaceId,
  request: KibanaRequest
): Promise<SavedObjectsClient> {
  // `getActiveSpace` throws `SpaceNotFoundError` if the request targets a
  // non-existent Kibana space; routes wrapped by `withMissingSpaceHandler`
  // translate that to a 404 response.
  const space = await osqueryContext.service.getActiveSpace(request);
  const [core] = await osqueryContext.getStartServices();

  return getInternalSavedObjectsClientForSpaceId(core, space?.id ?? DEFAULT_SPACE_ID);
}
