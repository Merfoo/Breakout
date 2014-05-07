Brick = function()
{
    this.x = 0;
    this.y = 0;
    this.color = "red";
    this.startLives = 1;
    this.lives = 1;
};

Paddle = function()
{
    this.x = 0;
    this.y = 0;
    this.startWidth = 175;
    this.startHeight = 13;
    this.width = 175;
    this.height = 13;
    this.startMaxV = 1;
    this.startVInc = 0.1;
    this.maxV = 10;
    this.v = 0;
    this.vInc = 0.15;
    this.vDec = 0.05;
};

Ball = function()
{
    this.released = false;
    this.x = 110;
    this.y = 90;
    this.xLast = 0;
    this.yLast = 0;
    this.startReleaseHeight = 550;
    this.releaseHeight = 550;
    this.startXV = 4;
    this.startYV = 4;
    this.xV = 4;
    this.yV = 4;
    this.startR = 10;
    this.r = 10;
    this.color = "red";
    
    this.updateLastPos = function()
    {
        this.xLast = this.x - this.xV;
        this.yLast = this.y - this.yV;
    };
    
    this.reset = function()
    {
        
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
    };
    
    this.createLine = function(pointA, pointB)
    {
        if((pointB.x - pointA.x) !== 0)
        {
            this.slope = (pointB.y - pointA.y) / (pointB.x - pointA.x);
            this.yInt = pointB.y - (this.slope * pointB.x);
        }
        
        else
        {
            this.slope = null;
            this.yInt = null;
            this.xInt = pointA.x;
        }
    };
};