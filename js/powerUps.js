function updatePowerUps()
{
    var curTime = new Date().getTime();
    
    for(var i = 0; i < _powerUps.length; i++)
    {
        _powerUps[i].y += _powerUp.vY;
        
        if(hitPowerUp(_powerUps[i]))
        {
            switch(_powerUps[i].type)
            {
                case _powerUp.multiBall: _multiBall.start = curTime; break;
                case _powerUp.superBall: _superBall.start = curTime; break;
                case _powerUp.lazers: _lazer.start = curTime; break;
                case _powerUp.longPaddle: _longPaddle.start = curTime; break;
                case _powerUp.life: _life.start = curTime; break;
            }
            
            _powerUps.splice(i, 1);
            i--;
        }
    }
    
    if(_longPaddle.start > -1)
    {
        if(curTime - _longPaddle.start <= _longPaddle.dur)
        {
            if(_paddle.width < _paddleInit.width + _longPaddle.widthAdd)
            {
                _paddle.width += _longPaddle.widthInc;
                _paddle.x -= _longPaddle.widthInc / 2;
            }
            
            else
                _paddle.width = _paddleInit.width + _longPaddle.widthAdd;
        }
        
        else
        {
            _paddle.width -= _longPaddle.widthInc;
            _paddle.x += _longPaddle.widthInc / 2;
            
            if(_paddle.width <= _paddleInit.width)
            {
                _longPaddle.start = -1;
                _paddle.width = _paddleInit.width;
            }
        }
    }
    
    if(_multiBall.start > -1)
    {
        for(var i = 0; i < _multiBall.count; i++)
        {
            var newBall = new Ball(_ballInit);
            var newVel = null;
            
            switch(Math.floor(Math.random() * 4))
            {
                case 0: newVel = getVel(getRandomNumber(1, 89), _ballInit.vMax); break;
                case 1: newVel = getVel(getRandomNumber(91, 179), _ballInit.vMax); break;
                case 2: newVel = getVel(getRandomNumber(181, 269), _ballInit.vMax); break;
                case 3: newVel = getVel(getRandomNumber(271, 359), _ballInit.vMax); break;
            }
            
            newBall.x = _balls[0].x;
            newBall.y = _balls[0].y;
            newBall.vX = newVel.x;
            newBall.vY = newVel.y;
            newBall.released = true;
            _balls.push(newBall);
        }
        
        _multiBall.start = -1;
    }
    
    if(_lazer.start > -1)
    {
        if(curTime - _lazer.lastShoot >= _lazer.minShoot)
        {
            var xRight = _paddle.x + _paddle.width;
            var xLeft = _paddle.x;
            var y = _paddle.y - _lazer.height;
            _lazers.push(new Lazer(xLeft, y));
            _lazers.push(new Lazer(xRight, y));
            _lazer.lastShoot = curTime;
        }
        
        if(curTime - _lazer.start >= _lazer.dur)
            _lazer.start = -1;
    }
    
    updateLazers();
    
    if(_superBall.start > -1 && curTime - _superBall.start >= _superBall.dur)
        _superBall.start = -1;
        
    if(_life.start > -1)
    {
        _lives.cur += _life.count;
        _life.start = -1;
    }
}

function updateLazers()
{
    for(var i = 0; i < _lazers.length; i++)
    {
        _lazers[i].y -= _lazer.vY;
        
        if(_lazers[i].y < 0)
        {
            _lazers.splice(i, 1);
            i--;
            continue;
        }
    
        var brickX = Math.floor(_lazers[i].x / _brick.width);
        var brickY = Math.floor(_lazers[i].y / _brick.height);
        
        if(isBrickHere(brickX, brickY))
        {
            if(!_brickMap[brickX][brickY].invincible)
                _brick.live--;
            
            _brickMap[brickX][brickY] = null;
            _lazers.splice(i--, 1);
            continue;
        }
        
        paintLazer(_lazers[i]);
    }
}

function getPowerUp(x, y)
{
    var type = 0;
    
    switch(Math.floor(Math.random() * 5))
    {
        case 0: type = _powerUp.multiBall; break;
        case 1: type = _powerUp.superBall; break;
        case 2: type = _powerUp.lazers; break;
        case 3: type = _powerUp.longPaddle; break;
        case 4: type = _powerUp.life; break;
    }
    
    return new PowerUp(type, x, y);
}

function hitPowerUp(powerUp)
{
    if(_paddle.y - powerUp.y <= _powerUp.minDistY)
        if(getDist({ x: powerUp.x + (_powerUp.width / 2), y: powerUp.y }, { x: _paddle.x + (_paddle.width / 2), y: _paddle.y }) <= _paddle.width)
            return true;
            
    return false;
}
