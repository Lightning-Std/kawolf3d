/**

WOLFENSTEIN 3D

A CLONE OF THE ORIGINAL FIRST EPISODE

[THIS IS NOT AN AI PROGRAM]

Features the entire first episode, all ten levels.

This is, as nearly as possible, an exact clone of the original title. So far as I know, the only missing features are audio and the text that appears when you find a secret.

The original plan was to make the first three episodes, but KA has space limits for programs. As it is, even the officer and mutant enemy types, which I originally implemented, have had their images removed, to fit other things.

Turn on mouse controls if you wish, but if you are not using them, leave them off, since they make it harder to aim with keyboard.

You can change the difficulty level in the constants section.

**NEW** I have added save codes. Press [L] to get your code, then you can paste it in at the Save Code section;

**NOTE** If you are experiencing performance issues, try changing the INV_SCALE constant under performance settings to 4, or even 8. This lowers the resolution of the frame buffer, reducing the workload each frame.

CONTROLS: 
Up/Down or W/S - Move Forwards and Backwards
Left/Right or A/D - Turn Left and Right
Alt - Hold to strafe
Ctrl - Shoot
Shift - Hold to sprint
1,2,3,4 - Change weapons

MOUSE CONTROLS:
Mouse works as joystick, with mouse movement mimicking the up/down/left/right keys.
Hold right click to strafe.
Left click to shoot.

**NOTE** When using mouse controls, sprinting is always on. This is why it will be harder to aim using keyboard, because you turn faster when sprinting.

**/
hint(DISABLE_OPENGL_2X_SMOOTH);
// Performance Settings {
// Must be a power of two
var INV_SCALE = 2;
var TARGET_FPS = 70;
var DEBUG_FPS = false;
// Must be at least 0
var DECORATION_CLIPPING_DISTANCE = 0.2;
// }
// Control Settings {
var useMouse = true;
var mouseSensitivity = 0.04;
// }
// Save Code {
var saveCode = "!*%©$# ! ! ! ! !";
//}
// Constants {

var DIFFICULTIES = {
  CAN_I_PLAY_TOO_DADDY: 0,
  DONT_HURT_ME: 1,
  BRING_EM_ON: 2,
  I_AM_DEATH_INCARNATE: 3,
};

var GAME_STATES = {
  GET_PSYCHED: 0,
  FADE_IN: 1,
  FIZZLE_IN: 2,
  PLAY: 3,
  DIE_1: 4,
  DIE_2: 5,
  ELEVATOR: 6,
  WIN: 7,
  SCORE_SCREEN: 8,
  END_SCREEN: 9,
  TITLE: 10,
  DEATHCAM_1: 11,
  DEATHCAM_2: 12,
  DEATHCAM_3: 13,
};

var difficultyLevel = DIFFICULTIES.I_AM_DEATH_INCARNATE;

var MOVE_SPEED = 0.003204345703125 * 1.41;
var TURN_SPEED = 0.1;

var DIRECTIONS = {
  NORTH: new PVector(0, -1),
  SOUTH: new PVector(0, 1),
  EAST: new PVector(1, 0),
  WEST: new PVector(-1, 0),
  NONE: new PVector(0, 0),
};

var TICS_TO_MILLIS = 100 / 7;

var ENEMY_STATES = {
  STAND: 0,
  PATROL: 1,
  PAIN: 2,
  CHASE: 3,
  SHOOT: 4,
  DIE: 5,
};

var FLOOR_CODES = 37;
var TURN_POINT_START = 84 + FLOOR_CODES;
var SECRET_FLAG = 83 + FLOOR_CODES;
var DOOR_CODES = [
  29 + FLOOR_CODES,
  31 + FLOOR_CODES,
  32 + FLOOR_CODES,
  33 + FLOOR_CODES,
];

var WIN_CODE = 243;

var ENEMY_CODES_START = 96 + FLOOR_CODES;

var END_ELEVATOR_CODE = 21 + FLOOR_CODES;
var END_ELEVATOR_CODE_FLIPPED = 22 + FLOOR_CODES;

var GUARD_AMMO_ID = 73 + FLOOR_CODES;

var GOLD_KEY_ID = 80 + FLOOR_CODES;
var HANS_CODE = 205 + FLOOR_CODES;
var EXIT_CODE = 206 + FLOOR_CODES;
var SCHABBS_CODE = 207 + FLOOR_CODES;

// }
// Global {
var currentLevel = 0;
var currentEpisode = 0;
var totalScore = 0;

var totalSeconds = 0;
var averageKillRatio = 0;
var averageSecretRatio = 0;
var averageTreasureRatio = 0;
//}
// Frame Buffer {
var bufferWidth = 640 / INV_SCALE;
var bufferHeight = 400 / INV_SCALE;

var invalidScreen =
  width !== bufferWidth * INV_SCALE || height !== bufferHeight * INV_SCALE;

if (invalidScreen) {
  println("Please add this to the end of the url to continue:");
  println("?width=" + bufferWidth * INV_SCALE);
  println("You will need to reload the page.");
}

var bufferImage;
var bufferContext;

var frameBufferCreated = false;
var hudHeight = 96 / INV_SCALE;
var hudMargin = bufferWidth * (bufferHeight - hudHeight) * 4;

var pixels;
var renderPixels;

function createFrameBuffer() {
  bufferImage = createImage(bufferWidth, bufferHeight, RGB);

  bufferContext = bufferImage.sourceImg.getContext("2d");

  pixels = bufferContext.createImageData(bufferWidth, bufferHeight);
  renderPixels = bufferContext.createImageData(bufferWidth, bufferHeight);

  var pixelIndex = 0;
  for (var i = 0; i < bufferWidth * bufferHeight; i++) {
    if (pixelIndex < hudMargin) {
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
    } else {
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 64;
      pixels.data[pixelIndex++] = 64;
      pixels.data[pixelIndex++] = 255;
    }
  }
  frameBufferCreated = true;
}

function renderFrameBuffer(fizzlePixels) {
  for (var i = 0; i < renderPixels.data.length; i += 4) {
    if (fizzlePixels.data[i + 3] === 255) {
      renderPixels.data[i] = fizzlePixels.data[i];
      renderPixels.data[i + 1] = fizzlePixels.data[i + 1];
      renderPixels.data[i + 2] = fizzlePixels.data[i + 2];
      renderPixels.data[i + 3] = fizzlePixels.data[i + 3];
    } else {
      renderPixels.data[i] = pixels.data[i];
      renderPixels.data[i + 1] = pixels.data[i + 1];
      renderPixels.data[i + 2] = pixels.data[i + 2];
      renderPixels.data[i + 3] = pixels.data[i + 3];
    }
  }
  bufferContext.putImageData(renderPixels, 0, 0);
  image(bufferImage, width / 2, height / 2, width, height);
}

function clearFrameBuffer() {
  var pixelIndex = 0;
  for (var i = 0; i < bufferWidth * bufferHeight; i++) {
    if (pixelIndex < hudMargin) {
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 0;
    } else {
      pixels.data[pixelIndex++] = 0;
      pixels.data[pixelIndex++] = 64;
      pixels.data[pixelIndex++] = 64;
      pixels.data[pixelIndex++] = 255;
    }
  }
}

// }
// Mouse  {
var vMouseX = 0;
var vMouseY = 0;
var vMouseXOld = 0;
var vMouseYOld = 0;
var leftClick = false;
var rightClick = false;

var scopeOut = function (p) {
  return (function () {
    return this;
  })()[p];
};

function onMouseMove(e) {
  if (!scopeOut("document").pointerLockElement) {
    return;
  }
  vMouseX += e.movementX;
  vMouseY += e.movementY;
}

function onMousePressed(e) {
  if (!useMouse) {
    return;
  }
  if (e.button === 0) {
    leftClick = true;
  } else if (e.button === 2) {
    rightClick = true;
  }
}

function onMouseReleased(e) {
  if (!useMouse) {
    return;
  }
  if (e.button === 0) {
    leftClick = false;
  } else if (e.button === 2) {
    rightClick = false;
  }
}

mouseClicked = function () {
  if (useMouse) {
    scopeOut("document").getElementById("output-canvas").requestPointerLock();
    scopeOut("document").getElementById("output-canvas").onmousemove =
      onMouseMove;
    scopeOut("document").getElementById("output-canvas").onmousedown =
      onMousePressed;
    scopeOut("document").getElementById("output-canvas").onmouseup =
      onMouseReleased;
  }
};
function updateMouse() {
  vMouseXOld = vMouseX;
  vMouseYOld = vMouseY;
}
// }
// Pallette {
var pallette = [
  -1250068, -13092808, -1310720, -2556712, -16473088, -14670596, -16777128,
  -3669812, -11207428, -16748432, -222112, -10731488, -1779712, -13369256,
  -16749388, -14633804, -2302756, -13355980, -2097152, -4391752, -16476160,
  -16775940, -16777140, -4980556, -12518148, -16749460, -1010596, -11256804,
  -3357696, -14155712, -16753508, -14634832, -3092272, -13619152, -2883584,
  -6488932, -16480256, -16776964, -16777152, -5767000, -14615300, -16751516,
  -1536936, -12044264, -4936704, -3081124, -219044, -16777216, -4144960,
  -13882324, -3670016, -8323972, -16483328, -16776980, -16777164, -6553444,
  -16712452, -16752544, -2324396, -12570600, -6513664, -3867584, -223168,
  -197380, -4934476, -14145496, -4456448, -10421156, -16486400, -16776992,
  -16777172, -8126332, -16718620, -16754600, -3112880, -13095916, -8092672,
  -4916192, -227296, -204748, -5723992, -14671840, -5242880, -11207596,
  -16489472, -16777004, -16777188, -9699216, -16724788, -16760768, -3638196,
  -13622256, -9409536, -6226944, -231424, -207836, -6776680, -14935012,
  -5767168, -12518336, -16492544, -16777016, -206596, -10485660, -16730956,
  -202532, -4425656, -14147572, -10988544, -7281664, -1807360, -209896,
  -7566196, -206632, -6029312, -14615520, -16495616, -16777028, -214788,
  -11009960, -16734040, -204592, -4951996, -197416, -12566528, -8336384,
  -3383296, -212984, -8618884, -214856, -6815744, -16712704, -16498688,
  -16777040, -221956, -11534256, -16735068, -206652, -5740480, -197448,
  -4972292, -9128960, -4959232, -216064, -9408400, -222052, -7864320, -16716800,
  -2565892, -16777048, -230148, -12058552, -16737124, -207684, -6265796,
  -197476, -5766916, -10445824, -5745664, 0, -10197916, -230276, -8650752,
  -16719872, -4670212, -16777052, -238340, -12582848, -16738152, -209744,
  -6528968, -197508, -6815516, -10699524, -6534144, 0, -10724260, -238500,
  -9437184, -16722944, -6513412, -16777064, -240388, -2556676, -16741236,
  -211804, -7316428, -198564, -8388404, -12537604, -2558732, 0, -11250604,
  -240556, -10223616, -16463872, -8617732, -16777080, -245508, -4653828,
  -16743292, -213860, -7841744, -197548, -9174860, -14636804, -4658968, 0,
  -11776948, -245696, -11010048, -16466944, -10723076, -16777092, -253700,
  -6488836, -16745348, -214896, -8368084, -199616, -10485604, -16737028,
  -6497060, 0, -12040120, -253920, -11796480, -16470016, -11250436, -16777104,
  -261892, -8585992, -16746376, -216960, -9155544, -199648, -11534204,
  -16741148, -9123640, 0, -12566464, -262144, -12582912, -16734208, -12566276,
  -16777116, -2096924, -10683140, -16747404, -220048, -9680860, -199680,
  -12320656, -16745268, -12009280, -6815608,
];
//}
// Decoding {
var safeAlpha =
  "!#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅ";

function decodeToArray(str) {
  var out = [];
  var i = 0;
  while (i < str.length) {
    var c = safeAlpha.indexOf(str[i]);
    if (str[i] === String.fromCharCode(32)) {
      var c = safeAlpha.indexOf(str[i + 1]);
      var count = safeAlpha.indexOf(str[i + 2]);
      for (var j = 0; j < count; j++) {
        out.push(c);
      }
      i += 3;
    } else {
      out.push(c);
      i++;
    }
  }
  return out;
}

function decodeSubFilterToArray(str) {
  var imageHeight = safeAlpha.indexOf(str[0]);

  var filtered = decodeToArray(str.slice(1));
  var imageWidth = filtered.length / imageHeight;

  var out = [imageHeight];

  for (var i = 0; i < filtered.length; i++) {
    if (i % imageWidth === 0) {
      out.push(filtered[i]);
    } else {
      out.push((out[i] + filtered[i]) % 256);
    }
  }

  return out;
}

function decodeUpFilterToArray(str) {
  var imageHeight = safeAlpha.indexOf(str[0]);

  var filtered = decodeToArray(str.slice(1));
  var imageWidth = filtered.length / imageHeight;

  var out = [imageHeight];

  for (var i = 0; i < filtered.length; i++) {
    if (i < imageWidth) {
      out.push(filtered[i]);
    } else {
      out.push((out[i + 1 - imageWidth] + filtered[i]) % 256);
    }
  }

  return out;
}

function decodeFilteredToArray(str) {
  var filterType = safeAlpha.indexOf(str[0]);
  if (filterType === 0) {
    return decodeSubFilterToArray(str.slice(1));
  } else {
    return decodeUpFilterToArray(str.slice(1));
  }
}

// }
// Image Rendering {
var cachedTextures = [];
var renders = [];
var sliced = [];
var currentImage = 0;
var finishedRendering = false;

function renderTexture(imageData, imageScale) {
  background(0, 0, 0, 0);
  imageScale = imageScale || 1;
  cachedTextures.push([]);
  var imageDataArray = decodeFilteredToArray(imageData);
  var imageHeight = imageDataArray[0];
  var imageWidth = (imageDataArray.length - 1) / imageHeight;
  for (var y = 0; y < imageHeight; y++) {
    for (var x = 0; x < imageWidth; x++) {
      var index = y + x * imageHeight + 1;
      var fillColor = pallette[imageDataArray[index]];
      noStroke();
      if (fillColor === undefined) {
        println(currentImage);
      } else {
        if (fillColor === -6815608) {
          fillColor = 0;
        }
        if (fillColor === 0) {
          fill(0, 0, 0, 0);
        } else {
          fill(fillColor);
        }
        rect(x * imageScale, y * imageScale, imageScale, imageScale);
      }

      cachedTextures[cachedTextures.length - 1].push(fillColor);
    }
  }
  var rendered = get(0, 0, imageWidth * imageScale, imageHeight * imageScale);
  renders.push(rendered);
  // var slices = [];
  // for (var x = 0; x < 64; x++) {
  //     slices.push(get(x * imageScale, 0, imageScale, 64 * imageScale));
  // }
  // sliced.push(slices);
}
function initializeTextures(imageScale) {
  if (finishedRendering) {
    return;
  }
  renderTexture(rawImages[currentImage], imageScale);
  currentImage++;
  if (currentImage === rawImages.length) {
    finishedRendering = true;
  }
  fill(0, 0, 0);
  text(
    "Loading: " + floor((currentImage / rawImages.length) * 100) + "%",
    width / 2,
    height / 2
  );
}
// }
// Utilities {
function sign(x) {
  return x < 0 ? -1 : 1;
}

function sign0(x) {
  if (x === 0) {
    return 0;
  }
  return x < 0 ? -1 : 1;
}

function vectorEquals(v1, v2) {
  return v1.x === v2.x && v1.y === v2.y;
}

function wrap(num, min, max) {
  return ((((num - min) % max) + max) % max) + min;
}

function checkTile(scene, x, y, ignoreActor, ignoreAllActors) {
  x = floor(x);
  y = floor(y);
  var out = 0;
  if (scene.level.worldMap[x][y] > FLOOR_CODES) {
    out = 1;
  }
  var doorKey = x + "-" + y;
  var door = scene.doors[doorKey];
  if (door) {
    out = -(1 - door.openAmount);
  }

  if (
    scene.enemyGrid[x][y] !== null &&
    scene.enemyGrid[x][y].health > 0 &&
    scene.enemyGrid[x][y] !== ignoreActor &&
    !ignoreAllActors
  ) {
    out = 1;
  }

  if (scene.player !== ignoreActor && !ignoreAllActors) {
    if (
      scene.player.pos.x >= x - scene.player.radius &&
      scene.player.pos.x <= x + 1 + scene.player.radius
    ) {
      if (
        scene.player.pos.y >= y - scene.player.radius &&
        scene.player.pos.y <= y + 1 + scene.player.radius
      ) {
        out = 1;
      }
    }
  }

  return out;
}

