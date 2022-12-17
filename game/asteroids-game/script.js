/*
  All game elements are HTML elements. All game data is contained by the elements as attributes or css properties.
  A traditional object-oriented approach cannot be used because HTML objects cannot have methods attached.
  All object mutations will be performed by permutation functions that take an object as parameter.
*/

/// Game parameters
/// Change stuff here to have a different experience

var startingShips = 3; //  number of starting ships
var thrustForce = 2000; //  px/sec
var turnRate = 300; //  deg/sec
var playerDamping = 0.99; //  % velocity preserved per second
var rotationDamping = 0.95; // % rotation velocity preserved
var playerExplosion = 100; //  particles
var starfieldSize = 140; //  number of stars
var starSize = 3; //  px diameter
var parallaxStars = 0.15;  // % stars that move wrt player input

var startingAsteroids = 2; //  number of asteroids on level 1
var startAsteroidRadius = 125; //  px
var minAsteroidRadius = 30; //  px
var asteroidStartVelocity = 8000; //  px/sec
var asteroidCollisionDust = 60; //  particles

var explosionForce = 6;//12.5; //  px/sec
var particleDamping = 0.99; //  % velocity preserved per second
var dustSize = 5; //  px

var startBulletDamage = 10;
var bulletSpeed = 300; //  px/sec
var bulletDelay = 0.3; //  sec
var bulletParticles = 10; //  particles per impact

/// Simulation constants
/// Change stuff here to make the game not work

var DtR = Math.PI / 180;
var width = parseFloat($('#game').parent().css('width'));
var height = window.innerHeight;
var deathOpacity = 0.1; //  dust fades to here and dies
var sleepVelocity = 1; //  moving things stop below this speed

$(document).ready(function() {
  $('#startbutton').on('click', GameStart);
  $('#dev').on('click', DevInfo);
  $('#info').on('click', GameInfo);
  GameInfo();
});

/// utilities ///

Array.prototype.pushAll = function(array) {
  for (var i = 0; i < array.length; i++) {
    this.push(array[i]);
  }
}

function rndRange(min, max) {
  return min + Math.random() * (max - min);
}

