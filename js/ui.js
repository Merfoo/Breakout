function setGameSize()
{
    var oldMap = { width: _map.width, height: _map.height };
    _map.width = window.innerWidth;
    _map.height = window.innerHeight - _hud.height;
    _map.widthMod = _map.width / _map.origWidth;
    _map.heightMod = _map.height / _map.origHeight;
    _cvs.game.canvas.width = _map.width;
    _cvs.game.canvas.height = _map.height;
    _brick.width = _map.width / _brick.horz;
    _brick.height = _map.height / _brick.vert;
    _star.long = _star.initLong * _map.widthMod;
    _star.short = _star.initShort * _map.widthMod;
    _star.width = rotatePoint(_star.long, 0, 0, 0, 0).x * 2;
    _star.lineWidth = _star.initLineWidth * _map.widthMod;
    _star.vY = _star.initVY * _map.heightMod;
    _star.minDistY = _star.vY * 1.5;
    _ballAimInit.vMax = _ballAimInit.initVMax * _map.heightMod;
    _ballAimInit.width = _ballAimInit.initWidth * _map.widthMod;
    _paddleInit.width = _paddleInit.initWidth * _map.widthMod;
    _paddleInit.height = _paddleInit.initHeight * _map.heightMod;
    _paddleInit.gameHeight = _map.height - _paddleInit.height - _paddleInit.initGameHeight;
    _ballInit.r = _ballInit.initR * _map.widthMod;
    _ballInit.vMax = _ballInit.initVMax * _map.widthMod;
    _map.gameHeight = _map.height - _paddleInit.initGameHeight;
    _lazer.width = _lazer.initWidth * _map.widthMod;
    _lazer.height = _lazer.initHeight * _map.heightMod;
    _lazer.vY = _lazer.initVY * _map.heightMod;
    _longPaddle.widthAdd = _longPaddle.initWidthAdd * _map.widthMod;
    _longPaddle.widthInc = _longPaddle.initWidthInc * _map.widthMod;
    _ballAim.vMax = _ballAimInit.vMax;
    _ballAim.width = _ballAimInit.width;
    _paddle.width = _paddleInit.width;
    _paddle.height = _paddleInit.height;
    _paddle.vMax = _paddleInit.vMax;
    _paddle.y = _paddleInit.gameHeight;
    
    oldMap.width = oldMap.width === 0 ? _map.width : oldMap.width;
    oldMap.height = oldMap.height === 0 ? _map.height : oldMap.height;
    
    // balls
    for(var i = 0, len = _balls.length; i < len; i++)
    {
        _balls[i].x *= _map.width / oldMap.width;
        _balls[i].y *= _map.height / oldMap.height; 
        _balls[i].r = _ballInit.r;
        _balls[i].vMax = _ballInit.vMax;
        var ballMod = _balls[i].vMax / Math.sqrt((_balls[i].vX * _balls[i].vX) + (_balls[i].vY * _balls[i].vY));
        _balls[i].vX *= ballMod;
        _balls[i].vY *= ballMod;
    }
    
    // lazers
    for(var i = 0, len = _lazers.length; i < len; i++)
    {
        _lazers[i].x *= _map.width / oldMap.width;
        _lazers[i].y *= _map.height / oldMap.height;
    }
    
    // powerups
    for(var i = 0, len = _powerUps.length; i < len; i++)
    {
        _powerUps[i].x *= _map.width / oldMap.width;
        _powerUps[i].y *= _map.height / oldMap.height;
    }
}

function removeAllAnimations(elem)
{
    var isArray = Object.prototype.toString.call(elem) === "[object Array]";
    
    for(var prop in _anim)
    {
        if(_anim.hasOwnProperty(prop))
        {
            if(isArray)
                for(var i = 0, len = elem.length; i < len; i++)
                    elem[i].classList.remove(_anim[prop]);
            
            else
                elem.classList.remove(_anim[prop]);   
        }
    }
}

