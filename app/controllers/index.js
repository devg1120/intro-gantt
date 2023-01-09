import Controller from '@ember/controller';

export default class IndexController extends Controller {
  constructor() {
    super(...arguments);
    this.dayWidth = 20;
    let today = new Date();
    today.setDate(today.getDate() - 10);
    this.viewStartDate = today;
    this.viewEndDate = null;
    this.headerTitle = 'Project/Job';
  }
}
