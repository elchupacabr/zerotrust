<!-- ALL THE HTML -->
<template>
  <div id="app">
   <div
      v-for="(item, index) in clouds"
      class="cloud"
      :id="'cloud-' + index"
      :style="makeStarStyles(index)"
         ></div>
    <!--<button class="testbtn" @click="changeDisplay">Fire!</button> -->
    <div id="holoLoader" :class="displayMode ? 'active' : 'notActive'">
      <div class="holoLayer" id="core"><canvas id="coreCanvas" /></div>
      <div class="holoLayer" id="firstCircle">
        <canvas width="450" height="450" id="secondCanvas" />
      </div>
      <div class="holoLayer" id="secondCircle">
        <div class="slider a">
        <div class="sliderPoint a">
          <!-- <div v-for="item in sparks" class="spark" /> -->
          </div>
          </div>
        </div>
      <div class="holoLayer" id="thirdCircle"></div>
     <div class="holoLayer" id="fourthCircle"></div>
     <div class="holoLayer" id="fifthCircle">
       <canvas id="firstCanvas" />
     </div>
     <div class="holoLayer" id="sixthCircle"></div>
    </div>
   <canvas width="470" height="200" id="shootingParticles" :class="displayMode ? 'active' : 'notActive'"/>
  </div>
</template>
<!-- ALL THE JAVASRIPT -->
<script>
export default {
  data() {
    return {
      clouds: 50,
      particles:300,
      particleArray:[],
      shootingParticles:100,
      shootingParticlesArray:[],
      ringNumber:8,
      stylesArray:[],
      ringArray:[],
      instances: 4,
      count:300,
      countArray:[],
      start:65,
      then: Date.now(),
      displayModeEngage:Date.now(),
      displayMode:false,
      angles:[[0,25,10,'rgba(255,255,255,1)'],
              [50,76,10,'rgba(255,255,255,1)'],
              [101,126,10,'rgba(255,255,255,1)'],
              [152,177,10,'rgba(255,255,255,1)'],
              [203,227,10,'rgba(255,255,255,1)'],
              [258,279,10,'rgba(255,255,255,1)'],
              [305,334,10,'rgba(255,255,255,1)'],
             ],
    };
  },
  methods: {
    changeDisplay() {
      this.displayMode = !this.displayMode
      this.displayModeEngage = Date.now();
      //console.log("changed display!")
    },
    loop() {
      let now = Date.now();
      let delta = now - this.then;
      this.update();
      this.render();
      this.then = now;
      requestAnimationFrame(this.loop);
    },
    update() {
      if(this.displayMode === false) {
        this.start = this.start + 0.2;
        this.start >= 100 ? (this.changeDisplay(), this.start = 100) : null;
      }
      else {
        this.start = this.start - 0.4;
        this.start <= 0 ? (this.changeDisplay(), this.start = 0) : null;
      }
      //console.log(this.start)
      this.particleArray.forEach((item, index) => {
        this.adjustLength(item);
        this.moveParticle(item);
      })
      this.shootingParticlesArray.forEach((item, index) => {
        this.moveShootingParticle(item)  
      })
      this.ringArray.forEach((item, index) => {
        this.updateRings(item)  
      })
      this.countArray.forEach((item, index) => {
        this.updateCount(item)  
      })
      //console.log("we updating!")
    },
    render() {
      let canvas1 = document.getElementById("coreCanvas");
      let canvas2 = document.getElementById("firstCanvas");
      let canvas3 = document.getElementById("secondCanvas");
      let canvas4 = document.getElementById("shootingParticles")
      let ctx = canvas1.getContext("2d");
      let ctx2 = canvas2.getContext("2d");
      let ctx3 = canvas3.getContext("2d");
      let ctx4 = canvas4.getContext("2d");
      ctx.globalCompositeOperation = 'screen'; //test */
      ctx4.globalCompositeOperation = 'screen'; //test */
      ctx.clearRect(0, 0, canvas1.width, canvas1.height);
      this.particleArray.forEach((item, index) => {
        this.renderParticle(item, ctx)
      })
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      this.drawCircularPlate(this.angles, ctx2);
      ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
      this.countArray.forEach((item, index) => {
        this.drawCounter(item, ctx3)
      })
      this.drawShootTime(this.start, ctx3)
      this.drawOuterRing(this.ringArray, ctx3);
      ctx4.clearRect(0,0,canvas4.width, canvas4.height);
      this.shootingParticlesArray.forEach((item, index) => {
        this.renderShootingParticles(item, ctx4)
      })
      /* ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighten'; //test */
      //console.log("we rendering!")
    },
    createShootingParticles(number) {
      for(let n=0;n<number;n++) {
        let obj = {
          x:470,
          y:95 + (Math.random() * 12 - 6),
          radius:Math.random() * 5 + 15,
          speed:Math.random() * 7 + 1,
          opacity:1,
          delay:Math.floor(Math.random() * 1000),
        }
        this.shootingParticlesArray.push(obj);
      }
    },
    drawCounterInitiation(number) {
      for(let n=0; n<number; n++) {
        let obj = {
          number: n,
          opacity:Math.random(),
          reverse:true,
          start: n * (360/number),
          finish:(n + 1) * (360/number) ,
          fill: "transparent",
          shadow: "rgba(255,255,255,0.5)",
          strokeStyle:"255,255,255",
          lineWidth: Math.floor(Math.random() * 5 + 3)
        }
        this.countArray.push(obj)
      }
    },
    drawShootTime(start, ctx) {
      let finish = 360/100 * start - 90;
      ctx.strokeStyle = "rgba(255,255,255," + start/100 + ")";
      ctx.beginPath();
      ctx.arc(450/2, 450/2, 185, -90 * (Math.PI / 180), finish * (Math.PI / 180));  
      ctx.stroke();
      ctx.closePath();
      //X = Math.cos(angle*Math.PI/180) * length + startPointX
      let calculateX = Math.cos((finish+5)*Math.PI/180) * 185 + (450/2)
      //Y = Math.sin(angle*Math.PI/180) * length + startPointY    
      let calculateY = Math.sin((finish+5)*Math.PI/180) * 185 + (450/2)
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "10px Arial";
      ctx.fillText(start.toString().substring(0,2) + "%", calculateX, calculateY);
    },
    updateCount(item) {
      if(item.reverse === true) {
        item.opacity -= 0.01;
        item.opacity < 0.1 ? item.reverse = false : null
      }
      if(item.reverse === false) {
        item.opacity += 0.01;
        item.opacity > 0.9 ? item.reverse = true : null
      }
    },
    drawCounter(item, ctx) {
        if(item.number % 2) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(" + item.strokeStyle + "," + item.opacity + ")";
        ctx.arc(450/2, 450/2, 215 + (item.lineWidth/2), item.start * (Math.PI / 180), item.finish * (Math.PI / 180));
        ctx.fillStyle = item.fill;
        ctx.fill();
        ctx.shadowColor = item.shadow;
        ctx.shadowBlur = 8;
        ctx.lineWidth = item.lineWidth
        ctx.strokeStyle = 1;
        ctx.stroke();
        ctx.closePath();
      }
    },
    createCoreParticles(number) {
      for(let n=0;n<number;n++) {
        let angle = Math.floor(Math.random() * 360);
        let ring = Math.floor(Math.random() * 25);
        let length = 80 + Math.random() * 40;
        let speed = Math.random() - 0.5;
        speed > 0.3 ? speed = 0.3 : speed = speed;
        let particle = {
          x:250 + (length + ring * Math.cos(angle * (Math.PI / 180))),
          y:250 + (length + ring * Math.sin(angle * (Math.PI / 180))),
          radius:Math.random() * 2 + 2,
          startRadius:Math.random() * 2 + 2,
          length:length,
          speed:speed,
          usedLength:length,
          grow:Math.random() > 0.5 ? true : false,
          startAngle:angle,
          number:n,
          usedAngle:angle,
          ring: ring,
          color: Math.random() > 0.5 ? "rgba(255, 255, 255,0.3)" : "rgba(214,107,24,0.3)",
          shadow:"rgba(0, 0, 0,1)",
          number:n,
        }
        this.particleArray.push(particle);
      }
    },
    makeStarStyles(cloud) {
      if(document.getElementById("cloud-" + cloud) === null) {
      let radius = Math.floor(Math.random() * 230 + 130);
      let x = "top:" + Math.floor(Math.random() * document.body.clientHeight - radius/2) + "px";
      let y = "left:" + Math.floor(Math.random() * document.body.clientWidth - radius/2) + "px";
      let animationTime = Math.floor(Math.random() * 10 + 5);
      let animationDelay = Math.floor(Math.random() * 15);
      let background = "background:radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 34%, rgba(217,217,217,0.0) 70%)";
      let style = "position:absolute;" + x + ";" + y + ";" + "height:" + radius + "px;" + "width:" + radius + "px;" + "border-radius:180px;" + background + ";animation-duration: " + animationTime + "s;animation-delay:" + animationDelay + "s;";
        this.stylesArray.push(style)
      //console.log(style)
      return style;
      }
      else {
        return this.stylesArray[cloud]
      }
    },
    renderParticle(particle, ctx) {
      var grd = ctx.createRadialGradient(particle.x, particle.y, 1, particle.x,   particle.y, particle.radius-particle.radius/10);
      grd.addColorStop(0,particle.color);
      grd.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
    },
    renderShootingParticles(particle, ctx) {
      if(particle.x < 470) {
      ctx.fillStyle = "rgba(255,255,255," + particle.opacity + ")";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      }
    },
    moveShootingParticle(item) {
      if(this.displayMode === true && Date.now() > this.displayModeEngage + 1000) {
        item.opacity = item.x/470;
        item.x/470 * 10 > 0 ? item.radius = item.x/470 * 10 : item.radius = 0;
        if(item.x > 0) {
          if(Date.now() > this.displayModeEngage + 1000 + item.delay) {
            item.x = item.x - item.speed
          }
        }
        else {
          item.x = 470
        }
      }
      else if(this.displayMode === false && Date.now() < this.displayModeEngage + 1500) {
          item.opacity = item.x/470;
          item.x/470 * 10 > 0 ? item.radius = item.x/470 * 10 : item.radius = 0;
          item.x = item.x - item.speed
      }
      else if(this.displayMode === false && Date.now() > this.displayModeEngage + 1500) {
        item.x = 470;
      }
    },
    createRings(rings, array) {
      //console.logs
      for(let i = 0; i < rings ; i ++) {
        let distance = (360/rings)
        let startAng = Math.floor(Math.random() * 360)
        let endAng = startAng + Math.random() * 50 + 50;
        //let distance = Math.floor(Math.random() * 50 + 50)
        let distandeDrawn = (360/rings) /  100 * 90
        let distanceTransparent = (360/rings) /  100 * 10
        let obj = {
           startAng: startAng * (Math.PI / 180),
           endAng: endAng * (Math.PI / 180),
           length: 120 + 7 * i,
           shown:true,
           moveDirection:Math.random() > 0.5 ? true : false,
           moveDone:false,
          }
        array.push(obj);
        console.log(obj)
      }
    },
    updateRings(ring) {
      if(ring.moveDone === false) {
        ring.moveDirection ?
         (ring.startAng -= 0.01, ring.endAng -= 0.01) : 
         (ring.startAng += 0.01, ring.endAng += 0.01);
         Math.random() < 0.02 ? ring.moveDone = true : null;
      }
      else {
        ring.moveDirection = !ring.moveDirection;       
        ring.moveDone = false
      }
    },
    drawOuterRing(points, ctx) {
      points.forEach(item => {
         if(item.shown === true) {
           //console.log(item.startAng, item.endAng)
            ctx.beginPath();
            ctx.arc(450/2, 450/2, item.length, item.startAng, item.endAng, 0, 2 * Math.PI);
            ctx.fillStyle = 'transparent'
            ctx.fill();
            ctx.shadowColor = 'rgba(255,255,255,1)';
            ctx.shadowBlur = 15;
            ctx.lineWidth = 5;
            ctx.strokeStyle = "rgba(255,255,255,1)";
            ctx.stroke();
            ctx.closePath();
         }
      })
    },
    adjustLength(particle) {
      //particle.number === 0 ? console.log(particle.grow) : null
      if(particle.grow && !this.displayMode) {
        particle.usedLength += Math.abs(particle.speed) / 2;
        particle.usedLength > particle.length + 20 ? particle.grow = false : null;
        particle.radius > particle.startRadius ? (particle.radius -= 0.5, particle.usedLength += particle.radius / 3) : null;
      }
      else if(!particle.grow && !this.displayMode) {
        particle.usedLength -= Math.abs(particle.speed) / 2;
        particle.usedLength < particle.length - 20 ? particle.grow = true : null;
        particle.radius > particle.startRadius ? (particle.radius -= 1) : null;
      }
      else if(this.displayMode) {
        !particle.grow ? particle.grow = true : null;
        particle.usedLength > 0 ? particle.usedLength -= particle.radius / 10 : null;
        particle.radius < 25 ? particle.radius += 1 : null;
      }
    },
    moveParticle(particle) {
      //Math.random() < 0.5 ? particle.usedLength++ : particle.usedLength--;
      particle.usedAngle = particle.usedAngle + particle.speed;
      particle.x = 250 + particle.usedLength * Math.cos(particle.usedAngle * (Math.PI / 180));
      particle.y = 250 + particle.usedLength * Math.sin(particle.usedAngle * (Math.PI / 180));
    },
    drawCircularPlate(angles,ctx) {
      angles.forEach((item) => {     
        ctx.beginPath();
        ctx.arc(450/2, 450/2, 150, item[0] * (Math.PI / 180), item[1] * (Math.PI / 180));
        ctx.fillStyle = 'transparent'
        ctx.fill();
        ctx.shadowColor = item[3];
        ctx.shadowBlur = 15;
        ctx.lineWidth = item[2];
        ctx.strokeStyle = item[3];
        ctx.stroke();
        ctx.closePath();
      })
        ctx.beginPath();
        ctx.arc(450/2, 450/2, 138, 0, 2 * Math.PI);
        ctx.fillStyle = 'transparent'
        ctx.fill();
        ctx.shadowColor = 'rgba(255,255,255,1)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.stroke();
        ctx.closePath();
      
        ctx.beginPath();
        ctx.arc(450/2, 450/2, 163, 0, 2 * Math.PI);
        ctx.fillStyle = 'transparent'
        ctx.fill();
        ctx.shadowColor = 'rgba(255,255,255,1)';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.stroke();
        ctx.closePath();
    }
  },
  mounted() {
    this.drawCounterInitiation(this.count);
    this.createCoreParticles(this.particles);
    this.createShootingParticles(this.shootingParticles);
    this.createRings(this.ringNumber,this.ringArray);
    let canvas1 = document.getElementById("coreCanvas");
    canvas1.width = document.getElementById("core").offsetWidth;
    canvas1.height = document.getElementById("core").offsetHeight;
    let canvas2 = document.getElementById("firstCanvas");
    canvas2.width = document.getElementById("firstCircle").offsetWidth;
    canvas2.height = document.getElementById("firstCircle").offsetHeight;
    let ctx2 = canvas2.getContext("2d");
    this.drawCircularPlate(this.angles, ctx2);
    let canvas3 = document.getElementById("secondCanvas");
    canvas2.width = document.getElementById("firstCircle").offsetWidth;
    canvas2.height = document.getElementById("firstCircle").offsetHeight;
    window.addEventListener("resize", function(){
    let canvas1 = document.getElementById("coreCanvas");
    canvas1.width = document.getElementById("core").offsetWidth;
    canvas1.height = document.getElementById("core").offsetHeight;
    let canvas2 = document.getElementById("firstCanvas");
    canvas2.width = document.getElementById("firstCircle").offsetWidth;
    canvas2.height = document.getElementById("firstCircle").offsetHeight;
    let canvas3 = document.getElementById("secondCanvas");
    canvas2.width = document.getElementById("firstCircle").offsetWidth;
    canvas2.height = document.getElementById("firstCircle").offsetHeight;
    }, true);
    //Let's start this!
    //we go!
    this.loop();
  }
};
</script>
<!-- ALL THE STYLES -->
<style>
  :root {
  --main-blue-color: #13aeff;
  --main-white-color: #ffffff;
  --main-orange-color: #d66b18;
}
  body {
    width:100vw;
    height:100vh;
    margin:0;
    padding:0;
    overflow:hidden;
    background-image: radial-gradient( circle farthest-corner at 10% 20%,  rgba(28,38,47,1) 0%, rgba(37,47,57,1) 90% );
  }
  .testbtn {
    position: absolute;
    top: 20px;
    left: calc(50vw - 25px);
    height: 20px;
    box-shadow: 0px 0px 15px 0px rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    height: 25px;
    width: 70px;
    background-color: transparent;
    z-index: 10000000000000;
    color: white;
    border: 1px solid white;
  }
  .cloud {
    z-index:-1;
    opacity:0.5;
    animation:cloudFade;
  }
 @keyframes cloudFade {
  0%    {opacity:0.5;}
  50%   {opacity:0;}
  100%  {opacity:0.5;}
}
  
  @keyframes reverseRotate {
  from { transform:rotate(0deg) } 
  to { transform:rotate(360deg) } 
}
    @keyframes rotate {
  from { transform:rotate(360deg) } 
  to { transform:rotate(0deg) } 
}
  
  #secondCircle .slider {
    background-color: transparent;
    width: calc(50% + 4px);
    box-sizing: border-box;
    height: 8px;
    top:calc(50% - 4px);
    left:calc(50% - 4px);
    position: relative;
    animation:rotate 8s infinite linear;
    transform-origin: 4px 4px;

  }
  
  #secondCircle .sliderPoint.a {
    box-shadow: 0px 0px 3px 2px rgba(255,255,255,0.55);
    left: calc(100% - 2px);
    width: 4px;
    background-color: rgba(255,255,255,0.55);
    position:relative;
    box-sizing: border-box;
    border-radius: 100%;
    height: 4px;
  }
  
  #secondCircle .sliderPoint.a:before {
    content: '';
    box-shadow: 0px 0px 3px 2px rgba(255,255,255,0.55);
    width: 4px;
    position: relative;
   	top: 183px;
	  left: -285px;
    border-radius: 90px;
    height: 4px;
    display: block;
    background-color: rgba(255,255,255,0.55);
  }
  #secondCircle .sliderPoint.a:after {
    content: '';
    box-shadow: 0px 0px 3px 2px rgba(255,255,255,0.55);
    width: 4px;
    position: relative;
    top: -190px;
	  left: -270px;
    border-radius: 90px;
    height: 4px;
    display: block;
    background-color: rgba(255,255,255,0.55);
  }
  #holoLoader.active .sliderPoint.a:after {
    animation:sparks 3s infinite linear 0s;
  }
  #holoLoader.active .sliderPoint.a:before {
    animation:sparks 3s infinite linear 1.2s;
  }
  #holoLoader.active .sliderPoint.a {
    animation:sparks 3s infinite linear 0.3s;
  }
  
  @keyframes sparks {
    0% {
     box-shadow: 0px 0px 5px 3px rgba(255,255,255,0.75);
    }
    60% {
     box-shadow: 0px 0px 5px 3px rgba(255,255,255,0.75); 
    }
    61% {
     box-shadow: 0px 0px 5px 8px rgba(255,255,255,0.75); 
    }
    62% {
     box-shadow: 0px 0px 5px 3px rgba(255,255,255,0.75); 
    }
    84% {
     box-shadow: 0px 0px 5px 3px rgba(255,255,255,0.75); 
    }
    85% {
     box-shadow: 0px 0px 5px 8px rgba(255,255,255,0.75); 
    }
    86% {
     box-shadow: 0px 0px 5px 3px rgba(255,255,255,0.75); 
    }
  }
  
  #holoLoader {
    z-index:1;
    //box-shadow: 0px 0px 39px 0px rgba(148,255,241,1);
    position:relative;
    border-radius:50%;
    background-color:rgba(255,255,255,0);
    width:500px;
    height:500px;
    margin:auto;
    margin-top:calc(50vh - 250px);
    transition:all 0.5s ease-in-out 0.4s;
    //transform: perspective(1000px) rotateX(30deg) rotateY(-50deg) rotateZ(0deg);

  }
  
  .holoLayer {
    //background: radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(202,226,255,0) 65%, rgba(147,196,255,1) 100%);
    //box-shadow: 0px 0px 39px 0px rgba(148,255,241,0.3);
    border-radius:360px;
    transition:all 0.5s ease-in-out 0s;
  }
  
  #holoLoader.active {
    transform: perspective(1000px) rotateX(30deg) rotateY(-50deg) rotateZ(0deg);
    transition:all 0.5s ease-in-out;
  }
  
  #core {
    width:100%;
    height:100%;
    background:radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 17%, rgba(147,196,255,0.1) 24%, rgba(255,255,255,0) 30%)
  }
  #coreCanvas, #firstCanvas, #secondCanvas {
   width:100%;
   height:100%;
  }
  #firstCircle {
    position:absolute;
    top:0px;
    width:90%;
    height:90%;
    margin:5%;
  }
  
  @keyframes stutterMovement {
    0% {
      transform:rotate(0deg)
    }
    10% {
      transform:rotate(50deg)
    }
    30% {
      transform:rotate(50deg)
    }
    40% {
      transform:rotate(50deg)
    }
    45% {
      transform:rotate(70deg)
    }
    60% {
      transform:rotate(-20deg)
    }
    70% {
      transform:rotate(0deg)
    }
    85% {
      transform:rotate(20deg)
    }
    90% {
      transform:rotate(0deg)
    }
    100% {
      transform:rotate(0deg)
    }
  }
  
  #holoLoader.active #firstCircle {
    transform: translateX(-130px) translateY(-80px);
    transition:all 0.5s ease-in-out 0.4s;
  }
  #secondCircle {
    position:absolute;
    top:0px;
    width:80%;
    height:80%;
    margin:10%;
    border:1px solid var(--main-orange-color);
  }
 
  #secondCircle:before {
    transition:all 0.5s ease-in-out 0s;
    content:'';
    border:7px dotted rgba(79, 223, 255,0.3);
    position:absolute;
    top:0px;
    width:100%;
    height:100%;
    top: 0px;
    left: 0px;
    border-radius:360%;
    opacity:0;
  }
  #secondCircle:after {
    transition:all 0.5s ease-in-out 0s;
    content:'';
    border:5px solid rgba(79, 223, 255,0.7);
    position:absolute;
    top:0px;
    width:100%;
    height:100%;
    border-radius:360%;
    opacity:0;
  }
  #holoLoader.active #secondCircle {
    border:2px solid rgba(255, 255, 255,0.5);
    transform:translateX(-180px) translateY(-120px);
    transition:all 0.5s ease-in-out 0.4s;
  }
  
  #holoLoader.active #secondCircle:before {
    opacity:1;
    top: -55px;
    left: -75px;
    transition:all 0.5s ease-in-out 0.4s;
    animation: rotation 5s linear 0s infinite;
    transformation-origin:100% 100%;
  }
  
  @keyframes rotation {
    0% {
      transform:rotateZ(0deg)
    }
    100% {
      transform:rotateZ(360deg)
    }
  }
  #holoLoader.active #secondCircle:after {
    opacity:1;
    transform: translateX(45px) translateY(35px);
    transition:all 0.5s ease-in-out 0.4s;
    
  }
  #thirdCircle {
    position:absolute;
    top:0px;
    width:70%;
    height:70%;
    margin:15%;
    border:0px solid white;
    opacity:0;
    transition:all 0.5s ease-in-out 0s;
  }
  #holoLoader.active #thirdCircle:before {
    content:'';
    display:block;
    width:100%;
    height:100%;
    position:absolute;
  }
  #holoLoader.active #thirdCircle:after {
    content:'';
    position:absolute;
    display:block;
    border-radius:180%;
    width:100%;
    height:100%;
  }
  #holoLoader.active #thirdCircle {
    border:5px solid white;
    opacity:1;
    transform: translateX(-520px) translateY(-330px);
    transition:all 0.5s ease-in-out 0.4s;
  }
  #fourthCircle {
    position:absolute;
    top:0px;
    width:60%;
    height:60%;
    margin:20%;
  }
   #holoLoader.active #fourthCircle {
    transform: translateX(-810px) translateY(-540px);
    transition:all 0.5s ease-in-out 0.4s;
  }
  #fifthCircle {
    position:absolute;
    top:0px;
    width:50%;
    height:50%;
    margin:25%;
    animation: stutterMovement 5s infinite linear;
  }
  #holoLoader.active #fifthCircle {
    transform: translateX(-600px) translateY(-400px);
    transition:all 0.5s ease-in-out 0.4s;
  }
  #sixthCircle {
    position:absolute;
    top:0px;
    width:40%;
    height:40%;
    margin:30%;
    border:1px dashed var(--main-orange-color);
    border-radius:180%;
  }
  #holoLoader.active #sixthCircle {
    border:3px solid var(--main-white-color);
    transition:all 0.5s ease-in-out 0.4s;
  }
  
  #holoLoader.active #sixthCircle:before {
    position:absolute;
    width:40%;
    height:40%;
    margin:30%;
    top:-5px;
    left:-5px;
    border:1px dashed var(--main-white-color);
    border-radius:180%;
    transition: all 0.5s ease-in-out 0s;
    animation: bubbleEffect 4s infinite linear;
    box-shadow: 0px 0px 0px rgba(255,255,255,0);
  }
   #sixthCircle:before {
    content:'';
    position:absolute;
    border-radius:180%;
    width:20%;
   	display: block;
    height:20%;
    margin:40%;
    top: -5px;
	  left: -5px;
    border:1px solid var(--main-white-color);
    box-shadow: 0px 0px 5px 2px rgba(214,107,24,1), inset 0 0px 5px rgba(214,107,24,1);
    transition:all 0.5s ease-in-out 0.4s;
    animation: rotationY 4s infinite linear;
  }
  #holoLoader.active #sixthCircle:after {
    position:absolute;
    width:40%;
    height:40%;
    margin:30%;
    top:-5px;
    left:-5px;
    border:1px dashed var(--main-white-color);
    border-radius:180%;
    transition: all 0.5s ease-in-out 0s;
    animation: bubbleEffect 4s infinite linear;
    box-shadow: 0px 0px 0px rgba(255,255,255,0);
  }
  #sixthCircle:after {
    content:'';
    position:absolute;
    display: block;
    width:20%;
    height:20%;
    border-radius:180%;
    margin:40%;
    top: -5px;
	  left: -5px;
    box-shadow: 0px 0px 5px 2px var(--main-orange-color), inset 0 0px 5px var(--main-orange-color);
    border:1px solid var(--main-white-color);
    transition:all 0.5s ease-in-out 0.4s;
    animation: rotationX 8s infinite linear;
  }
  
  @keyframes rotationX {
    0% {
      transform:rotateX(0deg) rotateY(0deg) scale(1);
    }
    100% {
      transform:rotateX(360deg) rotateY(-360deg) scale(1);
    }
  }
  
  @keyframes rotationY {
     0% {
      transform:rotateY(0deg) rotateX(0deg) scale(1)
    }
    100% {
      transform:rotateY(360deg) rotateX(360deg) scale(1)
    }
  }
  
  @keyframes bubbleEffect {
    0% {
      animation-timing-function: linear;
      transform:scale(1);
    }
    25% {
      animation-timing-function: linear;
      opacity:1;
      transform:scale(1.2);
    }
    50% {
      animation-timing-function: linear;
      opacity:0.5;
      transform:scale(1);
    }
    75% {
      animation-timing-function: linear;
      opacity:0.5;
      transform:scale(0.8);
    }
    100%{
      animation-timing-function: linear;
      opacity:1;
      transform:scale(1);
    }
  }
  
  #shootingParticles {
    opacity:0;
    width: 470px;
    height: 200px;
    z-index:1;
    position: absolute;
    top: calc(50vh - 168px);
	  left: calc(50vw - 460px);
    transform: rotateZ(18deg);
    transition:all 0.5s linear 0.5s;
  }
  
  #shootingParticles.active {
     transition:all 0.5s linear 1s;
     opacity:1;
  }
</style>
