//import Component from '@glimmer/component';
//import { service } from '@ember/service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import EmberObject from '@ember/object';
import MinMaxChildDatesMixin from '../mixins/min-max-child-dates-mixin';
import { alias } from '@ember/object/computed';
import dateUtil from '../utils/date-util';

import { addObserver, removeObserver } from '@ember/object/observers';

/*
const jobTypes = [{
      title: 'Concept',
      color: '#d84599'
    },{
      title: 'Design',
      color: '#71b5a0'
    },{
      title: 'Programming',
      color: '#e5ce42'
    }];
*/

export default class GanttChartComponent extends Component {
  layout;
  classNames= 'gantt-chart';
  classNameBindings= ['ganttChartViewDay','ganttChartViewWeek','ganttChartViewMonth'];

  @service('gantt-chart') gantt;
  /*
  constructor() {
    super();
    //this.projects = this.get();
    //this.projects = this.gantt.getDataScenario1();
    // this.projects = this.getDataScenario1();
    this.projects = [];
   
  }
*/
    dayWidth = 99;
  constructor() {
    super(...arguments);

    this.viewStartDate = null;
    this.viewEndDate = null;
    this.onViewDateChange = null;

    this.dayWidth = 20;
    this.showToday = true;
    this.headerTitle = '';
    this.ganttWidth = 0;
    this.innerElement = null;
    this.stickyOffset = 0;
    this.scrollLeft = 0;
    this.infinityScroll = true;

    this.viewStartDate = dateUtil.getNewDate();
    let endDate = dateUtil.getNewDate(this.viewStartDate);
    endDate.setMonth(endDate.getMonth() + 3);
    this.viewEndDate = endDate;

    /*
    this.dayWidth = 20;
    this.viewStartDate = null;
    this.viewEndDate = null;

    // start-end date
    let today = new Date();
    today.setDate(today.getDate() - 10);
    this.viewStartDate = today;
*/
    //this.projects = this.gantt.getTest();

    //this.projects = this.gantt.getTest2();
    this.projects = this.gantt.getTest3();

    //this.projects = this.gantt.getDataScenario1();

    // bind listener functions
    //this._handleScroll = bind(this, this.updateScroll);
    //this._handleResize = bind(this, this.updateResize);

    //addObserver(this, 'viewStartDate', this.updateResize);
    //addObserver(this, 'viewEndDate', this.updateResize);
    //addObserver(this, 'dayWidth', this.updateResize);

    /*  OK
   this.projects = new Array();
   var pj1 = new Map();
   var pj2 = new Map();
   var pj3 = new Map();
   pj1["title"] = "AAAAA";
   pj2["title"] = "BBBBB";
   pj3["title"] = "CCCCC";
   this.projects.push(pj1);
   this.projects.push(pj2);
   this.projects.push(pj3);
   */
  }

  /*
  didInsertElement() {
    //super(...arguments);

    // inner-scroll listener
    //-set(this, 'innerElement', this.element.querySelector('.gantt-chart-inner'));
    //-get(this, 'innerElement').addEventListener('scroll', this._handleScroll);

    this.innerElement = document.querySelector('.gantt-chart-inner');
    if (this.innerElement) {
    this.innerElement.addEventListener('scroll', this._handleScroll);

    // resize listener
    this.updateResize();
    window.addEventListener('resize', this._handleResize);
    }
  };
  */
  /*
  willDestroyelement() {
    //super(...arguments);

    //-get(this, 'innerElement').removeEventListener('scroll', this._handleScroll);
    this.innerElement.removeEventListener('scroll', this._handleScroll);

    window.removeEventListener('resize', this._handleResize);
  };
*/

  dateToOffset(date, startDate, includeDay) {
    let dayWidth = parseInt(this.dayWidth) || 0;

    startDate = startDate || this.viewStartDate;
    startDate = dateUtil.getNewDate(startDate); // assure UTC
    includeDay = isNone(includeDay) ? false : includeDay;

    if (
      isNone(date) ||
      isNone(startDate) ||
      typeof date.getTime !== 'function'
    ) {
      return 0;
    }

    let diffDays = dateUtil.diffDays(startDate, date, includeDay);
    let offset = diffDays * dayWidth; // borders: border-width can be omitted using `border-box`

    return offset;
  }

  offsetToDate(pixelOffset) {
    let startDate = dateUtil.getNewDate(this.viewStartDate);
    let dayWidth = parseInt(this.dayWidth) || 0;

    let days = pixelOffset / dayWidth;

    let newDateTime = startDate.getTime() + days * 86400000;
    return dateUtil.getNewDate(newDateTime);
  }

  //                SCROLL & ENDLESS/INFINITY
  //
  // scroll-event for endless/infinit-scroll and timeline scroll in sticky position
  //

  updateScroll(e) {
    this.scrollLeft(e.target.scrollLeft);

    if (this.infinityScroll) {
      this.checkInfinityScroll(e);
    }
  }

  //- refreshWidths: observer('viewStartDate','viewEndDate','dayWidth', function() {
  //-   this.updateResize();
  //- });

  updateResize(/*e*/) {
    this.ganttWidth = this.element.offsetWidth;
    let totalWidth = this.dateToOffset(
      this.viewEndDate,
      this.viewStartDate,
      true
    );
    this.totalWidth = totalWidth;
  }

  checkInfinityScroll(e) {
    let target = e.target;
    let sum = target.offsetWidth + target.scrollLeft;

    if (sum >= target.scrollWidth) {
      this.expandView({ right: true });
    } else if (target.scrollLeft == 0) {
      this.expandView({ left: true });
    }
  }

  expandView(directions) {
    let numDays = Math.ceil(this.ganttWidth / this.dayWidth);

    // expand left/right
    if (directions.right) {
      let newEndDate = dateUtil.datePlusDays(this.viewEndDate, numDays);
      this.viewEndDate = newEndDate;
    } else if (directions.left) {
      let newStartDate = dateUtil.datePlusDays(
        this.viewStartDate,
        numDays * -1
      );
      this.viewStartDate = newStartDate;

      // set new scrollOffset
      this.innerElement.scrollLeft =
        this.innerElement.scrollLeft + this.ganttWidth;
    }

    // fire callback
    let callback = this.onViewDateChange;
    if (typeof callback === 'function') {
      callback(this.viewStartDate, this.viewEndDate);
    }
  }
}
