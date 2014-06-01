function inBetween(x, x1, x2)
{
    if(x1 > x2)
    {
        var tmp = x1;
        x1 = x2;
        x2 = tmp;
    }
    
    if(x >= x1 && x <= x2)
        return true;
    
    return false;
}

function getDist(pointA, pointB)
{
    return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
}

function getVel(ang, vel)
{
    return { x: -Math.cos(toRad(ang)) * vel, y: Math.sin(toRad(ang)) * vel };
}

function toRad(deg)
{
    return deg * Math.PI / 180;
}

function toDeg(rad)
{
    return rad * 180 / Math.PI;
}

// Returns random color between min and max.
function getRandomColor(min, max)
{
    // Creating a random number between iMin and iMax, converting to hex
    var hexR = (getRandomNumber(min, max)).toString(16);
    var hexG = (getRandomNumber(min, max)).toString(16);
    var hexB = (getRandomNumber(min, max)).toString(16);

    // Making sure single character values are prepended with a "0"
    if (hexR.length === 1)
        hexR = "0" + hexR;

    if (hexG.length === 1)
        hexG = "0" + hexG;

    if (hexB.length === 1)
        hexB = "0" + hexB;

    // Creating the hex value by concatenatening the string values
    return ("#" + hexR + hexG + hexB).toUpperCase();
}

// Returns random number between min and max, include iMin and iMax
function getRandomNumber(min, max)
{
    if (max < min)
    {
        var tmp = max;
        max = min;
        min = tmp;
    }

    return Math.floor((Math.random() * ((max + 1) - min)) + min);
}

function download(filename, text) 
{
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    pom.click();
}

function downloadImg(filename, imgSrc)
{
    var el = document.createElement("a");
    el.setAttribute("href", imgSrc);
    el.setAttribute("download", filename);
    el.click();
}

// Clones objs
function cloneObj(obj)
{
    if(obj === null)
        return null;
    
    var newObj = {};
    
    for(var prop in obj)
        if(obj.hasOwnProperty(prop))
            newObj[prop] = obj[prop];
    
    return newObj;
}

function cos(ang)
{
    return Math.cos(ang * Math.PI / 180) * 180 / Math.PI;
}

function sin(ang)
{
    return Math.sin(ang * Math.PI / 180) * 180 / Math.PI;
}

function rotatePoint(x, y, ang, cornerX, cornerY)
{
    var newX = cos(ang)*(x - cornerX) - sin(ang)*( y - cornerY) + cornerX;
    var newY = sin(ang)*(x - cornerX) + cos(ang)*( y - cornerY) + cornerY;
    
    return { x: newX, y: newY };
}

Timer = function()
{
    this.beg = 0;
    this.end = 0;
    this.bRunning = false;
    this.pauseBeg = 0;
    this.pauseEnd = 0;
    this.bPaused = false;
    
    this.start = function()
    {
        this.beg = new Date().getTime();
        this.bRunning = true;
    };
    
    this.stop = function()
    {
        this.end = new Date().getTime();
        this.bRunning = false;
    };
    
    this.isRunning = function()
    {
        return this.bRunning;
    };
    
    this.pause = function()
    {
        this.pauseBeg = new Date().getTime();
        this.bPaused = true;
    };
    
    this.unPause = function()
    {
        this.pauseEnd =  new Date().getTime();
        this.bPaused = false;
    };
    
    this.isPaused = function()
    {
        return this.bPaused;
    };
    
    this.reset = function(stop)
    {
        this.beg = 0;
        this.end = 0;
        this.pauseBeg = 0;
        this.pauseEnd = 0;
        
        if(stop)
        {
            this.bRunning = false;
            this.bPaused = false;
        }
    };
    
    this.get = function()
    {
        return (((this.bRunning ? new Date().getTime() : this.end) - this.beg) - ((this.bPaused ? new Date().getTime() : this.pauseEnd) - this.pauseBeg)) / 1000;
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