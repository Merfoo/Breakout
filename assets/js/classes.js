Brick = function()
{
    this.x = 0;
    this.y = 0;
    this.brickX = 0;
    this.brickY = 0;
    this.color = "red";
    this.startLives = 0;
    this.lives = 0;
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
    this.x = 10;
    this.y = 10;
    this.xV = 10;
    this.yV = 10;
    this.r = 10;
    this.color = "red";
};