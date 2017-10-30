//setting up
var app = new PIXI.Application(800, 600, { backgroundColor: 0x000000 });
var renderer = PIXI.autoDetectRenderer(800, 600);

//global vars
var levels = {},
  currentLevel = 0,
  playerBlock,
  widthUnit = 50;

//alias
var Graphics = PIXI.Graphics,
  stage = new PIXI.Container();

//carrega Json e inicia setup
$.getJSON("levels.json", function(ret) {
  levels = ret;
  setup();
});

document.body.appendChild(app.renderer.view);

function setup() {
  console.log(levels);
  playerBlock = defBlock(
      levels[currentLevel].initial.size, 
      levels[currentLevel].initial.color
    );

  app.stage.addChild(playerBlock);

  app.renderer.render(stage);
}

function gameLoop() {}

function play() {}

function end() {}

function defBlock(height, color) {
  var obj = new Graphics();
  obj.beginFill(parseInt("0x" + color.slice(1)));
  obj.lineStyle(1, 0xffffff);
  obj.drawRect(0, 0, widthUnit, widthUnit * height);
  obj.endFill();
  return obj;
}
