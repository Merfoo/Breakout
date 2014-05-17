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

Object.prototype.clone = Array.prototype.clone = function()
{
    if(Object.prototype.toString.call(this) === "[object Array]")
    {
        var arr = [];
        
        for(var i = 0, len = this.length; i < len; i++)
            arr[i] = this[i].clone();
        
        return arr;
    }
    
    else if(typeof(this) === "object")
    {
        var obj = {};
        
        for(var prop in this)
            if(this.hasOwnProperty(prop))
                obj[prop] = this[prop];
        
        return obj;
    }
    
    else
        return this;
};