frameRate(TARGET_FPS);
// }
// Fonts {
var fonts = [];
fonts.push("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ:%!'");

var charWidths = [
  {
    def: 16,
    ex: {
      ":": 8,
      "!": 8,
      "'": 8,
    },
  },
];

function displayText(x, y, message, fontIndex) {
  var font = fonts[fontIndex];
  var tempX = x;
  imageMode(CORNER);
  for (var i = 0; i < message.length; i++) {
    if (message[i] === " ") {
      tempX += (charWidths[fontIndex].def * 2) / INV_SCALE;
      continue;
    }
    var charIndex = font.indexOf(message[i]);
    if (charIndex === -1) {
      println("Invalid message character: " + message[i]);
      tempX += (charWidths[fontIndex].def * 4) / INV_SCALE;
      continue;
    }

    image(renders[fontOffsets[fontIndex] + charIndex], tempX, y);

    var charWidth = charWidths[fontIndex].ex.hasOwnProperty(message[i])
      ? charWidths[fontIndex].ex[message[i]]
      : charWidths[fontIndex].def;
    tempX += (charWidth * 4) / INV_SCALE;
  }

  imageMode(CENTER);
}
// }
// Input {
var inputKeys = {};
var inputKeysJustDown = {};

keyPressed = function () {
  inputKeys[key.toString()] = true;
  inputKeysJustDown[key.toString()] = true;
  if (keyCode === UP) {
    inputKeys.up = true;
    inputKeysJustDown.up = true;
  } else if (keyCode === DOWN) {
    inputKeys.down = true;
    inputKeysJustDown.down = true;
  } else if (keyCode === LEFT) {
    inputKeys.left = true;
    inputKeysJustDown.left = true;
  } else if (keyCode === RIGHT) {
    inputKeys.right = true;
    inputKeysJustDown.right = true;
  } else if (keyCode === ALT) {
    inputKeys.alt = true;
    inputKeys.alt = true;
  } else if (keyCode === CONTROL) {
    inputKeys.control = true;
    inputKeysJustDown.control = true;
  } else if (keyCode === SHIFT) {
    inputKeys.shift = true;
    inputKeysJustDown.shift = true;
  }
};

keyReleased = function () {
  inputKeys[key.toString()] = false;
  if (keyCode === UP) {
    inputKeys.up = false;
  } else if (keyCode === DOWN) {
    inputKeys.down = false;
  } else if (keyCode === LEFT) {
    inputKeys.left = false;
  } else if (keyCode === RIGHT) {
    inputKeys.right = false;
  } else if (keyCode === ALT) {
    inputKeys.alt = false;
  } else if (keyCode === CONTROL) {
    inputKeys.control = false;
  } else if (keyCode === SHIFT) {
    inputKeys.shift = false;
  }
};
// }
// Delta Time {
var lastTimestamp = millis();
var delta = 0;

function calculateDelta() {
  delta = millis() - lastTimestamp;
  lastTimestamp = millis();
}

var peakFPS = 0;
var lowFPS = Infinity;
var fps = 0;

function displayFPS() {
  if (!DEBUG_FPS) {
    return;
  }
  fill(200, 200, 200);
  var fps = floor((1 / delta) * 1000);
  peakFPS = max(peakFPS, fps);
  lowFPS = min(lowFPS, fps);
  textSize(11);
  text("FPS: " + fps + " Peak: " + peakFPS + " Low: " + lowFPS, 10, 10);
}
// }
// HUD {

var flashColor = color(255, 0, 0);
var flashAlpha = 0;

function displayNumber(num, col) {
  image(
    renders[hudOffset + 1 + num],
    16 * col + 6,
    height - (hudHeight * INV_SCALE) / 2 + 8,
    16,
    32
  );
}

function flashScreenColor(col) {
  flashAlpha = 128;
  flashColor = col;
}

function displayStat(num, startCol) {
  var temp = num;
  var pos = startCol;

  if (num === 0) {
    displayNumber(0, startCol);
  }

  while (temp > 0) {
    var digit = temp % 10;
    displayNumber(digit, pos);
    pos--;
    temp = floor(temp / 10);
  }
}

function displayHUD(scene) {
  imageMode(CENTER);
  image(
    renders[hudOffset],
    width / 2,
    height - (hudHeight * INV_SCALE) / 2,
    640,
    80
  );

  displayStat(scene.player.ammo, 28);

  displayStat(scene.player.health, 23);

  displayNumber(scene.player.lives, 14);

  displayStat(totalScore + scene.player.score, 11);

  displayStat(scene.player.floor, 3);

  image(
    renders[hudOffset + 11 + scene.player.currentWeapon],
    560,
    height - (hudHeight * INV_SCALE) / 2,
    96,
    48
  );

  var frame =
    scene.player.health === 0
      ? scene.player.killedBy.id === 8
        ? bjHudOffset + 23
        : bjHudOffset + 22
      : scene.player.grin
      ? bjHudOffset + 21
      : bjHudOffset +
        scene.player.faceFrame +
        floor((100 - scene.player.health) / 16) * 3;
  image(renders[frame], width / 2 - 24, height - (hudHeight * INV_SCALE) / 2);

  if (scene.player.hasGoldKey) {
    image(
      renders[hudOffset + 16],
      488,
      height - (hudHeight * INV_SCALE) / 2 - 16,
      16,
      32
    );
  } else {
    image(
      renders[hudOffset + 15],
      488,
      height - (hudHeight * INV_SCALE) / 2 - 16,
      16,
      32
    );
  }

  if (scene.player.hasSilverKey) {
    image(
      renders[hudOffset + 17],
      488,
      height - (hudHeight * INV_SCALE) / 2 + 16,
      16,
      32
    );
  } else {
    image(
      renders[hudOffset + 15],
      488,
      height - (hudHeight * INV_SCALE) / 2 + 16,
      16,
      32
    );
  }

  fill(flashColor, flashAlpha);
  rect(0, 0, width, height);

  flashAlpha -= delta * 0.3;
  if (flashAlpha < 0) {
    flashAlpha = 0;
  }
}
// }
// Fizzle Fade {
var fizzleRndVal = 1;
var fizzleDone = false;
var FIZZLE_BLOCK_SIZE = 2;
var fading = false;
var fizzleColor = [255, 0, 0, 255];
var fizzlePixels;

function setFizzlePixels(r, g, b, a) {
  var pixelIndex = 0;
  for (var i = 0; i < bufferWidth * bufferHeight; i++) {
    fizzlePixels.data[pixelIndex++] = r;
    fizzlePixels.data[pixelIndex++] = g;
    fizzlePixels.data[pixelIndex++] = b;
    fizzlePixels.data[pixelIndex++] = a;
  }
}

function setupFizzleFade() {
  fizzlePixels = bufferContext.createImageData(bufferWidth, bufferHeight);

  setFizzlePixels(0, 0, 0, 0);
}

function resetFizzle() {
  fizzleRndVal = 1;
  fizzleDone = false;
}

function fizzleFade(frames, protectHUD) {
  fading = true;
  var pixPerFrame;
  var p;
  var x;
  var y;
  var bx;
  var by;
  var pixelIndex;

  if (fizzleDone) {
    return false;
  }

  pixPerFrame = (bufferWidth * bufferHeight) / frames;

  for (p = 0; p < pixPerFrame; p++) {
    y = (fizzleRndVal & 0xff) - 1;
    x = (fizzleRndVal >> 8) & 0x1ff;

    if ((fizzleRndVal & 1) !== 0) {
      fizzleRndVal = (fizzleRndVal >> 1) ^ 0x00012000;
    } else {
      fizzleRndVal = fizzleRndVal >> 1;
    }

    if (x >= bufferWidth || y >= bufferHeight || y < 0) {
      continue;
    }
    for (by = 0; by < FIZZLE_BLOCK_SIZE; by++) {
      if (y + by >= bufferHeight) {
        break;
      }

      for (bx = 0; bx < FIZZLE_BLOCK_SIZE; bx++) {
        if (x + bx >= bufferWidth) {
          break;
        }

        pixelIndex = ((y + by) * bufferWidth + (x + bx)) * 4;

        if (pixelIndex > hudMargin && protectHUD) {
          continue;
        }
        fizzlePixels.data[pixelIndex] = fizzleColor[0];
        fizzlePixels.data[pixelIndex + 1] = fizzleColor[1];
        fizzlePixels.data[pixelIndex + 2] = fizzleColor[2];
        fizzlePixels.data[pixelIndex + 3] = fizzleColor[3];
      }
    }

    if (fizzleRndVal === 1) {
      fizzleDone = true;
      return false;
    }
  }

  return false;
}
// }
// Areas {
var areaConnectedToPlayer = [];

function refreshAreasConnectedToPlayer(scene) {
  var playerArea =
    scene.level.worldMap[floor(scene.player.pos.x)][floor(scene.player.pos.y)];
  for (var i = 0; i < FLOOR_CODES; i++) {
    if (i === playerArea) {
      areaConnectedToPlayer[i] = true;
    } else {
      areaConnectedToPlayer[i] = false;
    }
  }

  var doorKeys = Object.keys(scene.doors);
  var playerKey = floor(scene.player.pos.x) + "-" + floor(scene.player.pos.y);
  for (var i = 0; i < doorKeys.length; i++) {
    var door = scene.doors[doorKeys[i]];
    if (door.openAmount > 0.1 || doorKeys[i] === playerKey) {
      if (door.adjacentAreas.includes(playerArea)) {
        areaConnectedToPlayer[door.adjacentAreas[0]] = true;
        areaConnectedToPlayer[door.adjacentAreas[1]] = true;
      }
    }
  }
}
//}
// Elevator {
function tryElevator(scene) {
  if (
    scene.level.worldMap[floor(scene.player.pos.x + scene.player.forward.x)][
      floor(scene.player.pos.y + scene.player.forward.y)
    ] === END_ELEVATOR_CODE &&
    abs(scene.player.forward.x) > abs(scene.player.forward.y)
  ) {
    scene.level.worldMap[floor(scene.player.pos.x + scene.player.forward.x)][
      floor(scene.player.pos.y + scene.player.forward.y)
    ] = END_ELEVATOR_CODE_FLIPPED;
    scene.gamestate = GAME_STATES.ELEVATOR;
    resetFizzle();
    if (
      scene.level.worldMap[floor(scene.player.pos.x)][
        floor(scene.player.pos.y)
      ] === 1
    ) {
      currentLevel = 9;
    } else if (currentLevel === 9) {
      currentLevel = 1;
    } else {
      currentLevel++;
    }
    return;
  }
}
// }
// Doors {
function initializeDoors(scene) {
  var doors = {};
  for (var x = 0; x < scene.level.worldMap.length; x++) {
    for (var y = 0; y < scene.level.worldMap.length; y++) {
      var id = scene.level.worldMap[x][y];
      if (DOOR_CODES.includes(id)) {
        var adjacentAreas = [];
        if (scene.level.worldMap[x + 1][y] < FLOOR_CODES) {
          adjacentAreas[0] = scene.level.worldMap[x + 1][y];
          adjacentAreas[1] = scene.level.worldMap[x - 1][y];
        }
        if (scene.level.worldMap[x][y + 1] < FLOOR_CODES) {
          adjacentAreas[0] = scene.level.worldMap[x][y + 1];
          adjacentAreas[1] = scene.level.worldMap[x][y - 1];
        }
        doors[x + "-" + y] = {
          openAmount: 0,
          opening: false,
          closing: true,
          blocked: false,
          waitStartTimestamp: -1,
          requireGold: id === 32 + FLOOR_CODES,
          requireSilver: id === 33 + FLOOR_CODES,
          adjacentAreas: adjacentAreas,
        };
      }
    }
  }
  scene.doors = doors;
}

function openDoor(scene, key) {
  var door = scene.doors[key];
  if (door.requireGold && !scene.player.hasGoldKey) {
    return;
  }
  if (door.requireSilver && !scene.player.hasSilverKey) {
    return;
  }
  if (door.closing) {
    door.opening = true;
  }
}

function updateDoors(scene) {
  var doorKeys = Object.keys(scene.doors);
  for (var i = 0; i < doorKeys.length; i++) {
    var door = scene.doors[doorKeys[i]];
    if (door.opening) {
      door.closing = false;
      door.openAmount += 0.001 * delta;
      if (door.openAmount >= 1) {
        door.openAmount = 1;
        door.opening = false;
        door.waitStartTimestamp = millis();
      }
    } else if (door.closing) {
      var doorX = parseInt(doorKeys[i].split("-")[0], 10);
      var doorY = parseInt(doorKeys[i].split("-")[1], 10);
      if (checkTile(scene, doorX, doorY) <= 0 && !door.blocked) {
        door.openAmount = constrain(door.openAmount - 0.001 * delta, 0, 1);
      } else {
        door.openAmount = 1;
      }
    } else {
      if (millis() - door.waitStartTimestamp >= 3000) {
        door.closing = true;
      }
    }
  }
}
// }
// Secrets {
function setupSecrets(scene) {
  var out = [];
  for (var x = 0; x < scene.level.worldMap.length; x++) {
    for (var y = 0; y < scene.level.worldMap[x].length; y++) {
      if (scene.level.objectMap[x][y] === SECRET_FLAG) {
        out.push({
          x: x,
          y: y,
          offset: 1,
          side: 1,
          tilesLeft: 2,
          sliding: false,
          temp: false,
          direction: 1,
          floorCode: 0,
        });
      }
    }
  }
  scene.secrets = out;
  scene.secretCount = out.length;
}

function trySecret(scene) {
  for (var i = 0; i < scene.secrets.length; i++) {
    var secret = scene.secrets[i];
    if (
      secret.x === floor(scene.player.pos.x + scene.player.forward.x) &&
      secret.y === floor(scene.player.pos.y + scene.player.forward.y)
    ) {
      if (secret.temp) {
        continue;
      }
      if (secret.sliding) {
        continue;
      }
      if (secret.side === 1) {
        secret.direction = -sign(scene.player.forward.y);
      } else {
        secret.direction = -sign(scene.player.forward.x);
      }

      var moveX = secret.side === 0 ? -secret.direction : 0;
      var moveY = secret.side === 1 ? -secret.direction : 0;

      if (
        scene.level.worldMap[secret.x + moveX][secret.y + moveY] <
          FLOOR_CODES &&
        scene.level.worldMap[secret.x + moveX * 2][secret.y + moveY * 2] <
          FLOOR_CODES
      ) {
        scene.player.secretCount++;
        secret.sliding = true;

        scene.secrets.push({
          x: secret.x + moveX,
          y: secret.y + moveY,
          offset: 0,
          side: secret.side,
          sliding: true,
          temp: true,
          direction: -secret.direction,
        });

        secret.floorCode =
          scene.level.worldMap[secret.x + moveX][secret.y + moveY];
        scene.level.worldMap[secret.x + moveX][secret.y + moveY] =
          scene.level.worldMap[secret.x][secret.y];
      }
    }
  }
}

