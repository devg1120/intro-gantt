import { module, test } from 'qunit';
import { setupTest } from 'intro-super-rentals/tests/helpers';

module('Unit | Service | gantt-chart', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:gantt-chart');
    assert.ok(service);
  });
});
