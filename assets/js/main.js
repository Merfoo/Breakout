// This file conatins all variables used with different variations of the game, and some useful functions

"use strict";

// Map Related
var m_iMaxPixelWidth;
var m_iMaxPixelHeight;
var m_cBackgroundColor = "black";

// Title Related
var m_cTitle= new Array();
var m_iTitleMapWidth = 60;
var m_iTitleMapHeight = 30;
var m_iTitlePixelWidth;
var m_iTitlePixelHeight;
var m_iTitleBorderWidth = 1;

// Game speed
var m_iMenuSpeed = 50;
var m_iGameSpeedOriginal = 33;
var m_iGameSpeedMain = m_iGameSpeedOriginal;

// Life
var m_iStartingLife = 2;
var m_iCurrentLife = m_iStartingLife;
var m_bWon = false;
var m_bLost = false;

// Ball
var m_iBall;
var m_iMaxBallVelocity = 25;

// Paddle
var m_iPaddle;
var m_iMaxPaddleVelocity = 25;
var m_iPaddleLength;
var m_iPaddleThickness;
var m_iPaddleLastIndex = -1;
var m_iPaddleLast;
var m_iPaddleLastSize = 5;
var m_cPaddleColor = "pink";

// Brick related
var m_iBrickMapWidth = 20;
var m_iBrickMapHeight = 30;
var m_iBrickTileWidth;
var m_iBrickTileHeight;
var m_iBrickBorderWidth = 2;
var m_iBrickPositions;
var m_iStartingBrickCount = 30;
var m_iCurrentBrickTotal = m_iStartingBrickCount;

// Scores
var m_iScoreOne = 0;
var m_iHighestScoreOne = 0;
var m_cScoreColor = "white";

// Messages alignment
var m_cToolbarColor = "black";
var m_iToolbarThickness;
var m_iTextMapWidth = 30;
var m_iTextPixelWidth;
var m_iLeft;
var m_iMiddle;
var m_iRight;

// Sound Related
var m_sDirectory = "assets/music/";
var m_MP3List = new Array(m_sDirectory + "Ephixia - Zelda Remix.mp3", m_sDirectory + "Song One.mp3", m_sDirectory + "Song Two.mp3", m_sDirectory + "Song Three.mp3", m_sDirectory + "Song Four.mp3");
var m_OGGList = new Array(m_sDirectory + "Ephixia - Zelda Remix.ogg", m_sDirectory + "Song One.ogg", m_sDirectory + "Song Two.ogg", m_sDirectory + "Song Three.ogg", m_sDirectory + "Song Four.ogg");
var m_MusicList = m_MP3List;
var m_iPrevMusicIndex = getRandomNumber(0, m_MusicList.length - 1);
var m_FoodMusic;
var m_BackgroundMusic;
var m_bSoundOn = true;

// HTML5 Elemtents
var m_CanvasContext;
var m_Canvas;

// Interval ID's
var m_IntervalMenu;
var m_IntervalIDMain;

// Game version related.
var m_iGameVersion = 0;
var m_bGameStarted = false;
var m_bSingle = false;
var m_bIsPaused = false;

window.addEventListener('keyup', doKeyUp, true);
document.addEventListener("DOMContentLoaded", initializeGame);
document.addEventListener("mousemove", mouseMove);
document.documentElement.style.overflowX = "hidden";	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = "hidden";     // Vertical scrollbar will be hidden

