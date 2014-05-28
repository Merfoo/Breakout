Brick = function(x, y, lives, invincible, spawnBonus)
{
    this.x = typeof(x) === "undefined" ? 0 : x;
    this.y = typeof(y) === "undefined" ? 0 : y;
    this.color = "red";
    this.startLives = typeof(lives) === "undefined" ? 1 : lives;
    this.lives = this.startLives;
    this.spawnBonus = typeof(spawnBonus) === "undefined" ? false : true;
    this.invincible = typeof(invincible) === "undefined" ? false : invincible;
};

PowerUp = function(type, x, y)
{
    this.x = x;
    this.y = y;
    this.type = type;
};

Paddle = function(initVal)
{
    this.color = "black";
    this.width = initVal.width;
    this.height = initVal.height;
    this.x = 0;
    this.y = 0;
    this.vMax = initVal.vMax;
    this.vInc = initVal.vInc;
    this.v = 0;
};

Ball = function(initVal)
{
    this.color = "red";
    this.maxAng = 70;
    this.released = false;
    this.releaseHeight = initVal.releaseHeight;
    this.vMax = initVal.vMax;
    this.vX = 0;
    this.vY = 0;
    this.r = initVal.r;
    this.x = 0;
    this.y = 0;
    this.xLast = 0;
    this.yLast = 0;
    this.line = new Line();
};

BallAim = function(initVal)
{
    this.ang = -45;
    this.angI = 2.22;
    this.angMin = -160;
    this.angMax = -20;
    this.color = "black";
    this.x = 0;
    this.y = 0;
    this.vMax = initVal.vMax;
    this.vX = 0;
    this.vY = 0;
    this.width = 4;
};

Line = function()
{
    this.slope = 1;
    this.yInt = 1;
    this.xInt = 1;
    
    this.getX = function(y)
    {
        if(this.slope !== null)
            return (y - this.yInt) / this.slope;
        
        return this.xInt;
    };
    
    this.getY = function(x)
    {
        if(this.slope !== null)
            return (this.slope * x) + this.yInt;
        
        return 0;
    };
    
    this.createLine = function(pointA, pointB)
    {
        if((pointB.x - pointA.x) !== 0)
        {
            this.slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
            this.yInt = pointB.y - (this.slope * pointB.x);
            this.xInt = (pointB.y - this.yInt) / this.slope;
        }
        
        else
        {
            this.slope = null;
            this.yInt = null;
            this.xInt = pointA.x;
        }
    };
};