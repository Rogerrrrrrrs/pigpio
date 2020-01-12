'use strict';

const assert = require('assert');
const pigpio = require('../');
const Gpio = pigpio.Gpio;

const outPin = 17;
const output = new Gpio(outPin, {mode: Gpio.OUTPUT});

let baud = 19200;
let dataBits = 8;
let stopBits = 1;
let offset = 0;
let message = 'Serial test passed';

pigpio.waveAddSerial(outPin, baud, dataBits, stopBits, offset, message);

let waveId = pigpio.waveCreate();

output.serialReadOpen(baud, dataBits);

if(waveId >= 0) {
  pigpio.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (pigpio.waveTxBusy()) { }

setTimeout(() => {
  let data = output.serialRead(message.length);
  assert.strictEqual(data.toString(), message, 'Serial data mismatch');
  console.log(data.toString());
}, 10);

pigpio.waveDelete(waveId);