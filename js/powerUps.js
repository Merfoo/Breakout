function updatePowerUps()
{
    _dom.bonusLongPaddle.style.opacity = _powerUp.minOpac;
    _dom.bonusLazers.style.opacity = _powerUp.minOpac;
    _dom.bonusMultiBall.style.opacity = _powerUp.minOpac;
    _dom.bonusSuperBall.style.opacity = _powerUp.minOpac;
    _dom.bonusLife.style.opacity = _powerUp.minOpac;
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
                    
                case _powerUp.superBall: 
                    _superBall.timer.start(); 
                    break;
                    
                case _powerUp.lazers: 
                    _lazer.timer.start(); 
                    break;
                    
                case _powerUp.multiBall: 
                    for(var ballI = 0; ballI < _multiBall.count; ballI++)
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
                    _multiBall.timer.start(); 
                    break;
                    
                case _powerUp.life: 
                    _lives.cur += _life.count; 
                    _life.timer.start(); 
                    break;
            }
            
            removeItem = true;
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
    if(_multiBall.timer.isRunning())
    {
        _dom.bonusMultiBall.style.opacity = 1;
        
        if(_multiBall.timer.get() >= _multiBall.dur)
        {
            _dom.bonusMultiBall.style.opacity = _powerUp.minOpac;
            _multiBall.timer.reset(true);
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
    if(_superBall.timer.isRunning())
    {
        _dom.bonusSuperBall.style.opacity = 1;
        _superBall.active = true;
        
        if(_superBall.timer.get() >= _superBall.dur)
        {
            _dom.bonusSuperBall.style.opacity = _powerUp.minOpac;
            _superBall.active = false;
            _superBall.timer.reset(true);
        }
    }
    
    // life
    if(_life.timer.isRunning())
    {
        _dom.bonusLife.style.opacity = 1;
        
        if(_life.timer.get() >= _life.dur)
        {
            _dom.bonusLife.style.opacity = _powerUp.minOpac;
            _life.timer.reset(true);
        }
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
    if(_paddle.y - powerUp.y <= _star.minDistY)
        if(getDist({ x: powerUp.x, y: powerUp.y }, { x: _paddle.x + (_paddle.width / 2), y: _paddle.y }) <= (_paddle.width / 2) + (_star.width / 2))
            return true;
            
    return false;
}