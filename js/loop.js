// ---------------------------------------------------------------------------
// -        LOOP
// ---------------------------------------------------------------------------
var now,
    delta = 0.0,
    then = timestamp();
var frame = 0;
var frameTick = 0;
var interval = 1000.0 / 60.0;


var waitingOnBank = true;


var scene = {
    draw: gameDraw,
    update: gameState
};


function loop() {
    now = timestamp();
    delta += Math.min(1000, (now - then));
    while(delta > interval) {
        delta -= interval;
        scene.update(interval / 1000);
        if ((++frameTick)%15 == 0) ++frame;
    }
    //draw
    scene.draw();
    then = now;
    requestAnimationFrame(loop);
}


var n1 = 0, n2 = 0;
function gameState(dt) {

    // FMOD
    gSystem.update();


    // timer
    if (introTimer) {
        --introTimer;
        
        var n = (200 - introTimer)/8;
        n2 = (n-1)*(n-1);
        n1 = (n-8)*(n-8);
        
        if (introTimer <= 0) {
            introTimer = 0;
            intro_render = false;
            
            if (waitTimer) {
                temp = waitTimer;
                waitTimer = undefined;
                temp();
            }
        }
    }

}

function gameDraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
        
    ctx.scale(2, 2);
        
    drawLayer(0);
    drawLayer(1);
    drawEntities();
    drawLayer(2);
    
    /*if (waitingOnBank && gBank) {
    
        var outval = {};
        var loadStateResult = gBank.getLoadingState(outval);
        var bankLoadState = outval.val;
        if (bankLoadState == FMOD.STUDIO_LOADING_STATE_LOADED) {
            console.log('bank 2');
            waitingOnBank = false;
            loadPart2();
        }
    
    }*/ 
}

function drawLayer(layer) {

    cells = map.layers[layer].data;
    
    // Draw
    var srcX = 0, srcY = 0;
    var width = 48, height = 12;
    var x = 0, y = 0;
    var tx = canvas.width / width + 2;
    var ty = canvas.height / height + 2;
    var off_x = stage_x % width;// - width/2;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;

    for (var j = 0+j_off; j < ty+j_off; ++j) {
        for (var i = 0+i_off; i < tx+i_off; ++i) {
            x = off_x + (i-i_off) * width;
            y = off_y + (j-j_off) * height;

            x += 24 * (j%2);

            var rx = 1 + 2*4;
            var ry = 2 + 2*10;

            // ?
            tt = ScreenToTile(x, y);

            
            	        
	        var tile = getMapTile(layer, tt.x, tt.y);      
	        
	        if (tile) {
	            
                //ctx.drawImage(tile, srcX, srcY, width, height, x, y, width, height);
                ctx.drawImage(tile, 
                    x - 24, 
                    y-height-height-3 + 48-tile.height);
            }
        }
    }
}


var stage_render = true;
var intro_render = true;
function getMapTile(layer, x, y) {

    var tt = {x:x, y:y };

    if (tt.x < 0) return undefined;
    if (tt.y < 0) return undefined;
    if (tt.x > 99) return undefined;
    if (tt.y > 99) return undefined; 
    
    // Hijacked special effect
    if (intro_render) {      
    
        var height = 0;
        var width = 32;
        var ctx = entityBatch[0].ppx + stage_x + 0.5 * (TILE_WIDTH - width);
        var cty = entityBatch[0].ppy + stage_y - height + TILE_DEPTH;
        var tt22 = ScreenToTile(ctx, cty);
        
        var dx = (x - tt22.x);
        var dy = (y - tt22.y);
        var r2 = dx*dx + dy*dy;
        
        if (r2 < n2 && r2 >= n1) {        
            if (layer > 0) return undefined;
            return tiles[9];
        }
    }
    
    // Ordinary stage tile
    if (stage_render) {
    
        var t = tcell(tt.x, tt.y);
         
        if (t == undefined) return undefined;
        if (t == 0) return undefined;

	    return tiles[t-1];
    } else {
    }
}

function drawEntities() {
    // Cursor
    /*if (place)*/ {
        var tt = ScreenToTile(currX, currY);
        var ss = TileToScreen(tt.x, tt.y, stage_x, stage_y);
        var x0 = ss.x;
        var x1 = x0 + 24;
        var x2 = x1 + 24;
        var y0 = ss.y;
        var y1 = y0 + 12;
        var y2 = y1 + 12;
        ctx.beginPath();
        ctx.moveTo(x0, y1);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.stroke();
    }

    // Entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];//[frame%4];
        
        //var tile = entity.img;
        var tile = getEntityTile();
        
        width = 32;
        height = 32;
        
        x = entity.ppx + stage_x + 0.5 * (TILE_WIDTH - width);
        y = entity.ppy + stage_y - height + TILE_DEPTH;

        var sx = 32 * (frame % 4);



        if (dude.flip) {
        ctx.save();
            ctx.translate(width, 0);
            ctx.scale(-1, 1);



        ctx.drawImage(tile, 
                      sx, 0,
                      32, 32,
                      -x, y, 
                      32, 32);
                      
        ctx.restore();
        } else {
                ctx.drawImage(tile, 
                      sx, 0,
                      32, 32,
                      x, y, 
                      32, 32);
        }
    }
    
    // Pathing
    updateMovePath();
    
    // Console
    var tt = ScreenToTile(currX, currY);
    ctx.fillText(tt.x + ', ' + tt.y, 25, 25);
}

var img = {};
img.person = new Image();
img.person.src = 'img/stand0x.png';
img.cat_idle = new Image();
img.cat_idle.src = 'img/cat_idle.png';
img.cat_run = new Image();
img.cat_run.src = 'img/cat_walk.png';
function getEntityTile() {

    //1st part
    //return img.person;


    // Transition / Hijack
    if (intro_render) {
        if (Math.floor(introTimer/15) % 2) {
            return img.person;
        } else {
            return img.cat_idle;
        }
    } 
    
    if (dude.run) return img.cat_run;
    return img.cat_idle;

}
