const LOG_INTERVAL = 100;

export function run() {
  if (Game.time % LOG_INTERVAL === 0) {
    console.log(`CPU Used: ${Game.cpu.getUsed()}, CPU Limit: ${Game.cpu.limit}, CPU Bucket: ${Game.cpu.bucket}`);
    for (const room of Object.values(Game.rooms)) {
      const controller = room.controller;
      if (controller && controller.my) {
        console.log(
          `Controller Room: ${room.name}, Controller Level: ${controller.level}, Controller Progress: ${controller.progress} / ${controller.progressTotal}`
        );
      }
    }
  }
}