function updateSecrets(scene) {
  var i = 0;
  while (i < scene.secrets.length) {
    var secret = scene.secrets[i];
    if (secret.sliding) {
      if (secret.temp) {
        secret.offset += 0.0005 * delta;
        if (secret.offset >= 1) {
          scene.secrets.splice(i, 1);
        } else {
          i++;
        }
      } else {
        secret.offset -= 0.0005 * delta;
        if (secret.offset <= 0) {
          secret.tilesLeft--;
          var yMove = secret.side === 1 ? -secret.direction : 0;
          var xMove = secret.side === 0 ? -secret.direction : 0;
          scene.level.worldMap[secret.x + xMove][secret.y + yMove] =
            scene.level.worldMap[secret.x][secret.y];
          scene.level.worldMap[secret.x][secret.y] = secret.floorCode;
          if (secret.tilesLeft === 0) {
            scene.secrets.splice(i, 1);
          } else {
            secret.offset = 1;
            secret.x += xMove;
            secret.y += yMove;
            scene.level.worldMap[secret.x + xMove][secret.y + yMove] =
              scene.level.worldMap[secret.x][secret.y];

            scene.secrets.push({
              x: secret.x + xMove,
              y: secret.y + yMove,
              offset: 0,
              side: secret.side,
              sliding: true,
              temp: true,
              direction: -secret.direction,
            });
            i++;
          }
        } else {
          i++;
        }
      }
    } else {
      i++;
    }
  }
}
// }
// Raycasting {
var zBuffer = new Array(bufferWidth);
var plane = new PVector(0, 0.74);
function raycast(scene) {
  var player = scene.player;
  var worldMap = scene.level.worldMap;
  var secrets = scene.secrets;
  var doors = scene.doors;
  // rotate the camera plane
  var rotatedPlaneX = plane.x * cos(player.angle) - plane.y * sin(player.angle);
  var rotatedPlaneY = plane.x * sin(player.angle) + plane.y * cos(player.angle);

  var playerX = player.pos.x;
  var playerY = player.pos.y;
  var playerForwardX = player.forward.x;
  var playerForwardY = player.forward.y;

  var ceilingColor =
    ceilingColorPallette[
      ceilingColorIndexes[currentEpisode * 10 + currentLevel] & 0xff
    ];

  for (var x = 0; x < bufferWidth; x++) {
    var cameraX = (x * 2) / bufferWidth - 1;

    // ray direction
    var rayDirX = playerForwardX + rotatedPlaneX * cameraX;
    var rayDirY = playerForwardY + rotatedPlaneY * cameraX;

    // current map cell
    var mapX = floor(playerX);
    var mapY = floor(playerY);

    // length of ray to next x or y side
    var deltaX = rayDirX === 0 ? Infinity : abs(1 / rayDirX);
    var deltaY = rayDirY === 0 ? Infinity : abs(1 / rayDirY);

    // step direction
    var stepX = rayDirX < 0 ? -1 : 1;
    var stepY = rayDirY < 0 ? -1 : 1;

    // initial side distances
    var sideDistX =
      rayDirX < 0 ? (playerX - mapX) * deltaX : (mapX + 1.0 - playerX) * deltaX;

    var sideDistY =
      rayDirY < 0 ? (playerY - mapY) * deltaY : (mapY + 1.0 - playerY) * deltaY;

    var hit = 0;
    var side = sideDistX < sideDistY ? 0 : 1;
    var hitDoorTile = false;
    var initialTest = true;
    var doorOpenAmount;

    var wallX;
    var textureOffset = 0;

    // DDA loop
    while (hit === 0) {
      if (worldMap[mapX][mapY] > 0) {
        hit = worldMap[mapX][mapY];
        if (hit <= FLOOR_CODES || hit - FLOOR_CODES >= wallCount) {
          hit = 0;
        }

        // Secrets {
        for (var i = 0; i < secrets.length; i++) {
          var secret = secrets[i];

          if (secret.x === mapX && secret.y === mapY) {
            if (!secret.sliding) {
              secret.side = side;
            }
            if (secret.offset !== 1) {
              var nx = secret.side === 0 ? secret.direction : 0;
              var ny = secret.side === 1 ? secret.direction : 0;

              var dot = rayDirX * nx + rayDirY * ny;

              if (side === 1) {
                if (side === secret.side) {
                  if (dot >= 0) {
                    hit = 0;
                    continue;
                  }
                  if (sideDistY - deltaY * secret.offset >= sideDistX) {
                    hit = 0;
                  } else if (secret.direction === sign(playerForwardY)) {
                    hit = 0;
                  } else {
                    sideDistY += deltaY * (1 - secret.offset);
                  }
                } else {
                  var xPos = playerX + (sideDistY - deltaY) * rayDirX;
                  xPos -= floor(xPos);

                  var xPosFar = playerX + sideDistY * rayDirX;
                  xPosFar -= floor(xPosFar);

                  if (secret.direction === -1) {
                    xPos = 1 - xPos;
                    xPosFar = 1 - xPosFar;
                  }

                  if (xPos > secret.offset) {
                    if (dot >= 0) {
                      hit = 0;
                      continue;
                    }
                    var wouldHitSide = false;
                    if (sideDistX < sideDistY) {
                      wouldHitSide = true;
                    } else if (xPosFar < secret.offset) {
                      wouldHitSide = true;
                    }

                    if (secret.direction === sign(player.forward.x)) {
                      wouldHitSide = false;
                    }

                    var newSideDistX = sideDistX + deltaX * (1 - secret.offset);
                    if (sideDistY - deltaY > newSideDistX - deltaX) {
                      wouldHitSide = false;
                    }

                    if (wouldHitSide) {
                      sideDistX = newSideDistX;
                      side = 0;
                    } else {
                      hit = 0;
                    }
                  } else {
                    textureOffset = (1 - secret.offset) * -secret.direction;
                  }
                }
              } else {
                if (side === secret.side) {
                  if (dot >= 0) {
                    hit = 0;
                    continue;
                  }
                  if (sideDistX - deltaX * secret.offset >= sideDistY) {
                    hit = 0;
                  } else if (secret.direction === sign(playerForwardX)) {
                    hit = 0;
                  } else {
                    sideDistX += deltaX * (1 - secret.offset);
                  }
                } else {
                  var xPos = playerY + (sideDistX - deltaX) * rayDirY;
                  xPos -= floor(xPos);

                  var xPosFar = playerY + sideDistX * rayDirY;
                  xPosFar -= floor(xPosFar);

                  if (secret.direction === -1) {
                    xPos = 1 - xPos;
                    xPosFar = 1 - xPosFar;
                  }

                  if (xPos > secret.offset) {
                    if (dot >= 0) {
                      hit = 0;
                      continue;
                    }
                    var wouldHitSide = false;
                    if (sideDistX >= sideDistY) {
                      wouldHitSide = true;
                    } else if (xPosFar < secret.offset) {
                      wouldHitSide = true;
                    }

                    var newSideDistY = sideDistY + deltaY * (1 - secret.offset);
                    if (sideDistX - deltaX > newSideDistY - deltaY) {
                      wouldHitSide = false;
                    }

                    if (wouldHitSide) {
                      sideDistY = newSideDistY;
                      side = 1;
                    } else {
                      hit = 0;
                    }
                  } else {
                    textureOffset = (1 - secret.offset) * -secret.direction;
                  }
                }
              }
            }
          }
        }
        //}

        // Doors {
        if (hitDoorTile) {
          hit = 30 + FLOOR_CODES;
        }
        if (DOOR_CODES.includes(hit)) {
          doorOpenAmount = doors[mapX + "-" + mapY].openAmount;
          if (initialTest) {
            if (
              sideDistX < sideDistY &&
              worldMap[mapX + 1][mapY] > FLOOR_CODES
            ) {
              hitDoorTile = true;
            }
            if (
              sideDistY < sideDistX &&
              worldMap[mapX][mapY + 1] > FLOOR_CODES
            ) {
              hitDoorTile = true;
            }
          }
          if (side === 1) {
            if (sideDistY - deltaY * 0.5 >= sideDistX) {
              hit = 0;
              hitDoorTile = true;
            } else {
              var doorX = playerX + (sideDistY - deltaY * 0.5) * rayDirX;
              doorX -= floor(doorX);

              if (doorX < doorOpenAmount) {
                hit = 0;
                if (sideDistY >= sideDistX) {
                  hitDoorTile = true;
                }
              } else {
                sideDistY += deltaY * 0.5;
              }
            }
          } else {
            if (sideDistX - deltaX * 0.5 >= sideDistY) {
              hit = 0;
              hitDoorTile = true;
            } else {
              var doorX = playerY + (sideDistX - deltaX * 0.5) * rayDirY;
              doorX -= floor(doorX);

              if (doorX < doorOpenAmount) {
                hit = 0;
                if (sideDistX >= sideDistY) {
                  hitDoorTile = true;
                }
              } else {
                sideDistX += deltaX * 0.5;
              }
            }
          }
        }
        //}
      }
      if (hit === 0) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaY;
          mapY += stepY;
          side = 1;
        }
      }
      if (initialTest) {
        initialTest = false;
      }
    }

    var perpWallDist = side === 0 ? sideDistX - deltaX : sideDistY - deltaY;

    var isDoor = DOOR_CODES.includes(hit);
    if (isDoor) {
      textureOffset = doorOpenAmount;
    }
    if (side === 0) {
      wallX = playerY + perpWallDist * rayDirY - textureOffset;
      wallX -= floor(wallX);
    } else {
      wallX = playerX + perpWallDist * rayDirX - textureOffset;
      wallX -= floor(wallX);
    }

    zBuffer[x] = perpWallDist;

    var lineHeight = floor(bufferHeight / perpWallDist);
    var textureX = 0;

    textureX = constrain(floor(63 * wallX), 0, 63);

    if (!isDoor) {
      if (side === 0 && rayDirX < 0) {
        textureX = 63 - textureX;
      }
      if (side === 1 && rayDirY > 0) {
        textureX = 63 - textureX;
      }
    }

    var drawStartY = (bufferHeight - lineHeight) / 2;
    var drawEndY = bufferHeight - drawStartY;

    var pixelIndex = x * 4;
    var texture = cachedTextures[(hit - FLOOR_CODES) * 2 - side - 1];
    for (var y = 0; y < bufferHeight; y++) {
      if (y < bufferHeight - hudHeight) {
        if (y < drawStartY) {
          pixels.data[pixelIndex] = ceilingColor[0];
          pixels.data[pixelIndex + 1] = ceilingColor[1];
          pixels.data[pixelIndex + 2] = ceilingColor[2];
          pixels.data[pixelIndex + 3] = 255;
        } else if (y > drawEndY) {
          pixels.data[pixelIndex] = 112;
          pixels.data[pixelIndex + 1] = 112;
          pixels.data[pixelIndex + 2] = 112;
          pixels.data[pixelIndex + 3] = 255;
        } else {
          var textureY = floor(
            ((y - drawStartY) * 64) / (drawEndY - drawStartY)
          );
          var pixelColor = texture[textureX + textureY * 64];
          pixels.data[pixelIndex] = (pixelColor >> 16) & 0xff;
          pixels.data[pixelIndex + 1] = (pixelColor >> 8) & 0xff;
          pixels.data[pixelIndex + 2] = (pixelColor >> 0) & 0xff;
          pixels.data[pixelIndex + 3] = (pixelColor >> 24) & 0xff;
        }
        pixelIndex += bufferWidth * 4;
      }
    }
  }
}
// }
// Decorations {
function Decoration(id, x, y) {
  this.id = id;
  this.pos = new PVector(x, y);
  this.dx = 0;
  this.dy = 0;
  this.visible = false;
}

Decoration.prototype.getTexture = function () {
  return cachedTextures[this.id - FLOOR_CODES + wallCount - 1];
};

Decoration.prototype.update = function () {};

function spawnDecorations(scene) {
  var decorations = [];
  var pickupGrid = [];
  for (var x = 0; x < scene.level.worldMap.length; x++) {
    pickupGrid.push([]);
    for (var y = 0; y < scene.level.worldMap[x].length; y++) {
      pickupGrid[x].push([]);
    }
  }
  var totalTreasure = 0;
  for (var x = 0; x < scene.level.worldMap.length; x++) {
    for (var y = 0; y < scene.level.worldMap[x].length; y++) {
      if (
        scene.level.worldMap[x][y] >= wallCount + FLOOR_CODES &&
        scene.level.worldMap[x][y] <= totalTiles + FLOOR_CODES
      ) {
        decorations.push(
          new Decoration(scene.level.worldMap[x][y], x + 0.5, y + 0.5)
        );
      }
      if (
        scene.level.objectMap[x][y] >= wallCount + FLOOR_CODES &&
        scene.level.objectMap[x][y] <= totalTiles + FLOOR_CODES
      ) {
        var dec = new Decoration(scene.level.objectMap[x][y], x + 0.5, y + 0.5);
        decorations.push(dec);

        var pickupId =
          scene.level.objectMap[x][y] - pickupOffset - FLOOR_CODES - 1;
        if (pickupId >= 0 && pickupId <= 15) {
          pickupGrid[x][y].push(dec);
          switch (pickupId) {
            case 9: // Cross
              totalTreasure += 100;
              break;
            case 10: // Chalice
              totalTreasure += 500;
              break;
            case 11: // Chest
              totalTreasure += 1000;
              break;
            case 12: // Crown
              totalTreasure += 5000;
              break;
            case 15: // One Up
              totalTreasure += 40000;
              break;
            default:
              break;
          }
        }
      }
    }
  }
  scene.decorations = decorations;
  scene.treasureCount = totalTreasure;
  scene.pickupGrid = pickupGrid;
}

function renderDecorations(scene) {
  var playerX = scene.player.pos.x;
  var playerY = scene.player.pos.y;

  if (scene.decorations.length > 1) {
    scene.decorations.sort(function (a, b) {
      a.dx = a.pos.x - playerX;
      a.dy = a.pos.y - playerY;
      b.dx = b.pos.x - playerX;
      b.dy = b.pos.y - playerY;

      return b.dx * b.dx + b.dy * b.dy - (a.dx * a.dx + a.dy * a.dy);
    });
  } else if (scene.decorations.length === 1) {
    var a = scene.decorations[0];
    a.dx = a.pos.x - playerX;
    a.dy = a.pos.y - playerY;
  }
  var playerForwardX = scene.player.forward.x;
  var playerForwardY = scene.player.forward.y;
  var rotatedPlaneX =
    plane.x * cos(scene.player.angle) - plane.y * sin(scene.player.angle);
  var rotatedPlaneY =
    plane.x * sin(scene.player.angle) + plane.y * cos(scene.player.angle);
  for (var i = 0; i < scene.decorations.length; i++) {
    var decoration = scene.decorations[i];
    decoration.visible = false;

    var invDet =
      1 / (rotatedPlaneX * playerForwardY - playerForwardX * rotatedPlaneY);

    var transformY =
      invDet * (-rotatedPlaneY * decoration.dx + rotatedPlaneX * decoration.dy);
    if (transformY <= DECORATION_CLIPPING_DISTANCE) {
      continue;
    }

    var transformX =
      invDet *
      (playerForwardY * decoration.dx - playerForwardX * decoration.dy);

    var spriteScreenX = floor(
      (bufferWidth / 2) * (1 + transformX / transformY)
    );
    decoration.screenX = spriteScreenX;
    if (spriteScreenX < -64 || spriteScreenX > bufferWidth + 64) {
      continue;
    }
    var decorationHeight = abs(floor(bufferHeight / transformY));

    var drawStartX = floor(spriteScreenX - decorationHeight / 2);
    var drawEndX = floor(spriteScreenX + decorationHeight / 2);
    var drawStartY = floor((bufferHeight - decorationHeight) / 2);
    var drawEndY = floor(bufferHeight - drawStartY);

    var drawEndYClamped = min(drawEndY, bufferHeight - hudHeight);

    for (var stripe = drawStartX; stripe < drawEndX; stripe++) {
      var textureX = floor(((stripe - drawStartX) / decorationHeight) * 64);
      if (stripe > 0 && stripe < bufferWidth && transformY < zBuffer[stripe]) {
        var pixelIndex = (drawStartY * bufferWidth + stripe) * 4;
        var texture = decoration.getTexture();
        for (var y = drawStartY; y < drawEndYClamped; y++) {
          var textureY = floor(
            ((y - drawStartY) * 64) / (drawEndY - drawStartY)
          );

          var pixelColor = texture[textureX + textureY * 64];
          var a = (pixelColor >> 24) & 0xff;
          if (a !== 0) {
            decoration.visible = true;
            pixels.data[pixelIndex] = (pixelColor >> 16) & 0xff;
            pixels.data[pixelIndex + 1] = (pixelColor >> 8) & 0xff;
            pixels.data[pixelIndex + 2] = pixelColor & 0xff;
            pixels.data[pixelIndex + 3] = a;
          }
          pixelIndex += bufferWidth * 4;
        }
      }
    }
  }
}

function updateDecorations(scene) {
  for (var i = 0; i < scene.decorations.length; i++) {
    scene.decorations[i].update(scene);
  }
}

//}
// Enemies {

