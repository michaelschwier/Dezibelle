(function() {
  // ----- Global variables -------------------------------
  var language = "de"
  var isPhoneGapApp = false;
  var lastTimeStamp = null;
  var resources;
  var audioCache = {};
  var canvas;
  var gamePhase;
  var levelCreator;
  var gameStatusCreator;
  var mouseIsPressed = false;

  // --------------------------------------------------------------------------
  function setupAudioCache()
  {
    audioCache["baby"] = new Howl({src: ["audio/Baby.mp3"]});
    audioCache["saugroboter"] = new Howl({src: ["audio/Staubsaugerroboter.mp3"]});
    audioCache["verstaerker"] = new Howl({src: ["audio/Verstaerkerturm.mp3"]});
    audioCache["dino"] = new Howl({src: ["audio/SpaceDino.mp3"]});
    audioCache["gitarre"] = new Howl({src: ["audio/Gitarrenriff.mp3"]});
    audioCache["schlagzeug"] = new Howl({src: ["audio/Schlagzeug.mp3"]});
    audioCache["garnele"] = new Howl({src: ["audio/Groelgarnelen.mp3"]});

    audioCache["radar"] = new Howl({src: ["audio/Radar.mp3"]});
    audioCache["radar"].volume(0.1);
    audioCache["lamm"] = new Howl({src: ["audio/Babylaemmchen.mp3"]});
    audioCache["lamm"].volume(0.1);
    audioCache["wurstbrot"] = new Howl({src: ["audio/silence.mp3"]});
    audioCache["wurstbrot"].volume(0.1);

    audioCache["bomb"] = new Howl({src: ["audio/Moewenpupsstinkbombe.mp3"]});
    audioCache["kotz"] = new Howl({src: ["audio/WuergKotz.mp3"]});
  }

  // --------------------------------------------------------------------------
  function resizeGame()
  {
    var gameContainer = document.getElementById('gameContainer');
    var referenceWidthToHeight = 1000 / 800;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;
    
    if (newWidthToHeight > referenceWidthToHeight) {
        gameContainer.style.height = '100vh';
        gameContainer.style.width = '125vh';
    } 
    else {
      gameContainer.style.height = '80vw';
      gameContainer.style.width = '100vw';
    }
  }

  // --------------------------------------------------------------------------
  function getTouchClientPosition(e)
  {
    var touchPos = {};
    touchPos.valid = false;
    if (e.targetTouches.length == 1) {
      var touch = event.targetTouches[0];
      touchPos.clientX = touch.clientX;
      touchPos.clientY = touch.clientY;
      touchPos.valid = true;
    }
    return touchPos;
  }
  
  function getCanvasPosition(e)
  {
    var clientRect = canvas.getBoundingClientRect();
    x = e.clientX - clientRect.left;
    y = e.clientY - clientRect.top;
    x *= canvas.width / clientRect.width;
    y *= canvas.height / clientRect.height;
    var position = {};
    position.canvasX = x;
    position.canvasY = y;
    return position;
  }
  
  function handleTouchMove(e)
  {
    e.preventDefault();
    touchPos = getTouchClientPosition(e)
    if (touchPos.valid) {
      pos = getCanvasPosition(touchPos);
      gamePhase.handleTouchMove(pos);
    }
  }

  function handleTouchStart(e)
  {
    e.preventDefault();
    touchPos = getTouchClientPosition(e)
    if (touchPos.valid) {
      pos = getCanvasPosition(touchPos);
      gamePhase.handleMouseDown(pos);
    }
  }

  function handleMouseMove(e)
  {
    e.preventDefault();
    if (mouseIsPressed) {
      pos = getCanvasPosition(e);
      gamePhase.handleTouchMove(pos);
    }
  }

  function handleMouseDown(e)
  {
    e.preventDefault();
    if (e.button == 0) {
      mouseIsPressed = true;
    }
    pos = getCanvasPosition(e);
    gamePhase.handleMouseDown(pos);
  }

  function handleMouseUp(e)
  {
    e.preventDefault();
    if (e.button == 0) {
      mouseIsPressed = false;
    }
  }
  
  // --------------------------------------------------------------------------
  function IntroPhase(titleDelay = 15/*120*/) {
    var delayUntilTitle = titleDelay;
    var startGame = false;
    document.getElementById("gameContainer").style.backgroundColor="white";
    document.getElementById("gameContainer").style.backgroundImage="url(\"images/title-01.png\")"; 

    this.handleTouchMove = function(pos)
    { }

    this.handleMouseDown = function(pos)
    { 
      if (delayUntilTitle < 0) {
        document.getElementById("gameContainer").style.backgroundImage="none"; 
        startGame = true;
        // hack to convince Safari and other browsers to play audio
        dummyAudio = new Audio("audio/silence.mp3");
        dummyAudio.play();
        setupAudioCache();
      }
    }

    this.update = function(frameTime = 0)
    {
      delayUntilTitle -= 1;
    }

    this.render = function()
    {
      if (delayUntilTitle == 0) {
        document.getElementById("gameContainer").style.backgroundImage="url(\"images/" + language + "/title-02.png?v=0.1.5\")";
      }
    }

    this.getNextGamePhase = function()
    {
      if (startGame) 
      {
        return new MainGamePhase(0);
      }
      else {
        return this;
      }
    }
  }
  
  // --------------------------------------------------------------------------
  function GamePhase(scene) 
  {
    this.scene = scene;

    this.handleTouchMove = function(pos)
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("handleTouchMove" in this.scene[key]) {
            this.scene[key].handleTouchMove(pos);
          }
        }
      }
    }

    this.handleMouseDown = function(pos)
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("handleMouseDown" in this.scene[key]) {
            this.scene[key].handleMouseDown(pos);
          }
        }
      }
    }
    
    this.update = function(frameTime = 0)
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("update" in this.scene[key]) {
            this.scene[key].update(frameTime);
          }
        }
      }
    }

    this.render = function()
    { 
      for (var key in this.scene) {
        if (this.scene[key]) {
          if ("render" in this.scene[key]) {
            this.scene[key].render(canvas.getContext("2d"));
          }
        }
      }
    }

    this.getNextGamePhase = function()
    { 
      return this;
    }
  }

  // --------------------------------------------------------------------------
  function MainGamePhase(level)
  {
    document.getElementById("gameContainer").style.backgroundColor="black";
    this.level = level;
    this.finishedDelay = 2.0;
    GamePhase.call(this, levelCreator.getScene(this.level));

    this.collisionDetection = function()
    {
      if(this.scene.volumeObject) {
        xDistToPlayer = this.scene.volumeObject.x - this.scene.player.x;
        yDistToPlayer = Math.abs(this.scene.player.y - this.scene.volumeObject.y);
        if (!this.scene.volumeObject.hasPassed() && (xDistToPlayer < 50)) {
          if (yDistToPlayer < 75) {
            if (this.scene.volumeObject instanceof Bomb) {
              this.scene.volumeObject.collision();
              if (this.scene.scoreBar.getScore() > 3) {
                this.scene.scoreBar.setScore(3);
              }
            }
            else {
            this.scene.scoreBar.updateScore(1);  
            }
            this.scene.volumeObject.catch();
            this.scene.volumeObject = null;
          }
          else {
            this.scene.volumeObject.setPassedState();
            if (!(this.scene.volumeObject instanceof Bomb)) {
              this.scene.scoreBar.updateScore(-1);
            }
          }
        }
      }
    }

    this.waitIfFinished = function(frameTime) 
    {
      if (this.scene.scoreBar.isMax() || this.scene.scoreBar.isEmpty()) {
        this.finishedDelay -= frameTime;
        if (this.scene.objectSpawner) {
          delete this.scene.objectSpawner;
        }
      }
    }

    this.super_update = this.update;
    this.update = function(frameTime)
    {
      this.collisionDetection();
      this.waitIfFinished(frameTime);
      this.super_update(frameTime);
    }

    this.getNextGamePhase = function()
    { 
      if (this.scene.scoreBar.isMax() && (this.finishedDelay < 0)) {
        return new LevelFinishedPhase(this.level);
      }
      else if (this.scene.scoreBar.isEmpty() && (this.finishedDelay < 0)) {
        // return new GameStatusPhase(this.level, this.level);
        return new MainGamePhase(this.level);
      }
      else {
        return this;
      }
    }

  }
  
  // --------------------------------------------------------------------------
  function LevelFinishedPhase(currLevel)
  {
    document.getElementById("gameContainer").style.backgroundColor="white";
    this.currLevel = currLevel;
    var scene = {}
    hamsterToken = new HamsterToken(resources);
    hamsterDriveStatus = new HamsterDriveStatus(currLevel, resources);
    scene.animationSequence = new AnimationSequence([hamsterToken, hamsterDriveStatus], false)
    // if (this.currLevel == 4) {
    //   scene.animationSequence.append(new PortrashTalks(
    //     ["motivate01"],
    //     resources));
    // }
    // else if (this.currLevel == 8) {
    //   scene.animationSequence.append(new PortrashTalks(
    //     ["motivate02"],
    //     resources));
    // }
    GamePhase.call(this, scene);

    this.getNextGamePhase = function()
    { 
      if (scene.animationSequence.isDone()) {
        nextLevel = this.currLevel + 1;
        if (nextLevel < levelDefinitions.length) {
          return new MainGamePhase(nextLevel);
        }
        else {
          return new IntroPhase();
        }
      }
      else {
        return this;
      }
    }
  }

  // --------------------------------------------------------------------------
  function getPassedFrameTimeInSeconds(timeStamp)
  {
    if (!lastTimeStamp) {
      lastTimeStamp = timeStamp;
    }
    var timePassed = (timeStamp - lastTimeStamp) / 1000.0;
    lastTimeStamp = timeStamp;
    return timePassed;
  }
  
  // --------------------------------------------------------------------------
  function gameLoop(timeStamp) 
  {
    var timePassed = getPassedFrameTimeInSeconds(timeStamp);

    window.requestAnimationFrame(gameLoop);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    gamePhase.update(timePassed);
    gamePhase.render();
    gamePhase = gamePhase.getNextGamePhase();
  }
  
  // --------------------------------------------------------------------------
  function initGame()
  {
    canvas = document.getElementById("gameCanvas");
    canvas.width = 1000;
    canvas.height = 800;

    gamePhase = new IntroPhase();

    canvas.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    levelCreator = new LevelCreator(levelDefinitions, resources, audioCache)
    // gameStatusCreator = new GameStatusCreator(levelDefinitions, resources, audioCache)
  
    gameLoop();
  }

  // --------------------------------------------------------------------------
  // START
  // --------------------------------------------------------------------------
  resizeGame();
  window.addEventListener('resize', resizeGame);
  window.addEventListener('orientationchange', resizeGame);

  language = getLanguage()
  console.log("Switching game language to", language)
  // Language agnostic images
  resources = new ResourcePreLoader();
  resources.addImage("hamster", "images/hamster_100x74x2.png")  
  resources.addImage("hamsterDriveUnit", "images/hamster-unit_100x100x2.png");
  resources.addImage("hamsterToken", "images/hamster-unit_800x800x2.png");
  resources.addImage("dezibelle", "images/Dezibelle_200x200x10.png");
  resources.addImage("baby", "images/Baby_200x200x1.png");
  resources.addImage("radar", "images/Radar_200x200x1.png");
  resources.addImage("saugroboter", "images/Saugroboter_200x200x1.png")
  resources.addImage("bombe", "images/Stinkbombe_200x200x1.png");
  resources.addImage("lamm", "images/Babylaemmchen_200x200x1.png");
  resources.addImage("gitarre", "images/Luftgitarre_200x200x1.png");
  resources.addImage("dino", "images/Spacedino_200x200x1.png")
  resources.addImage("verstaerker", "images/Verstaerkerturm_200x200x1.png");
  resources.addImage("wurstbrot", "images/Wurstbrot_200x200x1.png");
  resources.addImage("garnele", "images/Groelgarnele_200x200x1.png");
  resources.addImage("schlagzeug", "images/Schlagzeug_200x200x1.png")  
  resources.addImage("piano", "images/piano_200x200x8.png");
  resources.addImage("forte", "images/forte_200x200x8.png");
  resources.addImage("balken", "images/balken_100x500x1.png")
  // Translated Images
  resources.addImage("countdown", "images/" + language + "/countdown_800x800x3.png");
  resources.addImage("hamsterdriveTitle", "images/" + language + "/hamsterdrive_341x45x1.png");
  resources.loadAndCallWhenDone(initGame);
} ());

