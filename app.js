/*
Author: Alessandro Siqueira
Date: 5/11/2017
Version: 1.0
Obs.: essa aplicação presisa ser executada em ambiente HTTP (servidor), se executado em modo File
aparecerá um erro de Cross origin requests no console.
Ou acesse www.state.com.br/testePushStart para visualizar em um ambiente HTTP.
*/

//setting up
var app = new PIXI.Application(800, 600, { backgroundColor: 0x000000, antialias: true });
var renderer = PIXI.autoDetectRenderer(800, 600);

//alias
const Graphics = PIXI.Graphics,
  Container = PIXI.Container,
  Text = PIXI.Text,
  Loader = PIXI.loader,
  Sprite = PIXI.Sprite,
  Texture = PIXI.Texture,
  stage = new Container();

//global vars
var levels = {},
  currentLevel = -1,
  playerBlock,
  finalBlock,
  activeModifiers = [],
  widthUnit = 50,
  pathProp = {
    pathLenght: 600,
    pathY: 300
  },
  scnCurrent = new Container(),
  actionCounter = 0,
  selectCounter = 0;

//carrega Json e inicia sprites
$.getJSON("levels.json", function (ret) {
  levels = ret;
  loadSprites();
});

//cria obj canvas na página html
document.body.appendChild(app.renderer.view);

//starting up
function setup() {
  //cria fase
  if (currentLevel >= 0) {
    setLevel();
  } else {
    intro();
  }
};

//tela de intro
function intro() {
  var bg = new Sprite.fromImage('assets/imgs/introFinal.png');
  var logo = new defLogo();
  var btPlay = new defBtPlay(1);
  var author = makeText('Author: Alessandro Siqueira - alessandro.state@gmail.com', app.view.height - 20, 11, 0, '#aaaaaa');

  bg.x = 0;
  bg.y = 0;

  logo.x = app.view.width / 2;
  logo.y = 150;

  btPlay.x = app.view.width / 2;
  btPlay.y = app.view.height - btPlay.height;

  scnCurrent.addChild(bg);
  scnCurrent.addChild(logo);
  scnCurrent.addChild(btPlay);
  scnCurrent.addChild(author);

  app.stage.addChild(scnCurrent);

  app.renderer.render(stage);
}

//tela de creditos
function credits() {
  var logo = new defLogo();
  var logo2 = new Sprite.fromImage('assets/imgs/logo2.png');;
  var thanks = makeText('Thank you for playing.', app.view.height / 2, 20, 2, '#ffffff');
  var seeAgain = makeText('See you again in:', (app.view.height / 2) + 30, 20, 2, '#ffffff');
  var btAgain = new defBtPlay(2);

  var midWidth = app.view.width / 2;

  logo.x = midWidth;
  logo.y = 150;

  logo2.anchor.set(.5, .5);
  logo2.x = midWidth;
  logo2.y = 420;
  logo2.setScale = 0;

  thanks.anchor.set(.5, .5);
  thanks.x = midWidth;

  seeAgain.anchor.set(.5, .5);
  seeAgain.x = midWidth;

  btAgain.x = midWidth;
  btAgain.y = 550;

  var update = function () {
    logo2.scale.x = logo2.setScale / 100;
    logo2.scale.y = logo2.setScale / 100;
  };

  TweenMax.fromTo(logo2, .8,
    {
      alpha: 0,
      setScale: 0,
      autoCSS: false
    },
    {
      alpha: 1,
      setScale: 50,
      roundProps: "setScale",
      onUpdate: update,
      ease: Elastic.easeInOut,
      delay: 1.5
    });

  scnCurrent.addChild(logo);
  scnCurrent.addChild(logo2);
  scnCurrent.addChild(thanks);
  scnCurrent.addChild(seeAgain);
  scnCurrent.addChild(btAgain);

  app.stage.addChild(scnCurrent);

  renderer.render(stage);
}

//cria btPlay
var defBtPlay = function (id) {
  var obj;

  switch (id) {
    case 1:
      obj = new Sprite.fromImage('assets/imgs/btPlay.png');
      break;
    case 2:
      obj = new Sprite.fromImage('assets/imgs/btAgain.png');
      break;
  }

  var setScale;

  obj.anchor.set(.5, .5);
  obj.interactive = true;
  obj.buttonMode = true;

  var update = function () {
    obj.scale.x = obj.setScale / 100;
    obj.scale.y = obj.setScale / 100;
  };

  TweenMax.fromTo(obj, .5,
    {
      setScale: 90,
      autoCSS: false
    },
    {
      setScale: 100,
      roundProps: "setScale",
      onUpdate: update,
      ease: Elastic.easeInOut,
      repeatDelay: 2,
      repeat: -1,
      yoyo: true
    });

  obj.on("pointerdown", function () {
    switch (id) {
      case 1:
        obj.interactive = false;
        obj.buttonMode = false;
        scnCurrent.addChild(fadeToBlack());
        break;

      case 2:
        obj.interactive = false;
        obj.buttonMode = false;
        currentLevel = -1;
        resetLevel();
        break;
    }

  });


  return obj;
}

