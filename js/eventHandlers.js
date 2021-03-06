function brickLifeChanged(newVal)
{
    if(typeof(newVal) !== "undefined" && newVal >= 0 && newVal <= _brick.maxLives)
        _dom.brickLifeOptions.selectedIndex = newVal;
        
    _creative.life = parseInt(_dom.brickLifeOptions.options[_dom.brickLifeOptions.selectedIndex].value);
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
            
        case _keyCodes.space:
            if(_mode === _modes.single)
                _balls[0].released = true;
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
            
            case _keyCodes.space:
                _keys.space = false;
                break;
                
            case _keyCodes.p:
                _modes.paused ? unPauseSingle() : pauseSingle();
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
                brickLifeChanged(0);    // invincible
                break;
                
            case _keyCodes.one:
                brickLifeChanged(1);    // 1 hit
                break;
                
            case _keyCodes.two:
                brickLifeChanged(2);    // 2 hit
                break;
                
            case _keyCodes.three:
                brickLifeChanged(3);    // 3 hit
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

// Add/Remove brick
function modBrick(x, y)
{    
    if(_creative.add)
    {   
        _brickMap[x][y] = new Brick(x, y, _creative.life);

        if(_brickMap[x][y].lives === 0)
            _brickMap[x][y].invincible = true;
    }

    else
        _brickMap[x][y] = null;
    
    _levels[_level.index][x][y] = cloneObj(_brickMap[x][y]);
}

function mouseMoveEvent(e)
{
    _mouse.moving = true;
    var tmp = getMouseCoord(e, true);
    var eX = tmp.x;
    var eY = tmp.y;
    _mouse.xLast = _mouse.x;
    _mouse.yLast = _mouse.y;
    _mouse.x = eX;
    _mouse.y = eY;
        
    if(_mode === _modes.creative)
    {
        var x = Math.floor(_mouse.x / _brick.width);
        var y = Math.floor(_mouse.y / _brick.height);
        var xLast = Math.floor(_mouse.xLast / _brick.width);
        var yLast = Math.floor(_mouse.yLast / _brick.height);
        
        if(x === xLast && y === yLast)
            return;
        
        if(_mouse.down && _mouse.y < _map.gameHeight)
            modBrick(x, y);
    }
    
    else if(_mode === _modes.single && !_modes.paused)
    {
        if(_balls[0].released)
            _paddle.x = eX - (_paddle.width / 2);
        
        if(!_modes.touch || (_modes.touch && _mouse.y <= _map.gameHeight))
            _ballAim.ang = getBallAimAngle(eX, eY);
    }
}

function mouseDownEvent(e)
{
    var tmp = getMouseCoord(e, true);
    var eX = tmp.x;
    var eY = tmp.y;
    _mouse.xLast = _mouse.x;
    _mouse.yLast = _mouse.y;
    _mouse.x = eX;
    _mouse.y = eY;
    _mouse.xDown = _mouse.x;
    _mouse.yDown = _mouse.y;
    _mouse.down = true;
    
    if(_mode === _modes.creative)
    {
        _mouse.x = eX;
        _mouse.y = eY;
        var x = Math.floor(_mouse.x / _brick.width);
        var y = Math.floor(_mouse.y / _brick.height);
        
        if(_mouse.y < _map.gameHeight)
            modBrick(x, y);
    }
}

function mouseUpEvent(e)
{    
    var tmp = getMouseCoord(e, true);
    var eX = tmp.x;
    var eY = tmp.y;
    _mouse.xLast = _mouse.x;
    _mouse.yLast = _mouse.y;
    _mouse.x = eX;
    _mouse.y = eY;
    
    if(_mode === _modes.single && !_modes.paused && !_balls[0].released && !_modes.touch)
        if(!_mouse.moving || (_mouse.x === _mouse.xDown && _mouse.y === _mouse.yDown))
            releaseBall(_ballAim.ang = getBallAimAngle(eX, eY));
    
    _mouse.moving = false;
    _mouse.down = false;
}

function getMouseCoord(e, onCanvas)
{
    var eX = e.clientX;
    var eY = e.clientY;
    
    if(!!e.touches)
    {
        eX = e.touches[0].clientX;
        eY = e.touches[0].clientY;
    }
    
    if(!!onCanvas)
        eY -= _hud.height;
    
    return { x: eX, y: eY };
}

function pauseSingle()
{
    _duoBall.timer.pause();
    _uberBall.timer.pause();
    _triBall.timer.pause();
    _lazer.timer.pause();
    _longPaddle.timer.pause();
    _life.timer.pause();
    _paddle.powerUpHitTimer.pause();
    _modes.paused = true;
    showPause();
}

function unPauseSingle()
{
    if(_modes.paused)
    {
        _duoBall.timer.unPause();
        _uberBall.timer.unPause();
        _triBall.timer.unPause();
        _lazer.timer.unPause();
        _longPaddle.timer.unPause();
        _life.timer.unPause();
        _paddle.powerUpHitTimer.unPause();
        _modes.paused = false;
    }
    
    hidePause();
}

function getBallAimAngle(x, y)
{
    var ang = Math.atan((_balls[0].y - y) / (x - _balls[0].x)) * 180 / Math.PI;
        
    if(ang >= 0)
        ang = (180 - ang) * -1;

    if(_balls[0].y - y < 0)
        ang = x - _balls[0].x >= 0 ? _ballAim.angMin : _ballAim.angMax;
    
    return ang;
}