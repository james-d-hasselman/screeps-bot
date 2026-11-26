export function run(creep: Creep) {
  if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
    creep.memory.working = false;
  } else if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
    creep.memory.working = true;
  }

  if (creep.memory.working) {
    if (creep.room.controller) {
      const result = creep.upgradeController(creep.room.controller);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
  } else {
    const sources = creep.room.find(FIND_SOURCES_ACTIVE);
    if (sources.length > 0) {
      const source = sources[0];
      const result = creep.harvest(source);
      if (result === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
}
