//==============================================================================
// FMOD variables and setup
//==============================================================================
var FMOD = {};                          // FMOD global object which must be declared to enable 'main' and 'preRun' and then call the constructor function.
FMOD['preRun'] = prerun;                // Will be called before FMOD runs, but after the Emscripten runtime has initialized
FMOD['onRuntimeInitialized'] = fmod_oninitialised;    // Called when the Emscripten runtime has initialized
FMOD['TOTAL_MEMORY'] = 64*1024*1024;    // FMOD Heap defaults to 16mb which is enough for this demo, but set it differently here for demonstration (64mb)
FMODModule(FMOD);                       // Calling the constructor function with our object


var gSystem;                            // Global 'System' object which has the top level API functions.  Sounds and channels are created from this.
var gSystemLowLevel;
var gSound = {};                        // Array of sounds.
var gChannel = {};                      // Array of channels , 1 for each sound.
var gBank;


// Will be called before FMOD runs, but after the Emscripten runtime has initialized
// Call FMOD file preloading functions here to mount local files.  Otherwise load custom data from memory or use own file system.
function prerun()
{
/*
    var fileUrl = "/";
    var fileName;
    var folderName = "/";
    var canRead = true;
    var canWrite = false;

    fileName = [
        "Basic AM_1.wav",
    ];

    for (var count = 0; count < fileName.length; count++)
    {
        FMOD.FS_createPreloadedFile(folderName, fileName[count], fileUrl + fileName[count], canRead, canWrite);
    } 
*/
}

// Simple error checking function for all FMOD return values.
function CHECK_RESULT(result)
{
    if (result != FMOD.OK)
    {
        var msg = "Error!!! '" + FMOD.ErrorString(result) + "'";
        //     alert(msg);
        throw msg;
    }
}

// Called when the Emscripten runtime has initialized
function fmod_oninitialised()
{
    // A temporary empty object to hold our system
    var outval = {};
    var systemOut = {};
    var result;

    console.log("Creating FMOD System object\n");

    // Create the system and check the result
    //result = FMOD.System_Create(systemOut);
    result = FMOD.Studio_System_Create(systemOut);
    CHECK_RESULT(result);

    console.log("grabbing system object from temporary and storing it\n");

    // Take out our System object
    gSystem = systemOut.val;

    result = gSystem.getLowLevelSystem(outval);
    CHECK_RESULT(result);

    gSystemLowLevel = outval.val;

    // Optional.  Setting DSP Buffer size can affect latency and stability.
    // Processing is currently done in the main thread so anything lower than 2048 samples can cause stuttering on some devices.
    console.log("set DSP Buffer size.\n");
    result = gSystemLowLevel.setDSPBufferSize(2048, 2);
    CHECK_RESULT(result);

    console.log("initialize FMOD\n");

    // 1024 virtual channels
    //result = gSystem.init(1024, FMOD.INIT_NORMAL, null);
    result = gSystem.initialize(1024, FMOD.STUDIO_INIT_NORMAL, FMOD.INIT_NORMAL, null);
    CHECK_RESULT(result);

    //
    console.log("initialize Application\n");

    // Set up iOS workaround.  iOS does not allow webaudio to start unless screen is touched.
    var iOS = false;//iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS)
    {
        alert("WebAudio can only be started if the screen is touched.  Touch the screen when the data has finished loading.");

        window.addEventListener('touchend', function() {
                                                if (!gIOSInitialized)
                                                {
                                                    result = gSystem.setDriver(0);
                                                    gIOSInitialized = true;
                                                }
                                            }, false);
    }

    // Set the framerate to 50 frames per second, or 20ms.
    console.log("Start game loop\n");

    // Our Game
    loadFile();
    setup();

    return FMOD.OK;
}


