import document from 'document';
import { Barometer } from 'barometer';
import { HeartRateSensor } from 'heart-rate';
import { init as setStateCallback } from '../state';
import clock from 'clock';
import { preferences } from 'user-settings';
import zeroPad from '../utils/zero-pad';

let $hr = null;
let $time = null;
let time = '--';
let hr = '--';
let hrm = null;
let bar = null;

function draw() {
  $hr.text = hr;
  if ($time) {
    $time.text = time;
  }
}

export function destroy() {
  console.log('destroy index page');
  hrm.stop();
  bar.stop();
  $hr = null;
  $time = null;
}

export function init() {
  var altitudeInFeetElement = document.getElementById('altitude');
  var pressureElement = document.getElementById('pressure');
  $hr = document.getElementById('hr');
  $time = document.getElementById('time');

  if (Barometer) {
    bar = new Barometer({ frequency: 1 });

    // Update the lavel with each reading from the sensor
    bar.addEventListener('reading', () => {
      altitudeInFeetElement.text =
        altitudeFromPressure(bar.pressure / 100) + ' meter';
      pressureElement.text = Math.round(bar.pressure / 100) + ' hPa';
    });

    // Begin monitoring the sensor
    bar.start();
  } else {
    console.log('no barometer available');
  }

  if (HeartRateSensor) {
    hrm = new HeartRateSensor({ frequency: 1 });
    hrm.addEventListener('reading', () => {
      hr = hrm.heartRate;
    });
    hrm.start();
  }

  clock.granularity = 'seconds'; // seconds if you like to show seconds or update stats every second, minutes if you only need it minutely
  // use function above on clock tick
  clock.ontick = (evt) => updateTime(evt.date);
  // use the function on start as well
  updateTime(new Date());

  setStateCallback(draw);

  draw();
}
function altitudeFromPressure(pressure) {
  return (1 - (pressure / 1013.25) ** 0.190284) * 145366.45;
}

// time

function updateTime(datetime) {
  const minute = datetime.getMinutes();
  const hour = datetime.getHours();
  let hours = hour;
  if (preferences.clockDisplay === '12h') {
    // 12h format
    hours = zeroPad(hours % 12 || 12);
  } else {
    // 24h format
    hours = zeroPad(hours);
  }
  const mins = zeroPad(minute);
  time = `${hours}:${mins}`;

  // draw every second to show time changes
  draw();
}
