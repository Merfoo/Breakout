function brickLifeChanged(newVal)
{
    if(typeof(newVal) !== "undefined" && newVal >= -1 && newVal <= _brick.maxLives)
        _dom.brickLifeOptions.selectedIndex = newVal + 1;
        
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
                (_modes.paused = !_modes.paused) ? pauseSingle() : unPauseSingle();
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
                
            case _keyCodes.nine:
                brickLifeChanged(-1);
                break;
                
            case _keyCodes.zero:
                brickLifeChanged(0);
                break;
                
            case _keyCodes.one:
                brickLifeChanged(1);
                break;
                
            case _keyCodes.two:
                brickLifeChanged(2);
                break;
                
            case _keyCodes.three:
                brickLifeChanged(3);
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
        if(!isBrickHere(x, y))
        {
            var life = _creative.life === -1 ? _creative.lastLife++ : _creative.life;
    
            if(_creative.lastLife > _brick.maxLives)
                _creative.lastLife = 0;
            
            _brickMap[x][y] = new Brick(x, y, life);
            
            if(_brickMap[x][y].lives === 0)
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
    var eX = e.clientX;
    var eY = e.clientY;
    
    if(!!e.touches)
    {
        eX = e.touches[0].clientX;
        eY = e.touches[0].clientY;
    }
    
    eY -= _hud.height;
    
    if(_mode === _modes.creative)
    {
        _mouse.xLast = _mouse.x;
        _mouse.yLast = _mouse.y;
        _mouse.x = eX;
        _mouse.y = eY;
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
    
    else if(_mode === _modes.single && !_modes.paused)
    {
        _paddle.x = eX - (_paddle.width / 2);
        _ballAim.ang = getBallAimAngle(eX, eY);
    }
}

function mouseDownEvent(e)
{
    var eX = e.clientX;
    var eY = e.clientY - _hud.height;
    
    if(_mode === _modes.creative)
    {
        _mouse.x = eX;
        _mouse.y = eY;
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
    
    if(_mode === _modes.single && !_modes.paused)
        if(!_balls[0].released)
            releaseBall(_ballAim.ang = getBallAimAngle(eX, eY));
}

function mouseUpEvent(e)
{
    if(e.which === _mouseCodes.leftClick)
        _mouse.leftDown = false;
    
    if(e.which === _mouseCodes.rightClick)
        _mouse.rightDown = false;
}

function pauseSingle()
{
    _multiBall.timer.pause();
    _superBall.timer.pause();
    _lazer.timer.pause();
    _longPaddle.timer.pause();
    _life.timer.pause();
    showPause();
}

function unPauseSingle()
{
    _multiBall.timer.unPause();
    _superBall.timer.unPause();
    _lazer.timer.unPause();
    _longPaddle.timer.unPause();
    _life.timer.unPause();
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