function startGame() {
  currentLevel = 0;
  app.stage.removeChild(scnCurrent);
  setup();
}

//cria logo
var defLogo = function () {
  var obj = new Sprite.fromImage('assets/imgs/logo.png');
  var count = 0;

  obj.anchor.set(.5, .5);

  function loop() {
    obj.scale.x = 1 + Math.sin(count) * 0.06;
    obj.scale.y = 1 + Math.cos(count) * 0.08;

    count += 0.1;
  }

  setInterval(loop, 20);

  return obj;
}

//fim da fase ou do jogo
function end() {
  currentLevel++;
  resetLevel();
}

//cria blocos customizados
var defBlock = function (height, color, alpha, id, rotation) {
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

  if (rotation != undefined) {
    obj.rotation = rotation;
  };

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
function makeText(text, posY, size, stroke, color) {
  var style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: size,
    fontWeight: "bold",
    fill: "white",
    stroke: '#4a1850',
    strokeThickness: stroke,
    fill: [color]
  });

  var obj = new Text(text, style);

  obj.x = app.renderer.view.width / 2 - obj.width / 2;
  obj.y = posY;

  return obj;
}

//carrega imagens para sprites
function loadSprites() {
  Loader.add("assets/imgs/resize1.png")
    .add("assets/imgs/resize2.png")
    .add("assets/imgs/colorize.png")
    .add("assets/imgs/rotate.png")
    .add("assets/imgs/select.png")
    .add("assets/imgs/win.png")
    .add("assets/imgs/logo.png")
    .add("assets/imgs/logo2.png")
    .add("assets/imgs/introFinal.png")
    .add("assets/imgs/btPlay.png")
    .add("assets/imgs/btAgain.png")
    .load(setup);
}

//define modificadores e suas acoes
function setModifier(count, index) {
  var obj, modifierName, modifFunc;

  var objLayerModifs = levels[currentLevel].modifiers[index];

  modifierName = objLayerModifs.type;

  if (modifierName == 'resize') {
    modifierName = objLayerModifs.type + objLayerModifs[Object.keys(objLayerModifs)[1]].toString();
  }

  obj = new Sprite(
    Loader.resources['assets/imgs/' + modifierName + '.png'].texture
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
  if (modifierName == 'select') {
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
    if (index == 3) {
      index = 2
    };
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
    case 'rotate':
      obj.modFunc = new rotateIt(obj);
      break;
  }
}

//posiciona e insere objetos na cena
function setLevel() {

  //titulo fase
  var title = makeText(levels[currentLevel].name, 100, 42, 8, '#ffffff');

  var instructions;

  //instruções
  if (currentLevel < 4) {
    instructions = makeText('Click on the glowing block.', 160, 12, 0, '#cccccc');
  } else {
    instructions = makeText('Choose the modifiers and click on the glowing block.', 160, 12, 0, '#cccccc');
  }

  var author = makeText('Author: Alessandro Siqueira - alessandro.state@gmail.com', app.view.height - 20, 11, 0, '#aaaaaa');

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
    -1,
    levels[currentLevel].final.rotation
  );
  finalBlock.loopBol = false;

  //bloco transformado em azul
  playerBlockMod = new defBlock(1, '#0000ff', 1, 0);
  playerBlockMod.loopBol = false;
  playerBlockMod.x = -100;

  scnCurrent.addChild(makePath());
  scnCurrent.addChild(title);
  scnCurrent.addChild(instructions);
  scnCurrent.addChild(author);

  //modificadores
  for (var n = 0; n < levels[currentLevel].modifiers.length; n++) {
    activeModifiers.push(setModifier(levels[currentLevel].modifiers.length, n));
    scnCurrent.addChild(activeModifiers[n]);
  }

  scnCurrent.addChild(finalBlock);
  scnCurrent.addChild(playerBlockMod);
  scnCurrent.addChild(playerBlock);

  app.stage.addChild(scnCurrent);

  app.renderer.render(stage);
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
  TweenMax.to(obj, 1, {
    x: target.x,
    ease: Power1.easeInOut,
    onComplete: verifyEnd,
    onCompleteParams: [obj]
  });
}

