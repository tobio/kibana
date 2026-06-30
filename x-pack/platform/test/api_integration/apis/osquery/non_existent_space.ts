/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Test } from 'supertest';
import type { FtrProviderContext } from '../../ftr_provider_context';

// Regression coverage for https://github.com/elastic/kibana/issues/275119.
//
// Osquery routes used to call `getActiveSpace` while resolving the URL's
// Kibana space, but the saved-object not-found error thrown by Spaces when
// the space did not exist was never caught — it bubbled up as a generic 500.
// A `withMissingSpaceHandler` wrapper now translates that to a 404. These
// tests cover one representative route per major group so the wrapper's
// presence is asserted across families, not just one.
export default function ({ getService }: FtrProviderContext) {
  const supertest = getService('supertest');
  const apiVersion = '2023-10-31';

  const expectMissingSpace404 = (request: Test) =>
    request.set('kbn-xsrf', 'true').set('elastic-api-version', apiVersion).expect(404);

  describe('Osquery routes return 404 for non-existent spaces', () => {
    const missing = (suffix: string) => `/s/space-does-not-exist/api/osquery${suffix}`;

    it('packs find', async () => {
      await expectMissingSpace404(supertest.get(missing('/packs')));
    });

    it('saved_queries find', async () => {
      await expectMissingSpace404(supertest.get(missing('/saved_queries')));
    });

    it('saved_queries read', async () => {
      await expectMissingSpace404(supertest.get(missing('/saved_queries/any-id')));
    });

    it('live_queries find', async () => {
      await expectMissingSpace404(supertest.get(missing('/live_queries')));
    });

    it('live_queries details', async () => {
      await expectMissingSpace404(supertest.get(missing('/live_queries/any-action-id')));
    });

    it('fleet_wrapper agent_policies', async () => {
      await expectMissingSpace404(supertest.get(missing('/fleet_wrapper/agent_policies')));
    });

    it('fleet_wrapper package_policies', async () => {
      await expectMissingSpace404(supertest.get(missing('/fleet_wrapper/package_policies')));
    });

    it('status', async () => {
      await expectMissingSpace404(supertest.post(missing('/status')));
    });
  });
}
