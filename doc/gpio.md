## Class Gpio - General Purpose Input Output

#### Methods
- Constructor
  - [Gpio(gpio[, options])](#gpiogpio-options)
- Mode
  - [mode(mode)](#modemode)
  - [getMode()](#getmode)
- Pull-Type
  - [pullUpDown(pud)](#pullupdownpud)
- Digital IO
  - [digitalRead()](#digitalread)
  - [digitalWrite(level)](#digitalwritelevel)
  - [trigger(pulseLen, level)](#triggerpulselen-level)
- PWM
  - [pwmWrite(dutyCycle)](#pwmwritedutycycle)
  - [hardwarePwmWrite(frequency, dutyCycle)](#hardwarepwmwritefrequency-dutycycle)
  - [getPwmDutyCycle()](#getpwmdutycycle)
  - [pwmRange(range)](#pwmrangerange)
  - [getPwmRange()](#getpwmrange)
  - [getPwmRealRange()](#getpwmrealrange)
  - [pwmFrequency(frequency)](#pwmfrequencyfrequency)
  - [getPwmFrequency()](#getpwmfrequency)
- Servo Control
  - [servoWrite(pulseWidth)](#servowritepulsewidth)
  - [getServoPulseWidth()](#getservopulsewidth)
- Interrupts
  - [enableInterrupt(edge[, timeout])](#enableinterruptedge-timeout)
  - [disableInterrupt()](#disableinterrupt)
- Alerts
  - [enableAlert()](#enablealert)
  - [disableAlert()](#disablealert)
- Waveform
  - [waveClear()](#waveclear)
  - [waveAddNew()](#waveaddnew)
  - [waveAddGeneric(pulses)](#waveaddgenericpulses)
  - [waveAddSerial(baud, dataBits, stopBits, offset, message)](#waveaddserialbaud-databits-stopbits-offset-message)
  - [waveCreate()](#wavecreate)
  - [waveDelete()](#wavedelete)
  - [waveTxSend(waveId, waveMode)](#wavetxsendwaveid-wavemode)
  - [waveChain(chain)](#wavechainchain)
  - [waveTxAt()](#wavetxat)
  - [waveTxBusy()](#wavetxbusy)
  - [waveTxStop()](#wavetxstop)
  - [waveGetMicros()](#wavegetmicros)
  - [waveGetHighMicros()](#wavegethighmicros)
  - [waveGetMaxMicros()](#wavegetmaxmicros)
  - [waveGetPulses()](#wavegetpulses)
  - [waveGetHighPulses()](#wavegethighpulses)
  - [waveGetMaxPulses()](#wavegetmaxpulses)
  - [waveGetCbs()](#wavegetcbs)
  - [waveGetHighCbs()](#wavegethighcbs)
  - [waveGetMaxCbs()](#wavegetmaxcbs)
- Serial
  - [serialReadOpen(baud, dataBits)](#serialreadopenbaud-databits)
  - [serialReadInvert(invert)](#serialreadinvertinvert)
  - [serialRead(buf, bufSize)](#serialreadbuf-bufsize)
  - [serialReadClose()](#serialreadclose)
- Filters
  - [glitchFilter(steady)](#glitchfiltersteady)

#### Events
  - [Event: 'alert'](#event-alert)
  - [Event: 'interrupt'](#event-interrupt)

#### Constants
  - [INPUT](#input)
  - [OUTPUT](#output)
  - [ALT0](#alt0)
  - [ALT1](#alt1)
  - [ALT2](#alt2)
  - [ALT3](#alt3)
  - [ALT4](#alt4)
  - [ALT5](#alt5)
  - [PUD_OFF](#pud_off)
  - [PUD_DOWN](#pud_down)
  - [PUD_UP](#pud_up)
  - [RISING_EDGE](#rising_edge)
  - [FALLING_EDGE](#falling_edge)
  - [EITHER_EDGE](#either_edge)
  - [TIMEOUT](#timeout-2)
  - [MIN_GPIO](#min_gpio)
  - [MAX_GPIO](#max_gpio)
  - [MAX_USER_GPIO](#max_user_gpio)
  - [WAVE_MODE_ONE_SHOT](#wave_mode_one_shot)
  - [WAVE_MODE_REPEAT](#wave_mode_repeat)
  - [WAVE_MODE_ONE_SHOT_SYNC](#wave_mode_one_shot_sync)
  - [WAVE_MODE_REPEAT_SYNC](#wave_mode_repeat_sync)

### Methods

#### Gpio(gpio[, options])
- gpio - an unsigned integer specifying the GPIO number
- options - object (optional)

Returns a new Gpio object for accessing a GPIO. The optional options object can
be used to configure the mode, pull type, interrupting edge(s), interrupt
timeout, and alerts for the GPIO.

A Gpio object is an EventEmitter.

GPIOs on Linux are identified by unsigned integers. These are the numbers that
should be passed to the Gpio constructor. For example, pin 7 on the Raspberry
Pi P1 expansion header corresponds to GPIO4 in Raspbian Linux. 4 is therefore
the number to pass to the Gpio constructor when using pin 7 on the P1 expansion
header.

The following options are supported:
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5 (optional, no default)
- pullUpDown - PUD_OFF, PUD_DOWN, or PUD_UP (optional, no default)
- edge - interrupt edge for inputs. RISING_EDGE, FALLING_EDGE, or EITHER_EDGE (optional, no default)
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout if edge specified)
- alert - boolean specifying whether or not alert events are emitted when the GPIO changes state (optional, default false)

If no mode option is specified, the GPIO will be left in it's current mode. If
pullUpDown is not not specified, the pull-type for the GPIO will not be
modified. This makes it possible to implement programs that do things like
print information about the current mode and logic level for all GPIOs, for
example:

```js
const Gpio = require('pigpio').Gpio;

for (let gpioNo = Gpio.MIN_GPIO; gpioNo <= Gpio.MAX_GPIO; gpioNo += 1) {
  const gpio = new Gpio(gpioNo);

  console.log('GPIO ' + gpioNo + ':' +
    ' mode=' + gpio.getMode() +
    ' level=' + gpio.digitalRead()
  );
}
```

If an interrupt edge is specified, the Gpio will emit an 'interrupt' event each
time an interrupt is detected. Interrupt events are low latency events and will
be emitted as quickly as possible. The level argument passed to the interrupt
event listener is the level read at the time the process was informed of the
interrupt. The level may not be the same as the expected edge as interrupts
happening in rapid succession may be missed by the kernel.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

If alerts are enabled, the Gpio will emit an 'alert' event each time the GPIO
state changes. The logic level and time of the state change accurate to a few
microseconds are passed to the alert event listener. GPIOs are sampled at a
rate set when the library is started. The default sample rate is 5 microseconds
but it can be set 1, 2, 4, 5, 8, or 10 microseconds with the
[configureClock](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#configureclockmicroseconds-peripheral)
function. State changes shorter than the sample rate may be missed.
Alert events are emitted nominally 1000 times per second and there will be one
alert event for each state change detected. i.e. There will be alert events for
all state changes but there will be a latency.

#### The Difference Between Interrupts and Alerts

Both interrupts and alerts provide information about state changes. Interrupts
provide this information as quickly as possible and the latency is as low as
possible. Alerts are queued and fired once per millisecond so the latency is
higher. It's possible to detect more alerts than interrupts per second.

Both interrupts and alerts provide `tick` information that are accurate to a
few microseconds.

#### mode(mode)
- mode - INPUT, OUTPUT, ALT0, ALT1, ALT2, ALT3, ALT4, or ALT5

Sets the GPIO mode. Returns this.

#### getMode()
Returns the GPIO mode.

#### pullUpDown(pud)
- pud - PUD_OFF, PUD_DOWN, or PUD_UP

Sets or clears the resistor pull type for the GPIO. Returns this.

#### digitalRead()
Returns the GPIO level, 0 or 1.

#### digitalWrite(level)
- level - 0 or 1

Sets the GPIO level to 0 or 1. If PWM or servo pulses are active on the GPIO
they are switched off. Returns this.

#### trigger(pulseLen, level)
- pulseLen - pulse length in microseconds (1 - 100)
- level - 0 or 1

Sends a trigger pulse to the GPIO. The GPIO is set to level for pulseLen
microseconds and then reset to not level. 

#### pwmWrite(dutyCycle)
- dutyCycle - an unsigned integer >= 0 (off) and <= range (fully on). range defaults to 255.

Starts PWM on the GPIO. Returns this.

Uses DMA to control and schedule the pulse lengths and duty cycles. pwmRange
can be used to change the default range of 255.

#### hardwarePwmWrite(frequency, dutyCycle)
- frequency - an unsigned integer >= 0 and <= 125000000 (>= 0 and <= 187500000 for the BCM2711)
- dutyCycle - an unsigned integer >= 0 (off) and <= 1000000 (fully on).

Starts hardware PWM on the GPIO at the specified frequency and dutyCycle.
Frequencies above 30MHz are unlikely to work. Returns this.

hardwarePwmWrite can only be invoked if the pigpio main clock is PCM. The main
clock defaults to PCM but can be overridden by invoking the
[configureClock](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#configureclockmicroseconds-peripheral)
function.

The actual number of steps bteween off and fully on is the integral part of 250
million divided by frequency (375 million divided by frequency for the
BCM2711).

The actual frequency set is 250 million / steps (375 million / steps for the
BCM2711).

There will only be a million steps for a frequency of 250 (375 for the
BCM2711). Lower frequencies will have more steps and higher frequencies will
have fewer steps. duytCycle is automatically scaled to take this into account.

All models of the Raspberry Pi support hardware PWM on GPIO18.

#### getPwmDutyCycle()
Returns the PWM duty cycle setting on the GPIO.

#### pwmRange(range)
- range - an unsigned integer in the range 25 through 40000

Selects the duty cycle range to be used for the GPIO. Subsequent calls to
pwmWrite will use a duty cycle between 0 (off) and range (fully on).

If PWM is currently active on the GPIO its duty cycle will be scaled to reflect
the new range. 

The real range, the number of steps between fully off and fully on for each
frequency and sample rate, is given in the following table.

1us | 2us | 4us | 5us | 8us | 10us | Real Range |
---: | ---: | ---: | ---: | ---: | ---: | ---: |
40000 | 20000 | 10000 | 8000 | 5000 | 4000 |25 |
20000 | 10000 | 5000 | 4000 | 2500 | 2000 | 50 |
10000 | 5000 | 2500 | 2000 | 1250 | 1000 | 100 |
8000 | 4000 | 2000 | 1600 | 1000 | 800 | 125 |
5000 | 2500 | 1250 | 1000 | 625 | 500 | 200 |
4000 | 2000 | 1000 | 800 | 500 | 400 | 250 |
2500 | 1250 | 625 | 500 | 313 | 250 | 400 |
2000 | 1000 | 500 | 400 | 250 | 200 | 500 |
1600 | 800 | 400 | 320 | 200 | 160 | 625 |
1250 | 625 | 313 | 250 | 156 | 125 | 800 |
1000 | 500 | 250 | 200 | 125 | 100 | 1000 |
800 | 400 | 200 | 160 | 100 | 80 | 1250 |
500 | 250 | 125 | 100 | 63 | 50 | 2000 |
400 | 200 | 100 | 80 | 50 | 40 | 2500 |
250 | 125 | 63 | 50 | 31 | 25 | 4000 |
200 | 100 | 50 | 40 | 25 | 20 | 5000 |
100 | 50 | 25 | 20 | 13 | 10 | 10000 |
50 | 25 | 13 | 10 | 6 | 5 | 20000 |

The real value set by pwmWrite is (dutyCycle * real range) / range. 

#### getPwmRange()
Returns the duty cycle range used for the GPIO.

If hardware PWM is active on the GPIO the reported range will be 1000000.

#### getPwmRealRange()
Returns the real range used for the GPIO.

If hardware PWM is active on the GPIO the reported real range will be
approximately 250M (375M for the BCM2711) divided by the set PWM frequency.

#### pwmFrequency(frequency)
- frequency - an unsigned integer >= 0

Sets the frequency in hertz to be used for the GPIO. Returns this.

Each GPIO can be independently set to one of 18 different PWM frequencies. 

The selectable frequencies depend upon the sample rate which may be 1, 2, 4, 5,
8, or 10 microseconds (default 5). The sample rate can be set with the
[configureClock](https://github.com/fivdi/pigpio/blob/master/doc/configuration.md#configureclockmicroseconds-peripheral)
function.

If PWM is currently active on the GPIO it will be switched off and then back on
at the new frequency.

The frequencies in hertz for each sample rate are:

1us | 2us | 4us | 5us | 8us | 10us |
---: | ---: | ---: | ---: | ---: | ---: |
40000 | 20000 | 10000 | 8000 | 5000 | 4000 |
20000 | 10000 | 5000 | 4000 | 2500 | 2000 |
10000 | 5000 | 2500 | 2000 | 1250 | 1000 |
8000 | 4000 | 2000 | 1600 | 1000 | 800 |
5000 | 2500 | 1250 | 1000 | 625 | 500 |
4000 | 2000 | 1000 | 800 | 500 | 400 |
2500 | 1250 | 625 | 500 | 313 | 250 |
2000 | 1000 | 500 | 400 | 250 | 200 |
1600 | 800 | 400 | 320 | 200 | 160 |
1250 | 625 | 313 | 250 | 156 | 125 |
1000 | 500 | 250 | 200 | 125 | 100 |
800 | 400 | 200 | 160 | 100 | 80 |
500 | 250 | 125 | 100 | 63 | 50 |
400 | 200 | 100 | 80 | 50 | 40 |
250 | 125 | 63 | 50 | 31 | 25 |
200 | 100 | 50 | 40 | 25 | 20 |
100 | 50 | 25 | 20 | 13 | 10 |
50 | 25 | 13 | 10 | 6 | 5 |

#### getPwmFrequency()
Returns the frequency (in hertz) used for the GPIO. The default frequency is
800Hz.

If hardware PWM is active on the GPIO the reported frequency will be that set
by hardwarePwmWrite.

#### servoWrite(pulseWidth)
- pulseWidth - pulse width in microseconds, an unsigned integer, 0 or a number in the range 500 through 2500

Starts servo pulses at 50Hz on the GPIO, 0 (off), 500 (most anti-clockwise) to
2500 (most clockwise). Returns this.

#### getServoPulseWidth()
Returns the servo pulse width setting on the GPIO.

#### enableInterrupt(edge[, timeout])
- edge - RISING_EDGE, FALLING_EDGE, or EITHER_EDGE
- timeout - interrupt timeout in milliseconds (optional, defaults to 0 meaning no timeout)

Enables interrupts for the GPIO. Returns this.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

#### disableInterrupt()
Disables interrupts for the GPIO. Returns this.

#### enableAlert()
Enables alerts for the GPIO. Returns this.

An alert event will be emitted every time the GPIO changes state.

#### disableAlert()
Disables alerts for the GPIO. Returns this.

#### glitchFilter(steady)
Sets a glitch filter on a GPIO. Returns this.
- steady - Time, in microseconds, during which the level must be stable. Maximum value: 300000

Level changes on the GPIO are not reported unless the level has been stable for at least `steady` microseconds. The level is then reported. Level changes of less than `steady` microseconds are ignored. This means that event callbacks will only be executed if the level change is at least `steady` microseconds long. Note that each (stable) edge will be timestamped `steady` microseconds after it was first detected.

This filter only affects the execution of callbacks from the `alert` event, not those of the `interrupt` event.

#### waveClear()
Clears all waveforms and any data added by calls to the `waveAdd*` functions. Returns this.

#### waveAddNew()
Starts a new empty waveform. 

You wouldn't normally need to call this function as it is automatically called after a waveform is created with the gpioWaveCreate function. 

Returns this.

#### waveAddGeneric(pulses)
- pulses - an array of pulses objects.

Adds a series of pulses to the current waveform. Returns the new total number of pulses in the current waveform.

The pulse objects are built with the following properties:
- gpioOn - an unsigned integer specifying the GPIO number to be turned on.
- gpioOff - an unsigned integer specifying the GPIO number to be turned off.
- usDelay - an unsigned integer specifying the pulse length in microseconds.

If you don't want to change a GPIO you can use 0 as a value for gpioOn or gpioOff.

The following example shows a pulse that switches GPIO 17 on for 50 microseconds.
```js
{
  gpioOn: 17,
  gpioOff: 0,
  usDelay: 50
}
```
The following example generates a waveform that starts with a 1µs pulse, then has a 2µs pause, followed by a 3µs pulse and so on.

```js
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;

const output = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});
  
let waveform = [];

for (let x = 0; x < 20; x++) {
  if (x % 2 == 1) {
    waveform.push({ gpioOn: outPin, gpioOff: 0, usDelay: x + 1 });
  } else {
    waveform.push({ gpioOn: 0, gpioOff: outPin, usDelay: x + 1 });
  }
}

output.waveClear();

output.waveAddGeneric(waveform);

let waveId = output.waveCreate();

if (waveId >= 0) {
  output.waveTxSend(waveId, pigpio.WAVE_MODE_ONE_SHOT);
}

while (output.waveTxBusy()) {}

output.waveDelete(waveId);
```

#### waveAddSerial(baud, dataBits, stopBits, offset, message)
- baud - an unsigned integer from 50 - 1000000, specifies the baud rate.
- dataBits - an unsigned integer from 1 - 32, number of data bits.
- stopBits - an unsigned integer from 1 - 4, number of stop bits.
- offset - an unsigned integer >= 0, the serial data starts `offset` microseconds from the start of the waveform.
- message - a string, the Message to be sent.

Adds a waveform representing serial data to the existing waveform.
Returns the new total number of pulses in the current waveform.

#### waveCreate()
Creates a waveform from added data. Returns a wave id.
All data previously added with `waveAdd*` methods get cleared.

#### waveDelete(waveId)
- waveId - >=0, as returned by waveCreate

Deletes a waveform by the given wave id. Returns this.

#### waveTxSend(waveId, waveMode)
- waveId - >=0, as returned by waveCreate
- waveMode - WAVE_MODE_ONE_SHOT, WAVE_MODE_REPEAT, WAVE_MODE_ONE_SHOT_SYNC or WAVE_MODE_REPEAT_SYNC

Transmits a waveform. Returns the number of DMA control blocks in the waveform.

The SYNC variants of the waveMode wait for the current waveform to reach the end of a cycle or finish before starting the new waveform.

WARNING: bad things may happen if you delete the previous waveform before it has been synced to the new waveform.

NOTE: Any hardware PWM started by hardwarePwmWrite will be cancelled.

#### waveChain(chain)
- chain - Array of waves to be transmitted, contains an ordered list of wave_ids and optional command codes and related data.

Transmits a chain of waveforms. Returns this.

NOTE: Any hardware PWM started by hardwarePwmWrite will be cancelled.

The following command codes are supported:

Name | Command & Data | Description |
---: | ---: | ---: |
Loop Start | 255 0	| Identify start of a wave block
Loop Repeat	| 255 1 x y	| loop x + y*256 times
Delay	| 255 2 x y	| delay x + y*256 microseconds
Loop Forever |	255 3	| loop forever

Each wave is transmitted in the order specified. A wave may occur multiple times per chain. 
blocks of waves may be transmitted multiple times by using the loop commands. The block is bracketed by loop start and end commands. Loops may be nested.
Delays between waves may be added with the delay command. 
If present Loop Forever must be the last entry in the chain. chains

For example, the following code creates a chain containing four simple waves and  them together using all the above modifiers.
```js
const pigpio = require('pigpio');
const Gpio = pigpio.Gpio;

const outPin = 17;
const output = new Gpio(outPin, {
  mode: Gpio.OUTPUT
});

let firstWaveForm =   [{ gpioOn: outPin, gpioOff: 0, usDelay: 10 }, { gpioOn: 0, gpioOff: outPin, usDelay: 10 }];
let secondWaveForm =  [{ gpioOn: outPin, gpioOff: 0, usDelay: 20 }, { gpioOn: 0, gpioOff: outPin, usDelay: 20 }];
let thirdWaveForm =   [{ gpioOn: outPin, gpioOff: 0, usDelay: 30 }, { gpioOn: 0, gpioOff: outPin, usDelay: 30 }];
let fourthWaveForm =  [{ gpioOn: outPin, gpioOff: 0, usDelay: 40 }, { gpioOn: 0, gpioOff: outPin, usDelay: 40 }];

output.waveClear();
output.waveAddGeneric(firstWaveForm);
let firstWaveId = output.waveCreate();

output.waveAddGeneric(secondWaveForm);
let secondWaveId = output.waveCreate();

output.waveAddGeneric(thirdWaveForm);
let thirdWaveId = output.waveCreate();

output.waveAddGeneric(fourthWaveForm);
let fourthWaveId = output.waveCreate();

let chain = [
  firstWaveId,      // transmits firstWaveId
  secondWaveId,	    // transmits secondWaveId
  firstWaveId,      // transmits again firstWaveId
  255, 2, 136, 19,  // delay for 5000 microseconds (136 + 19 * 256 = 5000)
  255, 0,           // marks the beginning of a new wave
  thirdWaveId,	    // transmits thirdWaveId
  255, 1, 30, 0,    // repeats the waves since the last beginning mark 30 times (30 + 0 * 256 = 30)
  255, 0,           // marks the beginning of a new wave
  fourthWaveId,	    // transmits fourthWaveId
  255, 3            // loops forever until waveTxStop is called
];

output.waveChain(chain);
while (output.waveTxBusy()) {}
```

#### waveTxAt()
Returns the current transmitting wave id.

#### waveTxBusy()
Returns 1 if the current waveform is still transmitting, otherwise 0.

#### waveTxStop()
Aborts the current waveform. Returns this.

#### waveGetMicros()
Returns the length in microseconds of the current waveform.

#### waveGetHighMicros()
Returns the length in microseconds of the longest waveform created since gpioInitialise was called.

#### waveGetMaxMicros()
Returns the maximum possible size of a waveform in microseconds.

#### waveGetPulses()
Returns the length in pulses of the current waveform.

#### waveGetHighPulses()
Returns the length in pulses of the longest waveform created since gpioInitialise was called.

#### waveGetMaxPulses()
Returns the maximum possible size of a waveform in pulses.

#### waveGetCbs()
Returns the length in DMA control blocks of the current waveform.

#### waveGetHighCbs()
Returns the length in DMA control blocks of the longest waveform created since gpioInitialise was called.

#### waveGetMaxCbs()
Returns the maximum possible size of a waveform in DMA control blocks.

#### serialReadOpen(baud, dataBits)
- baud - an unsigned integer from 50 - 250000, specifies the baud rate.
- dataBits - an unsigned integer from 1 - 32, number of data bits.

Opens a GPIO for bit bang reading of serial data. Returns this.

#### serialReadInvert(invert)
- invert - if the level should be invertet or not, 0 or 1

Configures the level logic for bit bang serial reads. Returns this.

#### serialRead(buf, bufSize)
- buf - a buffer to receive the read bytes
- bufSize - > 0

Copies up to bufSize bytes of data read from the bit bang serial cyclic buffer to the buffer starting at buf. Returns the number of bytes read.

#### serialReadClose()
Closes a GPIO for bit bang reading of serial data. Returns this.

### Events

#### Event: 'alert'
- level - the GPIO level when the state change occurred, 0 or 1
- tick - the time stamp of the state change, an unsigned 32 bit integer

tick is the number of microseconds since system boot and it should be accurate
to a few microseconds.

As tick is an unsigned 32 bit quantity it wraps around after 2^32 microseconds,
which is approximately 1 hour 12 minutes. 

It's not necessary to worry about wrap around when subtracting one tick from
another tick if the JavaScript sign propagating right shift operator `>>` is used.

For example, the following code which simply subtracts `startTick` from `endTick`
prints -4294967294 which isn't the difference we're looking for:

```js
const startTick = 0xffffffff; // 2^32-1 or 4294967295, the max unsigned 32 bit integer
const endTick = 1;
console.log(endTick - startTick); // prints -4294967294 which isn't what we want
```

However, the following code which right shifts both `startTick` and `endTick` 0
bits to the right before subtracting prints 2 which is the difference we're
looking for:

```js
const startTick = 0xffffffff; // 2^32-1 or 4294967295, the max unsigned 32 bit integer
const endTick = 1;
console.log((endTick >> 0) - (startTick >> 0)); // prints 2 which is what we want
```

#### Event: 'interrupt'
- level - the GPIO level when the interrupt occurred, 0, 1, or TIMEOUT (2)
- tick - the time stamp of the state change, an unsigned 32 bit integer

You can find more information about ticks above in the event [alert](#event-alert).

Emitted on interrupts.

Interrupts can have an optional timeout. The level argument passed to the
interrupt event listener will be TIMEOUT (2) if the optional interrupt timeout
expires.

### Constants

#### INPUT
Indicates that the GPIO is an input.

#### OUTPUT
Indicates that the GPIO is an output.

#### ALT0
Indicates that the GPIO is in alternative mode 0.

#### ALT1
Indicates that the GPIO is in alternative mode 1.

#### ALT2
Indicates that the GPIO is in alternative mode 2.

#### ALT3
Indicates that the GPIO is in alternative mode 3.

#### ALT4
Indicates that the GPIO is in alternative mode 4.

#### ALT5
Indicates that the GPIO is in alternative mode 5.

#### PUD_OFF
Niether the pull-up nor the pull-down resistor should be enabled.

#### PUD_DOWN
Enable pull-down resistor.

#### PUD_UP
Enable pull-up resistor.

#### RISING_EDGE
Indicates that the GPIO fires interrupts on rising edges.

#### FALLING_EDGE
Indicates that the GPIO fires interrupts on falling edges.

#### EITHER_EDGE
Indicates that the GPIO fires interrupts on both rising and falling edges.

#### TIMEOUT (2)
The level argument passed to an interrupt event listener when an interrupt
timeout expires.

#### MIN_GPIO
The smallest GPIO number.

#### MAX_GPIO
The largest GPIO number.

#### MAX_USER_GPIO
The largest user GPIO number.

#### WAVE_MODE_ONE_SHOT
The waveform is sent once

#### WAVE_MODE_REPEAT
The waveform cycles repeatedly

#### WAVE_MODE_ONE_SHOT_SYNC
The waveform is sent once, waiting for the current waveform to finish before starting the new waveform

#### WAVE_MODE_REPEAT_SYNC
The waveform cycles repeatedly, waiting for the current waveform to finish before starting the new waveform

