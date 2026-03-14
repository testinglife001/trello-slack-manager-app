// modules/canvas/crdt/versionClock.js
export default function createClock(initial = 0) {
  let version = initial;

  return {
    get: () => version,
    tick: () => ++version,
    set: (v) => (version = v)
  };
}
