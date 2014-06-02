document.addEventListener("DOMContentLoaded", init);
document.documentElement.style.overflowX = "hidden";	 // Horz scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vert scrollbar will be hidden
document.addEventListener("keyup", keyUpEvent);
document.addEventListener("keydown", keyDownEvent);
document.addEventListener("mousemove", mouseMoveEvent);
document.addEventListener("mousedown", mouseDownEvent);
document.addEventListener("mouseup", mouseUpEvent);

try
{
    document.addEventListener('touchmove', function(event) { // Prevent scrolling on touch devices
        event.preventDefault();
    }, false);
    document.addEventListener("touchmove", mouseMoveEvent);
    document.addEventListener("touchstart", mouseDownEvent);
    //document.addEventListener("touchend", mouseUpEvent);
}

catch(e)
{
    
}

function init()
{
    if (!("ontouchstart" in document.documentElement)) // Remove touch box if not touch device
        _paddleInit.initGameHeight = 0;

    document.onmousewheel = function() { return false; }; // Prevent mouse scrolling
    _storeAvailable = typeof(Storage) !== "undefined";
    _dom.startMenu = document.getElementById("startMenu");
    _dom.howToPlayMenu = document.getElementById("howToPlay");
    _dom.pause = document.getElementById("paused");
    _dom.hud = document.getElementById("hud");
    _dom.lives = document.getElementById("lives");
    _dom.brickModeAdd = document.getElementById("brickModeAdd");
    _dom.brickModeDel = document.getElementById("brickModeDel");
    _dom.brickLifeOptions = document.getElementById("brickLifeOptions");
    _dom.creativeOptions = document.getElementById("creativeOptions");
    _dom.bonus = document.getElementById("bonus");
    _dom.bonusBox = document.getElementById("bonusBox");
    _dom.bonusLazers = document.getElementById("bonusLazers");
    _dom.bonusSuperBall = document.getElementById("bonusSuperBall");
    _dom.bonusLongPaddle = document.getElementById("bonusLongPaddle");
    _dom.bonusMultiBall = document.getElementById("bonusMultiBall");
    _dom.bonusLife = document.getElementById("bonusLife");
    _cvs.game = document.getElementById("myCanvas").getContext("2d");
    _hud.height = _dom.hud.clientHeight;
    document.getElementById("creativeMode").onclick = initCreativeMode;
    document.getElementById("instructions").onclick = showHowToPlayMenu;
    document.getElementById("backToStartMenu").onclick = initAutoMode;
    document.getElementById("pressEnter").onclick = initSingleMode;
    _dom.brickModeAdd.onclick = brickAddClicked;
    _dom.brickModeDel.onclick = brickDelClicked;
    _dom.brickLifeOptions.onchange = brickLifeChanged;
    window.addEventListener("resize", setGameSize);
    window.requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
    
    hideSingleHud();
    updateBrickModeAnim();
    makeLevels();
    setGameSize();
    initGame();
    loop();
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
            
            updatePowerUps();
            updatePaddle();
            updateBalls();
            updateBallAim();
            updateHud();
            break;
            
        case _modes.creative:
            break;
    }
    
    paintBallAim();
    paintBalls();
    paintPaddle();
    paintBricks();
    paintLazers();
    paintPowerUps();
    paintTouchBox();
    window.requestAnimFrame(loop);
}

function initGame()
{    
    _paddle = new Paddle(_paddleInit);
    _paddle.x = (_map.width / 2) - (_paddle.width / 2);
    _balls = [new Ball(_ballInit)];
    _balls[0].x = _paddle.x + _paddle.width / 2;
    _balls[0].y = _paddle.y - _paddle.height - _balls[0].r;
    _keys.left = false;
    _keys.right = false;
    _keys.enter = false;
    _keys.space = false;
    _lives.cur = _lives.starting;
    _powerUps = [];
    _lazers = [];
    _longPaddle.timer.reset(true);
    _multiBall.timer.reset(true);
    _lazer.timer.reset(true);
    _superBall.timer.reset(true);
    _superBall.active = false;
    getLevel(_level.index);
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
        var ballAng = getRandomNumber(-90 - _balls[0].maxAng, -90 + _balls[0].maxAng);
        releaseBall(ballAng);
    }
}