// Initialize canvas
function initializeGame()
{
    setUpMusic();
    setCanvasSize();
    setUpLetters();
    
    // Initialize any variables dependant on canvas size
    m_iToolbarThickness = Math.floor(m_iMaxPixelHeight / 25);
    m_iTitlePixelWidth = Math.floor(m_iMaxPixelWidth / m_iTitleMapWidth);
    m_iTitlePixelHeight = Math.floor(m_iMaxPixelHeight / m_iTitleMapHeight);
    m_iBrickTileWidth = Math.floor(m_iMaxPixelWidth / m_iBrickMapWidth);
    m_iBrickTileHeight = Math.floor((m_iMaxPixelHeight - m_iToolbarThickness) / m_iBrickMapHeight);
    m_iLeft = 5;
    m_iMiddle = Math.floor(m_iMaxPixelWidth / 2);
    m_iRight = Math.floor((m_iMaxPixelWidth / 2) + (m_iMaxPixelWidth / 2) / 2);
    
    showStartMenu(true);
}

// Starts game
function startGame(iGameVersion)
{
    if(!m_bGameStarted)
    {
        m_iGameVersion = iGameVersion;

        if (m_iGameVersion == 0)
            initializeSingle();
    }
}

// Changes gamespeed
function changeGameSpeed(intervalID, sFunction, gameSpeed)
{
    window.clearInterval(intervalID);
    intervalID = window.setInterval(sFunction, gameSpeed);

    return intervalID;
}

// Sets the canvas as big as the broswer size.
function setCanvasSize()
{
    m_CanvasContext = document.getElementById("myCanvas").getContext("2d");
    
    // The more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined')
    {
        m_iMaxPixelWidth = window.innerWidth;
        m_iMaxPixelHeight = window.innerHeight;
    }
    
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
		&& typeof document.documentElement.clientWidth != 'undefined'
		&& document.documentElement.clientWidth != 0)
    {
        m_iMaxPixelWidth = document.documentElement.clientWidth;
        m_iMaxPixelHeight = document.documentElement.clientHeight;
    }

    // Older versions of IE
    else
    {
        m_iMaxPixelWidth = document.getElementsByTagName('body')[0].clientWidth;
        m_iMaxPixelHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
    
    m_CanvasContext.canvas.width = m_iMaxPixelWidth;
    m_CanvasContext.canvas.height = m_iMaxPixelHeight;
}

// Sets up the music
function setUpMusic()
{
    var a = document.createElement('audio');
    
    // Sets up music
    if (!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, '')))
    {
        m_MusicList = m_MP3List;
        m_FoodMusic = new Audio(m_sDirectory + "Food.mp3");        
    }

    else
    {
        m_MusicList = m_OGGList;
        m_FoodMusic = new Audio(m_sDirectory + "Food.ogg"); 
    }
	
    m_BackgroundMusic = new Audio(m_MusicList[m_iPrevMusicIndex]);
}

// Writes message to corresponding tile, with specified colour
function writeMessage(startTile, message, color)
{
    m_CanvasContext.font = (m_iToolbarThickness - 10)  + 'pt Calibri';
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillText(message, startTile, m_iToolbarThickness - 5);
}

// Paints toolbar back to regular
function paintToolbar()
{
    paintTile(0, 0, m_iMaxPixelWidth, m_iToolbarThickness, m_cToolbarColor);
}

// Paints a tile on the screen pixel based
function paintTile(x, y, width, height, color)
{
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillRect(x, y, width, height);
}

// Paints one brick
function paintBrick(iBrick, color)
{
    paintTile(iBrick.startX + m_iBrickBorderWidth, 
        iBrick.topY + m_iBrickBorderWidth, 
        m_iBrickTileWidth - (m_iBrickBorderWidth * 2), 
        m_iBrickTileHeight - (m_iBrickBorderWidth * 2), 
        color);
}

// Paints a paddle
function paintPaddle(iPaddle, color)
{
    paintTile(iPaddle.startX, 
        iPaddle.topY, 
        m_iPaddleLength, 
        m_iPaddleThickness, 
        color);
}

// Paints a circle using pixels
function paintCircle(iBall, color)
{
    m_CanvasContext.beginPath();
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.arc(iBall.x, iBall.y, iBall.radius, 0, 2 * Math.PI);
    m_CanvasContext.stroke();
    m_CanvasContext.closePath();
    m_CanvasContext.fill();
}