function rndRangeInt(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function Trunc(number, digits) {
  return Math.floor(number * Math.pow(10, digits)) / Math.pow(10, digits);
}
Number.prototype.PerFrame = function() {
  return this / dt.fps;
}

function rndSign() {
  return Math.floor(Math.random() * 2) * 2 - 1;
}
var DeltaTime = function() {
  this.reset();
}
DeltaTime.prototype.reset = function() {
  this.fps = 20;
  this.delta = this.fps / 1000;
  this.last = Date.now();
}
DeltaTime.prototype.update = function() {
  this.cur = Date.now();
  this.delta = this.cur - this.last;
  this.last = this.cur;
  this.fps = 1000 / this.delta;
}
var dt = new DeltaTime();

/// Primary game functions  ///

var gameLevel = 0;
var gameTimer = null;
var bulletDamage = 0;

//  triggered by user action
//  initializes game data and transitions to 'running'
function GameStart() {

  //  hide the title screen
  $('#title').hide();
  $('#game').show();

  //  preserve the score element
  var hs = $('.score').clone();
  hs.text(0);
  hs.show();

  //  clear contents
  var crt = $('#game');
  crt.empty();
  ItemRender(hs);

  //  resets game data and display
  bulletDamage = startBulletDamage;
  player = PlayerCreate();
  PlayerReset(player);

  //  reset player score
  var ships = $('.score').clone();
  ships.attr('id', 'playerShips');
  ships.show();
  ships.css('left', width - 60);
  ItemRender(ships);
  
  //  reset player 'ships' display
  PlayerShipsSet(startingShips);

  //  create the background stars
  RecyclerS.reset();
  RecyclerS.generate(starfieldSize);

  //  init asteroids
  gameLevel = 1;
  RecyclerA.reset();
  LevelInit(gameLevel);

  //  init bullets
  RecyclerB.reset();

  //  init particles (dust)
  RecyclerP.reset();

  //  init frame-time monitor
  dt.reset();

  //  todo
  //  add key listeners for player input
  $('body').on('keypress', GameKeyListener);
  $('body').on('keydown', GameKeyListener);

  if (gameTimer !== null) {
    window.cancelAnimationFrame(gameTimer);
  }
  gameTimer = window.requestAnimationFrame(GameUpdate);
}

function GameKeyListener(event) {
  if (!ItemIsAlive(player)) {
    PlayerReset();
    return;
  }

  var key = event.which;

  switch (key) {
    case 84: // 't'
      DevAlert();
      break;
    case 113: // 'q'
    case 27: // escape
      //  exit game, return to title
      GameEnd();
      break;
    case 97: // 'a'
    case 37: // left-arrow
      //  turn left
      PlayerTurn(-turnRate);
      break;
    case 119: // 'w'
    case 38: // up-arrow
      //  thrust
      PlayerThrust();
      break;
    case 100: // 'd'
    case 39: // right-arrow
      //  turn right
      PlayerTurn(turnRate);
      break;
    case 32: // space
      //  fire
      PlayerFire();
      break;
  }
}

//  triggered by window interval
//  this is the game clock
function GameUpdate() {
  PlayerUpdate();
  RecyclerS.update();
  RecyclerA.update();
  RecyclerB.update();
  RecyclerP.update();

  //  check each asteroid for collisions
  for (var a = 0; a < RecyclerA.live.length; a++) {
    var collided = false;
    var asteroid = RecyclerA.live[a];
    var density = 0.75 * parseFloat(asteroid.css('width'));
    var impact = parseInt(asteroid.attr('dmg'));

    //  check each bullet for collision with this asteroid
    for (var b = 0; b < RecyclerB.live.length; b++) {
      var bullet = RecyclerB.live[b];
      if (ItemsCollided(asteroid, bullet)) {
        collided = true;
        ItemKill(bullet);
        var hs = $('.score').first();
        var points = parseInt(hs.text());
        points += Math.ceil(2 * startAsteroidRadius / parseFloat(asteroid.css('width')));
        hs.text(points);

        //  check for asteroid destruction
        var dmg = parseInt(bullet.attr('dmg'));
        impact += dmg;
        asteroid.attr('dmg', impact);
        if (impact > density) {
          AsteroidExplode(asteroid);
          ItemKill(asteroid);
        } else {
          BulletExplode(bullet);
          AsteroidColorUpdate(asteroid);
        }

        //  abort checking bullets
        break;
      }
    }

    //  if this asteroid wasn't hit by a bullet,
    //  check player collision with this asteroid
    if (!collided && ItemIsAlive(player) && PlayerCollided(asteroid)) {
      ItemKill(player);
      ItemKill(asteroid);
      AsteroidExplode(asteroid);
      PlayerExplode();
      PlayerShipsDown();
    }
  }

  if (RecyclerA.live.length === 0) {
    gameLevel++;
    LevelInit(gameLevel);
    PlayerShipsUp();
    bulletDamage += 2;
  }

  if (PlayerShipsGone()) {
    GameEnd();
  }

  dt.update();

  gameTimer = window.requestAnimationFrame(GameUpdate);
}

//  triggered by window interval
//  executes when the game is still 'running' but
//  the player has lost -- this displays the
//  final score, credits, etc
function GameEnd() {
  //  todo
  //  remove key listeners for player input
  PlayerExplode();
  $('body').off('keypress', GameKeyListener);
  $('body').off('keydown', GameKeyListener);
  GameInfo();
  
  RecyclerS.empty();
  RecyclerA.empty();
  RecyclerB.empty();
  RecyclerP.empty();
}

function GameInfo() {
  var hs = $('.score');
  hs.hide();
  $('#game').hide();
  $('#title').show();
  $('#info').hide();

  if (gameTimer !== null) {
    window.cancelAnimationFrame(gameTimer);
  }
}

function DevInfo() {
  $('#title').hide();
  $('#info').show();
}

function DevAlert() {
  var a = 'Asteroids\nNew: ' + RecyclerA.new.length + '\nLive: ' + RecyclerA.live.length + '\nDead: ' + RecyclerA.dead.length;
  alert(a);
}

/// Game subfunctions  ///

function LevelInit(level) {
  for (var i = level - 1 + startingAsteroids; i > 0; i--) {
    var n = RecyclerA.get();
    AsteroidReset(n);
    AsteroidSetRadius(n, startAsteroidRadius);
    AsteroidVelocityInit(n);
    AsteroidPositionInit(n);
  }
}

//  Game items  //

function ItemReset(item) {
  item.attr('dead', false);
  item.show();
}

function ItemKill(item) {
  item.attr('dead', true);
  item.hide();
}

function ItemIsAlive(item) {
  var dead = item.attr('dead');
  return dead !== 'true';
}

function ItemIsOffScreen(item) {
  var x = parseFloat(item.css('left'));
  var y = parseFloat(item.css('top'));
  var w = parseFloat(item.css('width'));
  var h = parseFloat(item.css('height'));
  return ((x < -w) || (x > width+w) || (y < -h) || (y > height+h));
}

function MovementUpdate(item) {

  //  do not process unmoving items
  var dx = parseFloat(item.attr('dx'));
  var dy = parseFloat(item.attr('dy'));
  if (dx === 0 && dy === 0) return;

  //  update position based on velocity
  var x = parseFloat(item.css('left'));
  var y = parseFloat(item.css('top'));
  x += dx.PerFrame();
  y += dy.PerFrame();

  //  wrap off-screen items
  var w = parseInt(item.css('width'));
  var h = parseInt(item.css('height'));
  if (x > width+w && dx > 0) {
    x = -w;
  }
  if (x < -w && dx < 0) {
    x = width;
  }
  if (y > height+h && dy > 0) {
    y = -h;
  }
  if (y < -h && dy < 0) {
    y = height;
  }

  PositionSet(item, x, y);
}

function PositionSet(item, x, y) {
  item.css('left', x);
  item.css('top', y);
}

function VelocitySet(item, dx, dy) {
  item.attr('dx', dx);
  item.attr('dy', dy);
}

function VelocityDamp(item) {
  var damp = parseFloat(item.attr('damp'));
  var dx = parseFloat(item.attr('dx'));
  var dy = parseFloat(item.attr('dy'));
  dx *= damp;
  dy *= damp;
  if (dx * dx + dy * dy < sleepVelocity * sleepVelocity) {
    dx = 0;
    dy = 0;
  }
  VelocitySet(item, dx, dy);
}

function ItemsCollided(itemA, itemB) {
  //  requires the items to interact with a bounding circle
  //  that is 75% of the item's width
  var Lr = 0.5 * parseFloat(itemA.css('width'));
  var Lx = parseFloat(itemA.css('left')) + Lr;
  var Ly = parseFloat(itemA.css('top')) + Lr;

  var Rr = 0.5 * parseFloat(itemB.css('width'));
  var Rx = parseFloat(itemB.css('left')) + Rr;
  var Ry = parseFloat(itemB.css('top')) + Rr;

  var dx = Lx - Rx;
  var dy = Ly - Ry;
  var sqrDist = dx * dx + dy * dy;
  var d = Lr + Rr;
  d *= 0.75; //  require a more 'direct' hit
  return (sqrDist < d * d);
}

function SvgElementCreate() {
  var s = document.createElement('svg');
  var p = document.createElement('polygon');
  s.appendChild(p);
  s.setAttribute('width', '100%');
  s.setAttribute('height', '100%');
  return s;
}

function PolygonSetPoints(svgItem, points) {
  var polygon = svgItem.getElementsByTagName('polygon')[0];
  polygon.setAttribute('points', points);
}

function ItemRender(item) {
  $('#game').append(item);
}

function ItemDestroy(item){
  $('#game').remove(item);
}

// player  //

var player = null;
var reloadDelay = 0;

function PlayerCreate() {
  var p = $('<div></div>');
  p.addClass('game-element');
  p.addClass('player');
  p.attr('damp', playerDamping);
  p.attr('rot-damp', rotationDamping);
  p.attr('ra', 0);
  p.attr('rv', 0);
  p.attr('angle', 0);
  var ship = $('<div></div>');
  ship.attr('id', 'ship');
  p.append(ship);
  var exhaust = $('<div></div>');
  exhaust.attr('id', 'exhaust');
  exhaust.addClass('exhaust');
  exhaust.hide();
  p.append(exhaust);
  ItemRender(p);

  var s = SvgElementCreate();
  PolygonSetPoints(s, '0,0 20,10 0,20 5,10');
  ship.append(s);

  var e = SvgElementCreate();
  PolygonSetPoints(e, '20,5 20,15 5,10');
  exhaust.append(e);
  p.html(p.html());
  return p;
}

function PlayerReset() {
  ItemReset(player);
  PositionSet(player, 0.5 * width, 0.5 * height);
  VelocitySet(player, 0, 0);
  player.attr('thrust', false);
  player.attr('rv', rndSign() * rndRange(10, 30));
  player.attr('angle', Math.random() * 360);
}

function PlayerUpdate() {
  if (!ItemIsAlive(player)) return;

  //  adjust rotational velocity
  var rotVel = parseFloat(player.attr('rv'));
  var rotAcel = parseFloat(player.attr('ra'));
  rotVel += rotAcel;
  
  var angle = parseFloat(player.attr('angle'));
  var damp = parseFloat(player.attr('rot-damp'));
  //  apply rotational damping
  rotVel *= damp;
  
  //  udpate rotation angle
  angle += rotVel.PerFrame();

  player.attr('ra', 0);
  player.attr('rv', rotVel);
  player.attr('angle', angle);

  //  rotate ship
  player.css('transform', 'rotate(' + angle + 'deg)');

  //  reload weapons
  reloadDelay -= 1.0 / dt.fps;

  //  move
  MovementUpdate(player);
  VelocityDamp(player);

  //  show exhaust
  if (player.attr('thrust') === true) {
    var e = player.find('#exhaust');
    e.show();
    e.css('opacity', Math.random());
    //  reset exhaust
    player.attr('thrust', false);
  } else {
    player.find('#exhaust').hide();
  }
}

function PlayerExplode() {
  //  flag player as destroyed
  ItemKill(player);

  //  get player position and velocity
  var x = parseFloat(player.css('left') + 10);
  var y = parseFloat(player.css('top')) + 10;
  var dx = parseFloat(player.attr('dx'));
  var dy = parseFloat(player.attr('dy'));

  //  create explosion at player position
  //  and with player's velocity
  for (var i = playerExplosion; i > 0; i--) {
    var p = RecyclerP.get();
    p.attr('damp', rndRange(0.7, 0.9));
    p.css('opacity', rndRange(0.7, 1));
    var psize = rndRange(3,5);
    p.css('width', psize);
    p.css('height', psize);
    var d = rndRange(0, 1);
    var a = Math.random() * 360;
    px = x + d * Math.cos(a);
    py = y + d * Math.sin(a);
    PositionSet(p, px, py);

    var a = Math.random() * 360;
    var f = rndRange(200, 800);
    pdx = Math.cos(DtR * a) * f;
    pdy = Math.sin(DtR * a) * f;
    VelocitySet(p, dx + pdx, dy + pdy);
  }
}

function PlayerCollided(asteroid) {
  var px = parseFloat(player.css('left')) + 10;
  var py = parseFloat(player.css('top')) + 10;
  var ar = parseFloat(asteroid.css('width')) * 0.5;
  var ax = parseFloat(asteroid.css('left')) + ar;
  var ay = parseFloat(asteroid.css('top')) + ar;
  var dx = ax - px;
  var dy = ay - py;
  ar *= 0.75;
  return (dx * dx + dy * dy < ar * ar);
}

function PlayerThrust() {
  player.attr('thrust', true);
  var angle = parseFloat(player.attr('angle'));
  var dx = parseFloat(player.attr('dx'));
  var dy = parseFloat(player.attr('dy'));
  dx += thrustForce.PerFrame() * Math.cos(DtR * angle);
  dy += thrustForce.PerFrame() * Math.sin(DtR * angle);
  player.attr('dx', dx);
  player.attr('dy', dy);
}

function PlayerTurn(rate) {
  player.attr('ra', rate);
}

function PlayerFire() {
  if (reloadDelay > 0) return;
  var angle = parseFloat(player.attr('angle'));
  var dx = Math.cos(DtR * angle);
  var dy = Math.sin(DtR * angle);
  var x = parseFloat(player.css('left'));
  var y = parseFloat(player.css('top'));
  var b = RecyclerB.get();
  var w = 0.5 * parseFloat(player.css('width'));
  PositionSet(b, x + w, y + w);
  VelocitySet(b, bulletSpeed * dx, bulletSpeed * dy);
  reloadDelay = bulletDelay;
  b.attr('dmg', bulletDamage);
}

function PlayerShipsSet(number) {
  $('#playerShips').text(number);
}

function PlayerShipsUp() {
  var s = $('#playerShips');
  s.text(parseInt(s.text()) + 1);
}

function PlayerShipsDown() {
  var s = $('#playerShips');
  s.text(parseInt(s.text()) - 1);
}

function PlayerShipsGone() {
  var s = parseInt($('#playerShips').text());
  return s === 0;
}

// Recycler  //

var Recycler = function() {
  this.reset();
  this.newItem = function() {}
  this.updateItem = function(e) {}
}
Recycler.prototype.reset = function() {
  this.live = [];
  this.dead = [];
  this.new = [];
}
Recycler.prototype.get = function() {
  var item = null;
  if (this.dead.length > 0) {
    item = this.dead[this.dead.length - 1];
    this.dead.pop();
  } else {
    item = this.newItem();
  }
  this.new.push(item);
  ItemReset(item);
  return item;
}
Recycler.prototype.empty = function() {
  if (this.new == null && this.live == null && this.dead == null) return;
  if (this.new !== null) {
    this.dead.pushAll(this.new);
    this.dead.length = 0;
  }
  if (this.live !== null) {
    this.dead.pushAll(this.new);
    this.dead.length = 0;
  }  
  for (var i = this.dead.length; i > 0; i--) {
    var index = i - 1;
    var item = $(this.dead[index]);
    ItemDestroy(item);
  }
  this.dead.length = 0;
}
Recycler.prototype.update = function() {
  if (this.new.length > 0) {
    this.live.pushAll(this.new);
    this.new.length = 0;
  }
  for (var i = this.live.length; i > 0; i--) {
    var index = i - 1;
    var item = $(this.live[index]);
    if (ItemIsAlive(item)) {
      this.updateItem(item);
    } else {
      this.dead.push(item);
      this.live.splice(index, 1);
    }
  }
}

//  Particles //

function ParticleCreate() {
  var p = $('<div></div>')
  p.addClass('game-element');
  p.addClass('star');
  p.css('opacity', Math.random());
  p.attr('damp', rndRange(0.9,0.999));
  ItemRender(p);
  return p;
}

var RecyclerP = new Recycler()
RecyclerP.newItem = function() {
  var p = ParticleCreate();
  var d = rndRange(0.4,1.2)*dustSize;
  p.css('width', d);
  p.css('height', d);
  p.css('z-index', -6);
  VelocitySet(p, explosionForce * rndRange(-1, 1), explosionForce * rndRange(-1, 1));
  return p;
}
RecyclerP.get = function(){
  var p = Recycler.prototype.get.call(this);  
  var d = rndRange(0.4,1.2)*dustSize;
  p.css('width', d);
  p.css('height', d);
  p.css('opacity', Math.random());
  p.attr('damp', rndRange(0.9,0.999));
  return p;
}
RecyclerP.updateItem = function(p) {
  //  degrade opacity (fade away)
  var opacity = parseFloat(p.css('opacity'));
  var damp = parseFloat(p.attr('damp'));
  p.css('opacity', damp * opacity);

  //  kill particle if it is too faint
  if (damp * opacity < deathOpacity) {
    ItemKill(p);
    return;
  }

  //  degrade velocity (slow down)
  MovementUpdate(p);
  VelocityDamp(p);

  //  kill particle if it is too slow
  var dx = parseFloat(p.attr('dx'));
  var dy = parseFloat(p.attr('dy'));
  if (dx * dx + dy * dy < sleepVelocity) {
    ItemKill(p);
    return;
  }
}

// Stars //

var RecyclerS = new Recycler()
RecyclerS.newItem = function() {
  var s = ParticleCreate();
  s.css('width', starSize);
  s.css('height', starSize);
  if (Math.random() < parallaxStars) {
    //  some 'stars' move in response to the player
    s.attr('damp', rndRange(0.1,1.2));
  } else {
    //  remainder of stars are stationary
    s.attr('damp', 0);
  }
  var x = Math.random() * width;
  var y = Math.random() * height;
  PositionSet(s, x, y);
  ItemRender(s);
  return s;
}
RecyclerS.updateItem = function(s) {

  //  stars move opposite of player velocity
  var dx = -parseFloat(player.attr('dx'));
  var dy = -parseFloat(player.attr('dy'));

  //  dampen star movement so it's not 1:1
  var damp = parseFloat(s.attr('damp'));
  s.attr('dx', damp * dx);
  s.attr('dy', damp * dy);
  MovementUpdate(s);
}
RecyclerS.generate = function(quantity) {

  //  create the star background
  for (var i = quantity; i > 0; i--) {
    RecyclerS.get();
  }
}

// Asteroids //

function AsteroidSetRadius(asteroid, radius) {
  //  set rotation speed and direction
  var rotationSpeed = rndRange(4, 10) / radius;
  var direction = rndSign() > 0 ? 'normal' : 'reverse';
  asteroid.css('animation-duration', rotationSpeed.PerFrame());
  asteroid.css('animation-direction', direction);

  //  set asteroid size
  asteroid.css('width', 2 * radius);
  asteroid.css('height', 2 * radius);

  //  create the polygon that defines the asteroid
  var corners = 5 + Math.floor(radius / 8);
  var points = '';
  for (var i = 0; i < corners; i++) {
    var angle = i * 360 / corners;
    //  distance is 75-100% of radius
    var d = radius * 0.33 * (2 + Math.random());
    var px = radius + d * Math.cos(angle * DtR);
    var py = radius + d * Math.sin(angle * DtR);
    points += px + ',' + py + ' ';
  }
  asteroid.empty();
  var p = SvgElementCreate();
  PolygonSetPoints(p, points);
  asteroid.append(p);
  asteroid.html(asteroid.html());
}

function AsteroidVelocityInit(asteroid) {
  var size = parseFloat(asteroid.css('width'));
  var s = asteroidStartVelocity * rndRange(0.5, 1) * rndSign();
  s /= size;
  var d = Math.random() * 360;
  var dx = s * Math.cos(d);
  var dy = s * Math.sin(d);
  VelocitySet(asteroid, dx, dy);
}

function AsteroidPositionInit(asteroid) {
  var x = 0;
  var y = 0;
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      x = Math.random() * width;
      break;
    case 1:
      x = width;
      y = Math.random() * height;
      break;
    case 2:
      x = Math.random() * width;
      y = height;
      break;
    case 3:
      y = Math.random() * height;
      break;
  }
  x -= 0.5 * parseFloat(asteroid.css('width'));
  y -= 0.5 * parseFloat(asteroid.css('height'));
  PositionSet(asteroid, x, y);
}

