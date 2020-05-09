function LevelCreator(levelDefinitions, resources, audioCache)
{
  this.levelDefinitions = levelDefinitions;
  this.resources = resources;
  this.audioCache = audioCache;

  this.getScene = function(levelIdx)
  {
    if (levelIdx >= this.levelDefinitions.length) {
      levelIdx = 0
    }
    var scene = {};
    this.addControlElementsToScene(scene, levelIdx)
    this.addObjectSpawner(scene, levelIdx);
    this.addGameObjectsToScene(scene, levelIdx);
    return scene;
  }

  this.addControlElementsToScene = function(scene, levelIdx)
  {
    scene.piano = new MultiFrameAnimatedSprite({
      image: this.resources.getImage("piano"),
      x: -50,
      y: 650,
      numberOfFrames: 8,
      updateRate: 0.05
    })
    scene.forte = new MultiFrameAnimatedSprite({
      image: this.resources.getImage("forte"),
      x: -50,
      y: 50,
      numberOfFrames: 8,
      updateRate: 0.05
    })
    scene.balken = new Sprite({
      image: this.resources.getImage("balken"),
      x: 0,
      y: 190
    })    
  }

  this.addObjectSpawner = function(scene, levelIdx)
  {
    levelDef = levelDefinitions[levelIdx];
    minSpawnTime = levelDef.minSpawnTime;
    xPosition = 1100;
    images = [];
    audios = [];
    yPositions = [];
    for (var i = 0; i < levelDef.stuff.length; i++) {
      images.push(this.resources.getImage(levelDef.stuff[i].imageKey));
      audios.push(this.audioCache[levelDef.stuff[i].audioKey]);
      yPositions.push(levelDef.stuff[i].yPos);
    }
    scene.objectSpawner = new VolumeObjectSpawner(minSpawnTime, 
      images, audios, xPosition, yPositions, 
      this.resources.getImage("bombe"), audioCache["bomb"], levelDef.bombStartProbability,
      audioCache["kotz"],
      scene);
    scene.volumeObject = null;
  }

  this.addGameObjectsToScene = function(scene, levelIdx)
  {
    scene.scoreBar = new ScoreBar({
      image: this.resources.getImage("hamster"),
      x: 140,
      width: 840,
      initScore: 3
    });
    scene.player = new Dezibelle({
      image1: this.resources.getImage("dezibelle"),
      image2: this.resources.getImage("dezibellekotz")
    });
  }

}



