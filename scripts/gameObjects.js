// --------------------------------------------------------------------------
function Dezibelle(options)
{
  MultiFrameAnimatedSprite.call(this, {
    image: options.image,
    x: options.x || 100,
    y: options.y || 550,
    numberOfFrames: 10,
    updateRate: 0.04
  });
  this.playLoop();
  this.mover = new SmoothMover(this, options.moveTime || 0.3);
  
  this.ssuper_update = this.update;
  this.update = function(frameTime = 0) 
  {
    this.mover.move(frameTime);
    this.ssuper_update(frameTime);
  }

  this.moveTo = function(y)
  {
    x = this.x;
    y = Math.min(Math.max(y, 250), 650) - 100;
    if (!this.mover.currentTargetPosEquals(x,y)) {
      this.mover.setNewTargetPos(x, y);
    }
  }

  this.isInNavigationArea = function(x, y)
  {
    if (x >= 0 
        && y >= 0 
        && x <= 300 
        && y <= 800 ) {
      return true;
    }
    else {
      return false;
    }  
  }

  this.handleTouchMove = function(pos)
  { 
    if (this.isInNavigationArea(pos.canvasX, pos.canvasY)) {
      this.moveTo(pos.canvasY);
    }
  }

  this.handleMouseDown = function(pos)
  {
    this.handleTouchMove(pos);
  }

  this.isWaiting = function()
  {
    return !this.mover.isMoving();
  }
}

// --------------------------------------------------------------------------
function VolumeObjectBase(options)
{
  Sprite.call(this, {
    image: options.image,
    x: options.x,
    y: options.y
  })
  this.audio = options.audio;

  this.update = function(frameTime)
  {
    this.mover.move(frameTime);
  }
}

// --------------------------------------------------------------------------
function VolumeObject(options)
{
  VolumeObjectBase.call(this, {
    image: options.image,
    x: options.x,
    y: options.y,
    audio: options.audio
  })
  this.minX = -200;
  this.passed = false;
  this.mover = new ConstantMover(this, 6.0 / getUrlParamAsInt("speed", 1.0));
  this.mover.setNewTargetPos(this.minX, this.y);
  this.audio.play();

  this.gone = function()
  {
    if (this.x <= this.minX) {
      this.audio.stop();
      return true;
    }
    else {
      return false;
    }
  }

  this.setPassedState = function() 
  {
    this.passed = true;
  }

  this.hasPassed = function() 
  {
    return this.passed;
  }
}

// --------------------------------------------------------------------------
function NavigationButton(options, command)
{
  Button.call(this, options, command);
  this.offsetX = this.clipWidth;
  this.clipWidth = options.width;

  this.overlay = new MultiFrameSprite({
    image: options.overlayImage,
    x: options.overlayX,
    y: options.overlayY,
    numberOfFrames: 2
  });

  this.super_update2 = this.update
  this.update = function(frameTime)
  {
    this.overlay.setCurrentFrameIdx(this.frameIndex);
    this.overlay.update(frameTime);
    this.super_update2(frameTime);
  }

  this.super_render = this.render;
  this.render = function(renderContext)
  {
    this.super_render(renderContext);
    this.overlay.render(renderContext);
  }
}

// --------------------------------------------------------------------------
function ScoreBar(options)
{
  xPos = options.x;
  width = options.width;
  this.currScore = options.initScore || 3;
  this.maxScore = 10;
  this.looseScore = 0;
  this.scorePointSprites = [];
  for (i = 0; i < this.maxScore; i++) {
    this.scorePointSprites[i] = new MultiFrameAnimatedSprite({
      image: options.image,
      x: xPos + i * ((width - 70)/(this.maxScore - 1)),
      y: 20,
      width: 70,
      height: 52,
      numberOfFrames: 2
    });
  }

  this.updateScore = function(increment) 
  {
    this.currScore += increment;
    this.currScore = this.currScore < this.looseScore ? this.looseScore : this.currScore;
    this.currScore = this.currScore > this.maxScore ? this.maxScore : this.currScore;
  }

  this.getScore = function()
  {
    return this.currScore;
  }

  this.isMax = function()
  {
    return this.currScore == this.maxScore;
  }

  this.isEmpty = function()
  {
    return this.currScore == this.looseScore;
  }

  this.update = function(framTime)
  {
    for (i = 0; i < this.maxScore; i++) {
      if (i < this.currScore) {
        this.scorePointSprites[i].setCurrentFrameIdx(1);
      }
      else {
        this.scorePointSprites[i].setCurrentFrameIdx(0);
      }
      this.scorePointSprites[i].update(framTime);
    }
  }

  this.render = function(renderContext)
  {
    for (i = 0; i < this.maxScore; i++) {
      this.scorePointSprites[i].render(renderContext);
    }
  }
}

