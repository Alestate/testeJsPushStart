//setting up
var app = new PIXI.Application(800, 600, { backgroundColor: 0x000000 });
var renderer = PIXI.autoDetectRenderer(800, 600);

//global vars
var levels = {},
  currentLevel = 4,
  playerBlock,
  finalBlock,
  title,
  activeModifiers = [],
  widthUnit = 50,
  pathProp = {
    pathLenght: 600,
    pathY: 300
  },
  //textureArray = ["resize1", "resize2", "colorize", "rotate", "select"],
  textureCount = 0,
  scnCurrent,
  actionCounter = 0,
  selectCounter = 0,
  scnOld;

//alias
var Graphics = PIXI.Graphics,
  Container = PIXI.Container,
  Text = PIXI.Text,
  Loader = PIXI.loader,
  Sprite = PIXI.Sprite,
  Texture = PIXI.Texture,
  stage = new Container();

//carrega Json e inicia sprites
$.getJSON("levels.json", function (ret) {
  levels = ret;
  loadSprites();
});

document.body.appendChild(app.renderer.view);

//starting up
function setup() {
  //cria fase
  setLevel();
  app.renderer.render(stage);
}

function gameLoop() { }

function play() { }

//fim da fase ou do jogo
function end() { }

var defBlock = function (height, color, alpha, id) {
  var obj = new Graphics(),
    setSize;

  obj.loopBol = true;
  obj.dataFunc = new fxGlow(obj);

  if (id == 1) {
    obj.interactive = true;
    obj.buttonMode = true;
  }

  //acoes na selecao do playerBlock
  obj.on("pointerdown", function () {
    if (obj.loopBol) {
      obj.loopBol = false;
      obj.interactive = false;
      obj.buttonMode = false;
      setAction(obj);
    }
  });


  obj.beginFill(parseInt("0x" + color.slice(1)), alpha);

  obj.lineStyle(2, 0xffffff, 0.5);
  obj.drawRoundedRect(0, 0, widthUnit - 2, widthUnit * height - 2, 5);
  obj.endFill();

  if (id == -1 || id == 0) {
    setSize = -1
  } else {
    setSize = 1
  };
  obj.pivot.set(widthUnit / 2 - 1, widthUnit * height / 2 - 1);
  obj.x = (app.renderer.view.width / 2) - (pathProp.pathLenght / 2 * setSize) - (widthUnit / 2 * setSize);
  obj.y = pathProp.pathY;

  return obj;
};

//define a linha de caminho
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

//define textos
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

//carrega imagens para sprites
function loadSprites() {
  Loader.add("assets/imgs/resize1.png")
    .add("assets/imgs/resize2.png")
    .add("assets/imgs/colorize.png")
    .add("assets/imgs/rotate.png")
    .add("assets/imgs/select.png")
    .load(setup);
}

//define modificadores e suas acoes
function setModifier(count, index) {
  var obj, modifierName, modifFunc;

  var objLayerModifs = levels[currentLevel].modifiers[index];

  modifierName = objLayerModifs.type;

  if (modifierName == "resize") {
    modifierName = objLayerModifs.type + objLayerModifs[Object.keys(objLayerModifs)[1]].toString();
  }

  obj = new Sprite(
    Loader.resources["assets/imgs/" + modifierName + ".png"].texture
  );

  obj.anchor.set(0.5, 0.5);

  //define funcoes de modificacao
  switch (modifierName) {
    //reduz tamanho
    case 'resize1':
      obj.modFunc = new sizeDown(obj);
      break;

    //aumenta tamanho
    case 'resize2':
      obj.modFunc = new sizeUp(obj);
      break;

    //muda cor
    case 'colorize':
      obj.modFunc = new colorizeIt(obj);
      break;

    case 'select':
      obj.modFunc = new nope(obj);
      break;
  }

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

  //tratamento para modificador select
  if (modifierName == "select") {
    obj.interactive = true;
    obj.buttonMode = true;
    obj.on("pointerdown", function () {
      selectModifier(obj);
    });
  }

  return obj;
}