// Shows start menu, based on argument.
function showStartMenu(bVisible)
{
    if (bVisible)
    {
        document.getElementById("startMenu").style.zIndex = 1;
        showWinPic(false);
        showPausePic(false);
        showLosePic(false);
        m_IntervalMenu = window.setInterval("paintStartMenu();", m_iMenuSpeed);
    }

    else
    {
        document.getElementById("startMenu").style.zIndex = -1;
        window.clearInterval(m_IntervalMenu);
        paintTile(0, 0, m_iMaxPixelWidth, m_iToolbarThickness, m_cToolbarColor);
        paintTile(0, m_iToolbarThickness, m_iMaxPixelWidth, m_iMaxPixelHeight - m_iToolbarThickness, m_cBackgroundColor);
    }
}

function paintStartMenu()
{
    // Paints Whole screen black
    paintTile(0, 0, m_iMaxPixelWidth, m_iMaxPixelHeight, m_cBackgroundColor);

    for (var index = 0; index < m_cTitle.length; index++)
        paintTile((m_cTitle[index].x * m_iTitlePixelWidth) + m_iTitleBorderWidth, 
            (m_cTitle[index].y * m_iTitlePixelHeight) + m_iTitleBorderWidth, 
            m_iTitlePixelWidth - (m_iTitleBorderWidth * 2), 
            m_iTitlePixelHeight - (m_iTitleBorderWidth * 2), 
            getRandomColor(1, 255));
}

// Shows the win pic
function showWinPic(bVisible)
{
    if(bVisible)
        document.getElementById("won").style.zIndex = 1;
    
    else
        document.getElementById("won").style.zIndex = -1;
}

// Shows the win pic
function showLosePic(bVisible)
{
    if(bVisible)
        document.getElementById("lost").style.zIndex = 3;
    
    else
        document.getElementById("lost").style.zIndex = -1;
}

// Shows pause pause if true, otherwise hides it.
function showPausePic(bVisible)
{
    if (bVisible)
        document.getElementById("pause").style.zIndex = 3;

    else
        document.getElementById("pause").style.zIndex = -1;
}

function winLoseClick()
{
    if (m_bGameStarted)
    {
        if (m_bSingle)
            winLoseClickSingle();
    }
}

// Sets the sound on pause on visible
function showSoundPic(bOn)
{
    m_bSoundOn = bOn;

    if (m_bSoundOn)
    {
        document.getElementById("soundOn").style.zIndex = 1;
        document.getElementById("soundOff").style.zIndex = -1;
    }

    else
    {
        document.getElementById("soundOn").style.zIndex = -1;
        document.getElementById("soundOff").style.zIndex = 1;
    }
}

// Plays background music if mute is off
function playBackgroundMusic()
{
    if (m_bSoundOn)
    {
        if (m_BackgroundMusic.ended)
        {
            var  iNewMusicIndex = getRandomNumber(0, m_MusicList.length - 1);

            while(iNewMusicIndex == m_iPrevMusicIndex)
                iNewMusicIndex = getRandomNumber(0, m_MusicList.length - 1);

            m_iPrevMusicIndex = iNewMusicIndex;
            m_BackgroundMusic.src = m_MusicList[m_iPrevMusicIndex];
        }

        m_BackgroundMusic.play();
    }

    else
        m_BackgroundMusic.pause();
}

// Stops background music
function stopBackgroundMusic()
{
    m_BackgroundMusic.pause();
}

// Plays food music
function playFoodMusic()
{
    if(m_bSoundOn)
        m_FoodMusic.play();
}

// Handles key up events
function doKeyUp(event)
{
    if (m_bGameStarted && !m_bWon && !m_bLost)
    {
        if (m_bSingle)
            keyBoardUpSinglePlayer(event.keyCode);

        if (event.keyCode == 77)    // 'm' was pressed.
            m_bSoundOn = !m_bSoundOn;
    }
}

