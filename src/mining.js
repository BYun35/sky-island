export const MINING_DURATION_MS = Object.freeze({ dirt: 900, stone: 2000 });

export function startMining(type) {
  const durationMs = MINING_DURATION_MS[type];
  if (durationMs === undefined) throw new Error(`Unsupported mining block: ${type}`);
  return { type, durationMs, elapsedMs: 0, crackStage: 0, broken: false };
}

export function advanceMining(session, deltaMs) {
  if (session.broken) return session;
  const elapsedMs = Math.min(session.durationMs, session.elapsedMs + Math.max(0, deltaMs));
  const broken = elapsedMs >= session.durationMs;
  return {
    ...session,
    elapsedMs,
    crackStage: broken ? 9 : Math.min(9, Math.floor((elapsedMs / session.durationMs) * 10)),
    broken,
  };
}

export function cancelMining() {
  return null;
}
