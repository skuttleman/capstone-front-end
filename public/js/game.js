const BLOCK_SIZE = 50, REGULAR_SPEED = 5, MOVE_CHUNK = 2, MAX_MESSAGE_LENGTH = 8;
window.methods = {};

function displayGame(gameData, user, Ajax, finish) {
  if (user.id == gameData.player1.id) {
    var thisPlayer = 1;
    var otherPlayer = 2;
  } else {
    thisPlayer = 2;
    otherPlayer = 1;
  }
  gameData.thisPlayer = thisPlayer;
  if (gameData.game_status != 'player' + thisPlayer + ' turn' && gameData.game_status != 'completed') {
    return finish(gameData.game_status);
  }

  gameData.next_message = [];
  var gameVars = {
    state: gameData['player' + thisPlayer + '_state'],
    lastMessage: { message: gameData.last_message || [] },
    nextMessage: { message: gameData.next_message },
    player: null, cursors: null, movables: []
  };
  gameVars.watchListTracker = (gameVars.state.watchList || []).map(()=> new Object);

  cleanAndSetup(gameVars.state, ['assets', 'sprites'], true);
  cleanAndSetup(gameVars.state, ['animations', 'playAnimations']);

  if (window.game) {
    destroy(window.game);
  }

  gameVars.game = new Phaser.Game(800, 450, Phaser.AUTO, 'game-container', {
    preload: preload(gameVars),
    create: create(gameVars),
    update: update(gameVars)
  });
  window.game = gameVars.game;

  methods.deepUpdate = (function _deepUpdate(data, keyString, value) {
    if (!keyString || !data) return;
    var keys = keyString.split('.');
    var key = keys.shift();
    if (keys.length == 0) {
      data[key] = value;
    } else {
      if (!data[key]) data[key] = {};
      _deepUpdate(data[key], keys.join('.'), value);
    }
  }).bind(null, gameData);

  methods.deepCompare = (function _deepCompare(data, keyString) {
    if (!keyString || !data) return;
    var keys = keyString.split('.');
    var key = keys.shift();
    if (keys.length == 0) {
      return data[key];
    } else {
      if (!data[key]) return null;
      else return _deepCompare(data[key], keys.join('.'));
    }
  }).bind(null, gameData);

  window.sendBack = (function(data, id, Ajax, finish, completed) {
    data.last_message = data.next_message;
    ['next_message', 'id', 'thisPlayer'].forEach(property => delete data[property]);
    var move = (id == 'mock1' || id == 'mock2') ? id : 'move/' + id;
    Ajax.put(window.SERVER_HOST + '/api/v1/games/' + move, { state: data, completed: completed })
    .then(function() {
      delete methods.sendBack;
      delete methods.deepUpdate;
      delete window.pushToMessage;
      delete window.popMessage;
      finish(completed);
    });
  }).bind(null, gameData, gameData.id, Ajax, finish);

  methods.specifyUpdate = function(func) {
    return func(gameData);
  };

  window.pushToMessage = line => {
    var message = gameVars.nextMessage.message;
    if (message.length < MAX_MESSAGE_LENGTH) {
      message.push(line);
      return true;
    }
    return false;
  };

  window.popMessage = () => gameVars.nextMessage.message.pop();
}

function preload(gameVars) {
  return function() {
    (gameVars.state.checkOnLoad || []).forEach(function(check) {
      if (check && check.verify && check.verify.every(verify=> methods.deepCompare(verify.address) == verify.shouldBe)) {
        (check.targets || []).forEach(function(target) {
          (target.addresses || []).forEach(address=> methods.deepUpdate(address, target.value));
        });
      }
    });
    gameVars.cursors = gameVars.game.input.keyboard.createCursorKeys();
    gameVars.mouse = gameVars.game.input.mouse;
    gameVars.state.assets.forEach(function(asset) {
      gameVars.game.load[asset.type].apply(gameVars.game.load, asset.args);
    });
  };
}

