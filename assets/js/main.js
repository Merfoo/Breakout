var _hitArea = { top: 0, right: 1, bot: 2, left: 3 };
var _brick = { horz: 20, vert: 20, width: 90, height: 90, live: 0 };
var _bricks = [];
var _map = { width: 0, height: 0, widthMod: 1, heightMod: 1, origWidth: 1346, origHeight: 647 };
var _cvs = { borderThick: 0, game: null };
var _modes = { single: 0 };
var _mode = _modes.single;
var _keyCodes = { left: 37, right: 39, space: 32 };
var _keys = { left: false, right: false, space: false };
var _paddle = new Paddle();
var _ball = new Ball();

document.addEventListener("DOMContentLoaded", initGame);
document.documentElement.style.overflowX = "hidden";	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vertical scrollbar will be hidden
window.addEventListener("keyup", keyUpEvent);
window.addEventListener("keydown", keyDownEvent);

function initGame()
{
    _cvs.borderThick = parseInt(getComputedStyle(document.getElementById('myCanvas'),null).getPropertyValue('border-width'));
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    
    window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    
    setGameSize();
    creatBricks();
    loop();
    window.addEventListener("resize", setGameSize);
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
    _paddle.width = _paddle.startWidth * _map.widthMod;
    _paddle.height = _paddle.startHeight * _map.heightMod;
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _paddle.y = _map.height - _paddle.height;
    _ball.r = _ball.startR * _map.widthMod;
    _ball.releaseHeight = _ball.startReleaseHeight * _map.heightMod;
}

function loop()
{
    if(_mode === _modes.single)
    {
        clearScreen();
        updatePaddle();
        updateBall();
        paintPaddle();
        paintBricks();
        paintBall();
        _cvs.game.canvas.style.borderColor = getRandomColor(0, 255);
    }
    
    window.requestAnimFrame(loop);
}

function creatBricks()
{
    _bricks = [];
    
    for(var x = 1; x < _brick.horz - 1; x += 2)
    {
        for(var y = 1; y < _brick.vert - 5; y += 5)
        {
            var tmpBrick = new Brick();
            tmpBrick.x = x;
            tmpBrick.y = y;
            _bricks.push(tmpBrick);
        }
    }
    
    _brick.live = _bricks.length;
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
    
    _paddle.x += _paddle.maxV * _paddle.v;
    
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
        _ball.xV = 0;
        _ball.yV = 0;
        _ball.x = _paddle.x + (_paddle.width / 2);
        _ball.y = _ball.releaseHeight;
        
        if(_keys.space)
        {
            _ball.released = true;
            _ball.yV = _ball.startYV;
        }
    }
    
    if(_ball.x > _map.width || _ball.x < 0)
        _ball.xV = -_ball.xV;
    
    if(_ball.y < 0)
        _ball.yV *= -1;
    
    if(_ball.y > _map.height)
        _ball.y = 0;
    
    if(ballHitPaddle())
    {
        _ball.xV = _paddle.maxV * ((_ball.x - _paddle.x - (_paddle.width / 2)) / (_paddle.width / 2));
        _ball.yV *= -1;
    }
       
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
                        _ball.yV *= -1;

                if((yLeft >= brick.yTop && yLeft <= brick.yBot) || (yRight >= brick.yTop && yRight <= brick.yBot))
                    if(inBetween(brick.xLeft, ball.x, ball.xLast) || inBetween(brick.xRight, ball.x, ball.xLast))
                         _ball.xV *= -1;

                 if(_bricks[brickIndex].lives > 0 && --_bricks[brickIndex].lives <= 0)
                     _brick.live--;
                 
                 break;
            }
        }
    }
    
    _ball.x += _ball.xV;
    _ball.y += _ball.yV;
    _ball.updateLastPos();
    
    if(_brick.live <= 0)
    {
        creatBricks();
        _ball.released = false;
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

function keyUpEvent(e)
{
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