function AsteroidReset(asteroid) {
  asteroid.attr('dmg', 0);
  AsteroidColorUpdate(asteroid);
}

function AsteroidExplode(asteroid) {
  var a = asteroid;
  ItemKill(a);

  var radius = 0.5 * parseInt(a.css('width'));

  //  asteroid velocity
  var dx = 1.125 * parseFloat(a.attr('dx'));
  var dy = 1.125 * parseFloat(a.attr('dy'));

  //  asteroid position  
  var x = parseFloat(a.css('left')) + radius;
  var y = parseFloat(a.css('top')) + radius;

  if (radius > minAsteroidRadius) {

    //  create new asteroids that are smaller and faster
    for (var i = 2 + Math.floor(Math.random() * 2); i > 0; i--) {
      var n = RecyclerA.get();
      AsteroidReset(n);
      AsteroidSetRadius(n, radius * rndRange(0.45, 0.65));
      var size = 0.65 * parseFloat(n.css('width'));

      var px = x - 0.5 * size + 0.35 * rndRange(-radius, radius);
      var py = y - 0.5 * size + 0.35 * rndRange(-radius, radius);
      PositionSet(n, px, py);

      var ndx = dx * rndRange(0.95, 1.05) + 0.5 * radius * rndRange(-1, 1);
      var ndy = dy * rndRange(0.95, 1.05) + 0.5 * radius * rndRange(-1, 1);
      VelocitySet(n, ndx, ndy);
    }
  }

  //  create dust cloud
  var dustQuantity = asteroidCollisionDust * minAsteroidRadius / radius;
  var size = rndRange(0.5,1.5)* dustSize;// * radius / startAsteroidRadius;
  for (var i = dustQuantity; i > 0; i--) {
    var p = RecyclerP.get();
    p.attr('damp', rndRange(0.8, 0.99));
    p.css('opacity', rndRange(0.2, 0.5));
    p.css('width', size);
    p.css('height', size);
    p.css('filter', 'blur(' + (0.5 * size) + 'px)');

    var d = rndRange(0.1, 0.8);
    var aa = Math.random() * 360;
    var px = x + d * Math.cos(DtR * aa);
    var py = y + d * Math.sin(DtR * aa);
    PositionSet(p, px, py);

    var a = Math.random() * 360;
    var f = rndRange(25, 75);
    var pdx = Math.cos(DtR * a) * f;
    var pdy = Math.sin(DtR * a) * f;
    VelocitySet(p, dx + pdx, dy + pdy);
  }
}