function loadFile() {
    //src = 'Basic AM_1.wav';
    //src = 'bank/Master Bank.bank';
    var src = 'bank/11-25-17 GameJamMusicTest.mp3';

    /*{
        var loader = new THREE.FileLoader();
        console.log(loader);
        loader.setMimeType('audio/wav');
        loader.setResponseType('arraybuffer');
        loader.load(
                    src,
                    onLoad1,
                    onProgress,
                    onFail
                    );
    }*/
    
    src = 'bank/Clicker1.ogg';
    src = 'bank/Basic AM_1.wav';
    {
        var loader = new THREE.FileLoader();
        console.log(loader);
        loader.setMimeType('audio/wav');
        loader.setResponseType('arraybuffer');
        loader.load(
                    src,
                    onLoad2,
                    onProgress,
                    onFail
                    );
    }

}


var music;
function onLoad1( data ) {
    //var enc = new TextEncoder("utf-8");
    //var m  = enc.encode(data.response);
    var chars = new Uint8Array(data);

    //var buffer = data.response;
    var buffer = chars.buffer;

    //console.log( m );
    //console.log( buffer );
    var outval = {};
    var result;
    var exinfo = FMOD.CREATESOUNDEXINFO();
    exinfo.length = chars.length;

    //result = gSystem.createStream(chars.buffer, FMOD.LOOP_OFF | FMOD.OPENMEMORY, exinfo, outval);
    result = gSystemLowLevel.createStream(buffer, FMOD.LOOP_NORMAL | FMOD.OPENMEMORY, exinfo, outval);
    CHECK_RESULT(result);
    
    music = outval.val;
}

var mouseClickSound;
function onLoad2( data ) {
    //var enc = new TextEncoder("utf-8");
    //var m  = enc.encode(data.response);
    var chars = new Uint8Array(data);

    //var buffer = data.response;
    var buffer = chars.buffer;

    //console.log( m );
    //console.log( buffer );
    var outval = {};
    var result;
    var exinfo = FMOD.CREATESOUNDEXINFO();
    exinfo.length = chars.length;

    result = gSystemLowLevel.createStream(chars.buffer, FMOD.LOOP_OFF | FMOD.OPENMEMORY, exinfo, outval);
    CHECK_RESULT(result);
    
    console.log(outval);
    mouseClickSound = outval.val;
}


function onLoadBank( data ) {
    //var enc = new TextEncoder("utf-8");
    //var m  = enc.encode(data.response);
    var chars = new Uint8Array(data);

    //var buffer = data.response;
    var buffer = chars.buffer;

    //console.log( m );
    //console.log( buffer );
    var outval = {};
    var result;
    var exinfo = FMOD.CREATESOUNDEXINFO();
    exinfo.length = chars.length;

    //result = gSystem.createStream(chars.buffer, FMOD.LOOP_OFF | FMOD.OPENMEMORY, exinfo, outval);
    //result = gSystem.createStream(buffer, FMOD.LOOP_NORMAL | FMOD.OPENMEMORY, exinfo, outval);

    //CHECK_RESULT(result);

    //playSound(outval.val);
    var memoryMode = FMOD.STUDIO_LOAD_MEMORY; //FMOD.STUDIO_LOAD_MEMORY_POINT
    result = gSystem.loadBankMemory(buffer, chars.length, memoryMode, FMOD.STUDIO_LOAD_BANK_NONBLOCKING, outval);
    CHECK_RESULT(result);
    
    //FMOD.Memory_Free(buffer);
    gBank = outval.val;

    console.log('bank');
    console.log(gBank);

        if (gBank && gBank.isValid())
        {
            var loadStateResult = gBank.getLoadingState(outval);
            var bankLoadState = outval.val;
            console.log(bankLoadState == FMOD.STUDIO_LOADING_STATE_LOADING);
            console.log(bankLoadState);
            
        }
}

function loadPart2() {
    var count = {},
        array = {};
        
    result = gBank.getEventCount(count);
    CHECK_RESULT(result);
    var eventCount = count.val;
    console.log(eventCount);
    
    gBank.getEventList(array, 100, count);
    console.log(count.val);
    
    console.log(array.val);//EventDescription
    
    count = {};
    array.val.getID(count);
    console.log(count.val);
}

// Function called when download progresses
function onProgress( xhr ) {
    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
}

// Function called when download errors
function onFail( xhr ) {
    console.error( 'An error happened' );
}


//
//
//
function playSound(soundid)
{
    var outval = {}, result;
    
    result = gSystemLowLevel.playSound(soundid, null, false, outval);
}

