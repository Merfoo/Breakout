var _paddleInit = { startWidth: 173, startHeight: 13, startVMax: 10, startVInc: 0.15, width: 0, height: 0, vMax: 0, vInc: 0 };
var _ballInit = { startR: 10, startReleaseHeight: 550, startVMax: 9, r: 0, releaseHeight: 0, vMax: 0 };
var _ballAimInit = { startVMax: 150, startAng: 20, vMax: 0 };
var _dom = { startMenu: null, howToPlayMenu: null, pause: null, hud: null, lives: null };
var _anim = { moveUp: "animateUp", moveDown: "animateDown", moveLeft: "animateLeft", moveRight: "animateRight", fadeIn: "animateFadeIn", fadeOut: "animateFadeOut" };
var _brick = { horz: 20, vert: 20, width: 90, height: 90, live: 0, maxLives: 3, colors: ["black", "green", "yellow", "red"] };
var _bricks = [];
var _hitSpots = { topLeft: 0, topRight: 1, botLeft: 2, botRight: 3 };
var _map = { width: 0, height: 0, widthMod: 1, heightMod: 1, origWidth: 1346, origHeight: 622 }; // = total height - hud height
var _hud = { height: 0, livesText: "Lives: " };
var _cvs = { game: null };
var _modes = { single: 0, auto: 1, creative: 2, paused: false };
var _mode = _modes.auto;
var _levels = [];
var _level = { index: 0, orig: [] };
var _keyCodes = { up: 38, down: 40, left: 37, right: 39, space: 32, tilda: 192, a: 65, d: 68, p: 80, ctr: 17, alt: 18, enter: 13, esc: 27, shift: 16, del: 46 };
var _keys = { left: false, right: false, space: false };
var _mouseCodes = { leftClick: 1, rightClick: 3 };
var _lives = { cur: 3, starting: 3, inc: 1 };
var _paddle = new Paddle(_paddleInit);
var _ball = new Ball(_ballInit);
var _ballAim = new BallAim(_ballAimInit);
var _storeAvailable = false;

document.addEventListener("DOMContentLoaded", init);
document.documentElement.style.overflowX = "hidden";	 // Horz scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vert scrollbar will be hidden
document.addEventListener("keyup", keyUpEvent);
document.addEventListener("keydown", keyDownEvent);
document.addEventListener("mousedown", mouseDownEvent);

function init()
{
    _storeAvailable = typeof(Storage) !== "undefined";
    _dom.startMenu = document.getElementById("startMenu");
    _dom.howToPlayMenu = document.getElementById("howToPlay");
    _dom.pause = document.getElementById("paused");
    _dom.hud = document.getElementById("hud");
    _dom.lives = document.getElementById("lives");
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    _hud.height = _dom.hud.clientHeight;
    document.getElementById("creativeMode").onclick = initCreativeMode;
    document.getElementById("instructions").onclick = showHowToPlayMenu;
    document.getElementById("backToStartMenu").onclick = showStartMenu;
    window.addEventListener("resize", setGameSize);
    window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    
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
    _ball.r = _ballInit.r;
    _ball.releaseHeight = _ballInit.releaseHeight;
    _ball.vMax = _ballInit.vMax;
    var ballMod = _ball.vMax / Math.sqrt((_ball.vX * _ball.vX) + (_ball.vY * _ball.vY));
    _ball.vX *= ballMod;
    _ball.vY *= ballMod;
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
            
            if(!_ball.released)
            {
                updateBallAim();
                paintBallAim();
            }
            
            else
                updatePaddle();
            
            updateBall();
            updateHud();
            break;
            
        case _modes.creative:
            break;
    }
    
    paintBall();
    paintPaddle();
    paintBricks();
    window.requestAnimFrame(loop);
}

function initGame()
{    
    _ball = new Ball(_ballInit);
    _paddle = new Paddle(_paddleInit);
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _paddle.y = _map.height - _paddle.height;
    _ball.x = _paddle.x + _paddle.width / 2;
    _ball.y = _ball.releaseHeight;
    _keys.left = false;
    _keys.right = false;
    _keys.space = false;
    _lives.cur = _lives.starting;
    getLevel(_level.index);
}

