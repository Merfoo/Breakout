var _paddleInit = { startWidth: 173, startHeight: 13, startVMax: 10, startVInc: 0.15, width: 0, height: 0, vMax: 0, vInc: 0 };
var _ballInit = { startR: 10, startReleaseHeight: 550, startVMax: 9, r: 0, releaseHeight: 0, vMax: 0 };
var _ballAimInit = { startVMax: 150, startAng: 20, vMax: 0 };
var _dom = { startMenu: null, howToPlayMenu: null, pause: null, hud: null, lives: null, creativeOptions: null, brickModeAdd: null, brickModeDel: null, brickLife0: null, brickLife1: null, brickLife2: null, brickLife3: null };
var _anim = { moveUp: "animateUp", moveDown: "animateDown", moveLeft: "animateLeft", moveRight: "animateRight", fadeIn: "animateFadeIn", fadeOut: "animateFadeOut", darken: "animateDarken", lighten: "animateLighten" };
var _brick = { horz: 20, vert: 20, width: 90, height: 90, live: 0, maxLives: 3, colors: ["black", "green", "yellow", "red"] };
var _brickMap = [];
var _hitSpots = { topLeft: 0, topRight: 1, botLeft: 2, botRight: 3 };
var _map = { width: 0, height: 0, widthMod: 1, heightMod: 1, origWidth: 1346, origHeight: 622 }; // = total height - hud height
var _hud = { height: 0, livesText: "Lives: " };
var _cvs = { game: null };
var _modes = { single: 0, auto: 1, creative: 2, paused: false };
var _mode = _modes.auto;
var _creative = { add: true, life: -1 };
var _levels = [];
var _level = { index: 0, orig: [] };
var _keyCodes = { up: 38, down: 40, left: 37, right: 39, space: 32, tilda: 192, a: 65, d: 68, p: 80, ctr: 17, alt: 18, enter: 13, esc: 27, shift: 16, del: 46, q: 81, w: 87, zero: 48, one: 49, two: 50, three: 51 };
var _keys = { left: false, right: false, space: false };
var _mouseCodes = { leftClick: 1, rightClick: 3 };
var _mouse = { x: 0, y: 0, xLast: 0, yLast: 0, leftDown: false, rightDown: false };
var _lives = { cur: 3, starting: 3, inc: 1 };
var _paddle = new Paddle(_paddleInit);
var _balls = [];
var _ballAim = new BallAim(_ballAimInit);
var _storeAvailable = false;

document.addEventListener("DOMContentLoaded", init);
document.documentElement.style.overflowX = "hidden";	 // Horz scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vert scrollbar will be hidden
document.addEventListener("keyup", keyUpEvent);
document.addEventListener("keydown", keyDownEvent);
document.addEventListener("mousemove", mouseMoveEvent);
document.addEventListener("mousedown", mouseDownEvent);
document.addEventListener("mouseup", mouseUpEvent);

function init()
{
    _storeAvailable = typeof(Storage) !== "undefined";
    _dom.startMenu = document.getElementById("startMenu");
    _dom.howToPlayMenu = document.getElementById("howToPlay");
    _dom.pause = document.getElementById("paused");
    _dom.hud = document.getElementById("hud");
    _dom.lives = document.getElementById("lives");
    _dom.brickModeAdd = document.getElementById("brickModeAdd");
    _dom.brickModeDel = document.getElementById("brickModeDel");
    _dom.brickLife0 = document.getElementById("brickLife0");
    _dom.brickLife1 = document.getElementById("brickLife1");
    _dom.brickLife2 = document.getElementById("brickLife2");
    _dom.brickLife3 = document.getElementById("brickLife3");
    _dom.creativeOptions = document.getElementById("creativeOptions");
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    _hud.height = _dom.hud.clientHeight;
    document.getElementById("creativeMode").onclick = initCreativeMode;
    document.getElementById("instructions").onclick = showHowToPlayMenu;
    document.getElementById("backToStartMenu").onclick = showStartMenu;
    _dom.brickModeAdd.onclick = brickAddClicked;
    _dom.brickModeDel.onclick = brickDelClicked;
    _dom.brickLife0.onclick = brickLife0Clicked;
    _dom.brickLife1.onclick = brickLife1Clicked;
    _dom.brickLife2.onclick = brickLife2Clicked;
    _dom.brickLife3.onclick = brickLife3Clicked;
    window.addEventListener("resize", setGameSize);
    window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    
    updateBrickModeAnim();
    updateBrickLifeAnim();
    makeLevels();
    setGameSize();
    initGame();
    loop();
}

