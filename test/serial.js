'use strict';

const assert = require('assert');
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

let baud = 115200;
let dataBits = 8;
let stopBits = 1;
let offset = 0;
let message = 'Hello world!';

output.waveAddSerial(baud, dataBits, stopBits, offset, message);

let waveId = output.waveCreate();

// output.glitchFilter(Math.ceil(0.001 / baud * 2));

output.serialReadOpen(baud, dataBits);
output.enableAlert();

output.on('alert', (level, tick) => {
  console.log('alert');
  let data = output.serialRead();
  console.log(data);
});

if(waveId >= 0) {
  output.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (output.waveTxBusy()) { }

output.waveDelete(waveId);
output.disableAlert();