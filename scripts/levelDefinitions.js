levelDefinitions = [
  {
    name: "Level 1",
    minSpawnTime: 3.0 / getUrlParamAsInt("speed", 1.0),
    bombStartProbability: 0.01,
    stuff: [
      {
        imageKey: "baby",
        yPos: 150,
        audioKey: "c1"
      },
      {
        imageKey: "radar",
        yPos: 550,
        audioKey: "c2"
      }
    ]
  },
  {
    name: "Level 2",
    minSpawnTime: 3.0 / getUrlParamAsInt("speed", 1.0),
    bombStartProbability: 0.2,
    stuff: [
      {
        imageKey: "baby",
        yPos: 150,
        audioKey: "c1"
      },
      {
        imageKey: "saugroboter",
        yPos: 150,
        audioKey: "c1"
      },
      {
        imageKey: "radar",
        yPos: 550,
        audioKey: "c2"
      }
    ]
  },
]
