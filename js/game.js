// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map;
var tiles = {};

var selected = [];
var dude = {};
//dude.img = new Image();
//dude.img.src = 'img/stand0x.png';
dude.ppx = 284;
dude.ppy = 1205;
dude.cat = false;
dude.dx = 0;
dude.dy = 0;

var watcher = {};
watcher.ppx = 130;
watcher.ppy = 1030;
watcher.character = 1;
watcher.cat = 1;


var stage_x = 0, stage_y = 0;


var entityBatch = [];
var standing_prefix = "maps/";

function loadTileset(response) {
    console.log(response);
    var tileSrc = response.tiles;

    for (var key in tileSrc) {
        var img = new Image();
        var src = standing_prefix + response.tiles[key].image;
        console.log(src);
        img.src = src;
        tiles[key] = img;
    }
}


var waitEnter = undefined;
var enter = keyboard(13);
enter.press = function() {
    if (waitEnter) {
        var temp = waitEnter;
        waitEnter = undefined;
        temp();        
    }
};
enter.release = function() {
};

function setup() {
   
    
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    
 
    entityBatch.push(dude);
    
    get('maps/Tileset1.json', function(req) {
            loadTileset(JSON.parse(req.responseText));
        });
    
    var src = 'maps/untitled.json';
    get(src, function(req) {
            loadMap(JSON.parse(req.responseText));
            onLoadComplete_startIntro();
        });
        
    // Police Cats
    for (var i = 0; i < 31; ++i) { 
        createPoliceCat();
    }
    
    createStory();
}

// Moved to sounds..
//setup();



function createStory() {

    createCat(-346, 584, 'img/Cat Easter Egg.png',
                "A quantum wave doesn't need to decide where it's gong until it gets there");
    createCat(709, 604, 'img/Cat Easter Egg.png',
                'Waves are always changing. Sometimes high and sometimes low.');
    createCat(165, 973, 'img/Cat Easter Egg.png',
                "Everything in this universe exists as something as well as being something else");
    createCat(1927, 1267, 'img/Cat Easter Egg.png',
                'Entangled states can exist in similar superposition with each other');
                
                
    createCat(1037, 1482, 'img/Cat Scientist.png',
                'This is the end');                
                
    createCat(1237, 1182, 'img/Cat Female.png',
                'Meow', endGame);
                
                createSlime(1047, 1382);
                createSlime(1027, 1392);
                createSlime(1117, 1442);
                createSlime(1070, 1430);
                createSlime(1161, 1250);
                createSlime(1157, 1352);

}

function endGame() {
    dude.ppx = 284;
    dude.ppy = 1205;
    dude.cat = false;
    
    dude.target = undefined;
    
}

function createCat(x, y, img, text, fn) {
    var cat = {};
    cat.ppx = x;
    cat.ppy = y;
    
    cat.catImg = new Image();
    cat.catImg.src = img;
    
    cat.update = storyCatUpdate;
    cat.dialog = text;
    
    cat.fn = fn;
    
    entityBatch.push(cat);
}

function storyCatUpdate(cat) {
    var dx = cat.ppx - dude.ppx;
    var dy = cat.ppy - dude.ppy;
    var r2 = 2500;
    
    if (dx*dx + dy*dy < r2) {

        cat.showDialog = true;
        
        if (cat.fn) cat.fn();
        
    } else {
    
        cat.showDialog = false;
    }
}


function createPoliceCat() {
    var cat = {};
    policeCatRespawn(cat);
    
    cat.catImg = new Image();
    cat.catImg.src = 'img/Cat cop.png';
    
    cat.update = policeCatUpdate;
    cat.respawn = policeCatRespawn;
    
    
    entityBatch.push(cat);
}


function policeCatUpdate(cat) {
    if (Math.random() < 0.01) {
        // Change direction
        var a = 0;
        if (Math.random() < 0.1) {
            // target
            a = Math.atan2(cat.ppx - dude.ppx, cat.ppy - dude.ppy);
        } else {
            // random
            a = Math.random() * 2 * Math.PI;
        }
        var r = 0.9;
        cat.dx = r * -Math.sin(a);
        cat.dy = r * -Math.cos(a);
    }
    
    // check collision
    var dx = cat.ppx - dude.ppx;
    var dy = cat.ppy - dude.ppy;
    var r2 = 144;
    if (dx*dx + dy*dy < r2) {
        cat.collide = true;
        if (dude.damage) { cat.respawn(cat); }
    } else {
        cat.collide = false;
    }
 
}


