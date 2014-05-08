Brick = function(x, y, lives, spawnBonus)
{
    this.x = typeof(x) === "undefined" ? 0 : x;
    this.y = typeof(y) === "undefined" ? 0 : y;
    this.color = "red";
    this.startLives = typeof(lives) === "undefined" ? 1 : lives;
    this.lives = this.startLives;
    this.spawnBonus = typeof(spawnBonus) === "undefined" ? false : true;
};

Paddle = function()
{
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 175;
    this.startHeight = 13;
    this.startMaxV = 10;
    this.startVInc = 0.15;
    this.width = this.startWidth;
    this.height = this.startHeight;
    this.maxV = this.startMaxV;
    this.v = 0;
    this.vInc = this.startVInc;
    this.x = this.startX;
    this.y = this.startY;
};

Ball = function()
{
    this.startR = 10;
    this.startX = 10;
    this.startXV = 4;
    this.startYV = 4;
    this.startReleaseHeight = 550;
    this.maxV = 10;
    this.released = false;
    this.releaseHeight = this.startReleaseHeight;
    this.xV = this.startXV;
    this.yV = this.startYV;
    this.r = this.startR;
    this.color = "red";
    this.x = this.startX;
    this.y = this.releaseHeight;
    this.xLast = this.x;
    this.yLast = this.y;
    
    this.updateLastPos = function()
    {
        this.xLast = this.x - this.xV;
        this.yLast = this.y - this.yV;
    };
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