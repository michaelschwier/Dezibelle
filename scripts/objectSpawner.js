function VolumeObjectSpawner(minSpawnTime, 
  images, audios, xPosition, yPositions, 
  bombImg, bombAudio, bombProbability, 
  scene)
{
  this.minSpawnTime = minSpawnTime;
  this.timeSinceLastSpawn = 0.0;
  this.images = images;
  this.audios = audios;
  this.xPosition = xPosition;
  this.yPositions = yPositions;
  this.bombImg = bombImg;
  this.bombAudio = bombAudio;
  this.bombProbability = bombProbability;
  this.scene = scene;
  this.shuffledIndexList = []

  this.update = function(frameTime)
  {
    if (!this.scene.volumeObject || this.scene.volumeObject.gone()) {
      this.timeSinceLastSpawn += frameTime;
      if (this.timeSinceLastSpawn > this.minSpawnTime) {
        if (Math.random() < this.bombProbability) {
          this.spawnBomb();
        }
        else {
          this.spawnNewVolumeObject();
        }
        this.timeSinceLastSpawn = 0;
      }
    }  
  }

  this.spawnBomb = function()
  {
    yPos = 150;
    if (Math.random() < 0.5) {
      yPos = 550;
    }
    this.scene.volumeObject = new Bomb({
      image: this.bombImg, 
      x: this.xPosition,
      y: yPos,
      audio: this.bombAudio
    });
  }

  this.spawnNewVolumeObject = function()
  {
    var choice = this.getRandomIndex();
    var img = this.images[choice];
    var audio = this.audios[choice];
    var xPosition = this.xPosition;
    var yPosition = this.yPositions[choice];
    this.scene.volumeObject = new VolumeObject({
      image: img, 
      x: xPosition,
      y: yPosition,
      audio: audio
    });
    if (yPosition == 150 && this.scene.forte) {
      this.scene.forte.playLoop(4, true)
    }
    else if (yPosition == 550 && this.scene.piano) {
      this.scene.piano.playLoop(4, true)
    }
  }

  this.getRandomIndex = function()
  {
    if (this.shuffledIndexList.length <= 0) {
      this.shuffledIndexList = this.createShuffledIndexList(this.images.length);
    }
    return this.shuffledIndexList.pop();
  }

  this.createShuffledIndexList = function(size)
  {
    indexList = [];
    for (var n = 0; n < size; n++) {
      indexList.push(n);
    }
    var j, x, i;
    for (i = indexList.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = indexList[i];
      indexList[i] = indexList[j];
      indexList[j] = x;
    }
    return indexList;
  }
}