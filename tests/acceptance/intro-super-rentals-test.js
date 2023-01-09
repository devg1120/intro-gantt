import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'intro-super-rentals/tests/helpers';

module('Acceptance | intro super rentals', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /intro-super-rentals', async function (assert) {
    await visit('/intro-super-rentals');

    assert.strictEqual(currentURL(), '/intro-super-rentals');
  });
});
