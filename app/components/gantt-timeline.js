import Component from '@glimmer/component';


import {computed,observer,get,set,setProperties} from '@ember/object';
import {alias} from '@ember/object/computed';
//import {htmlSafe} from '@ember/string';
import {htmlSafe} from '@ember/template';
import {isEqual,isNone} from '@ember/utils';
import {bind} from '@ember/runloop';
import {action} from '@ember/object';

import layout from './gantt-timeline';

import dateUtil from '../utils/date-util';
//import Component from '@ember/component';
//import layout from '../templates/components/gantt-timeline';
//import moment from 'moment';
//import momentFormat from 'ember-moment/computeds/format';

export default class GanttTimelineComponent extends Component {
  layout
  classNames= ['gantt-timeline'];

  chart=null;
  @alias('chart.viewStartDate') viewStartDate;
  @alias('chart.viewEndDate') viewEndDate;

  // today
  @alias('chart.showToday') showToday;
  @computed('viewStartDate', 'dayWidth') 
  get todayStyle() {
    let today = dateUtil.getNewDate();
    let offsetLeft = get(this, 'chart').dateToOffset(today, null, false);

    return htmlSafe(`left:${offsetLeft}px;`);
  }

  // in-page styles
  @alias('chart.dayWidth') dayWidth;
  @computed('dayWidth')
  get dayWidthPx() {
    return htmlSafe(`${get(this, 'dayWidth')}px`);
  };
  @computed('dayWidth')
  get cwWidthPx() {
    let width = get(this, 'dayWidth')*7;
    return htmlSafe(`${width}px`);
  };

  // sticky header
  headerElement= null;
  @alias('chart.headerTitle') headerTitle;
  @alias('chart.scrollLeft') scrollLeft;
  @alias('chart.stickyOffset') stickyOffset;
  stickyStyle= htmlSafe('');
  stickyPlaceholderStyle= htmlSafe('');
  isSticky= false;
/*
  constructor() {
    super(...arguments);
    this._handleDocScroll = bind(this, this.checkSticky);
  }
  */
  constructor(owner, args) {
    super(owner, args);
    this.chart = args.chart;
    this._handleDocScroll = bind(this, this.checkSticky);

  
  }

  @action
  registerListener(element) {

    //set(this, 'headerElement', this.element.querySelector('.gantt-chart-header'));
    set(this, 'headerElement', document.querySelector('.gantt-chart-header'));

    // init sticky
    if (!isNone(get(this, 'stickyOffset'))) {
      element.addEventListener('scroll', this._handleDocScroll);
    }

    // init timeline scale
    if (get(this, 'autoTimeline')) {
      this.evaluateTimlineElements();
    }
  }


/*
  didInsertElement() {
    this._super(...arguments);

    set(this, 'headerElement', this.element.querySelector('.gantt-chart-header'));

    // init sticky
    if (!isNone(get(this, 'stickyOffset'))) {
      document.addEventListener('scroll', this._handleDocScroll);
    }

    // init timeline scale
    if (get(this, 'autoTimeline')) {
      this.evaluateTimlineElements();
    }
  },

  willDestroyelement() {
    this._super(...arguments);

    if (!isNone(get(this, 'stickyOffset'))) {
      document.removeEventListener('scroll', this._handleDocScroll);
    }
  },
*/

  // STICKY
  // -------------------
  checkSticky(/*e*/) {
    let offset = get(this, 'headerElement').getBoundingClientRect().top || 0;

    if (!get(this, 'isSticky') && offset < get(this, 'stickyOffset')) {
      this.makeSticky();

    } else if(get(this, 'isSticky') && offset > get(this, 'stickyOffset')) {
      this.resetSticky();
    }
  };
  onResize= observer('ganttWidth', function() {
    this.updateSticky();
  });
  makeSticky() {
    set(this, 'isSticky', true);
    this.updateSticky();
  };
  updateSticky() {
    if (get(this, 'isSticky')) {
      let stickyOffset = get(this, 'stickyOffset');
      let ganttWidth = get(this, 'chart.ganttWidth');
      let ganttLeft = get(this, 'chart.element').getBoundingClientRect().left;
      let headerHeight = get(this, 'headerElement.offsetHeight');

      set(this, 'stickyStyle', htmlSafe(`top:${stickyOffset}px;left:${ganttLeft}px;width:${ganttWidth}px;height:${headerHeight}px;`));
      set(this, 'stickyPlaceholderStyle', htmlSafe(`height:${headerHeight}px;`));
    }
  };
  resetSticky() {
    set(this, 'isSticky', false);
    set(this, 'stickyStyle', htmlSafe(''));
    set(this, 'stickyPlaceholderStyle', htmlSafe(''));
  };