function policeCatRespawn(cat) {

    createPuff(cat.ppx, cat.ppy);

    var ty = Math.random() * 45 + 55;
    var tx = Math.random() * 98 + 1;
   
    var s = TileToScreen(tx, ty, stage_x, stage_y);
    
    cat.ppx = s.x;
    cat.ppy = s.y;

}


function createSlime(x, y) {

    var puff = {};
    puff.ppx = x;
    puff.ppy = y;
    
    puff.img = new Image();
    puff.img.src = 'img/Iso_Slime.png';
      
    entityBatch.push(puff);
}


function createPuff(x, y) {

    var puff = {};
    puff.ppx = x;
    puff.ppy = y;
    
    puff.img = new Image();
    puff.img.src = 'img/smoke_sm.png';
    
    puff.update = puffUpdate;
    puff.time = 4 * 6;
    
    puff.puff = 1;
      
    entityBatch.push(puff);
}

function puffUpdate(puff) {
    --puff.time;
    if (puff.time == 0) {
        var index = entityBatch.indexOf(puff);
        entityBatch.splice(index, 1);
    }
}

// ---------------------------------------------------------------------------
// -        Map Loading
// ---------------------------------------------------------------------------
var cells = [];
function loadMap(mapJson) {
    console.log(mapJson);
    map = mapJson;

    var data    = map.layers[0].data,
        objects = map.layers[1].objects,
        n, obj, entity;
}


// ---------------------------------------------------------------------------
// -        Restart
// ---------------------------------------------------------------------------
function restart() {

}

// ---------------------------------------------------------------------------
// -        Char controls
// ---------------------------------------------------------------------------
var place = 0;
control = {};

var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;



canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
function findxy(res, e) {
        if (waitEnter) return;

        if (res == 'down') {
            playSound(mouseClickSound);
            if (e.button == 0) {
                if (!dude.a3) {
                    setPlayerMoveCommand();
                }
            }   
            if (e.button == 2) {
                if (dude.cat && !dude.a3) {
                    //dude.a3 = true;
                    setPlayerAttackCommand();
                }
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX/2 - canvas.offsetLeft;
            currY = e.clientY/2 - canvas.offsetTop;
             if (flag) {
                stage_x += (currX - prevX);
                stage_y += (currY - prevY);
            }
        }
    }


// ---------------------------------------------------------------------------
// -        MOVE COMMAND
// ---------------------------------------------------------------------------

function setPlayerMoveCommand() {

    // click in world space
    var bx = currX - stage_x - 12;
    var by = currY - stage_y - 6;    

    // direction relative to character
    var sx = bx - dude.ppx;
    var sy = by - dude.ppy;    
    
    var L = Math.sqrt(sx*sx + sy*sy);
        
    // create the movement vector    
    var r = 1;
        
    dude.dx = r * (sx) / L;
    dude.dy = r * (sy) / L;
    
    // set the target in world space
    dude.target = { x: bx, y: by };
}


function setPlayerAttackCommand() {
    dude.a3 = true;
    dude.a3timer = 30;
    dude.target = undefined;
    
    //dude.anim = 
    
        // click in world space
    var bx = currX - stage_x - 12;
    var by = currY - stage_y - 6;    

    // direction relative to character
    var sx = bx - dude.ppx;
    var sy = by - dude.ppy;    
    
    var L = Math.sqrt(sx*sx + sy*sy);
        
    // create the movement vector    
    var r = 2;
        
    dude.dx = r * (sx) / L;
    dude.dy = r * (sy) / L;
    
    dude.damage = true;
}



var dir_i = 100, dir_j = 100;

function moveCommand(sx, sy) {
    control.move = false;
    control.x = sx;
    control.y = sy;
}

function updateMovePath()    
{
    // update player character
    
    var d = 0;
    if (dude.cat) d = 2;
    cells = map.layers[d].data;

    
    // update entities
    for (var i = 0; i < entityBatch.length; ++i) {
        
        var entity = entityBatch[i];
        
        var x = entity.ppx;
        var y = entity.ppy;
    
        var ds = {
            x: entity.dx ? entity.dx : 0, 
            y: entity.dy ? entity.dy : 0
        };
        
        /*if (entity.new_target) { 

            entity.target = entity.new_target;
            entity.new_target = undefined;
        }*/
        //if (x < control.x - 2) ds.x = 1;
        //if (x > control.x + 1) ds.x = -1;
        //if (y < control.y - 1) ds.y = 1;
        //if (y > control.y + 1) ds.y = -1;
        
        
        var newx = x + ds.x;
        var newy = y + ds.y;
        
        var width = 48, height = 48;
        var tt = ScreenToTile(
                            newx + stage_x + 0.5 * (24 - width) + 24, 
                            newy + stage_y + 6
                        );
        //if (tt.x < -1) { newx = x; newy = y; }
        //if (tt.x > 8) { newx = x; newy = y; }
        //if (tt.y < 0) { newx = x; newy = y; }
        //if (tt.y > 3) { newx = x; newy = y; }
        if (tcell(tt.x, tt.y) == 0) { newx = x; newy = y; }

        entity.ppx = newx;
        entity.ppy = newy;
        
        if (entity.respawn && dude.cat) {
            tt = ScreenToTile(
                            newx + stage_x + 0.5 * (24 - width) + 24, 
                            newy + stage_y + 6
                        );
            if (tcell(tt.x, tt.y) == 0) entity.respawn(entity);
        }
       
        if (entity.target) {

            if (Math.abs(entity.ppx - entity.target.x) < Math.abs(entity.dx) &&
                Math.abs(entity.ppy - entity.target.y) < Math.abs(entity.dy)) {
                entity.dx = 0;
                entity.dy = 0;
                entity.target = undefined;
            }
        }
       
        // dir    
        if (entity.dx > 0) entity.flip = 0;
        if (entity.dx < 0) entity.flip = 1;

        // Some animation stuff      
        if (newx != x || newy !=y) entity.run = true;
        else entity.run = false;
        
        if (entity.a3) {
            //if (entity.run == false) entity.a3 = false;
            --entity.a3timer;
            if (entity.a3timer <= 0) {
                // Stop
                entity.a3 = false;
                entity.dx = 0;
                entity.dy = 0;
                entity.damage = false;
            }
        }    
    }

    stage_x = -dude.ppx + 0.5*canvas.width/2;
    stage_y = -dude.ppy + 0.5*canvas.height/2;

}

// ---------------------------------------------------------------------------
// -        BUILD
// ---------------------------------------------------------------------------
function createEntity(t, x, y) {
    var tt = ScreenToTile(x, y);
    var ss = TileToScreen(tt.x, tt.y, 0, 0);

    entity = {};
    entity.ppx = ss.x;// + 0.5 * (TILE_WIDTH - entity.img.width);
    entity.ppy = ss.y;// - entity.img.height + TILE_DEPTH;
    entity.dir = 0;
            
    var entityFacing = [];    
    for (var dir = 0; dir < 4; ++ dir) {
        var entityFrames = [];

        for (var i = 0; i < 4; ++i) {

	        var img = new Image();
            img.src = standing_prefix + "color"+colourName+"/"+buildNames[t-1]+"_Large_face"+dir+"_"+i+".png";

            entityFrames.push(img);
        }
        entityFacing.push(entityFrames);
    }
    entity.frames = entityFacing;

    entityBatch.push(entity);

    // The map
    entity.dir_space = [];
    for (var i = 0; i < dir_i; ++i) {
        entity.dir_space.push([]);
        for (var j = 0; j < dir_j; ++j) {
            entity.dir_space[i].push( {
                x: 0,
                y: 0,
            });
        }
    }
}

// ---------------------------------------------------------------------------
// -        LOAD THE MAP
// ---------------------------------------------------------------------------
function setup2(map) {
    var data    = map.layers[0].data,
        objects = map.layers[1].objects,
        n, obj, entity;

    MAP.th = map.height;
    MAP.tw = map.width;

    for(n = 0 ; n < objects.length ; n++) {
        obj = objects[n];
        switch(obj.type) {
        case "player"   : {entity = setupEntity(obj)}; break;
        }
    }
}

// ---------------------------------------------------------------------------
// -        Game Entity
// ---------------------------------------------------------------------------
function xx_setupEntity(obj) {
    var entity = {};
    entity.x        = obj.x;
    entity.y        = obj.y;
    return entity;
}
