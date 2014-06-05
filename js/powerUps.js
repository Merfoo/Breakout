function updatePowerUps()
{
    _dom.bonusLongPaddle.style.opacity = _powerUp.minOpac;
    _dom.bonusLazers.style.opacity = _powerUp.minOpac;
    _dom.bonusDuoBall.style.opacity = _powerUp.minOpac;
    _dom.bonusTriBall.style.opacity = _powerUp.minOpac;
    _dom.bonusUberBall.style.opacity = _powerUp.minOpac;
    var curTime = new Date().getTime();
    
    for(var i = 0; i < _powerUps.length; i++)
    {
        var removeItem = false;
        _powerUps[i].y += _star.vY;
        
        if(hitPowerUp(_powerUps[i]))
        {
            switch(_powerUps[i].type)
            {
                case _powerUp.longPaddle: 
                    _longPaddle.timer.start(); 
                    break;
                    
                case _powerUp.uberBall: 
                    _uberBall.timer.start(); 
                    break;
                    
                case _powerUp.lazers: 
                    _lazer.timer.start(); 
                    break;
                    
                case _powerUp.duoBall: 
                    for(var ballI = 0, ballLen = _balls.length; ballI < ballLen; ballI++)
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

                        newBall.x = _balls[ballI].x;
                        newBall.y = _balls[ballI].y;
                        newBall.vX = newVel.x;
                        newBall.vY = newVel.y;
                        newBall.released = true;
                        _balls.push(newBall);
                    }
                    _duoBall.timer.start(); 
                    break;
                
                case _powerUp.triBall:
                    var ang = -180 / (_triBall.count + 1);
                    var angSum = 0;
                    
                    for(var ballI = 0; ballI < _triBall.count; ballI++)
                    {
                        var newBall = new Ball(_ballInit);
                        var newVel = getVel(angSum += ang, _ballInit.vMax);
                        newBall.x = _paddle.x + (_paddle.width / 2);
                        newBall.y = _ballInit.releaseHeight;
                        newBall.vX = newVel.x;
                        newBall.vY = newVel.y;
                        newBall.released = true;
                        _balls.push(newBall);
                    }
                    _triBall.timer.start();
                    break;
                    
                case _powerUp.life: 
                    _lives.cur += _life.count; 
                    _life.timer.start(); 
                    break;
            }
            
            removeItem = true;
            _paddle.powerUpHitTimer.start();
            _paddle.flashMode = true;
        }
        
        if(_powerUps[i].y - (_star.width / 2) >= _map.gameHeight || removeItem)
        {
            _powerUps.splice(i, 1);
            i--;
        }
    }
    
    // longpaddle
    if(_longPaddle.timer.isRunning())
    {
        _dom.bonusLongPaddle.style.opacity = 1;
                
        if(_longPaddle.timer.get() <= _longPaddle.dur)
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
                _dom.bonusLongPaddle.style.opacity = _powerUp.minOpac;
                _longPaddle.timer.reset(true);
                _paddle.width = _paddleInit.width;
            }
        }
    }
    
    // multiball
    if(_duoBall.timer.isRunning())
    {
        _dom.bonusDuoBall.style.opacity = 1;
        
        if(_duoBall.timer.get() >= _duoBall.dur)
        {
            _dom.bonusDuoBall.style.opacity = _powerUp.minOpac;
            _duoBall.timer.reset(true);
        }
    }
    
    // lazers
    if(_lazer.timer.isRunning())
    {
        _dom.bonusLazers.style.opacity = 1;
        
        if(curTime - _lazer.lastShoot >= _lazer.minShoot)
        {
            var xRight = _paddle.x + _paddle.width;
            var xLeft = _paddle.x;
            var y = _paddle.y - _lazer.height;
            _lazers.push(new Lazer(xLeft, y));
            _lazers.push(new Lazer(xRight, y));
            _lazer.lastShoot = curTime;
        }
        
        if(_lazer.timer.get() >= _lazer.dur)
        {
            _dom.bonusLazers.style.opacity = _powerUp.minOpac;
            _lazer.timer.reset(true);
        }
    }
    
    updateLazers();
    
    // super ball
    if(_uberBall.timer.isRunning())
    {
        _dom.bonusUberBall.style.opacity = 1;
        _uberBall.active = true;
        
        if(_uberBall.timer.get() >= _uberBall.dur)
        {
            _dom.bonusUberBall.style.opacity = _powerUp.minOpac;
            _uberBall.active = false;
            _uberBall.timer.reset(true);
        }
    }
    
    // triBall
    if(_triBall.timer.isRunning())
    {
        _dom.bonusTriBall.style.opacity = 1;
        
        if(_triBall.timer.get() >= _triBall.dur)
        {
            _dom.bonusTriBall.style.opacity = _powerUp.minOpac;
            _triBall.timer.reset(true);
        }
    }
    
    // life
    if(_life.timer.isRunning())
    {
        if(_life.timer.get() >= _life.dur)
        {
            _dom.lifeBackground.style.backgroundColor = _hud.lifeBackgroundColor;
            _life.timer.reset(true);
        }
        
        else
            _dom.lifeBackground.style.backgroundColor = getRandomColor(0, 255);
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
    }
}

function getPowerUp(x, y)
{
    var type = 0;
    
    switch(Math.floor(Math.random() * 6))
    {
        case 0: type = _powerUp.duoBall; break;
        case 1: type = _powerUp.uberBall; break;
        case 2: type = _powerUp.lazers; break;
        case 3: type = _powerUp.longPaddle; break;
        case 4: type = _powerUp.life; break;
        case 5: type = _powerUp.triBall; break;
    }
    
    return new PowerUp(type, x, y);
}

function hitPowerUp(powerUp)
{
    if(_paddle.y - powerUp.y <= _star.minDistY)
        if(getDist({ x: powerUp.x, y: powerUp.y }, { x: _paddle.x + (_paddle.width / 2), y: _paddle.y }) <= (_paddle.width / 2) + (_star.width / 2))
            return true;
            
    return false;
}