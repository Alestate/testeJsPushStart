//setting up
var app = new PIXI.Application(800, 600, { backgroundColor: 0x000000 });
var renderer = PIXI.autoDetectRenderer(800, 600);

//global vars
var levels = {},
  currentLevel = 0,
  playerBlock,
  finalBlock,
  path,
  widthUnit = 50,
  pathProp = {
    pathLenght: 600,
    pathY: 300
  };

//alias
var Graphics = PIXI.Graphics,
  stage = new PIXI.Container();

//carrega Json e inicia setup
$.getJSON("levels.json", function (ret) {
  levels = ret;
  setup();
});

document.body.appendChild(app.renderer.view);

function setup() {
  console.log(levels);
  //bloco inicial
  playerBlock = defBlock(
    levels[currentLevel].initial.size,
    levels[currentLevel].initial.color,
    1
  );

  //bloco final
  finalBlock = defBlock(
    levels[currentLevel].final.size,
    levels[currentLevel].final.color,
    -1
  );

  //caminho
  path = makePath();

  app.stage.addChild(path);
  app.stage.addChild(finalBlock);
  app.stage.addChild(playerBlock);

  app.renderer.render(stage);
}

function gameLoop() { }

function play() { }

function end() { }

function defBlock(height, color, id) {
  var obj = new Graphics();
  var alpha;

  switch (id) {
    case 1:
      alpha = 1;
      break;

    case -1:
      alpha = .3;
      break;
  };

  obj.beginFill(parseInt("0x" + color.slice(1)), alpha);

  obj.lineStyle(2, 0xffffff, .5);
  obj.drawRoundedRect(0, 0, widthUnit, widthUnit * height, 5);
  obj.endFill();

  obj.pivot.set(widthUnit / 2, ((widthUnit * height) / 2));
  obj.x = app.renderer.view.width / 2 - ((pathProp.pathLenght / 2) * id) - ((widthUnit / 2) * id);
  obj.y = pathProp.pathY;
  return obj;
}

function makePath() {
  var obj = new Graphics();
  obj.lineStyle(2, 0xFFFFFF, 1);
  obj.moveTo(0, 0);
  obj.lineTo(pathProp.pathLenght, 0);

  obj.pivot.set(pathProp.pathLenght / 2, 0);
  obj.x = app.renderer.view.width / 2;
  obj.y = pathProp.pathY;
  return obj;
}