function paintBricks()
{
    for(var x = 0; x < _brick.horz; x++)
        for(var y = 0; y < _brick.vert; y++)
            if(_brickMap[x][y] !== null)
                if(_brickMap[x][y].lives > 0 || _brickMap[x][y].invincible)
                    paintBrick(_brickMap[x][y], _brickMap[x][y].color = _brick.colors[_brickMap[x][y].lives]);
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
        _cvs.game.fillStyle = _superBall.active ? getRandomColor(0, 255) : ball.color;
        _cvs.game.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
        _cvs.game.fill();
    }
}

function paintBallAim()
{
    if(_mode === _modes.single && !_balls[0].released)
    {    
        _cvs.game.lineWidth = _ballAim.width;
        _cvs.game.strokeStyle = _ballAim.color;
        _cvs.game.beginPath();
        _cvs.game.moveTo(_ballAim.x, _ballAim.y);
        _cvs.game.lineTo(_ballAim.x + _ballAim.vX, _ballAim.y + _ballAim.vY);
        _cvs.game.stroke();
        _cvs.game.closePath();
    }
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

function paintPowerUps()
{
    for(var i = 0, len = _powerUps.length; i < len; i++)
        paintStar(_powerUps[i].x, _powerUps[i].y);
}

function paintLazers()
{
    _cvs.game.lineCap = "round";
    _cvs.game.lineWidth = _lazer.width;
    _cvs.game.strokeStyle = _lazer.color;
    
    for(var i = 0, len = _lazers.length; i < len; i++)
    {
        _cvs.game.beginPath();
        _cvs.game.moveTo(_lazers[i].x, _lazers[i].y);
        _cvs.game.lineTo(_lazers[i].x, _lazers[i].y + _lazer.height);
        _cvs.game.stroke();
        _cvs.game.closePath();
    }
}

function updateHud()
{
    _dom.lives.innerHTML = _hud.livesText + _lives.cur;
}

function updateBrickModeAnim()
{
    removeAllAnimations([_dom.brickModeAdd, _dom.brickModeDel]);
    _dom.brickModeAdd.classList.add(_creative.add ? _anim.darken : _anim.lighten);
    _dom.brickModeDel.classList.add(!_creative.add ? _anim.darken : _anim.lighten);
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

function paintStar(cenX, cenY)
{
    var ang = 360 / 10;
    var sumAng = 0;
    var yOff = _star.long;
    var point = rotatePoint(cenX, cenY - yOff, sumAng, cenX, cenY);
    
    _cvs.game.fillStyle = getRandomColor(0, 255);
    //_cvs.game.strokeStyle = _star.color;
    //_cvs.game.lineWidth = _star.lineWidth;
    _cvs.game.beginPath();
    _cvs.game.moveTo(point.x, point.y);
    
    for(var i = 0; i < 11; i++)
    {
        sumAng += ang;
        yOff = _star.long;
        
        if(i % 2 === 0)
            yOff = _star.short;
        
        point = rotatePoint(cenX, cenY - yOff, sumAng, cenX, cenY);
        _cvs.game.lineTo(point.x, point.y);
    }
    
    //_cvs.game.stroke();
    _cvs.game.closePath();
    _cvs.game.fill();
}

function paintTouchBox()
{
    _cvs.game.fillStyle = _touchBox.color;
    _cvs.game.fillRect(0, _map.gameHeight, _map.width, _map.height - _map.gameHeight);
}

function hideSingleHud()
{
    removeAllAnimations([_dom.lives, _dom.bonusBox]);
    _dom.lives.classList.add(_anim.fadeOut);
    _dom.bonusBox.classList.add(_anim.fadeOut);
}

function showSingleHud()
{
    removeAllAnimations([_dom.lives, _dom.bonusBox]);
    _dom.lives.classList.add(_anim.fadeIn);
    _dom.bonusBox.classList.add(_anim.fadeIn);
}

function hideCreativeHud()
{
    removeAllAnimations(_dom.creativeOptions);
    _dom.creativeOptions.classList.add(_anim.fadeOut);
}

function showCreativeHud()
{
    removeAllAnimations(_dom.creativeOptions);
    _dom.creativeOptions.classList.add(_anim.fadeIn);
}