function create(gameVars) {
  return function() {
    gameVars.state.sprites.forEach(function(sprite) {
      var object = gameVars.game.add[sprite.type].apply(gameVars.game.add, sprite.args);
      object.custom = sprite.properties;
      if (sprite.args.indexOf('player') >= 0) {
        gameVars.player = object;
        // gameVars.game.physics.arcade.enable(gameVars.player);
      } else if (sprite.args.find((item) => String(item).indexOf('object') >= 0)) {
        gameVars.movables.push(object);
      }
    });
    Object.keys(gameVars.state.animations).forEach(function(key) {
      gameVars.state.animations[key].forEach(function(args) {
        if (gameVars.player && key === 'player') {
          gameVars.player.animations.add.apply(gameVars.player.animations, args);
        } else {
          var object = gameVars.movables.find(movable => movable.custom.name === key);
          if (object) {
            object.animations.add.apply(object.animations, args);
          }
        }
      });
    });
    Object.keys(gameVars.state.playAnimations).forEach(function(key) {
      if (key == 'player') {
        gameVars.player.animations.play(gameVars.state.playAnimations.player);
      } else {
        var object = gameVars.movables.find(movable => movable.custom.name == key);
        if (object) {
          object.animations.play(gameVars.state.playAnimations[key]);
        }
      }
    });
    gameVars.lastMessage.graphics = gameVars.game.add.graphics();
    gameVars.nextMessage.graphics = gameVars.game.add.graphics();
    if (gameVars.state.worldBounds) {
      gameVars.game.world.setBounds.apply(gameVars.game.world, gameVars.state.worldBounds);
      gameVars.game.camera.follow(gameVars.player);
    }

    var position, drawing;
    gameVars.game.input.addMoveCallback(function(pointer) {
      position = { x: pointer.worldX, y: pointer.worldY };
      if (pointer.isMouse) {
        if (pointer.isDown && !drawing) {
          drawing = window.pushToMessage({
            start: position, end: position, color: getElementValue('line-color')
          });
        } else if (drawing) {
          gameVars.nextMessage.message[gameVars.nextMessage.message.length - 1].end = position;
        }
        if (!pointer.isDown && drawing) {
          drawing = false;
        }
      }
    });
  };
}

function update(gameVars) {
  var moving, amount;
  return function() {
    drawMessage(gameVars, 'lastMessage');
    drawMessage(gameVars, 'nextMessage');
    manageWatchList(gameVars);

    if (gameVars.player && gameVars.cursors && !moving) {
      if (gameVars.cursors.left.isDown) {
        amount = { x: -50 };
      } else if (gameVars.cursors.right.isDown) {
        amount = { x: 50 };
      } else if (gameVars.cursors.up.isDown) {
        amount = { y: -50 };
      } else if (gameVars.cursors.down.isDown) {
        amount = { y: 50 };
      }
      if (amount) {
        moving = true;
        var eitherWay = function() {
          amount = null;
          moving = false;
        };
        moveIfPossible(gameVars.player, amount, gameVars.state.level, gameVars.movables)
        .then(eitherWay).catch(eitherWay);
      }
    }
  };
}

function cleanAndSetup(state, properties, setupArray) {
  properties.forEach(function(property) {
    state[property] = state[property] || (setupArray ? [] : {});
  });
}

function moveThing(thing, position, speed, level, movables) {
  return new Promise(function(resolve) {
    (function mover() {
      var levelSpot = {
        x: thing.x / BLOCK_SIZE,
        y: thing.y / BLOCK_SIZE
      };
      var x = ((position.x - levelSpot.x) / Math.abs(position.x - levelSpot.x)) || 0;
      var y = ((position.y - levelSpot.y) / Math.abs(position.y - levelSpot.y)) || 0;
      thing.x += x * MOVE_CHUNK;
      thing.y += y * MOVE_CHUNK;
      if (levelSpot.x != position.x || levelSpot.y != position.y) {
        setTimeout(mover, speed);
      } else {
        methods.specifyUpdate(thingUpdatePosition(thing, thing.x, thing.y));
        resolve({ thing: thing, level: level, movables: movables });
      }
    })();
  });
}

function moveIfPossible(player, amount, level, movables) {
  var position = {
    x: (player.x + (amount.x || 0)) / BLOCK_SIZE,
    y: (player.y + (amount.y || 0)) / BLOCK_SIZE
  };
  return Promise.resolve(canItMoveTo(player, position, level, movables));
}

function canItMoveTo(thing, position, level, movables) {
  var movable = getMovableAt(movables, position), blocked;
  var relative = {
    x: (position.x * BLOCK_SIZE) - thing.position.x,
    y: (position.y * BLOCK_SIZE) - thing.position.y
  };
  var actionable = level[position.y][position.x] ? level[position.y][position.x].action : null;
  if (thing.custom) {
    blocked = thing.custom.blocks.indexOf(actionable) >= 0 ||
      (!!thing.custom.move.x !== !!relative.x && !!thing.custom.move.y !== !!relative.y);
  } else {
    blocked = actionable === 'block';
  }
  if (blocked) {
    return Promise.reject();
  } else if (movable && !movable.custom.immovable) {
    var nextPosition = {
      x: position.x + (position.x - thing.x / BLOCK_SIZE),
      y: position.y + (position.y - thing.y / BLOCK_SIZE)
    };
    return canItMoveTo(movable, nextPosition, level, movables).then(function() {
      return moveThing(thing, position, REGULAR_SPEED, level, movables).then(runTriggers);
    });
  } else {
    return moveThing(thing, position, REGULAR_SPEED, level, movables).then(runTriggers);
  }
}

function getMovableAt(movables, position) {
  return movables.find(function(movable) {
    return movable.position.x == position.x * BLOCK_SIZE && movable.position.y == position.y * BLOCK_SIZE;
  });
}