function Enemy(id, x, y, forwardX, forwardY, definition, startFrame) {
  Decoration.call(this, id, x, y);
  this.pos = new PVector(x, y);
  this.forward = new PVector(forwardX, forwardY);
  this.oldForward = this.forward.get();
  this.dx = 0;
  this.dy = 0;
  this.frame = 0;
  this.animDir = 1;
  this.renderFrame = 0;
  this.angleOffset = 0;
  this.state = 0;
  this.radius = 0.3;
  this.timestamp = 0;
  if (!definition.notHittable) {
    if (definition.health.length) {
      this.health = definition.health[difficultyLevel];
    } else {
      this.health = definition.health;
    }
  }
  this.screenX = -64;
  this.targetPosition = this.pos.get();
  this.definition = definition;
  this.currentFrame = startFrame;
  this.tilePos = new PVector(floor(this.pos.x), floor(this.pos.y));
  this.distanceToMove = 0;
  this.firstAttack = true;
  this.canSeePlayer = false;
  this.reactionTime = -1;
}
Enemy.prototype = Object.create(Decoration.prototype);
Enemy.prototype.getTexture = function () {
  return cachedTextures[enemyFrameOffsets[this.id] + this.renderFrame];
};
Enemy.prototype.move = function (scene, move) {
  this.pos.x += move * sign0(this.forward.x);
  this.pos.y += move * sign0(this.forward.y);
  this.distanceToMove = max(
    abs(this.pos.x - this.targetPosition.x),
    abs(this.pos.y - this.targetPosition.y)
  );
};
Enemy.prototype.setTargetPosition = function (scene, x, y) {
  scene.enemyGrid[floor(this.targetPosition.x)][floor(this.targetPosition.y)] =
    null;
  this.targetPosition.x = x;
  this.targetPosition.y = y;
  scene.enemyGrid[floor(x)][floor(y)] = this;
  this.distanceToMove = max(
    abs(this.pos.x - this.targetPosition.x),
    abs(this.pos.y - this.targetPosition.y)
  );
};
Enemy.prototype.tryWalk = function (scene) {
  var targetX = floor(this.tilePos.x + sign0(this.forward.x));
  var targetY = floor(this.tilePos.y + sign0(this.forward.y));

  var destinationTile = checkTile(scene, targetX, targetY, this);

  if (abs(this.forward.x) + abs(this.forward.y) > 1) {
    if (
      checkTile(scene, targetX, this.tilePos.y, this) !== 0 ||
      checkTile(scene, this.tilePos.x, targetY, this) !== 0
    ) {
      return false;
    }
  }

  if (destinationTile < 0 && this.id !== 4) {
    this.distanceToMove = -1;
    return true;
  }

  if (destinationTile === 0) {
    this.setTargetPosition(scene, targetX + 0.5, targetY + 0.5);
    return true;
  }
  return false;
};
Enemy.prototype.update = function (scene) {
  var angle =
    (vectorEquals(this.forward, DIRECTIONS.NONE)
      ? this.oldForward.heading()
      : this.forward.heading()) -
    scene.player.forward.heading() +
    202.5;
  angle = wrap(angle, 0, 360);
  this.angleOffset = floor(angle / 45);

  var directionToPlayer = scene.player.pos.get();
  directionToPlayer.sub(this.pos);
  directionToPlayer.normalize();

  var angleToPlayer = wrap(
    directionToPlayer.heading() - this.forward.heading(),
    0,
    360
  );
  this.canSeePlayer =
    (angleToPlayer < 90 || angleToPlayer > 270 || this.id > 4) &&
    this.checkLineOfSight(scene);

  var frame = this.definition.frames[this.currentFrame];
  if (frame.think !== null) {
    this[frame.think](scene);
  }
  var progress = millis() - this.timestamp;
  if (progress >= frame.duration && frame.duration > 0) {
    if (frame.action !== null) {
      this[frame.action](scene);
    }
    this.currentFrame = frame.next;
    frame = this.definition.frames[this.currentFrame];
    this.timestamp = millis();
  }
  this.renderFrame = frame.frame;
  if (frame.angle) {
    this.renderFrame += this.angleOffset;
  }
};

Enemy.prototype.stand = function (scene) {
  this.checkAlert(scene);
};

