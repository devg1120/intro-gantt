import { module, test } from 'qunit';
import { setupTest } from 'intro-super-rentals/tests/helpers';

module('Unit | Controller | gantt-chart', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:gantt-chart');
    assert.ok(controller);
  });
});
