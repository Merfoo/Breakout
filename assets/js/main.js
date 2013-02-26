// This file conatins all variables used with different variations of the game, and some useful functions

// Viewable client-region of the browser (not screen size, not window size)
var m_iViewportWidth;
var m_iViewportHeight;

// Map Related
var m_iMaxPixelWidth;
var m_iMaxPixelHeight;

// Title Related
var m_iTitleMapWidth = 30;
var m_iTitleMapHeight = 60;
var m_iTitlePixelWidth;
var m_iTitlePixelHeight;

// All colors/ borders
var m_iBackgroundBorderWidth = 0;
var m_cBackgroundColor = "#000";
var m_cScoreColorOne = "#000";
var m_cPaddleColor = "blue";

// Game speed
var m_iMenuSpeed = 50;
var m_iGameSpeedOriginal = 20;
var m_iGameSpeedMain = m_iGameSpeedOriginal;

// Ball/Paddles
var m_iBall;
var m_iMaxBallVelocity = 25;
var m_iPaddle;
var m_iMaxPaddleVelocity = 25;
var m_iPaddleLength;
var m_iPaddleThickness;
var m_iPaddleLastIndex = -1;
var m_iPaddleLast;
var m_iPaddleLastSize = 7;

// Brick related
var m_iBrickMapWidth = 20;
var m_iBrickMapHeight = 30;
var m_iBrickTileWidth;
var m_iBrickTileHeight;
var m_iBrickPositions;
var m_iStartingBrickCount = 30;
var m_iMinLine;
var m_iCurrentBrickTotal = m_iStartingBrickCount;

// Scores
var m_iScoreOne = 0;
var m_iHighestScoreOne = 0;

// Messages alignment
var m_iToolbarThickness;
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

// Lettering
var m_cTitle= new Array();

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
document.documentElement.style.overflowX = 'hidden';	 // Horizontal scrollbar will be hidden
document.documentElement.style.overflowY = 'hidden';     // Vertical scrollbar will be hidden

// Initialize canvas
function initializeGame()
{
	// Sets up music
	if (!supportMP3())
    {
        m_MusicList = m_OGGList;
        m_FoodMusic = new Audio(m_sDirectory + "Food.ogg");        
    }

    else
    {
        m_MusicList = m_MP3List;
        m_FoodMusic = new Audio(m_sDirectory + "Food.mp3");
    }
	
	m_BackgroundMusic = new Audio(m_MusicList[m_iPrevMusicIndex]);
	
    // Get canvas context for drawing, add events
    m_Canvas = document.getElementById("myCanvas");
    m_CanvasContext = document.getElementById("myCanvas").getContext("2d");

    // Set canvas size, set up letter positions for the title
    getViewportSize();
    setCanvasSize();
    setUpLetters();
    
    // Initialize any variables dependant on canvas size
    m_iBrickTileWidth = Math.floor(m_iMaxPixelWidth / m_iBrickMapWidth);
    m_iBrickTileHeight = Math.floor(m_iMaxPixelHeight / m_iBrickMapHeight);
    m_iLeft = 5;
    m_iMiddle = m_iMaxPixelWidth / 2;
    m_iRight = (m_iMaxPixelWidth / 2) + (m_iMaxPixelWidth / 2) / 2;
    m_iToolbarThickness = m_iMaxPixelHeight / 100;
            
    var isChrome = /chrome/.test(navigator.userAgent.toLowerCase());
    
    if(!isChrome)
        alert("This game currently does not fully function in IE or Firefox, for best results try Google Chrome :D");

    showStartMenu(true);
    
    var reader = new FileReader();
    reader.readAsText("c://test.txt");
    
    reader.onload = readFinished;
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
function changeGameSpeed(intervalID, sFunction,gameSpeed)
{
    window.clearInterval(intervalID);
    intervalID = window.setInterval(sFunction, gameSpeed);

    return intervalID;
}

// 
function getViewportSize()
{
    // The more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined')
    {
        m_iViewportWidth = window.innerWidth;
        
        m_iViewportHeight = window.innerHeight;
    }
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
		&& typeof document.documentElement.clientWidth != 'undefined'
		&& document.documentElement.clientWidth != 0)
    {
        m_iViewportWidth = document.documentElement.clientWidth;
        m_iViewportHeight = document.documentElement.clientHeight;
    }

    // Older versions of IE
    else
    {
        m_iViewportWidth = document.getElementsByTagName('body')[0].clientWidth;
        m_iViewportHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
}

// Sets the canvas as big as the broswer size.
function setCanvasSize()
{
    m_iTitlePixelWidth = Math.floor(m_iViewportWidth / m_iTitleMapWidth);
    m_iTitlePixelHeight = Math.floor(m_iViewportHeight / m_iTitleMapHeight);
    m_iMaxPixelWidth = m_CanvasContext.canvas.width = m_iViewportWidth;
    m_iMaxPixelHeight = m_CanvasContext.canvas.height = m_iViewportHeight;
}

// Paints a tile on the screen pixel based
function paintTile(x, y, width, height, color)
{
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillRect(x, y, width, height);
}

// Paints a circle using pixels
function paintCircle(iBall, color)//x, y, radius, color)
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
        m_IntervalMenu = window.setInterval("paintStartMenu();", m_iMenuSpeed);
    }

    else
    {
        document.getElementById("startMenu").style.zIndex = -1;
        window.clearInterval(m_IntervalMenu);
    }
}

