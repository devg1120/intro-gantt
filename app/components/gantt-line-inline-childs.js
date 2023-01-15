import Component from '@glimmer/component';
import {computed,observer,get,set,setProperties} from '@ember/object';


export default class GanttLineInlineChildsComponent extends Component {
layout;
  classNames= ['gantt-line-inline-childs'];
  chart= null;
  parentLine= null;
  stripeWidth= 3;
  debounceTime= 0;
  childLines= null;
  periods= null;

  reloadPeriod= observer('parentLine.{dateStart,dateEnd,dayWidth}','childLines','childLines.@each.{dateStart,dateEnd,color}', function() {
    debounce(this, this.calculatePeriods, get(this, 'debounceTime'));
  });

  calculatePeriods() {

    // go through all jobs and generate compound child elements
    let chart = get(this, 'chart'),
        childs = get(this, 'childLines'),
        start = get(this, 'parentLine.dateStart'),
        end = get(this, 'parentLine.dateEnd');

    // generate period segments
    let periods = dateUtil.mergeTimePeriods(childs, start, end);

    // calculate width of segments
    if (periods && periods.length > 0) {
      periods.forEach(period => {
        period.width = chart.dateToOffset(period.dateEnd, period.dateStart, true);
        period.background = this.getBackgroundStyle(period.childs);
        period.style = htmlSafe(`width:${period.width}px;background:${period.background};`);
      });
    }

    set(this, 'periods', periods);
  };


 getBackgroundStyle(childs) {

    if (!isArray(childs) || childs.length === 0) {
      return 'transparent';
    }

    let colors = A(A(childs).getEach('color'));
    colors = colors.uniq(); // every color only once!
    colors = colors.sort(); // assure color-order always the same

    // single-color
    if (colors.length === 1) {
      return colors[0];
    }

    // multi-color
    let background = 'repeating-linear-gradient(90deg,'; // or 180? ;)
    let pxOffset = 0;
    let stripeWidth = get(this, 'stripeWidth');

    colors.forEach(color => {
      let nextOffset = pxOffset+stripeWidth;
      background+= `${color} ${pxOffset}px,${color} ${nextOffset}px,`;
      pxOffset = nextOffset;
    });

    background = background.substring(0, background.length-1) + ')';

    return background;
  };




}
