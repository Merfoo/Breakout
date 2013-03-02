// Single Player 

"use strict";

function initializeSingle()
{
    showStartMenu(false);
    m_bGameStarted = true;
    m_bSingle = true;

    // Game speed
    m_iGameSpeedMain = m_iGameSpeedOriginal;
    
    // Life
    m_iCurrentLife = m_iStartingLife;

    if (m_iScoreOne > m_iHighestScoreOne)
        m_iHighestScoreOne = m_iScoreOne;

    m_iScoreOne = 0;
    m_bWon = false;
    m_bLost = false;
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
    if(!m_bWon && !m_bLost)
    {
        // Plays music if mute is not checked.
        playBackgroundMusic();

        m_iBrickPositions = hitBrick(m_iBall, m_iBrickPositions);
        m_iPaddleLastIndex = setLastPaddle(m_iPaddle, m_iPaddleLastIndex, m_iPaddleLast);

        if(hitPaddle(m_iBall, m_iPaddle))
             ballDirectionChanger(m_iBall, m_iPaddle);

        if(m_iBrickPositions.length < 1)
            m_bWon = true;

        if(gotPastPaddle(m_iBall))
        {
            if(--m_iCurrentLife < 0)
                m_bLost = true;

            else
                initializeBall();
        }

        if(isAllSame(m_iPaddleLast))
             m_iPaddle.velocity = 0;

        for (var index = 0; index < m_iBrickPositions.length; index++)
            paintBrick(m_iBrickPositions[index], getRandomColor(1, 255));

        setUpBall(m_iBall, "blue");
        paintPaddle(m_iPaddle, m_cPaddleColor);
        paintToolbar();
        writeMessage(m_iLeft, "LIFE: " + m_iCurrentLife, m_cScoreColor);
    }
    
    if(m_bWon)
    {
        stopBackgroundMusic();
        showWinPic(true);
    }
    
    else if(m_bLost)
    {
        stopBackgroundMusic();
        showLosePic(true);
    }
}

// Stops loop
function pauseGameSingle()
{
    stopBackgroundMusic();
    showPausePic(true);
    clearInterval(m_IntervalIDMain);
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

// Handles keyboard events
function keyBoardUpSinglePlayer(keyCode)
{
    if (keyCode == 32)    // Space bar was pressed.
        m_bIsPaused ? unPauseGameSingle() : pauseGameSingle();

    else if (keyCode == 27)    // Escape was pressed, will eventually show start menu ... Jacob!!!
        endGame();
}

// Ends the game
function endGame()
{
    pauseGameSingle(m_IntervalIDMain);
    showStartMenu(true);
    m_bIsPaused = false;
    m_bGameStarted = false;
    m_bSingle = false;
    m_iScoreOne = 0;
    m_iHighestScoreOne = 0;
}

// Continues to endGame
function winLoseClickSingle()
{
    endGame();
}