// Handles mouse movement
function mouseMove(event)
{
    if(m_bGameStarted && !m_bIsPaused)
        movePaddle(event.clientX, m_iPaddle);
}

// Returns random color between iMin and iMax.
function getRandomColor(iMin, iMax)
{
    // creating a random number between iMin and iMax
    var r = getRandomNumber(iMin, iMax);
    var g = getRandomNumber(iMin, iMax);
    var b = getRandomNumber(iMin, iMax);

    // going from decimal to hex
    var hexR = r.toString(16);
    var hexG = g.toString(16);
    var hexB = b.toString(16);

    // making sure single character values are prepended with a "0"
    if (hexR.length == 1)
        hexR = "0" + hexR;

    if (hexG.length == 1)
        hexG = "0" + hexG;

    if (hexB.length == 1)
        hexB = "0" + hexB;

    // creating the hex value by concatenatening the string values
    var hexColor = "#" + hexR + hexG + hexB;
    return hexColor.toUpperCase();
}

// Returns random number between iMin and iMax.
function getRandomNumber(iMin, iMax)
{
    return Math.floor((Math.random() * (iMax - iMin)) + iMin);
}

// Capitalizes first leter of string.
function capitalizeFirst(sArg)
{
    return sArg.charAt(0).toUpperCase() + sArg.slice(1);
}

// Removes specified index of the array
function removeIndex(index, array)
{
    var returnArray = new Array();
    
    for(var iPos = 0; iPos < array.length; iPos++)
         if(iPos != index)
            returnArray.push(array[iPos]);
    
    return returnArray;
}

// Checks if all the data in the array is the same
function isAllSame(iArray)
{
    var iOriginal = iArray[0];
    
    for(var index = 1; index < iArray.length; index++)
        if(iOriginal != iArray[index])
            return false;
    
    return true;
}

