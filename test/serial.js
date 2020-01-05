'use strict';

const assert = require('assert');
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

pigpio.configureClock(1, pigpio.CLOCK_PCM);

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

let baud = 115200;
let dataBits = 8;
let stopBits = 1;
let offset = 0;
let message = 'Hello world!';

output.waveAddSerial(baud, dataBits, stopBits, offset, message);

let waveId = output.waveCreate();

output.serialReadOpen(baud, dataBits);

if(waveId >= 0) {
  output.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (output.waveTxBusy()) { }

setTimeout(() => {
  let data = output.serialRead();
  assert.strictEqual(data, message, 'Serial data mismatch');
}, 10);


output.waveDelete(waveId);