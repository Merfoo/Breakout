var _hitArea = { top: 0, right: 1, bot: 2, left: 3 };
var _brick = { horz: 20, vert: 20, width: 90, height: 90 };
var _bricks = [];
var _map = { width: 0, height: 0 };
var _cvs = { game: null };
var _modes = { single: 0 };
var _mode = _modes.single;
var _keyCodes = { left: 37, right: 39 };
var _keys = { left: false, right: false };
var _paddle = new Paddle();
var _ball = new Ball();

document.addEventListener("DOMContentLoaded", initGame);
document.documentElement.style.overflowX = "hidden";	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vertical scrollbar will be hidden
window.addEventListener("keyup", keyUpEvent);
window.addEventListener("keydown", keyDownEvent);

function initGame()
{
    var cvsBorderThick = parseInt(getComputedStyle(document.getElementById('myCanvas'),null).getPropertyValue('border-width'));
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    _map.width = window.innerWidth - (cvsBorderThick * 2);
    _map.height = window.innerHeight - (cvsBorderThick * 2);
    _cvs.game.canvas.width = _map.width;
    _cvs.game.canvas.height = _map.height;
    _brick.width = _map.width / _brick.horz;
    _brick.height = _map.height / _brick.vert;
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _paddle.y = _map.height - _paddle.height;
    
    window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    
    creatBricks();
    loop();
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
    }
    
    window.requestAnimFrame(loop);
}

function creatBricks()
{
    for(var x = 0; x < _brick.horz; x += 2)
    {
        for(var y = 0; y < _brick.vert; y += 5)
        {
            var tmpBrick = new Brick();
            tmpBrick.x = x * _brick.width;
            tmpBrick.y = y * _brick.height;
            tmpBrick.brickX = x;
            tmpBrick.brickY = y;
            _bricks.push(tmpBrick);
        }
    }
}

function paintBricks()
{
    for(var brickIndex in _bricks)
    {
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
    if(_ball.x > _map.width || _ball.x < 0)
        _ball.xV = -_ball.xV;
    
    if(_ball.y < 0)
        _ball.yV *= -1;
    
    if(_ball.y > _map.height)
        _ball.y = 0;
    
    if(ballHitPaddle())
    {
        if(_paddle.v !== 0)
            _ball.xV = _paddle.maxV * _paddle.v;
        
        _ball.yV *= -1;
    }
    
    var ballLine = new Line();
    ballLine.createLine({ x: _ball.x, y: _ball.y }, { x: _ball.xLast, y: _ball.yLast });
    
    for(var brickIndex in _bricks)
    {
        var brick = _bricks[brickIndex];
        brick = { xLeft: brick.x, xRight: brick.x + _brick.width, yTop: brick.y, yBot: brick.y + _brick.height };
        
        if(_ball.x > brick.xLeft && _ball.x < brick.xRight && _ball.y > brick.yTop && _ball.y < brick.yBot)
        {
            var xTop = ballLine.getX(brick.yTop);
            var xBot = ballLine.getX(brick.yBot);
            var yLeft = ballLine.getY(brick.xLeft);
            var yRight = ballLine.getY(brick.xRight);
            
            if((xTop >= brick.xLeft && xTop <= brick.xRight) || (xBot >= brick.xLeft && xBot <= brick.xRight))
                if(withinNumbers(xTop, _ball.x, _ball.xLast) || withinNumbers(xBot, _ball.x, _ball.xLast))
                    _ball.yV *= -1;
            
            if((yLeft >= brick.yTop && yLeft <= brick.yBot) || (yRight >= brick.yTop && yRight <= brick.yBot))
                if(withinNumbers(yLeft, _ball.y, _ball.yLast) || withinNumbers(yRight, _ball.y, _ball.yLast))
                     _ball.xV *= -1;
        }
    }
    
    _ball.x += _ball.xV;
    _ball.y += _ball.yV;
    _ball.updateLastPos();
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
    var x = brick.brickX;
    var y = brick.brickY;
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
        var code = e.keyCode;

        if(code === _keyCodes.left)
            _keys.left = false;

        if(code === _keyCodes.right)
            _keys.right = false;
    }
}

function keyDownEvent(e)
{
    if(_mode === _modes.single)
    {    
        var code = e.keyCode;

        if(code === _keyCodes.left)
            _keys.left = true;

        if(code === _keyCodes.right)
            _keys.right = true;
    }
}

function withinNumbers(x, x1, x2)
{
    if(x1 > x2)
    {
        var tmp = x1;
        x1 = x2;
        x2 = tmp;
    }
    
    if(x > x1 && x < x2)
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
    if (hexR.length == 1)
        hexR = "0" + hexR;

    if (hexG.length == 1)
        hexG = "0" + hexG;

    if (hexB.length == 1)
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