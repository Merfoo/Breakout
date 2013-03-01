// Single Player 

"use strict";

function initializeSingle()
{
    showStartMenu(false);
    m_bGameStarted = true;
    m_bSingle = true;

    // Game speed
    m_iGameSpeedMain = m_iGameSpeedOriginal;

    if (m_iScoreOne > m_iHighestScoreOne)
        m_iHighestScoreOne = m_iScoreOne;

    m_iScoreOne = 0;
    initializeBall();
    initializePaddle();
    initializeBricks();

    // Initialize gameloop.
    if (m_IntervalIDMain != null)
        clearInterval(m_IntervalIDMain);

    m_IntervalIDMain = window.setInterval("gameLoopSingle();", m_iGameSpeedMain);
}

// Runs all the functions required for the game to work.
function gameLoopSingle()
{
    // Plays music if mute is not checked.
    playBackgroundMusic();
    
    m_iBrickPositions = hitBrick(m_iBall, m_iBrickPositions);
    m_iPaddleLastIndex = setLastPaddle(m_iPaddle, m_iPaddleLastIndex, m_iPaddleLast);
    
    if(hitPaddle(m_iBall, m_iPaddle))
         ballDirectionChanger(m_iBall, m_iPaddle);
    
    if(m_iBrickPositions.length < 1)
     {
         alert("HAHAHA YOU WON!!!");
         initializeSingle();
     }
    
    if(gotPastPaddle(m_iBall))
        initializeBall();
    
    if(isAllSame(m_iPaddleLast))
         m_iPaddle.velocity = 0;
    
    for (var index = 0; index < m_iBrickPositions.length; index++)
        paintBrick(m_iBrickPositions[index], getRandomColor(1, 255));
    
    setUpBall(m_iBall, "blue");
    paintPaddle(m_iPaddle, m_cPaddleColor);
}

// Stops loop
function pauseGameSingle()
{
    stopBackgroundMusic();
    showPausePic(true);
    window.clearInterval(m_IntervalIDMain);
    m_bIsPaused = true;
}

// Starts loop again
function unPauseGameSingle()
{
    playBackgroundMusic();
    showPausePic(false);
    m_IntervalIDMain = changeGameSpeed(m_IntervalIDMain, "gameLoopSingle();", m_iGameSpeedMain);
    m_bIsPaused = false;
}

function keyBoardUpSinglePlayer(keyCode)
{
    if (keyCode == 32)    // Space bar was pressed.
        m_bIsPaused ? unPauseGameSingle() : pauseGameSingle();

    else if (keyCode == 27)    // Escape was pressed, will eventually show start menu ... Jacob!!!
    {
        pauseGameSingle(m_IntervalIDMain);
        m_bIsPaused = false;
        showPausePic(false);
        showStartMenu(true);
        m_bGameStarted = false;
        m_bSingle = false;
        m_iScoreOne = 0;
        m_iHighestScoreOne = 0;
    }
}