function paintStartMenu()
{
    // Paints Whole screen black
    paintTile(0, 0, m_iMaxPixelWidth, m_iMaxPixelHeight, "black");

    //var tempArray = m_cS.concat(m_cN, m_cA, m_cK, m_cE);

    //for (var index = 0; index < tempArray.length; index++)
    //    paintTile(tempArray[index].x, tempArray[index].y, getRandomColor(1, 255));
}

// Shows pause pause if true, otherwise hides it.
function showPausePic(bVisible)
{
    if (bVisible)
        document.getElementById("pause").style.zIndex = 1;

    else
        document.getElementById("pause").style.zIndex = -1;
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

// Writes message to corresponding tile, with specified colour
function writeMessage(startTile, color, message)
{
    paintTile(startTile, 0, message.length * 100, m_iToolbarThickness * 10, m_cBackgroundColor);
    m_CanvasContext.font = m_iToolbarThickness * 10 + 'pt Calibri';
    m_CanvasContext.fillStyle = color;
    m_CanvasContext.fillText(message, startTile, m_iToolbarThickness * 10);
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

// Checks if the browser supports mp3 files
function supportMP3()
{
    var a = document.createElement('audio');
    return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
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
    if (m_bGameStarted)
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

// Reads data from a file
function readFinished(event)
{
    alert(event.target.result);
}

// Sets up all the letter coordinates.
function setUpLetters()
{
    m_cTitle.push({x: 0, y: 0});
    
}

function initializeBall()
{
    // Size is in pixels
    var iBallRadius = ((m_iMaxPixelWidth / 60) + (m_iMaxPixelHeight / 30)) / 4;
    
    m_iBall = { x: m_iMaxPixelWidth / 2, y: m_iMaxPixelHeight / 2, radius: iBallRadius, xV: iBallRadius, yV: iBallRadius };
}

function initializePaddle()
{
    // Size is in pixels
    m_iPaddleLength = m_iMaxPixelWidth / 5;
    m_iPaddleThickness = m_iMaxPixelHeight / 50;

    m_iPaddleLast = new Array();
    
    for(var index = 0; index < m_iPaddleLastSize; index++)
        m_iPaddleLast.push(0);
    
    m_iPaddle = { 
        startX: (m_iMaxPixelWidth / 2) - (m_iPaddleLength / 2), 
        endX: (m_iMaxPixelWidth / 2) + (m_iPaddleLength / 2), 
        topY: (m_iMaxPixelHeight - m_iPaddleThickness), 
        bottomY: m_iMaxPixelHeight,
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
    if(((iCenterX + m_iPaddleLength/2) < m_iMaxPixelWidth) && ((iCenterX - m_iPaddleLength/2) > 0))
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
        
        paintTile(iPaddle.startX - 1, m_iMaxPixelHeight - m_iPaddleThickness - 1, m_iPaddleLength + 2, m_iPaddleThickness + 2, m_cBackgroundColor);
        iPaddle.startX = (iCenterX - m_iPaddleLength/2);
        iPaddle.endX = (iCenterX + m_iPaddleLength/2);
        paintTile(iPaddle.startX, m_iMaxPixelHeight - m_iPaddleThickness, m_iPaddleLength, m_iPaddleThickness, m_cPaddleColor);
    }
}

function makeNewBrick()
{
    m_iMinLine = m_iBrickMapHeight - Math.floor(m_iBrickMapHeight / 5);

    var tempX = getRandomNumber(0, m_iBrickMapWidth);
    var tempY = getRandomNumber(0, m_iMinLine);

    return { 
        tileX: tempX, 
        tileY: tempY, 
        startX: (tempX * m_iBrickTileWidth), 
        topY: (tempY * m_iBrickTileHeight), 
        endX: (tempX * m_iBrickTileWidth) + m_iBrickTileWidth, 
        bottomY: (tempY * m_iBrickTileHeight) + m_iBrickTileHeight 
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
    var ballVelocity = {xV: Math.abs(iBall.xV), yV: Math.abs(iBall.yV)}; 
    paintCircle(iBall, m_cBackgroundColor);
    
    // Checks if the ball has collided with the walls
    if (iBall.y - ballVelocity.yV <= 0 && iBall.yV < 0)
         iBall.yV = -iBall.yV;

    if (iBall.x - ballVelocity.xV <= 0 || iBall.x + ballVelocity.xV >= m_iMaxPixelWidth)
        iBall.xV = -iBall.xV;
    
    iBall.x += iBall.xV;
    iBall.y += iBall.yV;

    paintCircle(iBall, ballColor);
}

// Checks if the ball hit the paddle
function hitPaddle(iBall, iPaddle)
{
    var ballVelocity = {xV: Math.abs(iBall.xV), yV: Math.abs(iBall.yV)};
    
    // Checks if the ball hit the paddle
    if(iBall.yV > 0)
        if(iBall.y + ballVelocity.yV >= iPaddle.topY && iBall.x + ballVelocity.xV > iPaddle.startX && iBall.x - ballVelocity.xV < iPaddle.endX)
            return true;
    
    return false;
}

// Checks if ball hit a brick
function hitBrick(iBall, iBrickArray)
{
    var ballVelocity = {xV: Math.abs(iBall.xV), yV: Math.abs(iBall.yV)};
    
    for(var index = 0; index < iBrickArray.length; index++)
    {            
        if(iBall.x > iBrickArray[index].startX && iBall.x < iBrickArray[index].endX)
        {
            if(iBall.y + ballVelocity.yV >= iBrickArray[index].topY && iBall.y - ballVelocity.yV <= iBrickArray[index].bottomY)
            {
                iBall.yV = -iBall.yV;
                paintTile(iBrickArray[index].startX, iBrickArray[index].topY, iBrickArray[index].endX - iBrickArray[index].startX, iBrickArray[index].bottomY - iBrickArray[index].topY, m_cBackgroundColor);
                iBrickArray = removeIndex(index, iBrickArray);
                break;
            }
        }
        
        else if(iBall.y > iBrickArray[index].topY && iBall.y < iBrickArray[index].bottomY)
        {
            if(iBall.x + ballVelocity.yX >= iBrickArray[index].startX && iBall.x - ballVelocity.yX <= iBrickArray[index].endX)
            {
                iBall.xV = -iBall.xV;
                paintTile(iBrickArray[index].startX, iBrickArray[index].topY, iBrickArray[index].endX - iBrickArray[index].startX, iBrickArray[index].bottomY - iBrickArray[index].topY, m_cBackgroundColor);
                iBrickArray  = removeIndex(index, iBrickArray);
                break;
            }
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
    if(iBall.y >= m_iMaxPixelHeight)
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