// ---------------------------------------------------------------------------
// -        Setup
// ---------------------------------------------------------------------------
var map;
var tiles = {};

var selected = [];
var dude = {};
dude.img = new Image();
dude.img.src = 'img/stand0x.png';
dude.ppx = -184;
dude.ppy = 795;

var stage_x = 580, stage_y = -400;


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

function setup() {
   
    
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };
    
    
            
    selected.push(dude);
    entityBatch.push(dude);
    
    get('maps/Tileset1.json', function(req) {
            loadTileset(JSON.parse(req.responseText));
        });
    
    var src = 'maps/untitled.json';
    get(src, function(req) {
            loadMap(JSON.parse(req.responseText));
            loop();
        });
}

// Moved to sounds..
//setup();


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
        if (res == 'down') {
        
            if (e.button == 0) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                
                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    dot_flag = false;
                }

            } else if (e.button == 2) {
                control.x = currX - stage_x - 60;
                control.y = currY - stage_y - 60;
                
                playSound(mouseClickSound);
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
             if (flag) {
                stage_x += (currX - prevX);
                stage_y += (currY - prevY);
            }
        }
    }


// ---------------------------------------------------------------------------
// -        MOVE COMMAND
// ---------------------------------------------------------------------------


var dir_i = 100, dir_j = 100;
function moveCommand(sx, sy) {
    control.move = false;
    control.x = sx;
    control.y = sy;
}

function updateMovePath()    
{
    //var ss = TileToScreen(tt.x, tt.y, 0, 0);
    
    for (var i = 0; i < selected.length; ++i) {
        var x = selected[i].ppx;
        var y = selected[i].ppy;
        
        ds = {x:0,y:0};
        
        if (x < control.x - 1) ds.x = 1;
        if (x > control.x) ds.x = -1;
        if (y < control.y) ds.y = 1;
        if (y > control.y) ds.y = -1;
        //console.log(control.x);        
        //console.log(control.y);
        var newx = x + 2 * ds.x;
        var newy = y + ds.y;
        
        var width = 48, height = 48;
        var tt = ScreenToTile(
                            newx + stage_x + 0.5 * (TILE_WIDTH - width) - 3 + 40 + 0.5*width, 
                            newy + stage_y - height + TILE_DEPTH - 7 + 40 + height
                        );
        //if (tt.x < -1) { newx = x; newy = y; }
        //if (tt.x > 8) { newx = x; newy = y; }
        //if (tt.y < 0) { newx = x; newy = y; }
        //if (tt.y > 3) { newx = x; newy = y; }
        if (tcell(tt.x, tt.y) == 0) { newx = x; newy = y; }

        selected[i].ppx = newx;
        selected[i].ppy = newy;

        
        // dir
        
        if (ds.y > 0) {
            if (ds.x > 0) selected[i].dir = 0;
            if (ds.x < 0) selected[i].dir = 1;
        } else {
            if (ds.x > 0) selected[i].dir = 3;
            if (ds.x < 0) selected[i].dir = 2;
        }
        //if (ds.y > 0) selected[i].dir = 0;
        //if (ds.y < 0) selected[i].dir = 3;
        
        
           /*
        //var tt = ScreenToTile(currX, currY);
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
           */
    
    }
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
    
    if (t-1 == 3) { //buildNames[t-1] == 'Supply_S') {
        selected.push(entity);
    }
    
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
