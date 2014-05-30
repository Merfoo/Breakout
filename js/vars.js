Brick = function(x, y, lives, invincible, spawnBonus)
{
    this.x = typeof(x) === "undefined" ? 0 : x;
    this.y = typeof(y) === "undefined" ? 0 : y;
    this.color = "red";
    this.startLives = typeof(lives) === "undefined" ? 1 : lives;
    this.lives = this.startLives;
    this.spawnBonus = typeof(spawnBonus) === "undefined" ? false : true;
    this.invincible = typeof(invincible) === "undefined" ? false : invincible;
};

PowerUp = function(type, x, y)
{
    this.x = x;
    this.y = y;
    this.type = type;
};

Lazer = function(x, y)
{
    this.x = x;
    this.y = y;
};

Paddle = function(initVal)
{
    this.color = "black";
    this.width = initVal.width;
    this.height = initVal.height;
    this.x = 0;
    this.y = 0;
    this.vMax = initVal.vMax;
    this.v = 0;
};

Ball = function(initVal)
{
    this.color = "red";
    this.maxAng = 70;
    this.released = false;
    this.vMax = initVal.vMax;
    this.vX = 0;
    this.vY = 0;
    this.r = initVal.r;
    this.x = 0;
    this.y = 0;
    this.xLast = 0;
    this.yLast = 0;
    this.line = new Line();
};

BallAim = function(initVal)
{
    this.ang = -45;
    this.angI = 2.22;
    this.angMin = -160;
    this.angMax = -20;
    this.color = "black";
    this.x = 0;
    this.y = 0;
    this.vMax = initVal.vMax;
    this.vX = 0;
    this.vY = 0;
    this.width = 4;
};

Line = function()
{
    this.slope = 1;
    this.yInt = 1;
    this.xInt = 1;
    
    this.getX = function(y)
    {
        if(this.slope !== null)
            return (y - this.yInt) / this.slope;
        
        return this.xInt;
    };
    
    this.getY = function(x)
    {
        if(this.slope !== null)
            return (this.slope * x) + this.yInt;
        
        return 0;
    };
    
    this.createLine = function(pointA, pointB)
    {
        if((pointB.x - pointA.x) !== 0)
        {
            this.slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
            this.yInt = pointB.y - (this.slope * pointB.x);
            this.xInt = (pointB.y - this.yInt) / this.slope;
        }
        
        else
        {
            this.slope = null;
            this.yInt = null;
            this.xInt = pointA.x;
        }
    };
};


var _paddleInit = { initWidth: 173, initHeight: 13, width: 0, height: 0, vMax: 10 };
var _ballInit = { initR: 10, r: 0, vMax: 8 };
var _ballAimInit = { initVMax: 150, vMax: 0 };
var _dom = { startMenu: null, howToPlayMenu: null, pause: null, hud: null, lives: null, creativeOptions: null, brickModeAdd: null, brickModeDel: null, brickLifeOptions: null };
var _anim = { moveUp: "animateUp", moveDown: "animateDown", moveLeft: "animateLeft", moveRight: "animateRight", fadeIn: "animateFadeIn", fadeOut: "animateFadeOut", darken: "animateDarken", lighten: "animateLighten" };
var _brick = { horz: 20, vert: 20, width: 90, height: 90, live: 0, maxLives: 3, colors: ["black", "green", "yellow", "red"] };
var _brickMap = [];
var _hitSpots = { topLeft: 0, topRight: 1, botLeft: 2, botRight: 3 };
var _map = { width: 0, height: 0, widthMod: 1, heightMod: 1, origWidth: 1346, origHeight: 622 }; // = total height - hud height
var _hud = { height: 0, livesText: "Lives: " };
var _cvs = { game: null };
var _modes = { single: 0, auto: 1, creative: 2, paused: false };
var _mode = _modes.auto;
var _creative = { add: true, life: -1, lastLife: 0 };
var _levels = [];
var _level = { index: 0, orig: [] };
var _powerUp = { width: 0, height: 0, vY: 0, initVY: 5, minDistY: 0, multiBall: 0, superBall: 1, lazers: 2, longPaddle: 3, life: 4 };
var _powerUps = [];
var _multiBall = { start: -1, dur: 2500, count: 4 };
var _superBall = { start: -1, dur: 2500 };
var _lazer = { start: -1, dur: 6000, initVY: 10, initWidth: 5, initHeight: 25, vY: 0, width: 0, height: 0, minShoot: 500, lastShoot: 0, color: "red" };
var _lazers = [];
var _longPaddle = { start: -1, dur: 10000, initWidthAdd: 200, initWidthInc: 6, widthAdd: 0, widthInc: 0 };
var _life = { start: -1, dur: 1000, count: 1 };
var _keyCodes = { up: 38, down: 40, left: 37, right: 39, space: 32, tilda: 192, a: 65, d: 68, p: 80, ctr: 17, alt: 18, enter: 13, esc: 27, shift: 16, del: 46, q: 81, w: 87, zero: 48, one: 49, two: 50, three: 51, nine: 57 };
var _keys = { left: false, right: false, space: false };
var _mouseCodes = { leftClick: 1, rightClick: 3 };
var _mouse = { x: 0, y: 0, xLast: 0, yLast: 0, leftDown: false, rightDown: false };
var _lives = { cur: 3, starting: 3, inc: 1 };
var _paddle = new Paddle(_paddleInit);
var _balls = [];
var _ballAim = new BallAim(_ballAimInit);
var _storeAvailable = false;