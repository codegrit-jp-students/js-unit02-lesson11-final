import moment from 'moment';
import App from '../src/index';
import template from './template';

describe('App.getHistory', () => {
  test('it should return collection', () => {
    const startOfToday = moment().startOf('day');
    const val1 = moment(startOfToday).subtract(5, 'days').add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).subtract(5, 'days').add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    expect(App.getHistory()).toContain(val1);
    localStorage.clear();
  });
});

describe('removeOldHistory', () => {
  test('it should remove old history items', () => {
    const startOfToday = moment().startOf('day');
    const val1 = moment(startOfToday).subtract(8, 'days').add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).subtract(5, 'days').add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    document.body.innerHTML = template;
    const app = new App();
    localStorage.setItem('intervalData', JSON.stringify(collection));
    app.removeOldHistory();
    expect(App.getHistory()).not.toContain(val1);
    expect(App.getHistory()).toContain(val2);
    localStorage.clear();
  });
});

describe('saveIntervalData', () => {
  test('it should save array of items', () => {
    document.body.innerHTML = template;
    const app = new App();
    const startOfToday = moment().startOf('day');
    const item = moment(startOfToday).subtract(5, 'days').add(60, 'minutes');
    app.saveIntervalData(item);
    expect(JSON.parse(localStorage.getItem('intervalData'))).toContain(item.valueOf());
    localStorage.clear();
  });
});

describe('startTimer', () => {
  test('it should disable start button', () => {
    document.body.innerHTML = template;
    const app = new App();
    app.startTimer();
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    expect(startButton.disabled).toEqual(true);
    expect(stopButton.disabled).toEqual(false);
    expect(app.isTimerStopped).toEqual(false);
  });
  test('startAtとendAtを適切に設定する。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    app.startTimer(null, now);
    expect(app.startAt.valueOf()).toEqual(now.valueOf());
    expect(app.endAt.valueOf()).toEqual(now.add(25, 'minutes').valueOf());
  });
  test('一時停止からの再スタート時に、一時停止されていた分の時間分、終了時間を伸ばす。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minute');
    app.pausedAt = moment(startOfToday).add(15, 'minute');
    app.startTimer(null, moment(startOfToday).add(20, 'minute'));
    expect(app.endAt.valueOf())
      .toEqual(moment(startOfToday).add(30, 'minute').valueOf());
  });
});

describe('updateTimer', () => {
  test('it should update the time display', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    app.updateTimer(moment(startOfToday).add(10, 'seconds'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('24:50');
  });

  test('it should switch from work to break after work session end', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    const endAt = moment(startOfToday).add(25, 'minutes');
    app.endAt = endAt;
    app.updateTimer(moment(startOfToday).add(25, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('5:00');
    expect(app.onWork).not.toBeTruthy();
    expect(app.getHistory()).toEqual([endAt.add(100, 'millisecond').valueOf()]);
    expect(app.tempCycles).toEqual(1);
  });

  test('it should switch from work to long break afte each 4 work sessions', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.tempCycles = 3;
    app.startAt = startOfToday;
    const endAt = moment(startOfToday).add(25, 'minutes');
    app.endAt = endAt;
    app.updateTimer(moment(startOfToday).add(25, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('15:00');
    expect(app.onWork).not.toBeTruthy();
    expect(app.tempCycles).toEqual(0);
  });

  test('it should switch from break to start after break end', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.onWork = false;
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(5, 'minutes');
    app.updateTimer(moment(startOfToday).add(5, 'minutes').add(100, 'millisecond'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('25:00');
    expect(app.onWork).toBeTruthy();
  });
});

describe('pauseTimer', () => {
  test('it should update the button status', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    app.pauseTimer(null, moment(startOfToday).add(15, 'minute'));
    expect(app.startButton.disabled).not.toBeTruthy();
    expect(app.timerUpdater).toBe(null);
    expect(app.pausedAt.valueOf()).toEqual(moment(app.startAt.add(15, 'minute')).valueOf());
  });
});

describe('stopTimer', () => {
  test('it should reset the timer', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(now).add(20, 'minutes');
    app.stopTimer();
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('25:00');
    expect(app.onWork).toBeTruthy();
    expect(app.isTimerStopped).toBeTruthy();
    expect(app.startButton.disabled).not.toBeTruthy();
  });
});

describe('displayTime', () => {
  test('初期化時に25:00を表示する。', () => {
    document.body.innerHTML = template;
    const app = new App();
    const timeDisplay = document.getElementById('time-display');
    expect(app.isTimerStopped).toBeTruthy();
    expect(timeDisplay.innerHTML).toEqual('25:00');
  });

  test('it should show the time of countdown', () => {
    document.body.innerHTML = template;
    const app = new App();
    const now = moment();
    const startOfToday = now.startOf('day');
    app.startButton.disabled = true;
    app.stopButton.disabled = false;
    app.isTimerStopped = false;
    app.startAt = startOfToday;
    app.endAt = moment(startOfToday).add(25, 'minutes');
    app.displayTime(moment(startOfToday).add(51, 'seconds'));
    const timeDisplay = document.getElementById('time-display');
    expect(timeDisplay.innerHTML).toEqual('24:09');
  });
});

describe('displayCyclesToday', () => {
  test('it should show the numbrer of finished work sessions on the day', () => {
    document.body.innerHTML = template;
    const app = new App();
    const startOfToday = moment().startOf('day');
    const time = moment(startOfToday).add(5, 'hours');
    const val1 = moment(startOfToday).add(30, 'minutes').valueOf();
    const val2 = moment(startOfToday).add(60, 'minutes').valueOf();
    const collection = [val1, val2];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    app.displayCyclesToday(time);
    const countToday = document.getElementById('count-today');
    const percentToday = document.getElementById('percent-today');
    expect(countToday.innerHTML).toEqual('2回 / 4回');
    expect(percentToday.innerHTML).toEqual('目標を50％達成中です。');
    localStorage.clear();
  });
});

describe('displayHistory', () => {
  test('it should show the numbrer of finished work sessions up to 7 days ago', () => {
    document.body.innerHTML = template;
    const startOfToday = moment().startOf('day');
    const SevenDaysAgo = moment(startOfToday).subtract(7, 'days');
    const val1 = moment(SevenDaysAgo).add(50, 'minutes').valueOf();
    const val2 = moment(SevenDaysAgo).add(80, 'minutes').valueOf();
    const val3 = moment(SevenDaysAgo).add(2, 'days').add('3', 'hours').valueOf();
    const val4 = moment(SevenDaysAgo)
      .add(3, 'days')
      .add('2', 'hours')
      .valueOf();
    const collection = [val1, val2, val3, val4];
    localStorage.setItem('intervalData', JSON.stringify(collection));
    const app = new App();
    const sevenDaysAgoTh = document.getElementsByTagName('th')[0];
    const fiveDaysAgoTh = document.getElementsByTagName('th')[2];
    const sevenDaysAgoTd = document.getElementsByTagName('td')[0];
    const fiveDaysAgoTd = document.getElementsByTagName('td')[2];
    expect(sevenDaysAgoTh.innerHTML).toEqual(SevenDaysAgo.format('MM月DD日'));
    expect(fiveDaysAgoTh.innerHTML).toEqual(SevenDaysAgo.add(2, 'days').format('MM月DD日'));
    expect(sevenDaysAgoTd.innerHTML).toEqual('2回<br>達成率50%');
    expect(fiveDaysAgoTd.innerHTML).toEqual('1回<br>達成率25%');
    expect(app.getHistory().length).toEqual(4);
    localStorage.clear();
  });
});
