const gnomeContainer = document.getElementById("metrognome");
const gnomeMouth = gnomeContainer.querySelector(".mouth");
const gnomeBeard = gnomeContainer.querySelector(".beard");
const gnomeStacheLeft = gnomeContainer.querySelector(".stache.left");
const gnomeStacheRight = gnomeContainer.querySelector(".stache.right");
const tempoSlider = document.getElementById("tempo");
const bpm = document.getElementById("bpm");
const playBtn = document.getElementById("play");
let isPlaying = false;
let metronomeStartTimer;

// Modified metronome code came from this great article by Grant James:
// https://grantjam.es/creating-a-simple-metronome-using-javascript-and-the-web-audio-api
class Metronome {
  constructor(tempo = 120) {
    this.audioContext = null;
    this.notesInQueue = [];
    this.currentQuarterNote = 0;
    this.tempo = tempo;
    this.lookahead = 25;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;
    this.isRunning = false;
    this.intervalID = null;
  }

  nextNote() {
    var secondsPerBeat = 60 / this.tempo;
    this.nextNoteTime += secondsPerBeat;

    this.currentQuarterNote++;
    animSwing.duration(secondsPerBeat);
    animTalk.duration(secondsPerBeat / 2);

    if (this.currentQuarterNote == 4) {
      this.currentQuarterNote = 0;
    }
  }

  scheduleNote(beatNumber, time) {
    this.notesInQueue.push({ note: beatNumber, time: time });

    const osc = this.audioContext.createOscillator();
    const envelope = this.audioContext.createGain();

    osc.frequency.value = beatNumber % 4 == 0 ? 800 : 600;
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  scheduler() {
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.currentQuarterNote, this.nextNoteTime);
      this.nextNote();
    }
  }

  start() {
    if (this.isRunning) return;

    if (this.audioContext == null) {
      this.audioContext = new window.AudioContext();
    }

    this.isRunning = true;
    this.currentQuarterNote = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.intervalID);
  }
}

const metronome = new Metronome();
const startupDuration = 600;
const rotationDeg = 25;

const animStart = gsap
  .timeline({
    paused: true
  })
  .to(gnomeContainer, {
    rotate: rotationDeg * -1,
    ease: "back.in(2)",
    duration: startupDuration / 1000,
    onComplete: () => {
      animSwing.restart();
      animTalk.restart();
    }
  })
  .to(
    gnomeStacheLeft,
    {
      rotate: -10
    },
    "<"
  )
  .to(
    gnomeStacheRight,
    {
      rotate: 10
    },
    "<"
  );

const animStop = gsap
  .timeline({ paused: true })
  .to(gnomeContainer, {
    rotate: 0,
    ease: "elastic.out(1, 0.3)",
    duration: 1.4
  })
  .to(
    gnomeMouth,
    {
      scaleX: 0,
      scaleY: 0,
      duration: 0.2
    },
    "<"
  )
  .to(
    [gnomeStacheLeft, gnomeStacheRight],
    {
      rotate: 0
    },
    "<"
  );

const animSwing = gsap
  .timeline({
    repeat: -1,
    yoyo: true,
    paused: true
  })
  .fromTo(
    gnomeContainer,
    { rotate: rotationDeg * -1 },
    {
      rotate: rotationDeg,
      ease: "linear",
      immediateRender: false,
      onStart: () => animTalk.restart()
    }
  );

const animTalk = gsap
  .timeline({
    repeat: -1,
    yoyo: true,
    paused: true
  })
  .fromTo(
    gnomeMouth,
    { scaleX: 1, scaleY: 1 },
    {
      scaleX: 1,
      scaleY: 0,
      ease: "expo.out",
      immediateRender: false
    }
  )
  .fromTo(
    gnomeStacheLeft,
    { rotate: -10 },
    {
      rotate: 0,
      ease: "sine.in",
      immediateRender: false
    },
    "<"
  )
  .fromTo(
    gnomeStacheRight,
    { rotate: 10 },
    {
      rotate: 0,
      ease: "sine.in",
      immediateRender: false
    },
    "<"
  );

tempoSlider.addEventListener("input", () => {
  bpm.textContent = tempo.value;
  metronome.tempo = tempo.value;
});

function play() {
  isPlaying = true;
  playBtn.textContent = "Pause";
  animStop.invalidate().pause();
  animStart.restart();
  metronomeStartTimer = setTimeout(() => metronome.start(), startupDuration);
}

function pause() {
  isPlaying = false;
  clearTimeout(metronomeStartTimer);
  playBtn.textContent = "Play";
  animTalk.invalidate().pause();
  animSwing.invalidate().pause();
  animStart.invalidate().pause();
  animStop.restart();
  metronome.stop();
}

playBtn.addEventListener("click", () => (isPlaying ? pause() : play()));