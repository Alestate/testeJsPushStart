//setting up
var app = new PIXI.Application(800, 600, { backgroundColor: 0x000000 });
var renderer = PIXI.autoDetectRenderer(800, 600);

//global vars
var levels = {},
  currentLevel = 0,
  playerBlock,
  finalBlock,
  title,
  modifiers = [],
  widthUnit = 50,
  pathProp = {
    pathLenght: 600,
    pathY: 300
  },
  textureArray = ["resize1", "resize2", "colorize", "rotate", "select"],
  textureCount = 0,
  scnCurrent,
  scnOld;

//alias
var Graphics = PIXI.Graphics,
  Container = PIXI.Container,
  Text = PIXI.Text,
  Loader = PIXI.loader,
  Sprite = PIXI.Sprite;

//carrega Json e inicia sprites
$.getJSON("levels.json", function(ret) {
  levels = ret;
  loadSprites();
});

document.body.appendChild(app.renderer.view);

function setup() {
  var stage = new Container();

  setLevel();
  //console.log(scnCurrent.children[4].x);

  app.renderer.render(stage);
}

function gameLoop() {}

function play() {}

function end() {}

var defBlock = function(height, color, id) {
  var obj = new Graphics();
  var alpha;

  switch (id) {
    case 1:
      alpha = 1;

      obj.loopBol=true;
      obj.dataFunc = new fxGlow(obj);
      
      obj.interactive = true;
      obj.buttonMode = true;
      obj.on("pointerdown", function() {
        obj.loopBol=false;
      });
      break;

    case -1:
      alpha = 0.3;
      break;
  }

  obj.beginFill(parseInt("0x" + color.slice(1)), alpha);

  obj.lineStyle(2, 0xffffff, 0.5);
  obj.drawRoundedRect(0, 0, widthUnit, widthUnit * height, 5);
  obj.endFill();

  obj.pivot.set(widthUnit / 2, widthUnit * height / 2);
  obj.x =
    app.renderer.view.width / 2 -
    pathProp.pathLenght / 2 * id -
    widthUnit / 2 * id;
  obj.y = pathProp.pathY;

  return obj;
};

function makePath() {
  var obj = new Graphics();
  obj.lineStyle(2, 0xffffff, 1);
  obj.moveTo(0, 0);
  obj.lineTo(pathProp.pathLenght, 0);

  obj.pivot.set(pathProp.pathLenght / 2, 0);
  obj.x = app.renderer.view.width / 2;
  obj.y = pathProp.pathY;
  return obj;
}

function makeText(text) {
  var style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fontWeight: "bold",
    fill: "white"
  });

  var obj = new Text(text, style);

  obj.x = app.renderer.view.width / 2 - obj.width / 2;
  obj.y = 100;

  return obj;
}

function loadSprites() {
  Loader.add("assets/imgs/resize1.png")
    .add("assets/imgs/resize2.png")
    .add("assets/imgs/colorize.png")
    .add("assets/imgs/rotate.png")
    .add("assets/imgs/select.png")
    .load(setup);
}

function setModifier(count, index) {
  var obj, modifierName;
  var objLayerModifs = levels[currentLevel].modifiers[index];

  modifierName = objLayerModifs.type;

  if (modifierName == "resize") {
    modifierName =
      objLayerModifs.type +
      objLayerModifs[Object.keys(objLayerModifs)[1]].toString();
  }

  obj = new Sprite(
    Loader.resources["assets/imgs/" + modifierName + ".png"].texture
  );

  obj.anchor.set(0.5, 0.5);

  switch (count) {
    case 1:
      obj.x = app.view.width * 0.5;
      obj.y = pathProp.pathY;
      break;

    case 2:
      obj.x = app.view.width * (0.25 * (index + 1.5));
      obj.y = pathProp.pathY;
      break;
  }

  if (modifierName == "select") {
    obj.interactive = true;
    obj.buttonMode = true;
    obj.on("pointerdown", function() {
      selectModifier(this);
    });
  }

  return obj;
}

function setLevel() {
  scnCurrent = new Container();

  //bloco inicial
  playerBlock = new defBlock(
    levels[currentLevel].initial.size,
    levels[currentLevel].initial.color,
    1
  );

  //bloco final
  finalBlock = new defBlock(
    levels[currentLevel].final.size,
    levels[currentLevel].final.color,
    -1
  );

  //titulo fase
  title = makeText(levels[currentLevel].name);

  scnCurrent.addChild(makePath());
  scnCurrent.addChild(title);

  for (var n = 0; n < levels[currentLevel].modifiers.length; n++) {
    scnCurrent.addChild(setModifier(levels[currentLevel].modifiers.length, n));
  }

  scnCurrent.addChild(finalBlock);
  scnCurrent.addChild(playerBlock);

  app.stage.addChild(scnCurrent);
}

function selectModifier(obj) {
  var texture = PIXI.Texture.fromImage(
    "assets/imgs/" + textureArray[textureCount] + ".png"
  );
  obj.setTexture(texture);

  if (textureCount < textureArray.length - 2) {
    textureCount++;
  } else {
    textureCount = 0;
  }
}

var fxGlow = function(obj) {
  var alpha = 1,
    dir = -1,
    loopFunc = setInterval(frame, 17);

  function frame() {
    obj.alpha = alpha;
    alpha += 0.01 * dir;
    if (alpha > 1 || alpha < 0.7) {
      dir = dir * -1;
    }

    if(!obj.loopBol){
      clearInterval(loopFunc);
      obj.alpha = 1;
    }
  }
};