Enemy.prototype.patrol = function (scene) {
  if (this.checkAlert(scene)) {
    return;
  }

  if (
    vectorEquals(this.targetPosition, this.pos) ||
    (vectorEquals(this.forward, DIRECTIONS.NONE) && this.distanceToMove !== -1)
  ) {
    this.selectPatrolDirection(scene);
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }

  var move = this.definition.speed * delta;

  while (move > 0) {
    if (this.distanceToMove < 0) {
      var doorKey =
        floor(this.pos.x + this.forward.x) +
        "-" +
        floor(this.pos.y + this.forward.y);
      var door = scene.doors[doorKey];
      if (door && this.id !== 4) {
        openDoor(scene, doorKey);
        if (door.openAmount === 1) {
          this.distanceToMove = 1;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    if (move < this.distanceToMove) {
      this.move(scene, move);
      break;
    }

    this.pos.x = this.targetPosition.x;
    this.pos.y = this.targetPosition.y;
    this.tilePos.x = floor(this.pos.x);
    this.tilePos.y = floor(this.pos.y);
    move -= this.distanceToMove;

    this.selectPatrolDirection(scene);
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }
};

Enemy.prototype.chase = function (scene) {
  var dodge = false;
  if (this.checkLineOfSight(scene)) {
    var dx = abs(this.pos.x - scene.player.pos.x);
    var dy = abs(this.pos.y - scene.player.pos.y);

    var distance = max(dx, dy);

    var chance;

    if (distance <= 1.5) {
      chance = 300;
    } else {
      chance = 16 / distance;
    }

    if (random(0, 255) < chance) {
      this.currentFrame = "shoot1";
      this.timestamp = millis();
      return;
    }
    dodge = true;
  }

  if (
    vectorEquals(this.targetPosition, this.pos) ||
    (vectorEquals(this.forward, DIRECTIONS.NONE) && this.distanceToMove !== -1)
  ) {
    if (dodge) {
      this.selectDodgeDirection(scene);
    } else {
      this.selectChaseDirection(scene);
    }
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }

  var move = this.definition.speed * this.definition.chaseSpeed * delta;

  while (move > 0) {
    if (this.distanceToMove < 0) {
      var doorKey =
        floor(this.pos.x + this.forward.x) +
        "-" +
        floor(this.pos.y + this.forward.y);
      var door = scene.doors[doorKey];
      if (door && this.id !== 4) {
        openDoor(scene, doorKey);
        if (door.openAmount === 1) {
          this.distanceToMove = 1;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    if (move < this.distanceToMove) {
      this.move(scene, move);
      break;
    }

    this.pos.x = this.targetPosition.x;
    this.pos.y = this.targetPosition.y;
    this.tilePos.x = floor(this.pos.x);
    this.tilePos.y = floor(this.pos.y);
    move -= this.distanceToMove;

    if (dodge) {
      this.selectDodgeDirection(scene);
    } else {
      this.selectChaseDirection(scene);
    }
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }
};

Enemy.prototype.dogChase = function (scene) {
  if (
    vectorEquals(this.targetPosition, this.pos) ||
    vectorEquals(this.forward, DIRECTIONS.NONE)
  ) {
    this.selectDodgeDirection(scene);
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }

  var move = this.definition.speed * this.definition.chaseSpeed * delta;

  while (move > 0) {
    var dx = abs(scene.player.pos.x - this.pos.x) - move;
    if (dx <= 1 + scene.player.radius) {
      var dy = abs(scene.player.pos.y - this.pos.y) - move;
      if (dy <= 1 + scene.player.radius) {
        this.currentFrame = "jump1";
        this.timestamp = millis();
        return;
      }
    }

    if (this.distanceToMove < 0) {
      return;
    }
    if (move < this.distanceToMove) {
      this.move(scene, move);
      break;
    }

    this.pos.x = this.targetPosition.x;
    this.pos.y = this.targetPosition.y;
    this.tilePos.x = floor(this.pos.x);
    this.tilePos.y = floor(this.pos.y);
    move -= this.distanceToMove;

    this.selectDodgeDirection(scene);
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }
};

Enemy.prototype.schabbsChase = function (scene) {
  var dodge = false;
  var dx = abs(this.pos.x - scene.player.pos.x);
  var dy = abs(this.pos.y - scene.player.pos.y);

  var distance = max(dx, dy);
  if (this.checkLineOfSight(scene)) {
    var chance = random(8, 40);

    if (random(0, 255) < chance) {
      this.currentFrame = "throw1";
      this.timestamp = millis();
      return;
    }
    dodge = true;
  }

  if (
    vectorEquals(this.targetPosition, this.pos) ||
    (vectorEquals(this.forward, DIRECTIONS.NONE) && this.distanceToMove !== -1)
  ) {
    if (dodge) {
      this.selectDodgeDirection(scene);
    } else {
      this.selectChaseDirection(scene);
    }
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }

  var move = this.definition.speed * this.definition.chaseSpeed * delta;

  while (move > 0) {
    if (this.distanceToMove < 0) {
      var doorKey =
        floor(this.pos.x + this.forward.x) +
        "-" +
        floor(this.pos.y + this.forward.y);
      var door = scene.doors[doorKey];
      if (door && this.id !== 4) {
        openDoor(scene, doorKey);
        if (door.openAmount === 1) {
          this.distanceToMove = 1;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    if (move < this.distanceToMove) {
      this.move(scene, move);
      break;
    }

    this.pos.x = this.targetPosition.x;
    this.pos.y = this.targetPosition.y;
    this.tilePos.x = floor(this.pos.x);
    this.tilePos.y = floor(this.pos.y);
    move -= this.distanceToMove;
    if (distance < 4) {
      this.selectRunDirection(scene);
    } else if (dodge) {
      this.selectDodgeDirection(scene);
    } else {
      this.selectChaseDirection(scene);
    }
    if (vectorEquals(this.forward, DIRECTIONS.NONE)) {
      return;
    }
  }
};

Enemy.prototype.bite = function (scene) {
  var dx = abs(scene.player.pos.x - this.pos.x) - 1;
  if (dx <= 1 + scene.player.radius) {
    var dy = abs(scene.player.pos.y - this.pos.y) - 1;
    if (dy <= 1 + scene.player.radius) {
      if (random(0, 255) < 180) {
        scene.player.damage(floor(random(0, 255) / 16), this, scene);
      }
      return;
    }
  }
};

Enemy.prototype.BJRun = function (scene) {
  var speed = ((2048 / 65536) * TICS_TO_MILLIS * 1.41) / 1000;
  this.pos.y -= speed * 2 * delta;
  if (this.pos.y < this.targetY) {
    this.timestamp = millis();
    this.currentFrame = "jump1";
  }
};
Enemy.prototype.BJJump = function (scene) {
  var speed = ((680 / 65536) * TICS_TO_MILLIS * 1.41) / 1000;
  this.pos.y -= speed * 2 * delta;
};
Enemy.prototype.BJDone = function (scene) {
  scene.gamestate = GAME_STATES.ELEVATOR;
};

Enemy.prototype.checkAlert = function (scene) {
  var area = scene.level.worldMap[this.tilePos.x][this.tilePos.y];
  if (this.reactionTime > 0) {
    this.reactionTime -= delta;
    if (this.reactionTime > 0) {
      return false;
    }
    this.reactionTime = 0;
  } else if (this.reactionTime < 0) {
    if (!areaConnectedToPlayer[area] && area !== 0) {
      return false;
    }

    if (
      this.canSeePlayer ||
      (scene.player.madeNoise && area !== 0 && this.id < 5)
    ) {
      this.reactionTime = this.definition.getReactionTime();
    }
    return false;
  }
  this.currentFrame = "chase1";
  this.timestamp = millis();
  return true;
};

Enemy.prototype.selectDodgeDirection = function (scene) {
  if (!vectorEquals(this.forward, DIRECTIONS.NONE)) {
    this.oldForward = this.forward.get();
  }
  var turnAround = this.forward.get();
  turnAround.rotate(180);
  var directions = [];
  if (this.firstAttack) {
    turnAround = DIRECTIONS.NONE;
    this.firstAttack = false;
  }

  var dx = floor(scene.player.pos.x) - this.tilePos.x;
  var dy = floor(scene.player.pos.y) - this.tilePos.y;

  if (dx > 0) {
    directions[1] = DIRECTIONS.EAST;
    directions[3] = DIRECTIONS.WEST;
  } else {
    directions[1] = DIRECTIONS.WEST;
    directions[3] = DIRECTIONS.EAST;
  }

  if (dy > 0) {
    directions[2] = DIRECTIONS.SOUTH;
    directions[4] = DIRECTIONS.NORTH;
  } else {
    directions[2] = DIRECTIONS.NORTH;
    directions[4] = DIRECTIONS.SOUTH;
  }

  var tempDir;

  if (abs(dx) > abs(dy)) {
    tempDir = directions[1];
    directions[1] = directions[2];
    directions[2] = tempDir;
    tempDir = directions[3];
    directions[3] = directions[4];
    directions[4] = tempDir;
  }

  if (random(0, 255) < 128) {
    tempDir = directions[1];
    directions[1] = directions[2];
    directions[2] = tempDir;
    tempDir = directions[3];
    directions[3] = directions[4];
    directions[4] = tempDir;
  }

  directions[0] = directions[1].get();
  directions[0].add(directions[2]);

  for (var i = 0; i < directions.length; i++) {
    if (
      vectorEquals(directions[i], DIRECTIONS.NONE) ||
      vectorEquals(directions[i], turnAround)
    ) {
      continue;
    }
    this.forward = directions[i];
    if (this.tryWalk(scene)) {
      return;
    }
  }

  if (!vectorEquals(turnAround, DIRECTIONS.NONE)) {
    this.forward = turnAround;
    if (this.tryWalk(scene)) {
      return;
    }
  }

  this.forward = DIRECTIONS.NONE;
  this.setTargetPosition(scene, this.tilePos.x, this.tilePos.y);
};
Enemy.prototype.selectChaseDirection = function (scene) {
  if (!vectorEquals(this.forward, DIRECTIONS.NONE)) {
    this.oldForward = this.forward.get();
  }
  var turnAround = this.forward.get();
  turnAround.rotate(180);
  var directions = [];
  var oldDir = this.forward.get();

  var dx = floor(scene.player.pos.x) - this.tilePos.x;
  var dy = floor(scene.player.pos.y) - this.tilePos.y;

  if (dx > 0) {
    directions[0] = DIRECTIONS.EAST;
  } else {
    directions[0] = DIRECTIONS.WEST;
  }

  if (dy > 0) {
    directions[1] = DIRECTIONS.SOUTH;
  } else {
    directions[1] = DIRECTIONS.NORTH;
  }

  if (vectorEquals(directions[0], turnAround)) {
    directions[0] = DIRECTIONS.NONE;
  }
  if (vectorEquals(directions[1], turnAround)) {
    directions[1] = DIRECTIONS.NONE;
  }

  if (abs(dy) > abs(dx)) {
    var tdir = directions[0];
    directions[0] = directions[1];
    directions[1] = tdir;
  }

  if (!vectorEquals(directions[0], DIRECTIONS.NONE)) {
    this.forward = directions[0];
    if (this.tryWalk(scene)) {
      return;
    }
  }
  if (!vectorEquals(directions[1], DIRECTIONS.NONE)) {
    this.forward = directions[1];
    if (this.tryWalk(scene)) {
      return;
    }
  }
  if (!vectorEquals(oldDir, DIRECTIONS.NONE)) {
    this.forward = oldDir;
    if (this.tryWalk(scene)) {
      return;
    }
  }

  var dirs = Object.keys(DIRECTIONS);
  if (random(0, 255) > 128) {
    for (var i = 0; i < dirs.length; i++) {
      var dir = DIRECTIONS[dirs[i]];
      if (vectorEquals(dir, turnAround)) {
        continue;
      }
      if (vectorEquals(dir, DIRECTIONS.NONE)) {
        continue;
      }
      this.forward = dir;
      if (this.tryWalk(scene)) {
        return;
      }
    }
  } else {
    for (var i = dirs.length - 1; i >= 0; i--) {
      var dir = DIRECTIONS[dirs[i]];
      if (vectorEquals(dir, turnAround)) {
        continue;
      }
      if (vectorEquals(dir, DIRECTIONS.NONE)) {
        continue;
      }
      this.forward = dir;
      if (this.tryWalk(scene)) {
        return;
      }
    }
  }

  this.forward = DIRECTIONS.NONE;
  this.setTargetPosition(scene, this.tilePos.x, this.tilePos.y);
};
Enemy.prototype.selectPatrolDirection = function (scene) {
  if (!vectorEquals(this.forward, DIRECTIONS.NONE)) {
    this.oldForward = this.forward.get();
  }

  var newDirection = this.oldForward.get();
  var info = scene.level.objectMap[floor(this.pos.x)][floor(this.pos.y)];
  if (info >= TURN_POINT_START && info < TURN_POINT_START + 8) {
    var angle = (info - TURN_POINT_START) * 45;
    newDirection.x = round(cos(angle));
    newDirection.y = -round(sin(angle));
  }

  this.forward = newDirection;

  if (this.tryWalk(scene)) {
    return;
  }

  this.forward = DIRECTIONS.NONE;
  this.setTargetPosition(scene, this.tilePos.x, this.tilePos.y);
};

Enemy.prototype.selectRunDirection = function (scene) {
  if (!vectorEquals(this.forward, DIRECTIONS.NONE)) {
    this.oldForward = this.forward.get();
  }
  var directions = [];

  var dx = floor(scene.player.pos.x) - this.tilePos.x;
  var dy = floor(scene.player.pos.y) - this.tilePos.y;

  if (dx < 0) {
    directions[0] = DIRECTIONS.EAST;
  } else {
    directions[0] = DIRECTIONS.WEST;
  }

  if (dy < 0) {
    directions[1] = DIRECTIONS.SOUTH;
  } else {
    directions[1] = DIRECTIONS.NORTH;
  }

  if (abs(dy) > abs(dx)) {
    var tdir = directions[0];
    directions[0] = directions[1];
    directions[1] = tdir;
  }

  if (!vectorEquals(directions[0], DIRECTIONS.NONE)) {
    this.forward = directions[0];
    if (this.tryWalk(scene)) {
      return;
    }
  }
  if (!vectorEquals(directions[1], DIRECTIONS.NONE)) {
    this.forward = directions[1];
    if (this.tryWalk(scene)) {
      return;
    }
  }

  var dirs = Object.keys(DIRECTIONS);
  if (random(0, 255) > 128) {
    for (var i = 0; i < dirs.length; i++) {
      var dir = DIRECTIONS[dirs[i]];
      if (vectorEquals(dir, DIRECTIONS.NONE)) {
        continue;
      }
      this.forward = dir;
      if (this.tryWalk(scene)) {
        return;
      }
    }
  } else {
    for (var i = dirs.length - 1; i >= 0; i--) {
      var dir = DIRECTIONS[dirs[i]];
      if (vectorEquals(dir, DIRECTIONS.NONE)) {
        continue;
      }
      this.forward = dir;
      if (this.tryWalk(scene)) {
        return;
      }
    }
  }

  this.forward = DIRECTIONS.NONE;
  this.setTargetPosition(scene, this.tilePos.x, this.tilePos.y);
};

Enemy.prototype.fire = function (scene) {
  var dx = abs(this.pos.x - scene.player.pos.x);
  var dy = abs(this.pos.y - scene.player.pos.y);

  var distance = max(dx, dy);

  if (this.id === 2 || this.id >= 5) {
    distance *= 2 / 3;
  }

  if (this.checkLineOfSight(scene)) {
    var hitChance;
    if (scene.player.running) {
      if (this.visible) {
        hitChance = 160 - distance * 16;
      } else {
        hitChance = 160 - distance * 8;
      }
    } else {
      if (this.visible) {
        hitChance = 256 - distance * 16;
      } else {
        hitChance = 256 - distance * 8;
      }
    }

    if (random(0, 255) < hitChance) {
      var damage;
      if (distance < 2) {
        damage = floor(random(0, 255) / 4);
      } else if (distance < 4) {
        damage = floor(random(0, 255) / 8);
      } else {
        damage = floor(random(0, 255) / 16);
      }
      scene.player.damage(damage, this, scene);
    }
  }
};
Enemy.prototype.schabbsThrow = function (scene) {
  var angle = scene.player.pos.get();
  angle.sub(this.pos);
  angle.normalize();
  var needle = new Enemy(
    this.id + 1,
    this.pos.x,
    this.pos.y,
    angle.x,
    angle.y,
    enemyDefinitions[this.id + 1],
    "needle1"
  );
  scene.decorations.push(needle);
};
Enemy.prototype.projectile = function (scene) {
  this.pos.x += this.forward.x * delta * this.definition.speed;
  this.pos.y += this.forward.y * delta * this.definition.speed;
  if (checkTile(scene, this.pos.x, this.pos.y, this, true) !== 0) {
    var i = scene.decorations.indexOf(this);
    scene.decorations.splice(i, 1);
  } else if (
    abs(this.pos.x - scene.player.pos.x) < 0.75 &&
    abs(this.pos.y - scene.player.pos.y) < 0.75
  ) {
    scene.player.damage(floor(random(0, 255) / 8) + 20, this, scene);

    var i = scene.decorations.indexOf(this);
    scene.decorations.splice(i, 1);
  }
};
Enemy.prototype.hit = function (damage) {
  if (this.health === 0) {
    return false;
  }
  this.health -= damage;
  if (this.health <= 0 || this.id === 4) {
    this.health = 0;
    this.currentFrame = "die1";
    this.timestamp = millis();
    return true;
  } else if (this.id < 5) {
    this.currentFrame = this.health % 2 === 0 ? "pain1" : "pain2";
    this.timestamp = millis();
    return false;
  }
};
Enemy.prototype.checkLineOfSight = function (scene) {
  var rayDirection = scene.player.pos.get();
  rayDirection.sub(this.pos);
  rayDirection.normalize();

  var mapX = floor(this.pos.x);
  var mapY = floor(this.pos.y);

  var sideDistX;
  var sideDistY;

  //length of ray from one x or y-side to next x or y-side
  var deltaDistX = rayDirection.x === 0 ? Infinity : abs(1 / rayDirection.x);
  var deltaDistY = rayDirection.y === 0 ? Infinity : abs(1 / rayDirection.y);

  var stepX;
  var stepY;
  var side = 0;
  var hit = 0;

  if (rayDirection.x < 0) {
    stepX = -1;
    sideDistX = (this.pos.x - mapX) * deltaDistX;
  } else {
    stepX = 1;
    sideDistX = (mapX + 1 - this.pos.x) * deltaDistX;
  }
  if (rayDirection.y < 0) {
    stepY = -1;
    sideDistY = (this.pos.y - mapY) * deltaDistY;
  } else {
    stepY = 1;
    sideDistY = (mapY + 1 - this.pos.y) * deltaDistY;
  }

  while (hit <= FLOOR_CODES || hit >= FLOOR_CODES + wallCount) {
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      mapX += stepX;
      side = 0;
    } else {
      sideDistY += deltaDistY;
      mapY += stepY;
      side = 1;
    }

    hit = scene.level.worldMap[mapX][mapY];

    // Doors {
    if (DOOR_CODES.includes(hit)) {
      var doorOpenAmount = scene.doors[mapX + "-" + mapY].openAmount;
      if (side === 1) {
        if (sideDistY - deltaDistY * 0.5 >= sideDistX) {
          hit = 0;
        } else {
          var doorX =
            this.pos.x + (sideDistY - deltaDistY * 0.5) * rayDirection.x;
          doorX -= floor(doorX);

          if (doorX < doorOpenAmount) {
            hit = 0;
          }
        }
      } else {
        if (sideDistX - deltaDistX * 0.5 >= sideDistY) {
          hit = 0;
        } else {
          var doorX =
            this.pos.y + (sideDistX - deltaDistX * 0.5) * rayDirection.y;
          doorX -= floor(doorX);

          if (doorX < doorOpenAmount) {
            hit = 0;
          }
        }
      }
    }
    //}

    if (
      floor(scene.player.pos.x) === mapX &&
      floor(scene.player.pos.y) === mapY
    ) {
      return true;
    }
  }
  return false;
};
Enemy.prototype.clearGridSpace = function (scene) {
  var dropItemId = GUARD_AMMO_ID;
  if (this.id === 2 && scene.player.weapons < 3) {
    dropItemId = GUARD_AMMO_ID + 1;
  } else if (this.id === 5) {
    dropItemId = GOLD_KEY_ID;
  }

  var itemPosX = floor(this.pos.x);
  var itemPosY = floor(this.pos.y);

  if (this.id !== 4 && this.id !== 7) {
    var pickup = new Decoration(
      dropItemId,
      floor(this.pos.x) + 0.5,
      floor(this.pos.y) + 0.5
    );
    scene.decorations.push(pickup);
    scene.pickupGrid[itemPosX][itemPosY].push(pickup);
  }

  var door = scene.doors[itemPosX + "-" + itemPosY];
  if (door) {
    door.blocked = true;
  }
};

Enemy.prototype.startDeathCam = function (scene) {
  if (scene.gamestate === GAME_STATES.DEATHCAM_2) {
    scene.gamestate = GAME_STATES.DEATHCAM_3;
    scene.startTime = -1;
  } else {
    scene.gamestate = GAME_STATES.DEATHCAM_1;
    scene.startTime = -1;
  }
};

var enemyDefinitions = [];
enemyDefinitions.push({
  health: 25,
  speed: 0.000547 * 1.41,
  chaseSpeed: 3,
  getReactionTime: function () {
    return (1 + random(0, 255) / 4) * TICS_TO_MILLIS;
  },
  score: 100,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: true,
      frame: 0,
    },
    patrol1: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1s",
      angle: true,
      frame: 8,
    },
    patrol1s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol2",
      angle: true,
      frame: 8,
    },
    patrol2: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3",
      angle: true,
      frame: 16,
    },
    patrol3: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3s",
      angle: true,
      frame: 24,
    },
    patrol3s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol4",
      angle: true,
      frame: 24,
    },
    patrol4: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1",
      angle: true,
      frame: 32,
    },
    pain1: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 40,
    },
    pain2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 41,
    },
    shoot1: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot2",
      angle: false,
      frame: 46,
    },
    shoot2: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot3",
      angle: false,
      frame: 47,
    },
    shoot3: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 48,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1s",
      angle: true,
      frame: 8,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: true,
      frame: 8,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3",
      angle: true,
      frame: 16,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3s",
      angle: true,
      frame: 24,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: true,
      frame: 24,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1",
      angle: true,
      frame: 32,
    },
    die1: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 42,
    },
    die2: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 43,
    },
    die3: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 44,
    },
    die4: {
      duration: 0,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 45,
    },
  },
}); // Guard
enemyDefinitions.push({
  health: 50,
  speed: 0.000547 * 1.41,
  chaseSpeed: 5,
  getReactionTime: function () {
    return 2 * TICS_TO_MILLIS;
  },
  score: 400,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: true,
      frame: 0,
    },
    patrol1: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1s",
      angle: true,
      frame: 8,
    },
    patrol1s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol2",
      angle: true,
      frame: 8,
    },
    patrol2: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3",
      angle: true,
      frame: 16,
    },
    patrol3: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3s",
      angle: true,
      frame: 24,
    },
    patrol3s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol4",
      angle: true,
      frame: 24,
    },
    patrol4: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1",
      angle: true,
      frame: 32,
    },
    pain1: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 40,
    },
    pain2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 41,
    },
    shoot1: {
      duration: 6 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot2",
      angle: false,
      frame: 47,
    },
    shoot2: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot3",
      angle: false,
      frame: 48,
    },
    shoot3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 49,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1s",
      angle: true,
      frame: 8,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: true,
      frame: 8,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3",
      angle: true,
      frame: 16,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3s",
      angle: true,
      frame: 24,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: true,
      frame: 24,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1",
      angle: true,
      frame: 32,
    },
    die1: {
      duration: 11 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 42,
    },
    die2: {
      duration: 11 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 43,
    },
    die3: {
      duration: 11 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 44,
    },
    die4: {
      duration: 11 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die5",
      angle: false,
      frame: 45,
    },
    die5: {
      duration: 0,
      think: null,
      action: null,
      next: "die5",
      angle: false,
      frame: 46,
    },
  },
}); // Officer
enemyDefinitions.push({
  health: 100,
  speed: 0.000547 * 1.41,
  chaseSpeed: 4,
  getReactionTime: function () {
    return (1 + random(0, 255) / 6) * TICS_TO_MILLIS;
  },
  score: 500,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: true,
      frame: 0,
    },
    patrol1: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1s",
      angle: true,
      frame: 8,
    },
    patrol1s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol2",
      angle: true,
      frame: 8,
    },
    patrol2: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3",
      angle: true,
      frame: 16,
    },
    patrol3: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3s",
      angle: true,
      frame: 24,
    },
    patrol3s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol4",
      angle: true,
      frame: 24,
    },
    patrol4: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1",
      angle: true,
      frame: 32,
    },
    pain1: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 40,
    },
    pain2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 41,
    },
    shoot1: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot2",
      angle: false,
      frame: 46,
    },
    shoot2: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot3",
      angle: false,
      frame: 47,
    },
    shoot3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot4",
      angle: false,
      frame: 48,
    },
    shoot4: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot5",
      angle: false,
      frame: 47,
    },
    shoot5: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot6",
      angle: false,
      frame: 48,
    },
    shoot6: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot7",
      angle: false,
      frame: 47,
    },
    shoot7: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot8",
      angle: false,
      frame: 48,
    },
    shoot8: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot9",
      angle: false,
      frame: 47,
    },
    shoot9: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 48,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1s",
      angle: true,
      frame: 8,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: true,
      frame: 8,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3",
      angle: true,
      frame: 16,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3s",
      angle: true,
      frame: 24,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: true,
      frame: 24,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1",
      angle: true,
      frame: 32,
    },
    die1: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 42,
    },
    die2: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 43,
    },
    die3: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 44,
    },
    die4: {
      duration: 0,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 45,
    },
  },
}); // SS
enemyDefinitions.push({
  health: [45, 55, 55, 65],
  speed: 0.000547 * 1.41,
  chaseSpeed: 3,
  getReactionTime: function () {
    return (1 + random(0, 255) / 6) * TICS_TO_MILLIS;
  },
  score: 700,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: true,
      frame: 0,
    },
    patrol1: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1s",
      angle: true,
      frame: 8,
    },
    patrol1s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol2",
      angle: true,
      frame: 8,
    },
    patrol2: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3",
      angle: true,
      frame: 16,
    },
    patrol3: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3s",
      angle: true,
      frame: 24,
    },
    patrol3s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol4",
      angle: true,
      frame: 24,
    },
    patrol4: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1",
      angle: true,
      frame: 32,
    },
    pain1: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 40,
    },
    pain2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 41,
    },
    shoot1: {
      duration: 6 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot2",
      angle: false,
      frame: 47,
    },
    shoot2: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot3",
      angle: false,
      frame: 48,
    },
    shoot3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot4",
      angle: false,
      frame: 49,
    },
    shoot4: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 50,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1s",
      angle: true,
      frame: 8,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: true,
      frame: 8,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3",
      angle: true,
      frame: 16,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3s",
      angle: true,
      frame: 24,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: true,
      frame: 24,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1",
      angle: true,
      frame: 32,
    },
    die1: {
      duration: 7 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 42,
    },
    die2: {
      duration: 7 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 43,
    },
    die3: {
      duration: 7 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 44,
    },
    die4: {
      duration: 7 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die5",
      angle: false,
      frame: 45,
    },
    die5: {
      duration: 0,
      think: null,
      action: null,
      next: "die5",
      angle: false,
      frame: 46,
    },
  },
}); // Mutant
enemyDefinitions.push({
  health: 1,
  speed: 0.001709 * 1.41,
  chaseSpeed: 2,
  getReactionTime: function () {
    return (1 + random(0, 255) / 8) * TICS_TO_MILLIS;
  },
  score: 200,
  frames: {
    patrol1: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1s",
      angle: true,
      frame: 0,
    },
    patrol1s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol2",
      angle: true,
      frame: 0,
    },
    patrol2: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3",
      angle: true,
      frame: 8,
    },
    patrol3: {
      duration: 20 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol3s",
      angle: true,
      frame: 16,
    },
    patrol3s: {
      duration: 5 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "patrol4",
      angle: true,
      frame: 16,
    },
    patrol4: {
      duration: 15 * TICS_TO_MILLIS,
      think: "patrol",
      action: null,
      next: "patrol1",
      angle: true,
      frame: 24,
    },
    die1: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 32,
    },
    die2: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 33,
    },
    die3: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 34,
    },
    die4: {
      duration: 0,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 35,
    },
    jump1: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "jump2",
      angle: false,
      frame: 36,
    },
    jump2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "bite",
      next: "jump3",
      angle: false,
      frame: 37,
    },
    jump3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "jump4",
      angle: false,
      frame: 38,
    },
    jump4: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "jump5",
      angle: false,
      frame: 36,
    },
    jump5: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 0,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "dogChase",
      action: null,
      next: "chase1s",
      angle: true,
      frame: 0,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: true,
      frame: 0,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "dogChase",
      action: null,
      next: "chase3",
      angle: true,
      frame: 8,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "dogChase",
      action: null,
      next: "chase3s",
      angle: true,
      frame: 16,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: true,
      frame: 16,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "dogChase",
      action: null,
      next: "chase1",
      angle: true,
      frame: 24,
    },
  },
}); // Dog
enemyDefinitions.push({
  health: [850, 950, 1050, 1200],
  speed: 0.000547 * 1.41,
  chaseSpeed: 3,
  getReactionTime: function () {
    return 0;
  },
  score: 5000,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: false,
      frame: 0,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1s",
      angle: false,
      frame: 0,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: false,
      frame: 0,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3",
      angle: false,
      frame: 1,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase3s",
      angle: false,
      frame: 2,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: false,
      frame: 2,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "chase",
      action: null,
      next: "chase1",
      angle: false,
      frame: 3,
    },
    shoot1: {
      duration: 30 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "shoot2",
      angle: false,
      frame: 4,
    },
    shoot2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot3",
      angle: false,
      frame: 5,
    },
    shoot3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot4",
      angle: false,
      frame: 6,
    },
    shoot4: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot5",
      angle: false,
      frame: 5,
    },
    shoot5: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot6",
      angle: false,
      frame: 6,
    },
    shoot6: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot7",
      angle: false,
      frame: 5,
    },
    shoot7: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "fire",
      next: "shoot8",
      angle: false,
      frame: 6,
    },
    shoot8: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase1",
      angle: false,
      frame: 4,
    },
    die1: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 7,
    },
    die2: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 8,
    },
    die3: {
      duration: 15 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 9,
    },
    die4: {
      duration: 0,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 10,
    },
  },
}); // Hans Grosse
enemyDefinitions.push({
  health: 1,
  speed: 0.000547 * 1.41,
  frames: {
    run1: {
      duration: 12 * TICS_TO_MILLIS,
      think: "BJRun",
      action: null,
      next: "run1s",
      angle: false,
      frame: 0,
    },
    run1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "run2",
      angle: false,
      frame: 0,
    },
    run2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "BJRun",
      action: null,
      next: "run3",
      angle: false,
      frame: 1,
    },
    run3: {
      duration: 12 * TICS_TO_MILLIS,
      think: "BJRun",
      action: null,
      next: "run3s",
      angle: false,
      frame: 2,
    },
    run3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "run4",
      angle: false,
      frame: 2,
    },
    run4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "BJRun",
      action: null,
      next: "run1",
      angle: false,
      frame: 3,
    },
    jump1: {
      duration: 14 * TICS_TO_MILLIS,
      think: "BJJump",
      action: null,
      next: "jump2",
      angle: false,
      frame: 4,
    },
    jump2: {
      duration: 14 * TICS_TO_MILLIS,
      think: "BJJump",
      action: null,
      next: "jump3",
      angle: false,
      frame: 5,
    },
    jump3: {
      duration: 14 * TICS_TO_MILLIS,
      think: "BJJump",
      action: null,
      next: "jump4",
      angle: false,
      frame: 6,
    },
    jump4: {
      duration: 300 * TICS_TO_MILLIS,
      think: null,
      action: "BJDone",
      next: "jump5",
      angle: false,
      frame: 7,
    },
    jump5: {
      duration: 0,
      think: null,
      action: null,
      next: "jump5",
      angle: false,
      frame: 7,
    },
  },
}); // BJ
enemyDefinitions.push({
  health: [850, 950, 1550, 2400],
  speed: 0.000547 * 1.41,
  chaseSpeed: 3,
  getReactionTime: function () {
    return 0;
  },
  score: 5000,
  frames: {
    stand: {
      duration: 0,
      think: "stand",
      action: null,
      next: "stand",
      angle: false,
      frame: 0,
    },
    chase1: {
      duration: 10 * TICS_TO_MILLIS,
      think: "schabbsChase",
      action: null,
      next: "chase1s",
      angle: false,
      frame: 0,
    },
    chase1s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase2",
      angle: false,
      frame: 0,
    },
    chase2: {
      duration: 8 * TICS_TO_MILLIS,
      think: "schabbsChase",
      action: null,
      next: "chase3",
      angle: false,
      frame: 1,
    },
    chase3: {
      duration: 10 * TICS_TO_MILLIS,
      think: "schabbsChase",
      action: null,
      next: "chase3s",
      angle: false,
      frame: 2,
    },
    chase3s: {
      duration: 3 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "chase4",
      angle: false,
      frame: 2,
    },
    chase4: {
      duration: 8 * TICS_TO_MILLIS,
      think: "schabbsChase",
      action: null,
      next: "chase1",
      angle: false,
      frame: 3,
    },
    throw1: {
      duration: 30 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "throw2",
      angle: false,
      frame: 4,
    },
    throw2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: "schabbsThrow",
      next: "chase1",
      angle: false,
      frame: 5,
    },
    die1: {
      duration: 12 * TICS_TO_MILLIS,
      think: null,
      action: "clearGridSpace",
      next: "die2",
      angle: false,
      frame: 0,
    },
    die2: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die3",
      angle: false,
      frame: 0,
    },
    die3: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die4",
      angle: false,
      frame: 6,
    },
    die4: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die5",
      angle: false,
      frame: 7,
    },
    die5: {
      duration: 10 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die6",
      angle: false,
      frame: 8,
    },
    die6: {
      duration: 20 * TICS_TO_MILLIS,
      think: null,
      action: "startDeathCam",
      next: "die6",
      angle: false,
      frame: 9,
    },
    deathcam: {
      duration: 1 * TICS_TO_MILLIS,
      think: null,
      action: null,
      next: "die1",
      angle: false,
      frame: 0,
    },
  },
}); // Dr. Schabbs
enemyDefinitions.push({
  notHittable: true,
  speed: 0.00875,
  frames: {
    needle1: {
      duration: 6 * TICS_TO_MILLIS,
      think: "projectile",
      action: null,
      next: "needle2",
      angle: false,
      frame: 0,
    },
    needle2: {
      duration: 6 * TICS_TO_MILLIS,
      think: "projectile",
      action: null,
      next: "needle3",
      angle: false,
      frame: 1,
    },
    needle3: {
      duration: 6 * TICS_TO_MILLIS,
      think: "projectile",
      action: null,
      next: "needle4",
      angle: false,
      frame: 2,
    },
    needle4: {
      duration: 6 * TICS_TO_MILLIS,
      think: "projectile",
      action: null,
      next: "needle1",
      angle: false,
      frame: 3,
    },
  },
});

