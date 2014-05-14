var _paddleInit = { startWidth: 173, startHeight: 13, startVMax: 10, startVInc: 0.15, width: 0, height: 0, vMax: 0, vInc: 0 };
var _ballInit = { startR: 10, startReleaseHeight: 550, startVMax: 9, r: 0, releaseHeight: 0, vMax: 0 };
var _dom = { startMenu: null, howToPlayMenu: null, pause: null };
var _anim = { moveUp: "animateUp", moveDown: "animateDown", moveLeft: "animateLeft", moveRight: "animateRight", fadeIn: "animateFadeIn", fadeOut: "animateFadeOut" };
var _brick = { horz: 20, vert: 20, width: 90, height: 90, live: 0 };
var _bricks = [];
var _map = { width: 0, height: 0, widthMod: 1, heightMod: 1, origWidth: 1346, origHeight: 647 };
var _cvs = { borderThick: 4, game: null };
var _modes = { single: 0, auto: 1, creative: 2, paused: false };
var _levels = [];
var _level = { index: 0, orig: [] };
var _mode = _modes.auto;
var _keyCodes = { up: 38, down: 40, left: 37, right: 39, space: 32, tilda: 192, a: 65, d: 68, p: 80, ctr: 17, alt: 18, enter: 13, esc: 27, shift: 16, del: 46 };
var _keys = { left: false, right: false, space: false };
var _paddle = new Paddle(_paddleInit);
var _ball = new Ball(_ballInit);
var _storeAvailable = false;

document.addEventListener("DOMContentLoaded", init);
document.documentElement.style.overflowX = "hidden";	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vertical scrollbar will be hidden
window.addEventListener("keyup", keyUpEvent);
window.addEventListener("keydown", keyDownEvent);
window.addEventListener("mousedown", mouseDownEvent);

function init()
{
    _storeAvailable = typeof(Storage) !== "undefined";
    _dom.startMenu = document.getElementById("startMenu");
    _dom.howToPlayMenu = document.getElementById("howToPlay");
    _dom.pause = document.getElementById("paused");
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    console.log(_cvs.game.canvas.style);
    _cvs.game.canvas.style.borderTopWidth = _cvs.borderThick + "px";
    _cvs.game.canvas.style.borderRightWidth = _cvs.borderThick + "px";
    _cvs.game.canvas.style.borderBottomWidth = _cvs.borderThick + "px";
    _cvs.game.canvas.style.borderLeftWidth = _cvs.borderThick + "px";
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
    _map.width = window.innerWidth - (_cvs.borderThick * 2);
    _map.height = window.innerHeight - (_cvs.borderThick * 2);
    _map.widthMod = _map.width / _map.origWidth;
    _map.heightMod = _map.height / _map.origHeight;
    _cvs.game.canvas.width = _map.width;
    _cvs.game.canvas.height = _map.height;
    _brick.width = _map.width / _brick.horz;
    _brick.height = _map.height / _brick.vert;
    _paddle.width = _paddleInit.width = _paddleInit.startWidth * _map.widthMod;
    _paddle.height = _paddleInit.height = _paddleInit.startHeight * _map.heightMod;
    _paddle.vMax = _paddleInit.vMax = _paddleInit.startVMax * _map.widthMod;
    _paddle.vInc = _paddleInit.vInc = _paddleInit.startVInc * _map.widthMod;
    _paddle.y = _map.height - _paddleInit.height;
    _ball.r = _ballInit.r = _ballInit.startR * _map.widthMod;
    _ball.releaseHeight = _ballInit.releaseHeight = _ballInit.startReleaseHeight * _map.heightMod;
    _ball.vMax = _ballInit.vMax = _ballInit.startVMax * _map.widthMod;
    var ballMod = _ball.vMax / Math.sqrt((_ball.vX * _ball.vX) + (_ball.vY * _ball.vY));
    _ball.vX *= ballMod;
    _ball.vY *= ballMod;
}

function loop()
{
    switch(_mode)
    {
        case _modes.auto:
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
            
        case _modes.single:
            if(_modes.paused)
                break;
            
            clearScreen();
            updatePaddle();
            updateBall();
            paintPaddle();
            paintBricks();
            paintBall();
            _cvs.game.canvas.style.borderColor = getRandomColor(0, 255);
            break;
            
        case _modes.creative:
            clearScreen();
            paintPaddle();
            paintBricks();
            paintBall();
            _cvs.game.canvas.style.borderColor = getRandomColor(0, 255);
            break;
    }
    
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
    resetLevels();
}

