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
        if ((++frameTick)%8 == 0) ++frame;
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
    if (!dude.cat || introTimer) {
        n1 = 2;
        n2 = 8;
        
        if (introTimer) {
            --introTimer;
            
            var n = (4*60 - introTimer)*2;
            //n2 = n < 1 ? 0 : (n-1)*(n-1);
            //n1 = n < 8 ? 0 : (n-8)*(n-8);
            n1 = 3 + n;
            n2 = n1 + 6
            
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

    // player start
    if (!dude.cat) {
        var dx = dude.ppx - watcher.ppx;
        var dy = dude.ppy - watcher.ppy;
        if (dx*dx + dy*dy < 100) {
            beginGame();
            dude.cat = true; 
        } 
    }
    
    // entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];

        if (entity.update) { 
            entity.update(entity); 
        }
    }

}

function gameDraw() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    ctx.scale(2, 2);
        
    ctx.fillStyle = "#8c8cb7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "black";  

        
    drawLayer(0);
    drawEntities();
    drawLayer(1);
}

function drawLayer(layer) {

    cells = map.layers[layer].data;
    
    // Draw
    var srcX = 0, srcY = 0;
    var width = 48, height = 12;
    var x = 0, y = 0;
    var tx = canvas.width / width + 4;
    var ty = canvas.height / height + 4;
    var off_x = stage_x % width;// - width/2;
    var off_y = stage_y % height;
    var i_off = stage_x == 0 ? 0 : -Math.floor(Math.abs(stage_x / width)) * Math.abs(stage_x) / stage_x;
    var j_off = stage_y == 0 ? 0 : -Math.floor(Math.abs(stage_y / height)) * Math.abs(stage_y) / stage_y;
    off_x -= width;
    off_y -= height;

    for (var j = 0+j_off-1; j < ty+j_off; ++j) {
        for (var i = 0+i_off-1; i < tx+i_off; ++i) {
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
    /*if (intro_render)*/ 
    if (!dude.cat || introTimer)
    {      
    
        var height = 0;
        var width = 32;
        var ctx = watcher.ppx + stage_x;
        var cty = watcher.ppy + stage_y;
        var tt22 = ScreenToTile(ctx, cty);
        
        var dx = (x - tt22.x);
        var dy = (y - tt22.y);
        var r2 = dx*dx + dy*dy;
        
        if (r2 < n2 && r2 >= n1) {        
            if (layer > 0) return undefined;
            return tiles[9];
        }
        
        // Split?
        if (r2 < n1) {        
            cells = map.layers[layer + 2].data;
            var t = tcell(tt.x, tt.y);
             
            if (t == undefined) return undefined;
            if (t == 0) return undefined;

	        return tiles[t-1];
        }
        
        cells = map.layers[layer].data;
        var t = tcell(tt.x, tt.y);
        return tiles[t-1];
    }
    
    var d = 0;
    if (dude.cat) d = 2;
    cells = map.layers[layer + d].data;
    
    
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
    if (place) {
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
    
    // Draw move target
    if (dude.target) {
    /*
        var x0 = dude.target.x + stage_x;
        var x1 = x0 + 12;
        var x2 = x1 + 12;
        var y0 = dude.target.y + stage_y;
        var y1 = y0 + 6;
        var y2 = y1 + 6;
        ctx.beginPath();
        ctx.moveTo(x0, y1);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y2);
        ctx.closePath();
        ctx.stroke();
        */
        var x0 = dude.target.x + stage_x + 6;
        var y0 = dude.target.y + stage_y;
        ctx.drawImage(paw, x0, y0);
    }

    // Entities
    for (var i = 0; i < entityBatch.length; ++i) {
        var entity = entityBatch[i];//[frame%4];
        
        // Collision
        // Draw boundary
        if (control.showGrid)
        {
            var x0 = entity.ppx + stage_x;
            var x1 = x0 + 12;
            var x2 = x1 + 12;
            var y0 = entity.ppy + stage_y;
            var y1 = y0 + 6;
            var y2 = y1 + 6;
            if (entity.collide) ctx.strokeStyle='red';
            else ctx.strokeStyle='black';
            ctx.beginPath();
            ctx.moveTo(x0, y1);
            ctx.lineTo(x1, y0);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x1, y2);
            ctx.closePath();
            ctx.stroke();
        }
            
        
        // Draw the tile
        var tile = getEntityTile(entity);
        
        if (entity.catImg && !dude.cat) continue;
        
        width = 32;
        height = 32;
        
        x = entity.ppx + stage_x + 0.5 * (24 - width);
        y = entity.ppy + stage_y - height + 6;

        var sx = 32 * (frame % 4);
        
        if (entity.puff) sx *= 0.5;

        if (sx > tile.width - width) sx = 0;

        if (entity.flip) {
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
        
        // say
        if (entity.showDialog) {
            var x0 = x;
            var y0 = y - 1;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(entity.dialog, x0, y0, 200);
            ctx.fillStyle = 'white';
            ctx.fillText(entity.dialog, x0-1, y0-1, 200);
        }
              
    }
    

    
    // Pathing
    updateMovePath();
    
    // Console
    /*
    var tt = ScreenToTile(currX, currY);
    ctx.fillText(tt.x + ', ' + tt.y, 25, 25);


    ctx.fillText(
        (dude.ppx) + ', ' +  (dude.ppy), 
        25, 75);
    if (dude.target)    
    ctx.fillText(
        (dude.target.x) + ', ' +  (dude.target.y), 
        25, 125);
        */
}

var paw = new Image;
paw.src = 'img/paw.png';

var img = {};
img.person = new Image();
img.person.src = 'img/stand0x.png';
img.human_run = new Image();
img.human_run.src = 'img/run_human.png';
img.cat_idle = new Image();
img.cat_idle.src = 'img/cat_idle.png';
img.cat_run = new Image();
img.cat_run.src = 'img/cat_walk.png';
img.cat_a3 = new Image();
img.cat_a3.src = 'img/cat_a3.png';
img.watcher_idle = new Image();
img.watcher_idle.src = 'img/Cat civilian.png';
img.watcher_run = new Image();
img.watcher_run.src = 'img/Cat civilian.png';
function getEntityTile(entity) {

    //1st part
    //return img.person;


    // Transition / Hijack
    /*if (intro_render) {
        if (Math.floor(introTimer/15) % 2) {
            return img.person;
        } else {
            return img.cat_idle;
        }
    } */
    
    if (entity.img) return entity.img;
    
    // cats only
    if (entity.catImg) return entity.catImg;
    
    // entity
    if (entity.character == 1) {
        if (entity.cat) {
            if (entity.run) return img.watcher_run;
            return img.watcher_idle;
        } else {
            if (entity.run) return img.human_run;
            return img.person;
        }
    }
    
    // player
    if (dude.cat) {
        if (dude.a3) return img.cat_a3;
        if (dude.run) return img.cat_run;
        return img.cat_idle;
    } else {
        if (dude.run) return img.human_run;
        return img.person;
    }

}