function spawnEnemies(scene) {
  var out = [];
  var dead = 0;
  for (var x = 0; x < 64; x++) {
    for (var y = 0; y < 64; y++) {
      if (scene.level.objectMap[x][y] === ENEMY_CODES_START) {
        var enemy = new Enemy(
          0,
          x + 0.5,
          y + 0.5,
          0,
          0,
          enemyDefinitions[0],
          "die4"
        );
        enemy.health = 0;
        dead++;
        out.push(enemy);
      } else if (scene.level.objectMap[x][y] > ENEMY_CODES_START) {
        var enemyCode = scene.level.objectMap[x][y] - ENEMY_CODES_START - 1;
        var enemyId = -1;
        var enemyFrame = "stand";
        var enemyForwardX;
        var enemyForwardY;
        var enemyDirection = enemyCode % 4;

        switch (enemyDirection) {
          case 0:
            enemyForwardX = 1;
            enemyForwardY = 0;
            break;
          case 1:
            enemyForwardX = 0;
            enemyForwardY = -1;
            break;
          case 2:
            enemyForwardX = -1;
            enemyForwardY = 0;
            break;
          case 3:
            enemyForwardX = 0;
            enemyForwardY = 1;
            break;
        }

        if (enemyCode < 32) {
          enemyId = floor(enemyCode / 8);
          enemyFrame = enemyCode % 8 < 4 ? "stand" : "patrol1";
        } else if (enemyCode < 36) {
          enemyId = 4;
          enemyFrame = "patrol1";
        } else if (difficultyLevel > DIFFICULTIES.DONT_HURT_ME) {
          enemyCode -= 36;
          if (enemyCode < 32) {
            enemyId = floor(enemyCode / 8);
            enemyFrame = enemyCode % 8 < 4 ? "stand" : "patrol1";
          } else if (enemyCode < 36) {
            enemyId = 4;
            enemyFrame = "patrol1";
          } else if (difficultyLevel === DIFFICULTIES.I_AM_DEATH_INCARNATE) {
            enemyCode -= 36;
            if (enemyCode < 32) {
              enemyId = floor(enemyCode / 8);
              enemyFrame = enemyCode % 8 < 4 ? "stand" : "patrol1";
            } else if (enemyCode < 36) {
              enemyId = 4;
              enemyFrame = "patrol1";
            }
          }
        }

        if (scene.level.objectMap[x][y] === HANS_CODE) {
          enemyId = 5;
        }
        if (scene.level.objectMap[x][y] === SCHABBS_CODE) {
          enemyId = 7;
        }

        if (enemyId !== -1) {
          out.push(
            new Enemy(
              enemyId,
              x + 0.5,
              y + 0.5,
              enemyForwardX,
              enemyForwardY,
              enemyDefinitions[enemyId],
              enemyFrame
            )
          );
        }
      }
    }
  }
  scene.enemies = out;
  scene.enemyCount = out.length - dead;
}

function setupEnemyGrid(scene) {
  var out = [];
  for (var x = 0; x < scene.level.worldMap.length; x++) {
    out.push([]);
    for (var y = 0; y < scene.level.worldMap[x].length; y++) {
      out[x].push(null);
    }
  }

  for (var i = 0; i < scene.enemies.length; i++) {
    out[floor(scene.enemies[i].pos.x)][floor(scene.enemies[i].pos.y)] =
      scene.enemies[i];
  }

  scene.enemyGrid = out;
}
// }
// Player {
function Player(x, y, angle) {
  this.pos = new PVector(x, y);
  this.angle = angle;
  this.forward = new PVector(cos(this.angle), sin(this.angle));
  this.radius = 0.3;
  this.damagedThisShot = false;
  this.currentWeapon = 1;
  this.firing = false;
  this.currentWeaponFrame = 0;
  this.ammo = 8;
  this.secretCount = 0;
  this.weapons = 2;
  this.canFire = true;
  this.killCount = 0;

  this.running = false;

  this.health = 100;
  this.score = 0;
  this.lives = 3;
  this.floor = 1;
  this.hasGoldKey = false;
  this.hasSilverKey = false;

  this.madeNoise = false;

  this.weaponChosen = 1;

  this.faceFrame = 0;
  this.faceTime = 0;
  this.treasure = 0;
}
Player.prototype.preUpdate = function () {
  this.angle = wrap(this.angle, 0, 360);
  this.forward.x = cos(this.angle);
  this.forward.y = sin(this.angle);

  var selectedWeapon = this.currentWeapon;
  if (inputKeys["1"]) {
    selectedWeapon = 0;
  }
  if (inputKeys["2"]) {
    selectedWeapon = 1;
  }
  if (inputKeys["3"]) {
    selectedWeapon = 2;
  }
  if (inputKeys["4"]) {
    selectedWeapon = 3;
  }
  if (this.ammo === 0) {
    selectedWeapon = 0;
  }
  if (selectedWeapon < this.weapons && selectedWeapon !== this.currentWeapon) {
    this.currentWeapon = selectedWeapon;
    this.firing = false;
    this.currentWeaponFrame = 0;
    this.canFire = false;
  }
};
Player.prototype.move = function (scene) {
  var inputForward = 0;
  if (inputKeys.up) {
    inputForward++;
  }
  if (inputKeys.down) {
    inputForward--;
  }
  if (inputKeys.w) {
    inputForward++;
  }
  if (inputKeys.s) {
    inputForward--;
  }
  if (useMouse && inputForward === 0) {
    inputForward += (vMouseYOld - vMouseY) * mouseSensitivity * 8;
  }

  var inputHorizontal = 0;
  if (inputKeys.left) {
    inputHorizontal--;
  }
  if (inputKeys.right) {
    inputHorizontal++;
  }

  if (inputKeys.a) {
    inputHorizontal--;
  }
  if (inputKeys.d) {
    inputHorizontal++;
  }

  inputHorizontal = constrain(inputHorizontal, -1, 1);

  if (useMouse && inputHorizontal === 0) {
    inputHorizontal += (vMouseX - vMouseXOld) * mouseSensitivity;
  }

  var speed = inputKeys.shift || useMouse ? MOVE_SPEED * 2 : MOVE_SPEED;
  var moved = 0;

  var strafe = inputKeys.alt || rightClick;

  var moveX =
    this.forward.x * constrain(inputForward * speed, -speed, speed) * delta;
  var moveY =
    this.forward.y * constrain(inputForward * speed, -speed, speed) * delta;

  if (strafe) {
    moveX -=
      this.forward.y *
      constrain(inputHorizontal * speed, -speed, speed) *
      delta;
    moveY +=
      this.forward.x *
      constrain(inputHorizontal * speed, -speed, speed) *
      delta;
  } else {
    this.angle +=
      inputHorizontal *
      delta *
      TURN_SPEED *
      (inputKeys.shift || useMouse ? 2 : 1);
    this.angle = wrap(this.angle, 0, 360);
  }

  var newX = this.pos.x + moveX;
  var newY = this.pos.y + moveY;

  var moved = 0;

  if (
    checkTile(scene, newX + this.radius, this.pos.y, this) +
      checkTile(scene, newX - this.radius, this.pos.y, this) +
      checkTile(scene, newX, this.pos.y + this.radius, this) +
      checkTile(scene, newX, this.pos.y - this.radius, this) ===
    0
  ) {
    this.pos.x = newX;
    moved += abs(moveX / delta);
  }
  if (
    checkTile(scene, this.pos.x, newY + this.radius, this) +
      checkTile(scene, this.pos.x, newY - this.radius, this) +
      checkTile(scene, this.pos.x + this.radius, newY, this) +
      checkTile(scene, this.pos.x - this.radius, newY, this) ===
    0
  ) {
    this.pos.y = newY;
    moved += abs(moveY / delta);
  }

  this.running = moved >= MOVE_SPEED * 2;
};
Player.prototype.update = function (scene) {
  this.madeNoise = false;
  this.move(scene);
  this.handleWin(scene);
  this.handlePickups(scene);
  this.handleDoors(scene);
  this.updateWeapon(scene);
  this.updateFace();
};
Player.prototype.handleWin = function (scene) {
  var objectId = scene.level.objectMap[floor(this.pos.x)][floor(this.pos.y)];
  if (objectId === WIN_CODE) {
    scene.gamestate = GAME_STATES.WIN;
    this.targetPos = this.pos.get();
    this.targetPos.y -= 5;

    var bj = new Enemy(
      6,
      floor(this.pos.x) + 0.5,
      floor(this.pos.y) + 1.5,
      0,
      -1,
      enemyDefinitions[6],
      "run1"
    );
    bj.targetY = bj.pos.y - 4;
    scene.decorations.push(bj);
    scene.enemyGrid[floor(bj.pos.x)][floor(bj.pos.y)] = bj;
  }
};

