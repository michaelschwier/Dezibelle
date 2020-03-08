function VolumeObjectSpawner(minSpawnTime, images, audios, xPosition, yPositions, scene)
{
  this.minSpawnTime = minSpawnTime;
  this.timeSinceLastSpawn = 0.0;
  this.images = images;
  this.audios = audios;
  this.xPosition = xPosition;
  this.yPositions = yPositions;
  this.scene = scene;
  this.shuffledIndexList = []

  this.update = function(frameTime)
  {
    if (!this.scene.volumeObject || this.scene.volumeObject.gone()) {
      this.timeSinceLastSpawn += frameTime;
      if (this.timeSinceLastSpawn > this.minSpawnTime) {
        var choice = this.getRandomIndex();
        var img = this.images[choice];
        var audio = this.audios[choice];
        var xPosition = this.xPosition;
        if (this.scene.scoreBar) {
          xPosition -= this.scene.scoreBar.getScore() * 10;
        }
        this.scene.volumeObject = new VolumeObject({
          image: img, 
          x: xPosition,
          y: yPositions[choice],
          audio: audio
        });
        this.timeSinceLastSpawn = 0;
      }
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