function setGameSize()
{
    _map.width = window.innerWidth;
    _map.height = window.innerHeight - _hud.height;
    _map.widthMod = _map.width / _map.origWidth;
    _map.heightMod = _map.height / _map.origHeight;
    _cvs.game.canvas.width = _map.width;
    _cvs.game.canvas.height = _map.height;
    _brick.width = _map.width / _brick.horz;
    _brick.height = _map.height / _brick.vert;
    _ballAimInit.vMax = _ballAimInit.startVMax * _map.heightMod;
    _paddleInit.width = _paddleInit.startWidth * _map.widthMod;
    _paddleInit.height = _paddleInit.startHeight * _map.heightMod;
    _paddleInit.vMax = _paddleInit.startVMax * _map.widthMod;
    _paddleInit.vInc = _paddleInit.startVInc * _map.widthMod;
    _ballInit.r = _ballInit.startR * _map.widthMod;
    _ballInit.releaseHeight = _ballInit.startReleaseHeight * _map.heightMod;
    _ballInit.vMax = _ballInit.startVMax * _map.widthMod;
    
    _ballAim.vMax = _ballAimInit.vMax;
    _paddle.width = _paddleInit.width;
    _paddle.height = _paddleInit.height;
    _paddle.vMax = _paddleInit.vMax;
    _paddle.vInc = _paddleInit.vInc;
    _paddle.y = _map.height - _paddleInit.height;
    
    for(var i = 0, len = _balls.length; i < len; i++)
    {
        _balls[i].r = _ballInit.r;
        _balls[i].releaseHeight = _ballInit.releaseHeight;
        _balls[i].vMax = _ballInit.vMax;
        var ballMod = _balls[i].vMax / Math.sqrt((_balls[i].vX * _balls[i].vX) + (_balls[i].vY * _balls[i].vY));
        _balls[i].vX *= ballMod;
        _balls[i].vY *= ballMod;
    }
}

function loop()
{
    clearScreen();
    
    switch(_mode)
    {
        case _modes.auto:
            updateAi();
            
        case _modes.single:
            if(_modes.paused)
                break;
            
            if(!_balls[0].released)
            {
                updateBallAim();
                paintBallAim();
            }
            
            else
                updatePaddle();
            
            
            updateBalls();
            updateHud();
            break;
            
        case _modes.creative:
            break;
    }
    
    paintBalls();
    paintPaddle();
    paintBricks();
    window.requestAnimFrame(loop);
}

function initGame()
{    
    _paddle = new Paddle(_paddleInit);
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _paddle.y = _map.height - _paddle.height;
    _balls = [new Ball(_ballInit)];
    _balls[0].x = _paddle.x + _paddle.width / 2;
    _balls[0].y = _balls[0].releaseHeight;
    _keys.left = false;
    _keys.right = false;
    _keys.enter = false;
    _lives.cur = _lives.starting;
    getLevel(_level.index);
}

function paintBricks()
{
    for(var x = 0; x < _brick.horz; x++)
        for(var y = 0; y < _brick.vert; y++)
            if(_brickMap[x][y] !== null)
                if(_brickMap[x][y].lives > 0 || _brickMap[x][y].invincible)
                    paintBrick(_brickMap[x][y], _brickMap[x][y].color = _brick.colors[_brickMap[x][y].lives]);
}

function updateAi()
{
    var ballLine = new Line();
    ballLine.createLine({ x: _balls[0].x, y: _balls[0].y }, { x: _balls[0].xLast, y: _balls[0].yLast });
    var colX = ballLine.getX(_paddle.y);

    if(_balls[0].vY < 0)
        colX = ballLine.getX(0);

    if((colX > _paddle.x + _paddle.width))
    {
        _keys.left = false;
        _keys.right = true;
    }

    else if((colX < _paddle.x))
    {
        _keys.left = true;
        _keys.right = false;
    }

    else
    {
        _keys.left = false;
        _keys.right = false;
    } 

    if(!_balls[0].released)
    {
        var vel = getVel(getRandomNumber(-90 - _balls[0].maxAng, -90 + _balls[0].maxAng), _balls[0].vMax);
        _balls[0].vX = vel.x;
        _balls[0].vY = vel.y;
        _balls[0].x = _paddle.x + (_paddle.width / 2);
        _balls[0].y = _balls[0].releaseHeight;
        _balls[0].released = true;
    }
}