// Sets up all the letter coordinates.
function setUpLetters()
{
    m_cTitle.push({x: 10, y: 3});
    m_cTitle.push({x: 11, y: 3});
    m_cTitle.push({x: 12, y: 3});
    m_cTitle.push({x: 15, y: 3});
    m_cTitle.push({x: 16, y: 3});
    m_cTitle.push({x: 17, y: 3});
    m_cTitle.push({x: 20, y: 3});
    m_cTitle.push({x: 21, y: 3});
    m_cTitle.push({x: 22, y: 3});
    m_cTitle.push({x: 23, y: 3});
    m_cTitle.push({x: 26, y: 3});
    m_cTitle.push({x: 27, y: 3});
    m_cTitle.push({x: 30, y: 3});
    m_cTitle.push({x: 34, y: 3});
    m_cTitle.push({x: 37, y: 3});
    m_cTitle.push({x: 38, y: 3});
    m_cTitle.push({x: 41, y: 3});
    m_cTitle.push({x: 44, y: 3});
    m_cTitle.push({x: 46, y: 3});
    m_cTitle.push({x: 47, y: 3});
    m_cTitle.push({x: 48, y: 3});
    m_cTitle.push({x: 49, y: 3});
    m_cTitle.push({x: 50, y: 3});
    m_cTitle.push({x: 10, y: 4});
    m_cTitle.push({x: 13, y: 4});
    m_cTitle.push({x: 15, y: 4});
    m_cTitle.push({x: 18, y: 4});
    m_cTitle.push({x: 20, y: 4});
    m_cTitle.push({x: 25, y: 4});
    m_cTitle.push({x: 28, y: 4});
    m_cTitle.push({x: 30, y: 4});
    m_cTitle.push({x: 33, y: 4});
    m_cTitle.push({x: 36, y: 4});
    m_cTitle.push({x: 39, y: 4});
    m_cTitle.push({x: 41, y: 4});
    m_cTitle.push({x: 44, y: 4});
    m_cTitle.push({x: 48, y: 4});
    m_cTitle.push({x: 10, y: 5});
    m_cTitle.push({x: 13, y: 5});
    m_cTitle.push({x: 15, y: 5});
    m_cTitle.push({x: 18, y: 5});
    m_cTitle.push({x: 20, y: 5});
    m_cTitle.push({x: 25, y: 5});
    m_cTitle.push({x: 28, y: 5});
    m_cTitle.push({x: 30, y: 5});
    m_cTitle.push({x: 32, y: 5});
    m_cTitle.push({x: 36, y: 5});
    m_cTitle.push({x: 39, y: 5});
    m_cTitle.push({x: 41, y: 5});
    m_cTitle.push({x: 44, y: 5});
    m_cTitle.push({x: 48, y: 5});
    m_cTitle.push({x: 10, y: 6});
    m_cTitle.push({x: 11, y: 6});
    m_cTitle.push({x: 12, y: 6});
    m_cTitle.push({x: 13, y: 6});
    m_cTitle.push({x: 15, y: 6});
    m_cTitle.push({x: 16, y: 6});
    m_cTitle.push({x: 17, y: 6});
    m_cTitle.push({x: 20, y: 6});
    m_cTitle.push({x: 21, y: 6});
    m_cTitle.push({x: 22, y: 6});
    m_cTitle.push({x: 25, y: 6});
    m_cTitle.push({x: 26, y: 6});
    m_cTitle.push({x: 27, y: 6});
    m_cTitle.push({x: 28, y: 6});
    m_cTitle.push({x: 30, y: 6});
    m_cTitle.push({x: 31, y: 6});
    m_cTitle.push({x: 36, y: 6});
    m_cTitle.push({x: 39, y: 6});
    m_cTitle.push({x: 41, y: 6});
    m_cTitle.push({x: 44, y: 6});
    m_cTitle.push({x: 48, y: 6});
    m_cTitle.push({x: 10, y: 7});
    m_cTitle.push({x: 13, y: 7});
    m_cTitle.push({x: 15, y: 7});
    m_cTitle.push({x: 16, y: 7});
    m_cTitle.push({x: 20, y: 7});
    m_cTitle.push({x: 25, y: 7});
    m_cTitle.push({x: 28, y: 7});
    m_cTitle.push({x: 30, y: 7});
    m_cTitle.push({x: 32, y: 7});
    m_cTitle.push({x: 36, y: 7});
    m_cTitle.push({x: 39, y: 7});
    m_cTitle.push({x: 41, y: 7});
    m_cTitle.push({x: 44, y: 7});
    m_cTitle.push({x: 48, y: 7});
    m_cTitle.push({x: 10, y: 8});
    m_cTitle.push({x: 13, y: 8});
    m_cTitle.push({x: 15, y: 8});
    m_cTitle.push({x: 17, y: 8});
    m_cTitle.push({x: 20, y: 8});
    m_cTitle.push({x: 25, y: 8});
    m_cTitle.push({x: 28, y: 8});
    m_cTitle.push({x: 30, y: 8});
    m_cTitle.push({x: 33, y: 8});
    m_cTitle.push({x: 36, y: 8});
    m_cTitle.push({x: 39, y: 8});
    m_cTitle.push({x: 41, y: 8});
    m_cTitle.push({x: 44, y: 8});
    m_cTitle.push({x: 48, y: 8});
    m_cTitle.push({x: 10, y: 9});
    m_cTitle.push({x: 11, y: 9});
    m_cTitle.push({x: 12, y: 9});
    m_cTitle.push({x: 15, y: 9});
    m_cTitle.push({x: 18, y: 9});
    m_cTitle.push({x: 20, y: 9});
    m_cTitle.push({x: 21, y: 9});
    m_cTitle.push({x: 22, y: 9});
    m_cTitle.push({x: 23, y: 9});
    m_cTitle.push({x: 25, y: 9});
    m_cTitle.push({x: 28, y: 9});
    m_cTitle.push({x: 30, y: 9});
    m_cTitle.push({x: 34, y: 9});
    m_cTitle.push({x: 37, y: 9}); 
    m_cTitle.push({x: 38, y: 9});
    m_cTitle.push({x: 42, y: 9});
    m_cTitle.push({x: 43, y: 9});
    m_cTitle.push({x: 48, y: 9});
}