//define modificadores quando select
function setModifierSelect(obj, index) {
  var modifierName, modifFunc;

  if (index == 2) {
    modifierName = "resize2";
  } else {
    var objLayerModifs = levels[currentLevel].modifiers[0].options[index];

    modifierName = objLayerModifs.type;

    if (modifierName == "resize") {
      modifierName = objLayerModifs.type + objLayerModifs[Object.keys(objLayerModifs)[1]].toString();
    };
  };

  var texture = Texture.fromImage(
    "assets/imgs/" + modifierName + ".png"
  );

  obj.setTexture(texture);

  switch (modifierName) {
    case 'resize1':
      obj.modFunc = new sizeDown(obj);
      break;

    case 'resize2':
      obj.modFunc = new sizeUp(obj);
      break;

    case 'colorize':
      obj.modFunc = new colorizeIt(obj);
      break;
  }
}

//posiciona e insere objetos na cena
function setLevel() {
  scnCurrent = new Container();

  //bloco inicial
  playerBlock = new defBlock(
    levels[currentLevel].initial.size,
    levels[currentLevel].initial.color,
    1,
    1
  );

  //bloco final
  finalBlock = new defBlock(
    levels[currentLevel].final.size,
    levels[currentLevel].final.color,
    .3,
    -1
  );
  finalBlock.loopBol = false;

  //bloco transformado em azul
  playerBlockMod = new defBlock(1, '#0000ff', 1, 0);
  playerBlockMod.loopBol = false;
  playerBlockMod.x = -100;

  //titulo fase
  title = makeText(levels[currentLevel].name);

  scnCurrent.addChild(makePath());
  scnCurrent.addChild(title);

  for (var n = 0; n < levels[currentLevel].modifiers.length; n++) {
    activeModifiers.push(setModifier(levels[currentLevel].modifiers.length, n));
    scnCurrent.addChild(activeModifiers[n]);
  }

  scnCurrent.addChild(finalBlock);
  scnCurrent.addChild(playerBlockMod);
  scnCurrent.addChild(playerBlock);

  app.stage.addChild(scnCurrent);
}

//selecao de modificadores 
function selectModifier(obj) {
  setModifierSelect(obj, selectCounter);

  if (selectCounter < levels[currentLevel].modifiers[0].options.length) {
    selectCounter++
  } else {
    selectCounter = 0;
  }

}

//define proxima acao para playerBlock
function setAction(obj) {
  if (actionCounter < activeModifiers.length) {
    moveToTarget(obj, activeModifiers[actionCounter]);
    actionCounter++;
  } else {
    moveToTarget(obj, finalBlock);
  }
}

//desloca o playerBlock
function moveToTarget(obj, target) {
  TweenMax.to(obj, 1.3, {
    x: target.x,
    ease: Power1.easeInOut,
    onComplete: verifyEnd,
    onCompleteParams: [obj]
  });
}

//verifica condições para o fim da fase
function verifyEnd(obj) {
  if (obj.x == finalBlock.x) {
    end();
  } else {
    applyModify(obj);
  }
}

//aplica ações dos modificadores no playerBlock
function applyModify(obj) {
  activeModifiers[actionCounter - 1].modFunc(obj);
}

//efeito de glow
var fxGlow = function (obj) {
  var alpha = 1,
    dir = -1,
    loopFunc = setInterval(frame, 17);

  function frame() {
    obj.alpha = alpha;
    alpha += 0.01 * dir;
    if (alpha > 1 || alpha < 0.7) {
      dir = dir * -1;
    }

    if (!obj.loopBol) {
      clearInterval(loopFunc);
      obj.alpha = 1;
    }
  }
};

//metodos para modificação
var sizeUp = function (obj) {
  var ret = function (target) {
    TweenMax.to(target, 0.5, {
      height: 100,
      ease: Power2.easeOut,
      onComplete: setAction,
      onCompleteParams: [target]
    });

    obj.destroy();
  };
  return ret;
}

var sizeDown = function (obj) {
  var ret = function (target) {
    TweenMax.to(target, 0.5, {
      height: 50,
      ease: Power2.easeOut,
      onComplete: setAction,
      onCompleteParams: [target]
    });

    obj.destroy();
  };
  return ret;
}

var colorizeIt = function (obj) {
  var ret = function (target) {
    playerBlockMod.x = playerBlock.x;
    playerBlockMod.height = playerBlock.height;

    var update = function () {
      target.alpha -= 0.033;
    };

    TweenMax.to(target, 0.5, {
      onUpdate: update,
      onUpdateParams: [target],
      onComplete: clearOldPlayer,
    });

    obj.destroy();//deleta o modificador

    function clearOldPlayer() {
      playerBlock.destroy();
      setAction(playerBlockMod);
    };
  }
  return ret;
}

var nope = function (obj) {
  var ret = function (target) {
    setAction(target);
    obj.destroy();
  }
  return ret;
}