function paintBricks()
{
    for(var brickIndex in _bricks)
    {
        if(_bricks[brickIndex].lives <= 0)
            continue;
        
        _bricks[brickIndex].color = getRandomColor(0, 255);
        paintBrick(_bricks[brickIndex]);
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
        
        if(Math.abs(_paddle.v) < _paddle.vInc)
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

function updateBall()
{
    if(!_ball.released)
    {
        _ball.vX = 0;
        _ball.vY = 0;
        _ball.x = _paddle.x + (_paddle.width / 2);
        _ball.y = _ball.releaseHeight;
        
        if(_keys.space)
        {
            _ball.released = true;
            _ball.vY = _ball.vMax;
        }
    }
    
    if(_ball.x + _ball.r > _map.width) 
        _ball.vX = -Math.abs(_ball.vX);
    
    else if(_ball.x - _ball.r < 0)
        _ball.vX = Math.abs(_ball.vX);
        
    if(_ball.y - _ball.r < 0)
        _ball.vY = Math.abs(_ball.vY);
    
    else if(_ball.y > _map.height)
        _ball.released = false;
    
    if(ballHitPaddle())
    {
        var newVel = getVel((-_ball.maxAng * ((_ball.x - _paddle.x - (_paddle.width / 2)) / (_paddle.width / 2))) - 90, _ball.vMax);
        _ball.vX = newVel.x;
        _ball.vY = newVel.y;
    }
       
    var collided = { x: false, y: false };
    
    for(var brickIndex in _bricks)
    {
        if(_bricks[brickIndex].lives <= 0)
            continue;
        
        var brick = _bricks[brickIndex];
        brick = 
        { 
            xLeft: brick.x * _brick.width, 
            xRight: (brick.x * _brick.width) + _brick.width, 
            yTop: brick.y * _brick.height, 
            yBot: (brick.y * _brick.height) + _brick.height 
        };
        
        var offSet = [{ x: 0, y: 0 }, { x: -_ball.r, y: 0 }, { x: _ball.r, y: 0 }, { x: 0, y: -_ball.r }, { x: 0, y: _ball.r }];
        
        for(var j in offSet)
        {    
            var ball = { x: _ball.x + offSet[j].x, y: _ball.y + offSet[j].y, xLast: _ball.xLast + offSet[j].x, yLast: _ball.yLast + offSet[j].y };
        
            if(inBetween(ball.x, brick.xLeft, brick.xRight) && inBetween(ball.y, brick.yTop, brick.yBot))
            {
                var ballLine = new Line();
                ballLine.createLine({ x: ball.x, y: ball.y }, { x: ball.xLast, y: ball.yLast });
                var xTop = ballLine.getX(brick.yTop);
                var xBot = ballLine.getX(brick.yBot);
                var yLeft = ballLine.getY(brick.xLeft);
                var yRight = ballLine.getY(brick.xRight);
                
                if((xTop >= brick.xLeft && xTop <= brick.xRight) || (xBot >= brick.xLeft && xBot <= brick.xRight))
                    if(inBetween(brick.yTop, ball.y, ball.yLast) || inBetween(brick.yBot, ball.y, ball.yLast))
                        collided.y = true;

                if((yLeft >= brick.yTop && yLeft <= brick.yBot) || (yRight >= brick.yTop && yRight <= brick.yBot))
                    if(inBetween(brick.xLeft, ball.x, ball.xLast) || inBetween(brick.xRight, ball.x, ball.xLast))
                         collided.x = true;

                 if(_bricks[brickIndex].lives > 0 && --_bricks[brickIndex].lives <= 0)
                     _brick.live--;
            }
        }
    }
    
    if(collided.x)
        _ball.vX *= -1;

    if(collided.y)
        _ball.vY *= -1;
        
    _ball.x += _ball.vX;
    _ball.y += _ball.vY;
    _ball.updateLastPos();
        
    if(_brick.live <= 0)
    {
        _ball.released = false;
        getNextLevel();
        console.log("bricks destroyed");
    }
}

function ballHitPaddle()
{
    var ball = { xBack: _ball.x - _ball.r, xFor: _ball.x + _ball.r, yBack: _ball.y - _ball.r, yFor: _ball.y + _ball.r };
    var paddle = { xLeft: _paddle.x, xRight: _paddle.x + _paddle.width, y: _paddle.y };

    if((ball.xBack > paddle.xLeft || ball.xFor > paddle.xLeft) && (ball.xBack < paddle.xRight || ball.xFor < paddle.xRight))
        if(ball.yFor > paddle.y)
            return true;
    
    return false;
}

function clearScreen()
{
    _cvs.game.clearRect(0, 0, _map.width, _map.height);
}

function paintBrick(brick)
{
    var x = brick.x;
    var y = brick.y;
    var color = brick.color;
    _cvs.game.fillStyle = !!color === true ? color : "blue";
    _cvs.game.fillRect(x * _brick.width, y * _brick.height, _brick.width, _brick.height);
}

function paintBall()
{
    _cvs.game.beginPath();
    _cvs.game.fillStyle = _ball.color;
    _cvs.game.arc(_ball.x, _ball.y, _ball.r, 0, 2 * Math.PI);
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
    
    if(_storeAvailable && localStorage.levels)
        _levels = _levels.concat(JSON.parse(localStorage.levels));
}

function resetBrick(brick)
{
    brick.lives = brick.startLives;
}

function resetLevels()
{
    for(var levelIndex = 0, len = _levels.length; levelIndex < len; levelIndex++)
        for(var brickIndex = 0, brickLen = _levels[levelIndex].length; brickIndex < brickLen; brickIndex++)
            resetBrick(_levels[levelIndex][brickIndex]);
    
    getLevel(_level.index);
}
function getLevel(index)
{
    if(index < 0)
        index = 0;
    
    else if(index >= _levels.length)
        index = _levels.length - 1;
    
    _level.index = index;
    _bricks = _levels[_level.index].clone();
    _brick.live = _levels[_level.index].length;
}

function getPrevLevel()
{
    if(--_level.index < 0)
    {
        _level.index = _levels.length - 1;
    }
    
    getLevel(_level.index);
}

function getNextLevel()
{
    if(++_level.index >= _levels.length) 
        _level.index = 0;

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
            showStartMenu();
            
            if(_mode === _modes.creative)
                endCreativeMode();
            
            _mode = _modes.auto;
            break;
        
        case _keyCodes.tilda:
            printLevel();
            break;
            
        case _keyCodes.enter:
            hideStartMenu();
            hideHowToPlayMenu();
            initGame();
            _mode = _modes.single;
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
        var y = Math.floor(e.clientY / _brick.height);

        for(var i in _bricks)
        {
            if(_bricks[i].x === x && _bricks[i].y === y)
            {
                _bricks.splice(i, 1);
                return;
            }
        }

        _bricks.push(new Brick(x, y));
    }
}

function inBetween(x, x1, x2)
{
    if(x1 > x2)
    {
        var tmp = x1;
        x1 = x2;
        x2 = tmp;
    }
    
    if(x >= x1 && x <= x2)
        return true;
    
    return false;
}

function getVel(ang, vel)
{
    return { x: -Math.cos(toRad(ang)) * vel, y: Math.sin(toRad(ang)) * vel };
}

function toRad(deg)
{
    return deg * Math.PI / 180;
}

function toDeg(rad)
{
    return rad * 180 / Math.PI;
}

// Returns random color between min and max.
function getRandomColor(min, max)
{
    // Creating a random number between iMin and iMax, converting to hex
    var hexR = (getRandomNumber(min, max)).toString(16);
    var hexG = (getRandomNumber(min, max)).toString(16);
    var hexB = (getRandomNumber(min, max)).toString(16);

    // Making sure single character values are prepended with a "0"
    if (hexR.length === 1)
        hexR = "0" + hexR;

    if (hexG.length === 1)
        hexG = "0" + hexG;

    if (hexB.length === 1)
        hexB = "0" + hexB;

    // Creating the hex value by concatenatening the string values
    return ("#" + hexR + hexG + hexB).toUpperCase();
}

// Returns random number between min and max, include iMin and iMax
function getRandomNumber(min, max)
{
    if (max < min)
    {
        var tmp = max;
        max = min;
        min = tmp;
    }

    return Math.floor((Math.random() * ((max + 1) - min)) + min);
}
    
function saveCanvasImg()
{
    downloadImg("canvasImg.png", _cvs.game.canvas.toDataURL("image/png"));
}
    
function printLevel()
{
    var str = "\tvar ret = [];\n";
    
    for(var i in _bricks)
    {
        str += "\tret.push(new Brick(";
        str += _bricks[i].x;
        str += ", ";
        str += _bricks[i].y;
        str += "));\n";
    }
    
    str += "\n\treturn ret;";
    download("level.txt", str);
}

function download(filename, text) 
{
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function downloadImg(filename, imgSrc)
{
    var el = document.createElement("a");
    el.setAttribute("href", imgSrc);
    el.setAttribute("download", filename);
    el.click();
}

function initCreativeMode()
{
    hideStartMenu();
    initGame();
    _mode = _modes.creative;
    _levels.push([]);
    _level.index = _levels.length - 1;
}

function endCreativeMode()
{
    _levels.splice(_levels.length - 1, 1);
    _level.index = 0;
}

function removeLevel()
{
    if(_level.index >= _level.orig.length)
    {
        _levels[_level.index] = [];
        _bricks = [];
        
        if(_level.index !== _levels.length - 1)
            _levels.splice(_level.index--, 1);
    }
    
    getLevel(_level.index);
    localStorage.levels = JSON.stringify(_levels.slice(_level.orig.length, _levels.length - 1));
}

function addLevel()
{
    if(_bricks.length === 0)
        return;
    
    _levels.splice(_levels.length - 1, 0, _bricks.clone());
    _level.index++;
    getLevel(_level.index);
    localStorage.levels = JSON.stringify(_levels.slice(_level.orig.length, _levels.length - 1));
}