function initializeBall()
{
    // Size is in pixels
    var iBallRadius = ((m_iMaxPixelWidth / 60) + (m_iMaxPixelHeight / 30)) / 4;
    
    m_iBall = { x: m_iMaxPixelWidth / 2, y: m_iMaxPixelHeight / 2, radius: iBallRadius, xV: 0, yV: iBallRadius };
}

function initializePaddle()
{
    // Size is in pixels
    m_iPaddleLength = Math.floor(m_iMaxPixelWidth / 5);
    m_iPaddleThickness = Math.floor(m_iMaxPixelHeight / 50);
    var tempStartX = Math.floor((m_iMaxPixelWidth / 2) - (m_iPaddleLength / 2));
    var tempEndX = Math.floor((m_iMaxPixelWidth / 2) + (m_iPaddleLength / 2));
    var tempTopY = m_iMaxPixelHeight - m_iPaddleThickness - 10;
    var tempBottomY = tempTopY + m_iPaddleThickness;

    m_iPaddleLast = new Array();
    
    for(var index = 0; index < m_iPaddleLastSize; index++)
        m_iPaddleLast.push(0);
    
    m_iPaddle = { 
        startX: tempStartX, 
        endX: tempEndX, 
        topY: tempTopY, 
        bottomY: tempBottomY,
        velocity: 0
    };
}

function initializeBricks()
{
    m_iCurrentBrickTotal = m_iStartingBrickCount;
    m_iBrickPositions = new Array();
    
    setUpBricks(m_iStartingBrickCount, m_iBrickPositions);
}

function movePaddle(iCenterX, iPaddle)
{
    if(!m_bWon && !m_bLost)
    {
        if(((iCenterX + m_iPaddleLength/2) <= m_iMaxPixelWidth) && ((iCenterX - m_iPaddleLength/2) >= 0))
        {
            if(iCenterX > (iPaddle.startX + iPaddle.endX)/2)
            {
                if(iPaddle.velocity < 0)
                    iPaddle.velocity = 0;

                if(++iPaddle.velocity > m_iMaxPaddleVelocity)
                    iPaddle.velocity = m_iMaxPaddleVelocity;
            }

            else if(iCenterX < (iPaddle.startX + iPaddle.endX)/2)
            {
                if(iPaddle.velocity > 0)
                    iPaddle.velocity = 0;

                if(--iPaddle.velocity < -m_iMaxPaddleVelocity)
                    iPaddle.velocity = -m_iMaxPaddleVelocity;
            }

            paintPaddle(iPaddle, m_cBackgroundColor);
            iPaddle.startX = (iCenterX - m_iPaddleLength/2);
            iPaddle.endX = (iCenterX + m_iPaddleLength/2);
            paintPaddle(iPaddle, m_cPaddleColor);
        }
    }
}

function makeNewBrick()
{
    var iMinLine = m_iBrickMapHeight - Math.floor(m_iBrickMapHeight / 5);

    var tempX = getRandomNumber(0, m_iBrickMapWidth);
    var tempY = getRandomNumber(0, iMinLine);

    return { 
        tileX: tempX, 
        tileY: tempY , 
        startX: (tempX * m_iBrickTileWidth), 
        topY: (tempY * m_iBrickTileHeight) + m_iToolbarThickness, 
        endX: (tempX * m_iBrickTileWidth) + m_iBrickTileWidth, 
        bottomY: (tempY * m_iBrickTileHeight) + m_iBrickTileHeight + m_iToolbarThickness
    };
}

