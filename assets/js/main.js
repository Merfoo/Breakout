var _brick = { horz: 25, vert: 20, width: 90, height: 90 };
var _bricks = [];
var _map = { width: 0, height: 0 };
var _cvs = { game: null };
var _modes = { single: 0 };
var _mode = 0;
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
    creatBricks();
    setInterval(loop, 1000/60);
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
}

function creatBricks()
{
    for(var x = 0; x < _brick.horz; x += 2)
    {
        for(var y = 0; y < _brick.vert; y += 4)
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
    
    if(_paddle.x + _paddle.width > _map.width)
    {
        _paddle.x = _map.width - _paddle.width;
        _paddle.v = 0;
    }
    
    if(_paddle.x < 0)
    {
        _paddle.x = 0;
        _paddle.v = 0;
    }
}

function updateBall()
{
    if(_ball.x > _map.width || _ball.x < 0)
        _ball.xV = -_ball.xV;
    
    if(_ball.y > _map.height || _ball.y < 0)
        _ball.yV = -_ball.yV;
    
    for(var brickIndex in _bricks)
    {
        var tmpBrick = _bricks[brickIndex];
        
        if(_ball.x > tmpBrick.x && _ball.x < tmpBrick.x + _brick.width && _ball.y > tmpBrick.y && _ball.y < tmpBrick.y + _brick.height)
        {
            //_ball.xV = - _ball.xV;
            _ball.yV = - _ball.yV;
        }
    }
    _ball.x += _ball.xV;
    _ball.y += _ball.yV;
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

function print(obj)
{
    console.log(obj);
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