//verifica condições para o fim da fase
function verifyEnd(obj) {
  if (obj.x == finalBlock.x) {//bloco chegou na final
    var origin;

    if (playerBlock) {
      origin = playerBlock;
    } else {
      origin = playerBlockMod;
    };

    //validações
    var matchColor = origin.graphicsData[0].fillColor == finalBlock.graphicsData[0].fillColor;
    var matchSize = origin.height == finalBlock.height;
    var matchRotation = origin.rotation == finalBlock.rotation;//fase bonus

    if (matchColor && matchSize && matchRotation) {
      win();
    } else {
      missIt();
    };

  } else {
    applyModify(obj);
  }
}

//aplica ações dos modificadores no playerBlock
function applyModify(obj) {

  activeModifiers[actionCounter - 1].modFunc(obj);
}

//fim de fase
function win() {
  currentLevel++;

  var obj = new Sprite(
    Loader.resources['assets/imgs/win.png'].texture
  );
  obj.setScale = 0;
  obj.anchor.set(0.5, 0.5);
  obj.scale.x = obj.setScale;
  obj.scale.y = obj.setScale;
  obj.x = app.view.width / 2;
  obj.y = app.view.height / 2;

  scnCurrent.addChild(obj);

  var update = function () {
    obj.scale.x = obj.setScale / 100;
    obj.scale.y = obj.setScale / 100;
  };

  TweenMax.fromTo(obj, .8,
    {
      setScale: 0,
      autoCSS: false
    },
    {
      setScale: 100,
      roundProps: "setScale",
      onUpdate: update,
      ease: Elastic.easeOut,
      onComplete: function () {
        setTimeout(function () {
          resetLevel();
        }, 500);
      }
    });
}

//erro no fim de fase
function missIt() {
  scnCurrent.addChild(makeText('Sorry, try again.', 230, 20, 6, '#ffffff'));

  setTimeout(function () {
    resetLevel();
  }, 1000);
}

//reset para próxima fase
function resetLevel() {
  if (currentLevel < 6) {
    app.stage.removeChild(scnCurrent);

    activeModifiers = [],
      scnCurrent = new Container(),
      actionCounter = 0,
      selectCounter = 0;

    setup();
  } else {
    scnCurrent.addChild(fadeToBlack());
  }
};

//efeito de glow
var fxGlow = function (obj) {
  var alpha = 1,
    dir = -1,
    loopFunc = setInterval(frame, 17);

  function frame() {
    obj.alpha = alpha;
    alpha += 0.015 * dir;
    if (alpha > 1 || alpha < 0.6) {
      dir = dir * -1;
    }

    if (!obj.loopBol) {
      clearInterval(loopFunc);
      obj.alpha = 1;
    }
  }
};

var fadeToBlack = function () {
  var obj = new Graphics();

  obj.beginFill("0x000000", 1);
  obj.drawRect(0, 0, app.view.width, app.view.height);
  obj.endFill();

  obj.x = 0;
  obj.y = 0;

  TweenMax.fromTo(obj, .5, {
    alpha: 0,
  }, {
      alpha: 1,
      ease: Power2.easeOut,
      onComplete: defJump
    });

  function defJump() {
    if (currentLevel < 6) {
      startGame();
    } else {
      credits();
    }
  };

  return obj;
}

//metodos para modificação
var sizeUp = function (obj) {
  var ret = function (target) {
    TweenMax.to(target, 0.5, {
      height: widthUnit * 2,
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
      height: widthUnit,
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

    if (!playerBlock) {
      setTimeout(function () {
        setAction(playerBlockMod);
      }, 500);

      obj.destroy();//deleta o modificador

    } else {
      playerBlockMod.x = playerBlock.x;
      playerBlockMod.height = playerBlock.height;
      playerBlockMod.rotation = playerBlock.rotation;

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
        playerBlock = undefined;
        setAction(playerBlockMod);
      };
    }
  }



  return ret;
}

var rotateIt = function (obj) {
  var ret = function (target) {
    TweenMax.to(target, 0.5, {
      rotation: target.rotation + 1.5708,
      ease: Power2.easeOut,
      onComplete: setAction,
      onCompleteParams: [target]
    });

    obj.destroy();
  };
  return ret;
}

var nope = function (obj) {
  var ret = function (target) {
    setAction(target);
    obj.destroy();
  }
  return ret;
}