function setUpBricks(iAmount, iBrickArray)
{
    for(var iLimit = 0; iLimit < iAmount; iLimit++)
    {
        var tempBrick = makeNewBrick();
        var bAlreadyMade = true;

        while(bAlreadyMade)
        {
            bAlreadyMade = false;
            tempBrick = makeNewBrick();

            for(var index = 0; index < iBrickArray.length; index++)
            {
                if(tempBrick.tileX == iBrickArray[index].tileX && tempBrick.tileY == iBrickArray[index].tileY)
                {
                    bAlreadyMade = true;
                    break;
                }
            }
        }

        iBrickArray.push(tempBrick);
    }
}

// Handles the ball hitting the wall boundaries.
function setUpBall(iBall, ballColor)
{ 
    paintCircle(iBall, m_cBackgroundColor);
    
    // Checks if the ball has collided with the walls
    if (iBall.y - iBall.radius <= m_iToolbarThickness && iBall.yV < 0)
         iBall.yV = -iBall.yV;

    if ((iBall.x - iBall.radius <= 0 && iBall.x < 0) || (iBall.x + iBall.radius >= m_iMaxPixelWidth && iBall.x > 0))
        iBall.xV = -iBall.xV;
    
    iBall.x += iBall.xV;
    iBall.y += iBall.yV;

    paintCircle(iBall, ballColor);
}

// Checks if the ball hit the paddle
function hitPaddle(iBall, iPaddle)
{
    // Checks if the ball hit the paddle
    if(iBall.yV > 0)
         if(iBall.y + iBall.radius >= iPaddle.topY && iBall.y + iBall.radius <= iPaddle.bottomY)
            if(iBall.x + iBall.radius >= iPaddle.startX && iBall.x - iBall.radius<= iPaddle.endX)
                 return true;
     
    return false;
}

// Checks if ball hit a brick
function hitBrick(iBall, iBrickArray)
{
    var bHitBrick = false;
    
    for(var index = 0; index < iBrickArray.length; index++)
    {            
        if(iBall.x >= iBrickArray[index].startX && iBall.x <= iBrickArray[index].endX)
        {
            if(iBall.y + iBall.radius >= iBrickArray[index].topY && iBall.y - iBall.radius <= iBrickArray[index].bottomY)
            {
                iBall.yV = -iBall.yV;
                bHitBrick = true;
            }
        }
        
        if(iBall.y >= iBrickArray[index].topY && iBall.y <= iBrickArray[index].bottomY)
        {
            if(iBall.x + iBall.radius >= iBrickArray[index].startX && iBall.x - iBall.radius <= iBrickArray[index].endX)
            {
                iBall.xV = -iBall.xV;
                bHitBrick = true;
            }
        }
        
        if(bHitBrick)
        {
           paintBrick(iBrickArray[index], m_cBackgroundColor);
           iBrickArray = removeIndex(index, iBrickArray);
           break;
        }
    }
    
    return iBrickArray;
}

// Handles changing ball direction if it paddle, including ball direction modification.
function ballDirectionChanger(iBall, iPaddle)
{
    m_iBall.yV = -m_iBall.yV;
    iBall.xV += iPaddle.velocity;
    
    if(iBall.xV > m_iMaxBallVelocity)
        iBall.xV = m_iMaxBallVelocity;
    
    else if(iBall.xV < -m_iMaxBallVelocity)
        iBall.xV = -m_iMaxBallVelocity;
}

// Checks if the ball went past the paddle
function gotPastPaddle(iBall)
{
    if(iBall.y - iBall.radius > m_iMaxPixelHeight)
        return true;
    
    return false;
}

// Sets the coordinates of the last paddle, for use in slowing the paddle velocity
function setLastPaddle(iPaddle, index, iArray)
{
    if(++index >= iArray.length)
        index = 0;
    
    iArray[index] = (iPaddle.startX + iPaddle.endX)/2;
    
    return index;
}