function releaseBall(ang)
{
    var vel = getVel(ang, _balls[0].vMax);
    _ballAim.ang = ang;
    _balls[0].vX = vel.x;
    _balls[0].vY = vel.y;
    _balls[0].x = _paddle.x + (_paddle.width / 2);
    _balls[0].y = _paddle.y - _paddle.height - _balls[0].r;
    _balls[0].released = true;
}

function updatePaddle()
{
    if(_keys.left || _keys.right)
    {
        if(_keys.left)
            _paddle.v = -_paddle.vMax;

        if(_keys.right)
            _paddle.v = _paddle.vMax;
    }
    
    else
        _paddle.v = 0;
    
    _paddle.x += _paddle.v;
    
    if(_paddle.x + _paddle.width + _paddle.height > _map.width)
        _paddle.x = _map.width - _paddle.width - _paddle.height;
    
    if(_paddle.x  - _paddle.height < 0)
        _paddle.x = _paddle.height;
}

function updateBallAim()
{
    if(_balls[0].released)
        return;
    
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
    
    if(_keys.space)
        releaseBall(_ballAim.ang);
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

        else if(_balls[i].y > _map.gameHeight)
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
                //console.log("corner bot left");
            }

            if(getDist(brick.botRight, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.botRight;
                newVel = getVel(getRandomNumber(120, 150), _balls[i].vMax);
                //console.log("corner bot right");
            }

            if(getDist(brick.topLeft, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.topLeft;
                newVel = getVel(getRandomNumber(-30, -60), _balls[i].vMax);
                //console.log("corner top left");
            }

            if(getDist(brick.topRight, modBall) < dist)
            {
                hitBrick = true;
                hitSpot = _hitSpots.topRight;
                newVel = getVel(getRandomNumber(-120, -150), _balls[i].vMax);
                //console.log("corner top right");
            }

            if(hitBrick && hitSpot !== -1 && !_superBall.active)
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

            if(hitBrick)
            {
                if(localBricks[brickIndex].lives > 0 || _superBall.active)
                    removeLives.push(brickIndex);
            }    
        }

        for(var j = 0, len = removeLives.length; j < len; j++)
        {
            if(--localBricks[removeLives[j]].lives <= 0)
            {
                if(!localBricks[removeLives[j]].invincible)
                    _brick.live--;
                
                if(localBricks[removeLives[j]].spawnBonus)
                    _powerUps.push(getPowerUp((localBricks[removeLives[j]].x * _brick.width) + (_brick.width / 2), (localBricks[removeLives[j]].y * _brick.height) + (_brick.height / 2)));
                
                _brickMap[localBricks[removeLives[j]].x][localBricks[removeLives[j]].y] = null;
            }
        }

        if(_superBall.active)
        {
            collided.x = false;
            collided.y = false;
        }
        
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
                
                _brickMap[x][y].spawnBonus = Math.random() <= _brick.bonusChance[_brickMap[x][y].lives];
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

function initAutoMode()
{   
    _lives.cur = _lives.starting;
    showStartMenu();
            
    if(_mode === _modes.creative)
        endCreativeMode();
    
    else if(_mode === _modes.single)
        hideSingleHud();
    
    _mode = _modes.auto;
}

function initSingleMode()
{
    if(_mode === _modes.creative)
        endCreativeMode();
    
    hideStartMenu();
    hideHowToPlayMenu();
    showSingleHud();
    initGame();
    _mode = _modes.single;
}

function initCreativeMode()
{
    if(_mode === _modes.single)
        hideSingleHud();
    
    hideStartMenu();
    initGame();
    _mode = _modes.creative;
    _level.index = _levels.length - 1;
    addLevel();
    showCreativeHud();
}

function endCreativeMode()
{
    saveLevels();
    getLevel(_level.index);
    hideCreativeHud();
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