function paintBricks()
{
    for(var brickIndex in _bricks)
    {
        if(_bricks[brickIndex].lives > 0 || _bricks[brickIndex].invincible)
        {
            _bricks[brickIndex].color = _brick.colors[_bricks[brickIndex].lives];
            paintBrick(_bricks[brickIndex]);
        }
    }
}

function updateAi()
{
    var ballLine = new Line();
    ballLine.createLine({ x: _ball.x, y: _ball.y }, { x: _ball.xLast, y: _ball.yLast });
    var colX = ballLine.getX(_paddle.y);

    if(_ball.vY < 0)
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

    if(!_ball.released)
    {
        var vel = getVel(getRandomNumber(-90 - _ball.maxAng, -90 + _ball.maxAng), _ball.vMax);
        _ball.vX = vel.x;
        _ball.vY = vel.y;
        _ball.x = _paddle.x + (_paddle.width / 2);
        _ball.y = _ball.releaseHeight;
        _ball.released = true;
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
    _ball.vX = 0;
    _ball.vY = 0;
    _ball.x = _paddle.x + (_paddle.width / 2);
    _ball.y = _paddle.y - _paddle.height - _ball.r;
    _ballAim.x = _ball.x;
    _ballAim.y = _ball.y;
    
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
    
    if(_keys.space)
    {
        var ballVel = getVel(_ballAim.ang, _ball.vMax);
        _ball.vX = ballVel.x;
        _ball.vY = ballVel.y;
        _ball.released = true;
    }
}

function updateHud()
{
    _dom.lives.innerHTML = _hud.livesText + _lives.cur;
}

function updateBall()
{    
    if(_ball.x + _ball.r > _map.width) 
        _ball.vX = -Math.abs(_ball.vX);
    
    else if(_ball.x - _ball.r < 0)
        _ball.vX = Math.abs(_ball.vX);
        
    if(_ball.y - _ball.r < 0)
        _ball.vY = Math.abs(_ball.vY);
    
    else if(_ball.y > _map.height)
    {
        if(_mode === _modes.single)
            if(--_lives.cur <= 0)
                initAutoMode();

        _ball.released = false;
    }
    
    if(ballHitPaddle())
    {
        var newVel = getVel((-_ball.maxAng * ((_ball.x - _paddle.x - (_paddle.width / 2)) / (_paddle.width / 2))) - 90, _ball.vMax);
        _ball.vX = newVel.x;
        _ball.vY = newVel.y;
    }
       
    var collided = { x: false, y: false };
    var removeLives = [];
    
    for(var brickIndex = 0, len = _bricks.length; brickIndex < len; brickIndex++)
    {
        if(_bricks[brickIndex].lives <= 0 && !_bricks[brickIndex].invincible)
            continue;
        
        var hitBrick = false;
        var brick = _bricks[brickIndex].clone();
        brick.xLeft = brick.x * _brick.width; 
        brick.xRight = (brick.x * _brick.width) + _brick.width; 
        brick.yTop = brick.y * _brick.height;
        brick.yBot = (brick.y * _brick.height) + _brick.height;
        brick.cornTopLeft = { x: brick.xLeft, y: brick.yTop };
        brick.cornTopRight = { x: brick.xRight, y: brick.yTop };
        brick.cornBotLeft = { x: brick.xLeft, y: brick.yBot };
        brick.cornBotRight = { x: brick.xRight, y: brick.yBot };
        var ball = _ball.clone();
        ball.xLast = ball.x + (_ball.r * (_ball.vX < 0 ? -1 : 1) * 0.33);
        ball.yLast = ball.y + (_ball.r * (_ball.vY < 0 ? -1 : 1) * 0.33);
        ball.x = ball.xLast + ball.vX;
        ball.y = ball.yLast + ball.vY;
        ball.line = new Line();
        ball.line.createLine({ x: ball.x, y: ball.y }, { x: ball.xLast, y: ball.yLast });
        var xTop = ball.line.getX(brick.yTop);
        var xBot = ball.line.getX(brick.yBot);
        var yLeft = ball.line.getY(brick.xLeft);
        var yRight = ball.line.getY(brick.xRight);
        
        if((xTop > brick.xLeft && xTop < brick.xRight) || (xBot > brick.xLeft && xBot < brick.xRight) || (yLeft > brick.yTop && yLeft < brick.yBot) || (yRight > brick.yTop && yRight < brick.yBot))
        {
            
            if(ball.x > brick.xLeft && ball.x < brick.xRight && ball.y > brick.yTop && ball.y < brick.yBot)
            {
                hitBrick = true;
                
                if((xTop > brick.xLeft && xTop < brick.xRight) || (xBot > brick.xLeft && xBot < brick.xRight))
                    if(inBetween(brick.yTop, ball.y, ball.yLast) || inBetween(brick.yBot, ball.y, ball.yLast))
                        collided.y = true;
                
                if((yLeft > brick.yTop && yLeft < brick.yBot) || (yRight > brick.yTop && yRight < brick.yBot))
                    if(inBetween(brick.xLeft, ball.x, ball.xLast) || inBetween(brick.xRight, ball.x, ball.xLast))
                        collided.x = true;
            }
        }
        
        var hitSpot = -1;
        var dist = ball.r * 0.75;
        var newVel;

        if(getDist(brick.cornBotLeft, ball) < dist)
        {
            hitBrick = true;
            hitSpot = _hitSpots.botLeft;
            newVel = getVel(getRandomNumber(30, 60), _ball.vMax);
            console.log("corner bot left");
        }
        
        if(getDist(brick.cornBotRight, ball) < dist)
        {
            hitBrick = true;
            hitSpot = _hitSpots.botRight;
            newVel = getVel(getRandomNumber(120, 150), _ball.vMax);
            console.log("corner bot right");
        }
        
        if(getDist(brick.cornTopLeft, ball) < dist)
        {
            hitBrick = true;
            hitSpot = _hitSpots.topLeft;
            newVel = getVel(getRandomNumber(-30, -60), _ball.vMax);
            console.log("corner top left");
        }
        
        if(getDist(brick.cornTopRight, ball) < dist)
        {
            hitBrick = true;
            hitSpot = _hitSpots.topRight;
            newVel = getVel(getRandomNumber(-120, -150), _ball.vMax);
            console.log("corner top right");
        }

        if(hitBrick && hitSpot !== -1)
        {
            collided.x = true;
            collided.y = true; 
            var changeVel = true;
            
            for(var i = 0; i < len; i++)
            {
                if(_bricks[i].lives <= 0 && !_bricks[i].invincible)
                    continue;

                var curBrick = _bricks[brickIndex];
                var newBrick = _bricks[i];

                switch(hitSpot)
                {
                    case _hitSpots.botLeft:
                        if(newBrick.x + 1 === curBrick.x && newBrick.y === curBrick.y)
                            collided.x = false;

                        if(newBrick.x === curBrick.x && newBrick.y - 1 === curBrick.y)
                            collided.y = false;
                        
                        if(newBrick.x + 1 === curBrick.x && newBrick.y - 1 === curBrick.y)
                            changeVel = false;
                        break;

                    case _hitSpots.botRight:
                        if(newBrick.x - 1 === curBrick.x && newBrick.y === curBrick.y)
                            collided.x = false;

                        if(newBrick.x === curBrick.x && newBrick.y - 1 === curBrick.y)
                            collided.y = false;
                        
                        if(newBrick.x - 1 === curBrick.x && newBrick.y - 1 === curBrick.y)
                            changeVel = false;
                        break;

                    case _hitSpots.topLeft:
                        if(newBrick.x + 1 === curBrick.x && newBrick.y === curBrick.y)
                            collided.x = false;

                        if(newBrick.x === curBrick.x && newBrick.y + 1 === curBrick.y)
                            collided.y = false;
                        
                        if(newBrick.x + 1 === curBrick.x && newBrick.y + 1 === curBrick.y)
                            changeVel = false;
                        break;

                    case _hitSpots.topRight:
                        if(newBrick.x - 1 === curBrick.x && newBrick.y === curBrick.y)
                            collided.x = false;

                        if(newBrick.x === curBrick.x && newBrick.y + 1 === curBrick.y)
                            collided.y = false;
                        
                        if(newBrick.x - 1 === curBrick.x && newBrick.y + 1 === curBrick.y)
                            changeVel = false;
                        break;
                }
            }

            if(collided.x && collided.y && changeVel)
            {
                _ball.vX = newVel.x * -1;
                _ball.vY = newVel.y * -1;
            }
            
            else if(!changeVel)
            {
                collided.x = true;
                collided.y = true; 
            }
        }
        
        if(_bricks[brickIndex].lives > 0 && hitBrick)
            removeLives.push(brickIndex);    
    }
    
    for(var i = 0, len = removeLives.length; i < len; i++)
        if(--_bricks[removeLives[i]].lives <= 0)
            _brick.live--;
    
    if(collided.x)
        _ball.vX *= -1;

    if(collided.y)
        _ball.vY *= -1;
    
    _ball.xLast = _ball.x;
    _ball.yLast = _ball.y;
    _ball.x += _ball.vX;
    _ball.y += _ball.vY;
        
    if(_brick.live <= 0)
    {
        if(_mode === _modes.single)
            _lives.cur += _lives.inc;
        
        _ball.released = false;
        getNextLevel();
        console.log("bricks destroyed");
    }
}

function ballHitPaddle()
{
    var ball = { x: _ball.x + _ball.vX, y: _ball.y + _ball.vY };
    
    if(ball.x >= _paddle.x && ball.x <= _paddle.x + _paddle.width)
        if(_ball.y >= _paddle.y - (_paddle.height / 2))
            return true;
    
    return false;
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

function paintBall()
{
    _cvs.game.beginPath();
    _cvs.game.fillStyle = _ball.color;
    _cvs.game.arc(_ball.x, _ball.y, _ball.r, 0, 2 * Math.PI);
    _cvs.game.fill();
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
    var r = _ball.r;
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
    _level.index = index;
    _bricks = _levels[_level.index].clone();
    _brick.live = 0;
    
    for(var i = 0, len = _levels[_level.index].length; i < len; i++)
        if(!_levels[_level.index][i].invincible)
            _brick.live++;
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
                
            case _keyCodes.space:
                _keys.space = false;
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
                
            case _keyCodes.space:
                _keys.space = true;
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

function mouseDownEvent(e)
{
    if(_mode === _modes.creative)
    {
        var x = Math.floor(e.clientX / _brick.width);
        var y = Math.floor((e.clientY - _hud.height) / _brick.height);
        var brickIndex = -1;
        
        for(var i in _bricks)
        {
            if(_bricks[i].x === x && _bricks[i].y === y)
            {
                brickIndex = i;
                break;
            }
        }
        
        if(e.which === _mouseCodes.leftClick)
        {
            if(brickIndex === -1)
                _bricks.push(new Brick(x, y));
            
            else
                _bricks.splice(brickIndex, 1);
        }
        
        if(e.which === _mouseCodes.rightClick)
        {
            if(brickIndex !== -1)
            {    
                if(++_bricks[brickIndex].lives > _brick.maxLives)
                    _bricks[brickIndex].lives = 0;
                
                if(_bricks[brickIndex].lives === 0)
                    _bricks[brickIndex].invincible = true;
                
                else
                    _bricks[brickIndex].invincible = false;
            }
        }
        
        _levels[_level.index] = _bricks.clone();
    }
}

function saveCanvasImg()
{
    downloadImg("canvasImg.png", _cvs.game.canvas.toDataURL("image/png"));
}
    
function printLevel()
{
    var str = "\tvar ret = [];\n";
    
    for(var i = 0, len = _bricks.length; i < len; i++)
    {
        str += "\tret.push(new Brick(";
        str += _bricks[i].x;
        str += ", ";
        str += _bricks[i].y;
        str += ", ";
        str += _bricks[i].lives;
        str += ", ";
        str += _bricks[i].invincible;
        str += "));\n";
    }
    
    str += "\n\treturn ret;";
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
    _levels.push([]);
    getLevel(_levels.length - 1);
}

function endCreativeMode()
{
    saveLevels();
    getLevel(0);
}

function removeLevel()
{
    if(_level.index >= _level.orig.length)
    {
        _levels[_level.index] = [];
        _bricks = [];
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
    _levels.splice(++_level.index, 0, []);
    getLevel(_level.index);
}

function saveLevels()
{
    var newLevels = [];
    
    for(var i = _level.orig.length, len = _levels.length; i < len; i++)
        if(_levels[i].length > 0)
            newLevels.push(_levels[i]);
    
    localStorage.levels = JSON.stringify(newLevels);
    _levels = _level.orig.concat(newLevels);
}