  @computed('viewStartDate', 'viewEndDate', 'dayWidth') 
  get scaleWidth() {
    let width = (get(this, 'dayWidth') * parseInt(dateUtil.diffDays(get(this,'viewStartDate'), get(this,'viewEndDate'), true)));
    return width;
  };

  // timeline scroll needs to be manually adjusted, as position-fixed does not inherit scrolling
  @computed('scaleWidth', 'isSticky','scrollLeft')
  get scaleStyle() {

    // total width
    let scaleWidth = get(this, 'scaleWidth');
    let style = `width:${scaleWidth}px;`;

    if (get(this, 'isSticky')) {
      style+= `left:-${get(this,'scrollLeft')}px;`;
    }
    return htmlSafe(style);
  };

  autoTimeline  = true;

  timelineDay   = true;
  timelineCW    = true;
  timelineMonth = true;
  timelineYear  = true;


  autoViewObs = observer('dayWidth', 'autoTimeline', function() {
    if (get(this, 'autoTimeline')) {
      this.evaluateTimlineElements();
    }
  });

  evaluateTimlineElements() {
    let dayWidth = get(this, 'dayWidth');
    let views = { timelineDay: true, timelineCW: true, timelineMonth: true, timelineYear: false }

    if (dayWidth < 15) { // cw's instead of days
      views.timelineDay = false;
      views.timelineCW = true;
    }

    if (dayWidth < 5) { // months
      views.timelineMonth = true;
    }

    if (dayWidth < 1) { // year
      views.timelineYear = true;
      views.timelineMonth = false;
      views.timelineCW = false;
    }

    setProperties(this, views);
  };


  @computed('viewStartDate', 'viewEndDate','dayWidth') 
  get timelineScale() {

    let start = dateUtil.getNewDate(get(this, 'viewStartDate')),
        end = dateUtil.getNewDate(get(this, 'viewEndDate')),
        dayWidth = get(this, 'dayWidth');

    if (!start || !end || !(start<end)) {
      return [];
    }

    let actDate = dateUtil.getNewDate(start.getTime()),
        months = [];

    // MONTHS AND DAYS
    while(actDate < end) {

      // from/to days
      let startDay = 1;
      let lastDay = dateUtil.daysInMonth(actDate);

      // first month
      if (isEqual(start, actDate)) {
        startDay = actDate.getDate();
      } else {
        actDate.setDate(1);
      }

      // last month
      if (actDate.getMonth()===end.getMonth() && actDate.getFullYear()===end.getFullYear()) {
        lastDay = end.getDate();
      }

      // month data
      let month = {
        date: dateUtil.getNewDate(actDate),
        totalDays: lastDay,
        days: [],
        width: ((lastDay - startDay) +1) * dayWidth,
      };

      month.style = htmlSafe(`width:${month.width}px`);

      // iterate all days to generate data-array
      for(let d=startDay; d<=lastDay; d++) {
        let dayDate = dateUtil.getNewDate(actDate);
        month.days.push({
          nr: d,
          date: dayDate.setDate(d),
          isWeekend: ([0,6].indexOf(dayDate.getDay()) >=0),
        });
      }

      // add days to month
      months.push(month);
      actDate.setMonth(actDate.getMonth()+1);
    }

    // CWs
    let cws = [];
    if (get(this, 'timelineCW')) {
      let firstCW = dateUtil.getCW(start);
      let firstWD = start.getDay() || 7; // Sunday -> 7
      let firstCWrest = 8 - firstWD;

      // first cw
      cws.push({ date: firstCW, nr: dateUtil.getCW(start), width: htmlSafe('width: '+(firstCWrest * dayWidth)+'px;') }); // special width for first/last

      // middle cws
      actDate = dateUtil.datePlusDays(start, firstCWrest);
      while(actDate <= end) {
        cws.push({ date: dateUtil.getNewDate(actDate), nr: dateUtil.getCW(actDate) });
        actDate.setDate(actDate.getDate() + 7); // add 7 days
      }

      // adjust last cw
      let lastCWrest = dateUtil.diffDays(cws[cws.length - 1].date, end, true);
      cws[cws.length - 1].width = htmlSafe('width: '+(lastCWrest * dayWidth)+'px');
    }

    return {
      months,
      calendarWeeks: cws
    }
  };
  
}