function AsteroidColorUpdate(asteroid) {
  var dmg = parseInt(asteroid.attr('dmg'));
  var density = parseFloat(asteroid.css('width'));
  var shatter = dmg / density;
  //  base color 20,20,40
  var baseR = 20;
  var baseG = 20;
  var baseB = 40;
  //  end shatter color 100,100,200
  var finalR = 100;
  var finalG = 100;
  var finalB = 200;

  var r = baseR + (finalR - baseR) * shatter;
  var g = baseG + (finalG - baseG) * shatter;
  var b = baseB + (finalB - baseB) * shatter;

  asteroid.css('fill', 'rgb(' + r + ',' + g + ',' + b + ')');
}

var RecyclerA = new Recycler();
RecyclerA.newItem = function() {
  var a = $('<div></div>');
  a.addClass('game-element');
  a.addClass('asteroid');
  ItemRender(a);

  AsteroidReset(a);
  AsteroidSetRadius(a, startAsteroidRadius);
  AsteroidVelocityInit(a);
  AsteroidPositionInit(a);

  return a;
}
RecyclerA.updateItem = MovementUpdate;

// Bullets //

function BulletExplode(bullet) {

  //  get bullet position and velocity
  var size = 0.5 * parseFloat(bullet.css('width'));
  var x = parseFloat(bullet.css('left') + size);
  var y = parseFloat(bullet.css('top')) + size;
  var dx = parseFloat(bullet.attr('dx'));
  var dy = parseFloat(bullet.attr('dy'));

  //  create explosion at bullet position
  //  and with bullet's velocity
  var pCount = rndRange(0.5, 1.2)*bulletParticles;
  for (var i = pCount; i > 0; i--) {
    var p = RecyclerP.get();
    p.attr('damp', rndRange(0.7, 0.9));
    p.css('opacity', rndRange(0.99, 1));
    p.css('width', 4);
    p.css('height', 4);
    var d = rndRange(5, 10);
    var a = Math.random() * 360;
    px = x + d * Math.cos(a);
    py = y + d * Math.sin(a);
    PositionSet(p, px, py);

    var a = Math.random() * 360;
    var f = rndRange(25, 500);
    pdx = Math.cos(DtR * a) * f;
    pdy = Math.sin(DtR * a) * f;
    VelocitySet(p, dx + pdx, dy + pdy);
  }
}

var RecyclerB = new Recycler();
RecyclerB.newItem = function() {
  var b = $('<div></div>');
  b.addClass('game-element');
  b.addClass('bullet');
  b.attr('dmg', startBulletDamage);
  ItemRender(b);
  return b;
}
RecyclerB.updateItem = function(bullet) {

  //  update movement
  var dx = parseFloat(bullet.attr('dx'));
  var dy = parseFloat(bullet.attr('dy'));
  var x = parseFloat(bullet.css('left'));
  var y = parseFloat(bullet.css('top'));
  x += dx.PerFrame();
  y += dy.PerFrame();

  PositionSet(bullet, x, y);

  //  kill bullet when it is off screen
  if (ItemIsOffScreen(bullet)) {
    ItemKill(bullet);
    return;
  }
}