var triggerActions = {
  cycle: function(thing) {
    var cycles = thing.custom.cycles;
    methods.deepUpdate(cycles.thisAddress, cycles.cycles[cycles.next].thisValue);
    methods.deepUpdate(cycles.otherAddress, cycles.cycles[cycles.next].otherValue);
    thing.animations.play(cycles.cycles[cycles.next++].name);
    if (cycles.next >= cycles.cycles.length) cycles.next = 0;
  },
  teleportThing(thing, spot) {
    if (spot.location && spot.location.hasOwnProperty('x')) {
      thing.x = spot.location.x;
    }
    if (spot.location && spot.location.hasOwnProperty('y')) {
      thing.y = spot.location.y;
    }
    methods.specifyUpdate(thingUpdatePosition(thing, thing.x, thing.y));
  },
  enterExit: function(which, thing, movables) {
    (thing[which].deepUpdates || []).forEach(function(update) {
      (update.addresses || []).forEach(function(address) {
        methods.deepUpdate(address, update.value);
      });
    });
    Object.keys(thing[which].animations || {}).forEach(function(key) {
      var movable = movables.find(movable=> movable.custom.name == key);
      if (movable) {
        movable.play(thing[which].animations[key]);
      }
    });
  },
  win: function() {
    console.log('you win');
    window.sendBack(true);
  }
};

function runTriggers(args) {
  var thing = args.thing;
  var level = args.level;
  var movables = args.movables;

  var levelPosition = {
    x: thing.position.x / BLOCK_SIZE,
    y: thing.position.y / BLOCK_SIZE
  };

  var spot = level[levelPosition.y][levelPosition.x];
  if (spot && spot.effectors && spot.effectors.find(effector => effector == thing.custom.type)) {
    spot.targets.forEach(function(target) {
      if (target == thing.custom.name) var real = thing;
      else real = movables.find(movable => movable.custom.name == target);
      if (real && real.custom && real.custom.action && triggerActions[real.custom.action]) {
        // triggerActions[real.custom.action](real, spot, thing.position);
        triggerActions[real.custom.action](real, spot, thing.address);
      } else if (spot.action && triggerActions[spot.action]) {
        // triggerActions[spot.action](real, spot, thing.position);
        triggerActions[spot.action](real, spot, thing.address);
      }
    });
  }
  return Promise.resolve(args);
}

function drawMessage(gameVars, property) {
  const LINE_WIDTH = 7;
  var graphics = gameVars[property].graphics;
  var message = gameVars[property].message;
  var alpha = getElementValue(property.substr(0, 4) + '-alpha') / 100;
  if (graphics && message) {
    graphics.clear();
    message.forEach(drawLine(graphics, alpha, LINE_WIDTH));
  }
}

function drawLine(graphics, alpha, LINE_WIDTH) {
  return function(line) {
    graphics.beginFill();
    graphics.lineStyle(LINE_WIDTH, line.color, alpha);
    graphics.moveTo(line.start.x, line.start.y);
    graphics.lineTo(line.end.x, line.end.y);
    graphics.drawCircle(line.start.x, line.start.y, 0.001);
    graphics.drawCircle(line.end.x, line.end.y, 0.001);
    graphics.endFill();
  };
}

function thingUpdatePosition(thing, x, y) {
  return function(data) {
    args = data['player' + data.thisPlayer + '_state'].sprites.find(function(sprite) {
      return sprite.properties && sprite.properties.name == thing.custom.name;
    }).args;
    args[0] = x;
    args[1] = y;
  };
}

function manageWatchList(gameVars) {
  var watchList = gameVars.state.watchList;
  gameVars.watchListTracker.forEach(function(watch, i) {
    var watchable = gameVars.state.level[watchList[i].y][watchList[i].x];
    var entered = watch.entered;
    var compared = comparePositions(gameVars.player, watchList[i], BLOCK_SIZE);
    if (!entered && compared) {
      watch.entered = true;
      watchable && triggerActions.enterExit('onPlayerEnter', watchable, gameVars.movables);
    } else if (entered && !compared) {
      watch.entered = false;
      watchable && triggerActions.enterExit('onPlayerExit', watchable, gameVars.movables);
    }
  });
}

function comparePositions(position1, position2, divide1By, divide2By) {
  divide1By = divide1By || 1;
  divide2By = divide2By || 1;
  var matchX = position1.x / divide1By == position2.x / divide2By;
  var matchY = position1.y / divide1By == position2.y / divide2By;
  return matchX && matchY;
}

function getElementValue(id) {
  var element = document.getElementById(id);
  return element && Number(element.value);
}

function destroy(game) {
  if (game) game.destroy();
  var canvas = document.querySelector('canvas');
  if (canvas) canvas.parentNode.removeChild(canvas);
}
