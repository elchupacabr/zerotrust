var canvas, ctx;
var HEIGHT = 300;
var WIDTH = 600;
var angles = [0.5, 0.7, 1, 1.8, 2, 2.6, 3, 4];

function Paddle(x, y, flag) {
  this.x = x;
  this.y = y;
  this.flag = flag;
}

Paddle.prototype.render = function() {
  if (this.flag) this.y = ball.y*0.93;
  if (this.y >= HEIGHT - 20) this.y = HEIGHT -20;
  if (this.y <= 0) this.y = 20;
  ctx.beginPath();
  ctx.rect(this.x, this.y - 20, 7, 40);
  ctx.fillStyle = '#00000';
  ctx.fill();
}

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 4;
  this.angle = (Math.random() * 2 * Math.PI) + 1.4;
  this.v = 2;
}

Ball.prototype.hitPaddle = function() {
  this.v += 0.3;
  var a = Math.PI - this.angle;
  if (a < 0) a = 2*Math.PI + a;
  a = a + Math.random() * 0.3;
  if (a > 2*Math.PI) a = a - 2*Math.PI;
  return a;
}

Ball.prototype.newMatch = function() {
  this.angle =  angles[Math.floor(Math.random() * angles.length)]//(Math.random() * 2 * Math.PI) + 2;
  this.v = 2;
}
Ball.prototype.render = function() {
  this.x += Math.cos(this.angle) * this.v;
  this.y += Math.sin(this.angle) * this.v;
  this.v + 0.08;
  if (this.y <= 0) {
    this.y = 0;
    this.angle = ((2*Math.PI) - this.angle);
  } else if (this.y >= HEIGHT) {
    this.y = HEIGHT;
    this.angle =  ((2*Math.PI) - this.angle);
  }
  if ((this.y < (user.y + 20)) && (this.y > (user.y - 20)) && (this.x <= 15)) {
    this.angle = this.hitPaddle();
  } else if ((this.y < (enemy.y + 20)) && (this.y > (enemy.y - 20)) && (this.x >= enemy.x)){
    this.angle = this.hitPaddle();
  }
  if (this.x <= 0) {
    point("enemy");
    this.x = WIDTH/2;
    this.y = HEIGHT/2;
    this.newMatch();
  } else if (this.x >= WIDTH) {
    point("user");
    this.x = WIDTH/2;
    this.y = HEIGHT/2;
    this.newMatch();
  }
  

  
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'black';
  ctx.fill();
}

var user, enemy;
var ball;
window.addEventListener("load", function() {
  canvas = document.getElementById("game");
  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  ctx = canvas.getContext("2d");
  
  user = new Paddle(10, HEIGHT/2);
  enemy = new Paddle(WIDTH - 12, HEIGHT/2, true);
  ball = new Ball(WIDTH/2, HEIGHT/2);
  
  render();
});

window.addEventListener("mousemove", function(event) {
  user.y = event.clientY;
});

function point(who) {
  var el = document.getElementById(who + "-points");
  var p = parseInt(el.innerText) + 1;
  el.innerText = "" + p;
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  user.render();
  enemy.render();
  ball.render();
  
  requestAnimationFrame(render);
}