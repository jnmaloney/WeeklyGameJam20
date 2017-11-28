

var introTimer = 0;

// Show title screen
function showTitleScreen() {
    waitEnter = beginIntroSeq;
    scene.draw = drawTitle;
}

// Show intro movie
function showIntroMovie() {
    //sceneDraw = draw;
    //sceneUpdate = introUpdate;
}

// Show splash screen
function showSplashScreen() {
    //sceneDraw = drawSplash;
    //sceneUpdate = introUpdate;
}

// Game start
function gameStart() {
    //
}


var title1 = new Image();
title1.src = 'img/Title.png';

var title2 = new Image();
title2.src = 'img/History.png';


// start the intro movie
function beginGame() {
    scene.draw = gameDraw;
    introTimer = 4 * 60;
}

function beginTitle2() {
    scene.draw = drawTitle2;
    waitEnter = beginGame;
}

var waitTimer;
function beginIntroSeq() {
    scene.draw = gameDraw;
    entityBatch.push(watcher);
}

function middleIntroSeq() {
    // delay
    introTimer = 200;
    
    waitTimer = beginTitle2;
    

}


// Call the first function
function onLoadComplete_startIntro() {
    showTitleScreen();
    loop();
}



// Drawers
function drawTitle() {
    showScreen(title1);
}


function showScreen(tile) {
    //
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
        
    ctx.scale(1, 1);
    
    
    //
    var width = tile.width;
    var height = tile.height;
    
    var x = 0.5 * (canvas.width - width);
    var y = 0.5 * (canvas.height - height);

    ctx.drawImage(tile, x, y);
}


function drawTitle2() {
    showScreen(title2);
}



