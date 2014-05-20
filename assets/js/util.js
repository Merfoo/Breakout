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