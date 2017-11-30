

var introTimer = 0;

// Show title screen
function showTitleScreen() {
    //waitEnter = beginIntroSeq;
    waitEnter = beginTitle2;
    scene.draw = drawTitle;
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
    waitTimer = blah;
}

function blah() {
}

function beginTitle2() {
    scene.draw = drawTitle2;
    waitEnter = beginIntroSeq;//beginGame;
}

var waitTimer;
function beginIntroSeq() {
    scene.draw = gameDraw;
    entityBatch.push(watcher);
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


function drawTitle2() {
    showScreen(title2);
}


function showScreen(tile) {
    //

  
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //canvas.backgroundColor = 'black';
    //ctx.fillStyle = 'black';
    //ctx.fill();   
      
    ctx.scale(1, 1);
    
    
    //
    var width = tile.width;
    var height = tile.height;
    

    var h = (canvas.height > height) ? height : canvas.height;
    var w = h * width / height;

    var x = 0.5 * (canvas.width - w);
    var y = 0.5 * (canvas.height - h);

    ctx.drawImage(tile, x, y, w, h);
}




