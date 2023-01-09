import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'intro-super-rentals/tests/helpers';

module('Acceptance | super rentals', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /super-rentals', async function (assert) {
    await visit('/super-rentals');

    assert.strictEqual(currentURL(), '/super-rentals');
  });
});