function updatePaddle()
{
    if(_keys.left || _keys.right)
    {
        if(_keys.left)
            _paddle.v -= _paddle.vInc;

        if(_keys.right)
            _paddle.v += _paddle.vInc;
        
        if(_paddle.v > 1)
            _paddle.v = 1;
        
        if(_paddle.v < -1)
            _paddle.v = -1;
    }
    
    else
    {
        if(_paddle.v > 0 + _paddle.vInc)
            _paddle.v -= _paddle.vInc;
        
        if(_paddle.v < 0 - _paddle.vInc)
            _paddle.v += _paddle.vInc;
        
        if(Math.abs(_paddle.v) <= _paddle.vInc)
            _paddle.v = 0;
    }
    
    _paddle.x += _paddle.vMax * _paddle.v;
    
    if(_paddle.x + _paddle.width + _paddle.height > _map.width)
    {
        _paddle.x = _map.width - _paddle.width - _paddle.height;
        _paddle.v = 0;
    }
    
    if(_paddle.x  - _paddle.height < 0)
    {
        _paddle.x = _paddle.height;
        _paddle.v = 0;
    }
}

function updateBallAim()
{
    _paddle.v = 0;
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _balls[0].vX = 0;
    _balls[0].vY = 0;
    _balls[0].x = _paddle.x + (_paddle.width / 2);
    _balls[0].y = _paddle.y - _paddle.height - _balls[0].r;
    _ballAim.x = _balls[0].x;
    _ballAim.y = _balls[0].y;
    
    // Left is -20, right is -160 degrees
    if(_keys.left)
        _ballAim.ang += _ballAim.angI;
    
    else if(_keys.right)
        _ballAim.ang -= _ballAim.angI;
    
    if(_ballAim.ang < _ballAim.angMin)
        _ballAim.ang = _ballAim.angMin;
    
    else if(_ballAim.ang > _ballAim.angMax)
        _ballAim.ang = _ballAim.angMax;
        
    var newVel = getVel(_ballAim.ang, _ballAim.vMax);
    _ballAim.vX = newVel.x;
    _ballAim.vY = newVel.y;
    
    if(_keys.enter)
    {
        var ballVel = getVel(_ballAim.ang, _balls[0].vMax);
        _balls[0].vX = ballVel.x;
        _balls[0].vY = ballVel.y;
        _balls[0].released = true;
    }
}

function updateHud()
{
    _dom.lives.innerHTML = _hud.livesText + _lives.cur;
}