Player.prototype.handlePickups = function (scene) {
  var pickups = scene.pickupGrid[floor(this.pos.x)][floor(this.pos.y)];
  for (var i = pickups.length - 1; i >= 0; i--) {
    if (this.pickup(scene, pickups[i])) {
      pickups.splice(i, 1);
    }
  }
};
Player.prototype.handleDoors = function (scene) {
  if (inputKeys[" "]) {
    var doorKey =
      floor(this.pos.x + this.forward.x) +
      "-" +
      floor(this.pos.y + this.forward.y);
    if (scene.doors.hasOwnProperty(doorKey)) {
      openDoor(scene, doorKey);
    }

    trySecret(scene);
    tryElevator(scene);
  }
};
Player.prototype.updateWeapon = function (scene) {
  var fire = inputKeys.control || leftClick;
  var frameDelta = delta / (6 * TICS_TO_MILLIS);
  if (this.firing) {
    if (this.canFire) {
      this.currentWeaponFrame += frameDelta;
      if (
        floor(this.currentWeaponFrame) === 2 &&
        floor(this.currentWeaponFrame - frameDelta) !== 2 &&
        this.currentWeapon > 0
      ) {
        this.fire(scene);
      }
      if (
        floor(this.currentWeaponFrame) === 3 &&
        floor(this.currentWeaponFrame - frameDelta) !== 3
      ) {
        if (this.currentWeapon === 3) {
          this.fire(scene);
        } else if (this.currentWeapon === 0) {
          this.knife(scene);
        }
      }
    }

    if (fire && this.currentWeapon > 1) {
      if (this.currentWeaponFrame >= 4) {
        this.currentWeaponFrame = 2;
        this.fire(scene);
      }
    }
    if (this.currentWeaponFrame >= 5) {
      if (this.currentWeapon > 1) {
        this.currentWeaponFrame = 0;
        this.firing = false;
      } else {
        this.currentWeaponFrame = 0;
        this.canFire = false;
      }
    }
  }
  if (fire && (this.currentWeapon === 0 || this.ammo > 0)) {
    this.firing = true;
  } else {
    if (this.currentWeaponFrame === 0) {
      this.firing = false;
      this.canFire = true;
    }
  }
};
Player.prototype.fire = function (scene) {
  if (this.ammo === 0) {
    return;
  }
  this.ammo--;
  if (this.ammo === 0) {
    this.weaponChosen = this.currentWeapon;
  }
  var target = null;
  this.madeNoise = true;
  var distToTarget = Infinity;
  for (var i = 0; i < scene.enemies.length; i++) {
    var dx = abs(this.pos.x - scene.enemies[i].pos.x);
    var dy = abs(this.pos.y - scene.enemies[i].pos.y);

    var distance = max(dx, dy);

    if (
      distance < distToTarget &&
      abs(scene.enemies[i].screenX - bufferWidth / 2) < 32 &&
      scene.enemies[i].visible &&
      scene.enemies[i].health > 0 &&
      scene.enemies[i].checkLineOfSight(scene) &&
      !scene.enemies[i].notHittable
    ) {
      target = scene.enemies[i];
      distToTarget = distance;
    }
  }
  if (target !== null) {
    var damage = 0;
    if (distToTarget < 2) {
      damage = floor(random(0, 255) / 4);
    } else {
      if (distToTarget > 4 && random(0, 255) / 12 < distToTarget) {
        return;
      }
      damage = floor(random(0, 255) / 6);
    }
    if (target.hit(damage)) {
      this.addScore(target.definition.score, true);
      this.killCount++;
      if (target.id > 5) {
        this.killPos = this.pos.get();
      }
    }
  }
};
Player.prototype.knife = function (scene) {
  var enemies = scene.enemies;
  var target = null;
  var distToTarget = Infinity;
  for (var i = 0; i < enemies.length; i++) {
    var dx = abs(this.pos.x - enemies[i].pos.x);
    var dy = abs(this.pos.y - enemies[i].pos.y);

    var distance = max(dx, dy);

    if (
      distance < distToTarget &&
      abs(enemies[i].screenX - bufferWidth / 2) < 32 &&
      enemies[i].visible &&
      enemies[i].health > 0 &&
      enemies[i].checkLineOfSight(scene) &&
      !enemies[i].notHittable
    ) {
      target = enemies[i];
      distToTarget = distance;
    }
  }
  if (target !== null && distToTarget < 1.5) {
    var damage = floor(random(0, 255) / 16);
    if (target.hit(damage)) {
      this.addScore(target.definition.score, true);
      this.killCount++;
      if (target.id > 5) {
        this.killPos = this.pos.get();
      }
    }
    if (damage > 0) {
      this.madeNoise = true;
    }
  }
};
Player.prototype.addScore = function (amount, kill) {
  if (
    floor((totalScore + this.score + amount) / 40000) >
    floor((totalScore + this.score) / 40000)
  ) {
    this.lives = constrain(this.lives + 1, 0, 9);
  }
  this.score += amount;
  if (!kill) {
    this.treasure += amount;
  }
};
Player.prototype.pickup = function (scene, pickup) {
  var pickupId = pickup.id - pickupOffset - FLOOR_CODES - 1;
  var usedPickup = false;
  switch (pickupId) {
    case 0: // Gibs
      if (this.health < 11) {
        this.health = constrain(this.health + 1, 0, 100);
        usedPickup = true;
      }
      break;
    case 1: // Blood
      if (this.health < 11) {
        this.health = constrain(this.health + 1, 0, 100);
        usedPickup = true;
      }
      break;
    case 2: // Dogfood
      if (this.health < 100) {
        this.health = constrain(this.health + 4, 0, 100);
        usedPickup = true;
      }
      break;
    case 3: // Dinner
      if (this.health < 100) {
        this.health = constrain(this.health + 10, 0, 100);
        usedPickup = true;
      }
      break;
    case 4: // First Aid
      if (this.health < 100) {
        this.health = constrain(this.health + 25, 0, 100);
        usedPickup = true;
      }
      break;
    case 5: // Ammo
      if (this.ammo < 99) {
        if (this.ammo === 0) {
          this.currentWeapon = min(this.weapons - 1, this.weaponChosen);
          this.firing = false;
          this.currentWeaponFrame = 0;
          this.canFire = false;
        }
        this.ammo = constrain(this.ammo + 8, 0, 99);
        usedPickup = true;
      }
      break;
    case 6: // Ammo Guard
      if (this.ammo < 99) {
        if (this.ammo === 0) {
          this.currentWeapon = min(this.weapons - 1, this.weaponChosen);
          this.firing = false;
          this.currentWeaponFrame = 0;
          this.canFire = false;
        }
        this.ammo = constrain(this.ammo + 4, 0, 99);
        usedPickup = true;
      }
      break;
    case 7: // MP40
      if (this.weapons < 3 || this.ammo < 99) {
        if (this.ammo === 0) {
          this.currentWeapon = min(this.weapons - 1, this.weaponChosen);
          this.firing = false;
          this.currentWeaponFrame = 0;
          this.canFire = false;
        }
        this.weapons = max(this.weapons, 3);
        this.ammo = constrain(this.ammo + 6, 0, 99);
        usedPickup = true;
        this.currentWeapon = max(this.currentWeapon, 2);
        this.firing = false;
        this.currentWeaponFrame = 0;
      }
      break;
    case 8: // Chaingun
      if (this.weapons < 4 || this.ammo < 99) {
        if (this.ammo === 0) {
          this.currentWeapon = min(this.weapons - 1, this.weaponChosen);
          this.firing = false;
          this.currentWeaponFrame = 0;
          this.canFire = false;
        }
        this.weapons = 4;
        this.ammo = constrain(this.ammo + 6, 0, 99);
        usedPickup = true;
        this.currentWeapon = 3;
        this.firing = false;
        this.currentWeaponFrame = 0;
        this.grin = true;
        this.faceTime = 0;
      }
      break;
    case 9: // Cross
      this.addScore(100);
      usedPickup = true;
      break;
    case 10: // Chalice
      this.addScore(500);
      usedPickup = true;
      break;
    case 11: // Chest
      this.addScore(1000);
      usedPickup = true;
      break;
    case 12: // Crown
      this.addScore(5000);
      usedPickup = true;
      break;
    case 13: // Gold Key
      this.hasGoldKey = true;
      usedPickup = true;
      break;
    case 14: // Silver Key
      this.hasSilverKey = true;
      usedPickup = true;
      break;
    case 15: // One Up
      this.addScore(40000);
      this.health = 100;
      this.ammo = min(this.ammo + 25, 99);
      usedPickup = true;
      break;
  }

  if (usedPickup) {
    flashScreenColor(color(184, 184, 0));
    for (var i = 0; i < scene.decorations.length; i++) {
      var dec = scene.decorations[i];
      if (
        dec.pos.x === pickup.pos.x &&
        dec.pos.y === pickup.pos.y &&
        dec.id === pickup.id
      ) {
        scene.decorations.splice(i, 1);
        break;
      }
    }
  }
  return usedPickup;
};
Player.prototype.displayWeapon = function () {
  image(
    renders[
      floor(this.currentWeaponFrame + this.currentWeapon * 5) + weaponOffset
    ],
    width / 2,
    height - hudHeight * INV_SCALE - 128,
    256,
    256
  );
};
Player.prototype.damage = function (damage, attacker, scene) {
  if (difficultyLevel === DIFFICULTIES.CAN_I_PLAY_TOO_DADDY) {
    damage = floor(damage / 4);
  }
  this.health -= damage;
  if (this.health > 0) {
    flashScreenColor(color(255, 0, 0));
  } else {
    this.health = 0;
    this.killedBy = attacker;
    scene.gamestate = GAME_STATES.DIE_1;
  }
};
Player.prototype.updateFace = function () {
  this.faceTime += delta * 0.035;
  if (this.faceTime > random(0, 255)) {
    this.grin = false;
    this.faceFrame = round(random(0, 3));
    if (this.faceFrame === 3) {
      this.faceFrame = 1;
    }
    this.faceTime = 0;
  }
};

function spawnPlayer(scene) {
  var player;
  for (var x = 0; x < 64; x++) {
    for (var y = 0; y < 64; y++) {
      if (
        scene.level.objectMap[x][y] > 91 + FLOOR_CODES &&
        scene.level.objectMap[x][y] < 96 + FLOOR_CODES
      ) {
        switch (scene.level.objectMap[x][y]) {
          case 92 + FLOOR_CODES:
            player = new Player(x, y, 0);
            break;
          case 93 + FLOOR_CODES:
            player = new Player(x, y, -90);
            break;
          case 94 + FLOOR_CODES:
            player = new Player(x, y, 180);
            break;
          case 95 + FLOOR_CODES:
            player = new Player(x, y, 90);
            break;
        }
        player.pos.x += 0.5;
        player.pos.y += 0.5;
      }
    }
  }
  player.floor = currentLevel + 1;
  scene.player = player;
}

// }
// Level {

function decodeLevel(levelData) {
  var level = {
    worldMap: [],
    objectMap: [],
  };
  var worldMap = decodeToArray(levelData.worldMap);
  var objectMap = decodeToArray(levelData.objectMap);
  for (var x = 0; x < 64; x++) {
    level.worldMap.push([]);
    level.objectMap.push([]);
    for (var y = 0; y < 64; y++) {
      level.worldMap[x].push(worldMap[y + x * 64]);
      level.objectMap[x].push(objectMap[y + x * 64]);
    }
  }

  level.topColor = levelData.topColor;

  return level;
}
// }

// Scene {
var currentScene = null;

function Scene(episode, levelNumber) {
  this.episode = episodes[episode];
  this.levelData = this.episode.levels[levelNumber];
  this.levelNumber = levelNumber;
  this.initialized = false;
  this.gamestate =
    levelNumber === 0 ? GAME_STATES.TITLE : GAME_STATES.GET_PSYCHED;
  this.startTime = -1;
  this.enemyCount = 0;
  this.secretCount = 0;

  this.fadeColor = [0, 0, 0, 255];
}

Scene.prototype.init = function () {
  this.level = decodeLevel(this.levelData);

  spawnPlayer(this);

  setupSecrets(this);

  initializeDoors(this);

  refreshAreasConnectedToPlayer(this);

  spawnEnemies(this);

  spawnDecorations(this);

  for (var i = 0; i < this.enemies.length; i++) {
    this.decorations.push(this.enemies[i]);
  }

  setupEnemyGrid(this);

  setFizzlePixels(0, 0, 0, 0);
  resetFizzle();

  this.initialized = true;
  this.fadingIn = true;
};

Scene.prototype.reset = function (lives) {
  this.level = decodeLevel(this.levelData);
  this.startTime = millis();
  fading = false;
  resetFizzle();
  spawnPlayer(this);

  this.player.lives = lives;

  initializeDoors(this);

  setupSecrets(this);

  refreshAreasConnectedToPlayer(this);

  spawnEnemies(this);

  spawnDecorations(this);

  for (var i = 0; i < this.enemies.length; i++) {
    this.decorations.push(this.enemies[i]);
  }

  setupEnemyGrid(this);
};

Scene.prototype.fade = function (amount) {
  this.fadeColor[3] = constrain(this.fadeColor[3] + amount * delta, 0, 255);
};

Scene.prototype.renderFade = function () {
  fill(
    this.fadeColor[0],
    this.fadeColor[1],
    this.fadeColor[2],
    this.fadeColor[3]
  );
  rect(0, 0, width, height);
};

