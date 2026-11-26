export function run() {
  if (Object.keys(Game.creeps).length === 0) {
    const spawn = Object.values(Game.spawns)[0];
    const result = spawn.spawnCreep([WORK, CARRY, MOVE, MOVE], `${Game.time}`);
    if (result !== OK) {
      console.log(`Failed to spawn creep with error code ${result}`);
    }
  }
}