function updateBalls()
{    
    for(var i = 0; i < _balls.length; i++)
    {
        if(_balls[i].x + _balls[i].r > _map.width) 
            _balls[i].vX = -Math.abs(_balls[i].vX);

        else if(_balls[i].x - _balls[i].r < 0)
            _balls[i].vX = Math.abs(_balls[i].vX);

        if(_balls[i].y - _balls[i].r < 0)
            _balls[i].vY = Math.abs(_balls[i].vY);

        else if(_balls[i].y > _map.height)
        {
            if(_balls.length === 1)
            { 
                if(_mode === _modes.single)
                    if(--_lives.cur <= 0)
                        initAutoMode();

                _balls[i].released = false;
            }

            else
            {
                _balls.splice(i, 1);
                i--;
                continue;
            }
            
        }

        if(ballHitPaddle(_balls[i]))
        {
            var newVel = getVel((-_balls[i].maxAng * ((_balls[i].x - _paddle.x - (_paddle.width / 2)) / (_paddle.width / 2))) - 90, _balls[i].vMax);
            _balls[i].vX = newVel.x;
            _balls[i].vY = newVel.y;
        }

        var collided = { x: false, y: false };
        var removeLives = [];
        var localBricks = getLocalBricks(Math.floor(_balls[i].x / _brick.width), Math.floor(_balls[i].y / _brick.height));
        
        for(var brickIndex = 0, len = localBricks.length; brickIndex < len; brickIndex++)
        {
            var hitBrick = false;
            var brick = {};
            brick.x = localBricks[brickIndex].x;
            brick.y = localBricks[brickIndex].y;
            brick.xLeft = brick.x * _brick.width; 
            brick.xRight = (brick.x * _brick.width) + _brick.width; 
            brick.yTop = brick.y * _brick.height;
            brick.yBot = (brick.y * _brick.height) + _brick.height;
            brick.topLeft = { x: brick.xLeft, y: brick.yTop };
            brick.topRight = { x: brick.xRight, y: brick.yTop };
            brick.botLeft=  { x: brick.xLeft, y: brick.yBot };
            brick.botRight = { x: brick.xRight, y: brick.yBot };
            var modBall = {};
            modBall.r = _balls[i].r;
            modBall.xLast = _balls[i].x + (modBall.r * (_balls[i].vX < 0 ? -1 : 1) * 0.33);
            modBall.yLast = _balls[i].y + (modBall.r * (_balls[i].vY < 0 ? -1 : 1) * 0.33);
            modBall.x = modBall.xLast + _balls[i].vX;
            modBall.y = modBall.yLast + _balls[i].vY;
            modBall.line = new Line();
            modBall.line.createLine({ x: modBall.x, y: modBall.y }, { x: modBall.xLast, y: modBall.yLast });
            var xTop = modBall.line.getX(brick.yTop);
            var xBot = modBall.line.getX(brick.yBot);
            var yLeft = modBall.line.getY(brick.xLeft);
            var yRight = modBall.line.getY(brick.xRight);

            if((xTop > brick.xLeft && xTop < brick.xRight) || (xBot > brick.xLeft && xBot < brick.xRight) || (yLeft > brick.yTop && yLeft < brick.yBot) || (yRight > brick.yTop && yRight < brick.yBot))
            {

                if(modBall.x > brick.xLeft && modBall.x < brick.xRight && modBall.y > brick.yTop && modBall.y < brick.yBot)
                {
                    hitBrick = true;

                    if((xTop > brick.xLeft && xTop < brick.xRight) || (xBot > brick.xLeft && xBot < brick.xRight))
                        if(inBetween(brick.yTop, modBall.y, modBall.yLast) || inBetween(brick.yBot, modBall.y, modBall.yLast))
                            collided.y = true;

                    if((yLeft > brick.yTop && yLeft < brick.yBot) || (yRight > brick.yTop && yRight < brick.yBot))
                        if(inBetween(brick.xLeft, modBall.x, modBall.xLast) || inBetween(brick.xRight, modBall.x, modBall.xLast))
                            collided.x = true;
                }
            }

            var hitSpot = -1;
            var dist = modBall.r * 0.75;
            var newVel;

            if(getDist(brick.botLeft, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.botLeft;
                newVel = getVel(getRandomNumber(30, 60), _balls[i].vMax);
                console.log("corner bot left");
            }

            if(getDist(brick.botRight, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.botRight;
                newVel = getVel(getRandomNumber(120, 150), _balls[i].vMax);
                console.log("corner bot right");
            }

            if(getDist(brick.topLeft, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.topLeft;
                newVel = getVel(getRandomNumber(-30, -60), _balls[i].vMax);
                console.log("corner top left");
            }

            if(getDist(brick.topRight, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.topRight;
                newVel = getVel(getRandomNumber(-120, -150), _balls[i].vMax);
                console.log("corner top right");
            }

            if(hitBrick && hitSpot !== -1)
            {
                collided.x = true;
                collided.y = true; 
                var changeVel = true;
                
                switch(hitSpot)
                {
                    case _hitSpots.botLeft:
                        if(isBrickHere(localBricks[brickIndex].x - 1, localBricks[brickIndex].y))
                            collided.x = false;

                        if(isBrickHere(localBricks[brickIndex].x, localBricks[brickIndex].y + 1))
                            collided.y = false;

                        if(isBrickHere(localBricks[brickIndex].x - 1, localBricks[brickIndex].y + 1))
                            changeVel = false;
                        break;

                    case _hitSpots.botRight:
                        if(isBrickHere(localBricks[brickIndex].x + 1, localBricks[brickIndex].y))
                            collided.x = false;

                        if(isBrickHere(localBricks[brickIndex].x, localBricks[brickIndex].y + 1))
                            collided.y = false;

                        if(isBrickHere(localBricks[brickIndex].x + 1, localBricks[brickIndex].y + 1))
                            changeVel = false;
                        break;

                    case _hitSpots.topLeft:
                        if(isBrickHere(localBricks[brickIndex].x - 1, localBricks[brickIndex].y))
                            collided.x = false;

                        if(isBrickHere(localBricks[brickIndex].x, localBricks[brickIndex].y - 1))
                            collided.y = false;

                        if(isBrickHere(localBricks[brickIndex].x - 1, localBricks[brickIndex].y - 1))
                            changeVel = false;
                        break;

                    case _hitSpots.topRight:
                        if(isBrickHere(localBricks[brickIndex].x + 1, localBricks[brickIndex].y))
                            collided.x = false;

                        if(isBrickHere(localBricks[brickIndex].x, localBricks[brickIndex].y - 1))
                            collided.y = false;

                        if(isBrickHere(localBricks[brickIndex].x + 1, localBricks[brickIndex].y - 1))
                            changeVel = false;
                        break;
                }

                if(collided.x && collided.y && changeVel)
                {
                    _balls[i].vX = newVel.x * -1;
                    _balls[i].vY = newVel.y * -1;
                }

                else if(!changeVel)
                {
                    collided.x = true;
                    collided.y = true; 
                }
            }

            if(localBricks[brickIndex].lives > 0 && hitBrick)
                removeLives.push(brickIndex);    
        }

        for(var j = 0, len = removeLives.length; j < len; j++)
            if(--localBricks[removeLives[j]].lives <= 0)
                _brick.live--;

        if(collided.x)
            _balls[i].vX *= -1;

        if(collided.y)
            _balls[i].vY *= -1;

        _balls[i].xLast = _balls[i].x;
        _balls[i].yLast = _balls[i].y;
        _balls[i].x += _balls[i].vX;
        _balls[i].y += _balls[i].vY;

        if(_brick.live <= 0)
        {
            if(_mode === _modes.single)
                _lives.cur += _lives.inc;

            _balls[i].released = false;
            getNextLevel();
            console.log("bricks destroyed");
        }
    }
}

function ballHitPaddle(newBall)
{
    var ball = { x: newBall.x + newBall.vX, y: newBall.y + newBall.vY };
    
    if(ball.x >= _paddle.x && ball.x <= _paddle.x + _paddle.width)
        if(ball.y >= _paddle.y - (_paddle.height / 2))
            return true;
    
    return false;
}

function getBrick(x, y)
{
    if(isBrickHere(x, y))
        return _brickMap[x][y];
    
    return null;
}

function isBrickHere(x, y)
{
    if(x >= _brick.horz || y >= _brick.vert || x < 0 || y < 0)
        return false;
    
    if(_brickMap[x][y] !== null)
        if(_brickMap[x][y].lives > 0 || _brickMap[x][y].invincible)
            return true;
    
    return false;
}

function getLocalBricks(x, y)
{
    var bricks = [];
    
    if(isBrickHere(x, y))           // center
        bricks.push(getBrick(x, y));
    
    if(isBrickHere(x - 1, y - 1))   // top left
        bricks.push(getBrick(x - 1, y - 1));
    
    if(isBrickHere(x, y - 1))       // top
        bricks.push(getBrick(x, y - 1));
    
    if(isBrickHere(x + 1, y - 1))   // top right
        bricks.push(getBrick(x + 1, y - 1));
    
    if(isBrickHere(x + 1, y))       // right
        bricks.push(getBrick(x + 1, y));
    
    if(isBrickHere(x + 1, y + 1))   // bot right
        bricks.push(getBrick(x + 1, y + 1));
    
    if(isBrickHere(x, y + 1))       // bot
        bricks.push(getBrick(x, y + 1));
    
    if(isBrickHere(x - 1, y + 1))   // bot left
        bricks.push(getBrick(x - 1, y + 1));
    
    if(isBrickHere(x - 1, y))       // left 
        bricks.push(getBrick(x - 1, y));
    
    return bricks;
}

function clearScreen()
{
    _cvs.game.clearRect(0, 0, _map.width, _map.height);
}

function paintBrick(brick, newColor)
{
    var x = brick.x;
    var y = brick.y;
    var color = !!newColor ? newColor : brick.color;
    _cvs.game.fillStyle = color;
    _cvs.game.fillRect(x * _brick.width, y * _brick.height, _brick.width, _brick.height);
}

function paintBalls()
{
    for(var i = 0, len = _balls.length; i < len; i++)
    {
        var ball = _balls[i];
        _cvs.game.beginPath();
        _cvs.game.fillStyle = ball.color;
        _cvs.game.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
        _cvs.game.fill();
    }
}

function paintBallAim()
{
    _cvs.game.beginPath();
    _cvs.game.lineWidth = _ballAim.width;
    _cvs.game.strokeStyle = _ballAim.color;
    _cvs.game.moveTo(_ballAim.x, _ballAim.y);
    _cvs.game.lineTo(_ballAim.x + _ballAim.vX, _ballAim.y + _ballAim.vY);
    _cvs.game.stroke();
    _cvs.game.closePath();
}

function paintBrickCorner(newBrick)
{
    var brick = { x: newBrick.x * _brick.width, y: newBrick.y * _brick.height };
    var r = _ballInit.r;
    _cvs.game.beginPath();  // Top left
    _cvs.game.fillStyle = "blue";
    _cvs.game.arc(brick.x, brick.y, r, 0, 2 * Math.PI);
    _cvs.game.fill();       
    _cvs.game.beginPath();  // Bot left
    _cvs.game.fillStyle = "blue";
    _cvs.game.arc(brick.x, brick.y + _brick.height, r, 0, 2 * Math.PI);
    _cvs.game.fill();      
    _cvs.game.beginPath();  // Top right
    _cvs.game.fillStyle = "blue";
    _cvs.game.arc(brick.x + _brick.width, brick.y, r, 0, 2 * Math.PI);
    _cvs.game.fill();
    _cvs.game.beginPath();  // Bot right
    _cvs.game.fillStyle = "blue";
    _cvs.game.arc(brick.x + _brick.width, brick.y + _brick.height, r, 0, 2 * Math.PI);
    _cvs.game.fill();
}

function paintPaddle()
{
    var x = _paddle.x;
    var y = _paddle.y;
    var color = _paddle.color;
    _cvs.game.lineCap = "round";
    _cvs.game.lineWidth = _paddle.height;
    _cvs.game.beginPath();
    _cvs.game.moveTo(x, y);
    _cvs.game.lineTo(x + _paddle.width, y);
    _cvs.game.strokeStyle = color;
    _cvs.game.stroke();
    _cvs.game.closePath();
}

function makeLevels()
{
    _level.orig = [];
    _level.orig.push(makeLevel1());
    _level.orig.push(makeLevel2());
    _level.orig.push(makeLevel3());
    _level.orig.push(makeLevel4());
    _level.orig.push(makeLevel5());
    _levels = [].concat(_level.orig);
    
    if(_storeAvailable && !!localStorage.levels)
        _levels = _levels.concat(JSON.parse(localStorage.levels));
}

function getLevel(index)
{
    if(index < 0)
        index = 0;
    
    else if(index >= _levels.length)
        index = _levels.length - 1;
    
    _level.index = index;
    _brick.live = 0;
    _brickMap = [];
    
    for(var x = 0; x < _brick.horz; x++)
    {    
        _brickMap[x] = [];
        
        for(var y = 0; y < _brick.vert; y++)
        {   
            if(_levels[_level.index][x][y] !== null)
            {
                _brickMap[x][y] = cloneObj(_levels[_level.index][x][y]);
                
                if(!_brickMap[x][y].invincible)
                    _brick.live++;
            }
            
            else
                _brickMap[x][y] = null;
        }
    }
}

function getPrevLevel()
{
    --_level.index;
    
    if(_level.index< 0 || (_mode === _modes.creative && _level.index < _level.orig.length))
    {
        _level.index = _levels.length - 1;
    }
    
    getLevel(_level.index);
}

function getNextLevel()
{
    ++_level.index;
    
    if(_level.index >= _levels.length) 
    {
        _level.index = 0;
        
        if(_mode === _modes.creative)
            _level.index = _level.orig.length;
    }

    getLevel(_level.index);
}

function removeAllAnimations(elem)
{
    for(var prop in _anim)
        if(_anim.hasOwnProperty(prop))
            elem.classList.remove(_anim[prop]);
}

function showStartMenu()
{
    hideHowToPlayMenu();
    hidePause();
    removeAllAnimations(_dom.startMenu);
    _dom.startMenu.classList.add(_anim.moveUp);
    _modes.paused = false;
}

function hideStartMenu()
{        
    removeAllAnimations(_dom.startMenu);
    _dom.startMenu.classList.add(_anim.moveDown);
}

function showHowToPlayMenu()
{
    hideStartMenu();
    removeAllAnimations(_dom.howToPlayMenu);
    _dom.howToPlayMenu.style.display = "inline";
    _dom.howToPlayMenu.classList.add(_anim.moveLeft);
}

function hideHowToPlayMenu()
{
    removeAllAnimations(_dom.howToPlayMenu);
    _dom.howToPlayMenu.classList.add(_anim.moveRight);
}

function showPause()
{
    removeAllAnimations(_dom.pause);
    _dom.pause.style.display = "inline";
    _dom.pause.classList.add(_anim.fadeIn);
}

function hidePause()
{
    removeAllAnimations(_dom.pause);
    _dom.pause.classList.add(_anim.fadeOut);
}


function brickAddClicked()
{
    _creative.add = true;
    updateBrickModeAnim();
}

function brickDelClicked()
{
    _creative.add = false;
    updateBrickModeAnim();
}

function updateBrickModeAnim()
{
    removeAllAnimations(_dom.brickModeAdd);
    removeAllAnimations(_dom.brickModeDel);
    _dom.brickModeAdd.classList.add(_creative.add ? _anim.darken : _anim.lighten);
    _dom.brickModeDel.classList.add(!_creative.add ? _anim.darken : _anim.lighten);
}

function brickLife0Clicked()
{
    if(_creative.life === 0)
        _creative.life = -1;
    
    else
        _creative.life = 0;
    
    updateBrickLifeAnim();
}

function brickLife1Clicked()
{
    if(_creative.life === 1)
        _creative.life = -1;
    
    else
        _creative.life = 1;
    
    updateBrickLifeAnim();
}

function brickLife2Clicked()
{
    if(_creative.life === 2)
        _creative.life = -1;
    
    else
        _creative.life = 2;
    
    updateBrickLifeAnim();
}

function brickLife3Clicked()
{
    if(_creative.life === 3)
        _creative.life = -1;
    
    else
        _creative.life = 3;
    
    updateBrickLifeAnim();
}

function updateBrickLifeAnim()
{
    removeAllAnimations(_dom.brickLife0);
    removeAllAnimations(_dom.brickLife1);
    removeAllAnimations(_dom.brickLife2);
    removeAllAnimations(_dom.brickLife3);
    _dom.brickLife0.classList.add(_creative.life === 0 ? _anim.darken : _anim.lighten);
    _dom.brickLife1.classList.add(_creative.life === 1 ? _anim.darken : _anim.lighten);
    _dom.brickLife2.classList.add(_creative.life === 2 ? _anim.darken : _anim.lighten);
    _dom.brickLife3.classList.add(_creative.life === 3 ? _anim.darken : _anim.lighten);
}

function keyUpEvent(e)
{    
    switch(e.keyCode)
    {
        case _keyCodes.esc:
            initAutoMode();       
            break;
        
        case _keyCodes.tilda:
            printLevel();
            break;
            
        case _keyCodes.enter:
            if(_mode !== _modes.single)
                initSingleMode();
            break;
            
        case _keyCodes.a:
            getPrevLevel();
            break;
                
        case _keyCodes.d:
            getNextLevel();
            break;

        case _keyCodes.alt:
            saveCanvasImg();
            break;
    }
    
    if(_mode === _modes.single)
    {    
        switch(e.keyCode)
        {
            case _keyCodes.left:
                _keys.left = false;
                break;

            case _keyCodes.right:
                _keys.right = false;
                break;
                
            case _keyCodes.enter:
                _keys.enter = false;
                break;
                
            case _keyCodes.p:
                (_modes.paused = !_modes.paused) ? showPause() : hidePause();
                break;
        }
    }
    
    if(_mode === _modes.creative)
    {
        switch(e.keyCode)
        {
            case _keyCodes.del:
                removeLevel();
                break;
                
            case _keyCodes.ctr:
                addLevel();
                break;
                
            case _keyCodes.q:
                brickAddClicked();
                break;
                
            case _keyCodes.w:
                brickDelClicked();
                break;
                
            case _keyCodes.zero:
                brickLife0Clicked();
                break;
                
            case _keyCodes.one:
                brickLife1Clicked();
                break;
                
            case _keyCodes.two:
                brickLife2Clicked();
                break;
                
            case _keyCodes.three:
                brickLife3Clicked();
                break;
        }
    }
}

function keyDownEvent(e)
{
    if(_mode === _modes.single)
    {    
        switch(e.keyCode)
        {
            case _keyCodes.left:
                _keys.left = true;
                break;

            case _keyCodes.right:
                _keys.right = true;
                break;
                
            case _keyCodes.enter:
                _keys.enter = true;
                break;
        }
    }
    
    // To prevent page from scrolling on Firefox
    switch(e.keyCode)
    {
        case _keyCodes.up:
        case _keyCodes.down:
        case _keyCodes.left:
        case _keyCodes.right:
        case _keyCodes.space:
            e.preventDefault();
            break;
    }
}

// Add/Remove brick
function modBrick(x, y)
{
    var life = _creative.life === -1 ? 1 : _creative.life;
    
    if(_creative.add)
    {    
        if(!isBrickHere(x, y))
        {
            _brickMap[x][y] = new Brick(x, y, life);
            
            if(_creative.life === 0)
                _brickMap[x][y].invincible = true;
        }
        
    }

    else
        _brickMap[x][y] = null;
    
    _levels[_level.index][x][y] = cloneObj(_brickMap[x][y]);
}

// Increase brick life
function incBrick(x, y)
{
    if(isBrickHere(x, y))
    {
        if(_creative.life === -1)
        {
            if(++_brickMap[x][y].lives > _brick.maxLives)
                _brickMap[x][y].lives = 0;
        }
        
        else
            _brickMap[x][y].lives = _creative.life;
        
        _brickMap[x][y].invincible = (_brickMap[x][y].lives === 0);
    }
    
    _levels[_level.index][x][y] = cloneObj(_brickMap[x][y]);
}

function mouseMoveEvent(e)
{
    if(_mode === _modes.creative)
    {
        _mouse.xLast = _mouse.x;
        _mouse.yLast = _mouse.y;
        _mouse.x = e.clientX;
        _mouse.y = e.clientY;
        var x = Math.floor(_mouse.x / _brick.width);
        var y = Math.floor((_mouse.y - _hud.height) / _brick.height);
        var xLast = Math.floor(_mouse.xLast / _brick.width);
        var yLast = Math.floor((_mouse.yLast - _hud.height) / _brick.height);
        
        if(x === xLast && y === yLast)
            return;
        
        if(_mouse.leftDown)
            modBrick(x, y);
        
        if(_mouse.rightDown)
            incBrick(x, y);
    }
}

function mouseDownEvent(e)
{
    if(_mode === _modes.creative)
    {
        var x = Math.floor(_mouse.x / _brick.width);
        var y = Math.floor((_mouse.y - _hud.height) / _brick.height);
        
        if(e.which === _mouseCodes.leftClick)
        {
            modBrick(x, y);
            _mouse.leftDown = true;
        }
        
        if(e.which === _mouseCodes.rightClick)
        {
            incBrick(x, y);
            _mouse.rightDown = true;
        }
    }
}

function mouseUpEvent(e)
{
    if(e.which === _mouseCodes.leftClick)
        _mouse.leftDown = false;
    
    if(e.which === _mouseCodes.rightClick)
        _mouse.rightDown = false;
}

function saveCanvasImg()
{
    downloadImg("canvasImg.png", _cvs.game.canvas.toDataURL("image/png"));
}
    
function printLevel()
{
    var str = "return JSON.parse('" + JSON.stringify(_brickMap) + "');";
    download("level.txt", str);
}

function initAutoMode()
{   
    _lives.cur = _lives.starting;
    showStartMenu();
            
    if(_mode === _modes.creative)
        endCreativeMode();
    
    _mode = _modes.auto;
}

function initSingleMode()
{
    if(_mode === _modes.creative)
        endCreativeMode();
    
    hideStartMenu();
    hideHowToPlayMenu();
    initGame();
    _mode = _modes.single;
}

function initCreativeMode()
{
    hideStartMenu();
    initGame();
    _mode = _modes.creative;
    _level.index = _levels.length - 1;
    addLevel();
    removeAllAnimations(_dom.creativeOptions);
    _dom.creativeOptions.classList.add(_anim.fadeIn);
}

function endCreativeMode()
{
    saveLevels();
    getLevel(_level.index);
    removeAllAnimations(_dom.creativeOptions);
    _dom.creativeOptions.classList.add(_anim.fadeOut);
}

function removeLevel()
{
    if(_level.index >= _level.orig.length)
    {
        _levels.splice(_level.index, 1);
        
        if(_level.index >= _levels.length)
            _level.index = _levels.length - 1;
        
        if(_level.orig.length === _levels.length)
            addLevel();
        
        getLevel(_level.index);
    }
}

function addLevel()
{
    var newLevel = [];
    
    for(var i = 0; i < _brick.horz; i++)
    {
        newLevel[i] = [];
        
        for(var j = 0; j < _brick.vert; j++)
            newLevel[i][j] = null;
    }
            
    _levels.splice(++_level.index, 0, newLevel);
    getLevel(_level.index);
}

function saveLevels()
{
    var newLevels = [];
    var addedLevel = false;
    
    for(var i = _level.orig.length, len = _levels.length; i < len; i++)
    {    
        addedLevel = false;
        
        for(var x = 0; x < _brick.horz; x++)
        {   
            for(var y = 0; y < _brick.vert; y++)
            {    
                if(_levels[i][x][y] !== null)
                {
                    newLevels.push(_levels[i]);
                    addedLevel = true;
                    break;
                }
            }
            
            if(addedLevel)
                break;
        }
    }
    
    localStorage.levels = JSON.stringify(newLevels);
    _levels = _level.orig.concat(newLevels);
}