var screenRender;
Scene.prototype.draw = function () {
  switch (this.gamestate) {
    case GAME_STATES.GET_PSYCHED: // {
      background(0, 64, 64);
      displayHUD(this);
      image(renders[hudOffset + 18], width / 2, height / 2);
      if (this.startTime > 0) {
        var w = constrain(((millis() - this.startTime) / 1000) * 440, 0, 440);
        fill(252, 0, 0);
        rect(width / 2 - 218, height / 2 + 42, w, 4);
        fill(252, 156, 156);
        rect(width / 2 - 218, height / 2 + 42, w > 2 ? w - 2 : 0, 2);
      }
      this.renderFade();
      if (this.startTime === -1) {
        this.fade(-1);
        if (this.fadeColor[3] === 0) {
          this.startTime = millis();
        }
      } else if (millis() - this.startTime > 1000) {
        this.fade(1);
        if (this.fadeColor[3] === 255) {
          this.gamestate = GAME_STATES.FADE_IN;
          this.player.preUpdate();
          updateDecorations(this);
        }
      }
      break; //}
    case GAME_STATES.FADE_IN: // {
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      this.renderFade();
      this.fade(-1);
      if (this.fadeColor[3] === 0) {
        this.gamestate = GAME_STATES.PLAY;
        this.startTime = millis();
      }
      break; //}
    case GAME_STATES.FIZZLE_IN: // {
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      fizzleColor = [0, 0, 0, 0];
      fizzleFade(60);
      if (fizzleDone) {
        this.gamestate = GAME_STATES.PLAY;
        fading = false;
        resetFizzle();
      }
      break; //}
    case GAME_STATES.PLAY: // {
      if (invalidScreen) {
        return;
      }
      this.player.preUpdate();
      this.player.update(this);
      updateDoors(this);
      refreshAreasConnectedToPlayer(this);
      updateSecrets(this);
      updateDecorations(this);
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      this.player.displayWeapon();
      break; //}
    case GAME_STATES.DIE_1: // {
      var targetAngle =
        -atan2(
          this.player.pos.x - this.player.killedBy.pos.x,
          this.player.pos.y - this.player.killedBy.pos.y
        ) - 90;
      var turn = targetAngle - this.player.angle;
      if (turn > 180) {
        turn -= 360;
      } else if (turn < -180) {
        turn += 360;
      }

      if (abs(turn) > TURN_SPEED * delta) {
        this.player.angle += sign(turn) * TURN_SPEED * delta;
      } else {
        this.player.angle = targetAngle;
        this.fizzleProgress = 0;
        resetFizzle();

        this.gamestate = GAME_STATES.DIE_2;
      }

      this.player.preUpdate();
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      break; //}
    case GAME_STATES.DIE_2: // {
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      fizzleColor = [170, 0, 0, 255];
      fizzleFade(60, true);
      if (fizzleDone) {
        this.player.lives--;
        totalSeconds += floor((millis() - this.startTime) / 1000);
        if (this.player.lives < 0) {
          currentLevel = 0;
          this.levelData = this.episode.levels[0];
          this.player.lives = 3;
          this.player.floor = 1;
          totalScore = 0;
        }
        this.reset(this.player.lives);
        this.gamestate = GAME_STATES.FIZZLE_IN;
        this.player.preUpdate();
        refreshAreasConnectedToPlayer(this);
        updateDecorations(this);
      }
      break; //}
    case GAME_STATES.ELEVATOR: // {
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      this.renderFade();
      this.fade(1);
      if (this.fadeColor[3] === 255) {
        this.fadeOut = false;

        if (this.player.floor === 9) {
          this.gamestate = GAME_STATES.END_SCREEN;
        } else {
          this.gamestate = GAME_STATES.SCORE_SCREEN;

          if (this.player.floor !== 10) {
            this.killRatio = floor(
              (this.player.killCount / this.enemyCount) * 100
            );
            this.killRatioTemp = 0;

            this.secretRatio = floor(
              (this.player.secretCount / this.secretCount) * 100
            );
            this.secretRatioTemp = 0;

            this.treasureRatio = floor(
              (this.player.treasure / this.treasureCount) * 100
            );
            this.treasureRatioTemp = 0;

            this.seconds = floor((millis() - this.startTime) / 1000);
            if (this.seconds > 99 * 60) {
              this.seconds = 99 * 60;
            }

            this.time =
              floor(this.seconds / 60)
                .toString()
                .padStart(2, "0") +
              ":" +
              (this.seconds % 60).toString().padStart(2, "0");

            this.timeLeft = 0;
            if (
              this.seconds <
              this.episode.parTimes[this.player.floor - 1][0] * 60
            ) {
              this.timeLeft =
                this.episode.parTimes[this.player.floor - 1][0] * 60 -
                this.seconds;
            }

            this.timeLeftTemp = 0;
            this.timerTemp = 0;
            this.bonus = 0;
          } else {
            this.player.addScore(15000);
          }
        }
      }
      break; //}
    case GAME_STATES.WIN: // {
      var turn = 90 - this.player.angle;
      if (turn > 180) {
        turn -= 360;
      } else if (turn < -180) {
        turn += 360;
      }

      if (abs(turn) > TURN_SPEED * 2 * delta) {
        this.player.angle += sign(turn) * TURN_SPEED * 2 * delta;
      } else {
        this.player.angle = 90;
      }

      var moveY = this.player.targetPos.y - this.player.pos.y;

      if (abs(moveY) > MOVE_SPEED * delta) {
        this.player.pos.y += sign(moveY) * MOVE_SPEED * delta;
      } else {
        this.player.pos.y = this.player.targetPos.y;
      }

      this.player.preUpdate();
      updateDecorations(this);
      raycast(this);
      renderDecorations(this);
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      break; //}
    case GAME_STATES.SCORE_SCREEN: // {
      if (this.bjBreath === undefined) {
        this.bjBreath = 0;
        this.bjBreathTime = (10 / 70) * 1000;
        this.bjBreathFrame = 0;
      }

      this.bjBreath += delta;
      if (this.bjBreath > this.bjBreathTime) {
        this.bjBreath = 0;
        this.bjBreathTime = (35 / 70) * 1000;
        this.bjBreathFrame = (this.bjBreathFrame + 1) % 2;
      }

      var complete = false;

      if (this.player.floor === 10) {
        complete = true;
        background(0, 64, 64);
        displayHUD(this);
        displayText(248, 40, "SECRET FLOOR", 0);
        displayText(248, 72, "COMPLETED!", 0);

        displayText(128, 256, "15000 BONUS!", 0);
      } else {
        if (this.killRatio === undefined) {
          this.killRatio = 100;
          this.killRatioTemp = 0;
          this.secretRatio = 95;
          this.secretRatioTemp = 0;
          this.treasureRatio = 95;
          this.treasureRatioTemp = 0;
          this.seconds = 60;

          this.timeLeft = 0;
          if (
            this.seconds <
            this.episode.parTimes[this.player.floor - 1][0] * 60
          ) {
            this.timeLeft =
              this.episode.parTimes[this.player.floor - 1][0] * 60 -
              this.seconds;
          }

          this.timeLeftTemp = 0;

          this.bonus = 0;
          if (this.seconds > 99 * 60) {
            this.seconds = 99 * 60;
          }

          this.time =
            floor(this.seconds / 60)
              .toString()
              .padStart(2, "0") +
            ":" +
            (this.seconds % 60).toString().padStart(2, "0");
          this.secondsTemp = 0;
          this.timerTemp = 0;
        }

        if (this.fadeColor[3] === 0 || this.fadeOut) {
          if (this.timerTemp !== -1) {
            this.timerTemp += delta;
            if (this.timerTemp >= 430) {
              this.timerTemp = -1;
            }
          } else if (this.timeLeftTemp < this.timeLeft) {
            this.timeLeftTemp += delta * 0.07;
            if (
              floor(this.timeLeftTemp) > floor(this.timeLeftTemp - delta * 0.07)
            ) {
              this.bonus += 500;
              this.player.addScore(500);
            }
            if (this.timeLeftTemp >= this.timeLeft) {
              this.timeLeftTemp = this.timeLeft;
              this.timerTemp = 0;
            }
          } else if (this.killRatioTemp < this.killRatio) {
            this.killRatioTemp += delta * 0.07;
            if (this.killRatioTemp >= this.killRatio) {
              this.killRatioTemp = this.killRatio;
              this.timerTemp = 0;

              if (this.killRatio === 100) {
                this.bonus += 10000;
                this.player.addScore(10000);
              }
            }
          } else if (this.secretRatioTemp < this.secretRatio) {
            this.secretRatioTemp += delta * 0.07;
            if (this.secretRatioTemp >= this.secretRatio) {
              this.secretRatioTemp = this.secretRatio;
              this.timerTemp = 0;

              if (this.secretRatio === 100) {
                this.bonus += 10000;
                this.player.addScore(10000);
              }
            }
          } else if (this.treasureRatioTemp < this.treasureRatio) {
            this.treasureRatioTemp += delta * 0.07;
            if (this.treasureRatioTemp >= this.treasureRatio) {
              this.treasureRatioTemp = this.treasureRatio;

              if (this.treasureRatio === 100) {
                this.bonus += 10000;
                this.player.addScore(10000);
              }
            }
          } else {
            complete = true;
          }
        }
        background(0, 64, 64);
        displayHUD(this);
        displayText(248, 16, "FLOOR " + this.player.floor, 0);
        displayText(248, 48, "COMPLETED", 0);

        displayText(228, 96, "BONUS " + this.bonus, 0);

        displayText(268, 144, "TIME " + this.time, 0);
        displayText(
          268,
          176,
          "  PAR " + this.episode.parTimes[this.player.floor - 1][1],
          0
        );
        displayText(
          32,
          208,
          "        KILL RATIO " +
            floor(this.killRatioTemp)
              .toString()
              .padStart(3, "-")
              .split("-")
              .join("  ") +
            " %",
          0
        );
        displayText(
          32,
          240,
          "    SECRET RATIO " +
            floor(this.secretRatioTemp)
              .toString()
              .padStart(3, "-")
              .split("-")
              .join("  ") +
            " %",
          0
        );
        displayText(
          32,
          272,
          "TREASURE RATIO " +
            floor(this.treasureRatioTemp)
              .toString()
              .padStart(3, "-")
              .split("-")
              .join("  ") +
            " %",
          0
        );
      }
      imageMode(CORNER);
      image(renders[hudOffset + 19 + this.bjBreathFrame], 0, 16, 208, 176);
      imageMode(CENTER);
      this.renderFade();

      if (inputKeysJustDown[" "]) {
        if (complete) {
          this.fadeOut = true;
        } else {
          if (this.timeLeftTemp < this.timeLeft) {
            var remaining = this.timeLeft - this.timeLeftTemp;
            this.bonus += 500 * ceil(remaining);
            this.player.addScore(500 * ceil(remaining));
            this.timeLeftTemp = this.timeLeft;
          }
          if (this.killRatioTemp < this.killRatio) {
            if (this.killRatio === 100) {
              this.bonus += 10000;
              this.player.addScore(10000);
            }
            this.killRatioTemp = this.killRatio;
          }
          if (this.secretRatioTemp < this.secretRatio) {
            if (this.secretRatio === 100) {
              this.bonus += 10000;
              this.player.addScore(10000);
            }
            this.secretRatioTemp = this.secretRatio;
          }
          if (this.treasureRatioTemp < this.treasureRatio) {
            if (this.treasureRatio === 100) {
              this.bonus += 10000;
              this.player.addScore(10000);
            }
            this.treasureRatioTemp = this.treasureRatio;
          }
        }
      }

      if (this.fadeOut) {
        this.fade(1);
      } else {
        this.fade(-1);
      }
      if (this.fadeColor[3] === 255) {
        var nextScene = new Scene(currentEpisode, currentLevel);
        nextScene.init();
        nextScene.player.ammo = this.player.ammo;
        nextScene.player.lives = this.player.lives;
        nextScene.player.health = this.player.health;
        nextScene.player.weapons = this.player.weapons;
        nextScene.player.currentWeapon = this.player.currentWeapon;
        totalScore += this.player.score;
        if (this.player.floor !== 10) {
          totalSeconds += this.seconds;
          averageKillRatio += this.killRatio;
          averageSecretRatio += this.secretRatio;
          averageTreasureRatio += this.treasureRatio;
        }

        saveCode = "";
        saveCode += safeAlpha[currentLevel];
        saveCode += safeAlpha[this.player.ammo];
        saveCode += safeAlpha[this.player.lives];
        saveCode += safeAlpha[this.player.health];
        saveCode += safeAlpha[this.player.weapons];
        saveCode += safeAlpha[this.player.currentWeapon];
        var longDatas = [
          averageKillRatio,
          averageSecretRatio,
          averageTreasureRatio,
          totalScore,
          totalSeconds,
        ];
        for (var i = 0; i < longDatas.length; i++) {
          saveCode += " ";
          var temp = longDatas[i];

          if (temp === 0) {
            saveCode += safeAlpha[temp];
          }

          while (temp > 0) {
            var digit = temp % 10;
            saveCode += safeAlpha[digit];
            temp = floor(temp / 10);
          }
        }

        currentScene = nextScene;
      }
      break; //}
    case GAME_STATES.END_SCREEN: // {
      background(0, 64, 64);
      displayHUD(this);
      displayText(302, 32, "YOU WIN!", 0);
      displayText(248, 64, "TOTAL TIME", 0);
      if (totalSeconds > 99 * 60) {
        totalSeconds = 99 * 60;
      }
      displayText(
        248,
        96,
        floor(totalSeconds / 60)
          .toString()
          .padStart(2, "0") +
          ":" +
          (totalSeconds % 60).toString().padStart(2, "0"),
        0
      );

      displayText(196, 170, "AVERAGES", 0);
      displayText(
        144,
        212,
        "KILL      " +
          floor(averageKillRatio / 8)
            .toString()
            .padStart(3, "-")
            .split("-")
            .join("  ") +
          "%",
        0
      );
      displayText(
        80,
        244,
        "SECRET      " +
          floor(averageSecretRatio / 8)
            .toString()
            .padStart(3, "-")
            .split("-")
            .join("  ") +
          "%",
        0
      );
      displayText(
        16,
        276,
        "TREASURE      " +
          floor(averageTreasureRatio / 8)
            .toString()
            .padStart(3, "-")
            .split("-")
            .join("  ") +
          "%",
        0
      );

      imageMode(CORNER);
      image(renders[hudOffset + 21], 16, 16, 176, 176);
      imageMode(CENTER);
      this.renderFade();
      this.fade(-1);
      break; //}
    case GAME_STATES.TITLE:
      image(renders[titleScreenIndex], width / 2, height / 2);
      this.renderFade();
      if (this.startTime === -1) {
        this.fade(-1);
        if (this.fadeColor[3] === 0) {
          this.startTime = millis();
        }
      } else if (millis() - this.startTime > 2000) {
        this.fade(1);
        if (this.fadeColor[3] === 255) {
          this.gamestate = GAME_STATES.GET_PSYCHED;
          this.startTime = -1;
        }
      }
      break;
    case GAME_STATES.DEATHCAM_1:
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      if (this.startTime === -1) {
        fizzleColor = [0, 64, 64, 255];
        fizzleFade(60, true);
        if (fizzleDone) {
          this.startTime = millis();
          resetFizzle();
          for (var i = 0; i < this.enemies.length; i++) {
            if (
              Object.keys(this.enemies[i].definition.frames).includes(
                "deathcam"
              )
            ) {
              this.deathcamEnemy = this.enemies[i];
              break;
            }
          }
          if (this.deathcamEnemy) {
            var move = new PVector(
              this.deathcamEnemy.pos.x - this.player.killPos.x,
              this.deathcamEnemy.pos.y - this.player.killPos.y
            );
            move.normalize();
            move.mult(-1.5);
            var newPos = this.deathcamEnemy.pos.get();
            do {
              newPos.add(move);
            } while (
              checkTile(
                this,
                newPos.x + this.player.radius,
                newPos.y,
                this.player
              ) +
                checkTile(
                  this,
                  newPos.x - this.player.radius,
                  newPos.y,
                  this.player
                ) +
                checkTile(
                  this,
                  newPos.x,
                  newPos.y + this.player.radius,
                  this.player
                ) +
                checkTile(
                  this,
                  newPos.x,
                  newPos.y - this.player.radius,
                  this.player
                ) !==
              0
            );
            this.player.pos.set(newPos);
            var targetAngle =
              -atan2(
                this.player.pos.x - this.deathcamEnemy.pos.x,
                this.player.pos.y - this.deathcamEnemy.pos.y
              ) - 90;
            this.player.angle = targetAngle;
            this.player.preUpdate();

            this.deathcamEnemy.currentFrame = "deathcam";
            this.deathcamEnemy.timestamp = millis();
            this.deathcamEnemy.update(this);
            raycast(this);
            renderDecorations(this);
          }
        }
      } else if (millis() - this.startTime > 1000) {
        fizzleColor = [0, 0, 0, 0];
        fizzleFade(60, true);
        if (fizzleDone) {
          this.startTime = millis();
          resetFizzle();
          this.gamestate = GAME_STATES.DEATHCAM_2;
        }
      } else {
        background(0, 64, 64);
        displayHUD(this);
        displayText(24, (400 - hudHeight) / 2 - 16, "LET'S SEE THAT AGAIN!", 0);
      }
      break;
    case GAME_STATES.DEATHCAM_2:
      if (millis() - this.startTime > 1000) {
        this.deathcamEnemy.update(this);
        raycast(this);
        renderDecorations(this);
      }
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      if (floor((millis() - this.startTime) / 500) % 2 === 0) {
        image(renders[deathCamOffset], width / 2, 128 + 16, 256, 256);
      }
      break;
    case GAME_STATES.DEATHCAM_3:
      renderFrameBuffer(fizzlePixels);
      displayHUD(this);
      if (millis() - this.startTime > 100) {
        this.gamestate = GAME_STATES.ELEVATOR;
      }
      break;
  }

  if (invalidScreen) {
    fill(255, 0, 0);
    textSize(20);
    text(
      "The raycast renderer needs a specific\n resolutionin order to run correctly.\nPlease follow the instructions\n in the console to play: \nAdd ?width=640 to the \nend of the url and reload.",
      20,
      40
    );
  } else if (inputKeysJustDown.l) {
    println('var saveCode = "' + saveCode + '";');
  }
  displayFPS();
  updateMouse();
};
// }

// Game {
// Setup
imageMode(CENTER);

draw = function () {
  calculateDelta();
  if (!finishedRendering) {
    initializeTextures(4 / INV_SCALE);
    return;
  }

  if (!frameBufferCreated) {
    createFrameBuffer();
    setupFizzleFade();
  }
  if (currentScene === null) {
    var saveData = saveCode.split(" ");
    currentLevel = safeAlpha.indexOf(saveCode[0]);
    currentScene = new Scene(currentEpisode, currentLevel);
    currentScene.init();
    currentScene.player.ammo = safeAlpha.indexOf(saveCode[1]);
    currentScene.player.lives = safeAlpha.indexOf(saveCode[2]);
    currentScene.player.health = safeAlpha.indexOf(saveCode[3]);
    currentScene.player.weapons = safeAlpha.indexOf(saveCode[4]);
    currentScene.player.currentWeapon = safeAlpha.indexOf(saveCode[5]);
    for (var i = 1; i < saveData.length; i++) {
      var data = saveData[i];
      var num = "";
      for (var c = data.length - 1; c >= 0; c--) {
        num += safeAlpha.indexOf(data[c]);
      }

      num = parseInt(num, 10);

      switch (i) {
        case 1:
          averageKillRatio = num;
          break;
        case 2:
          averageSecretRatio = num;
          break;
        case 3:
          averageTreasureRatio = num;
          break;
        case 4:
          totalScore = num;
          break;
        case 5:
          totalSeconds = num;
          break;
      }
    }
  }

  if (!currentScene.initialized) {
    currentScene.init();
  }
  currentScene.draw();
  inputKeysJustDown = {};
};
// }
