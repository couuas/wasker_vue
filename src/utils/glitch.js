/**
 * Dynamic Glitch Frequency Utility
 * Maps system metrics to UI effects.
 */

// Simulated internal state - in a real app, this would come from a global store or API
let agentEntropy = 0.5;

/**
 * Updates the internal entropy based on "events"
 * @param {number} delta 
 */
export const pulseEntropy = (delta = 0.1) => {
    agentEntropy = Math.min(1.0, Math.max(0.0, agentEntropy + delta));
};

/**
 * Returns glitch intensity [0.1, 2.0]
 * Driven by sine wave + agent entropy
 */
export const getGlitchIntensity = (base = 1.0) => {
  const time = Date.now() / 1000;
  // Combine a slow oscillation with the agent's internal state
  const oscillation = Math.sin(time * 0.8) * 0.3;
  const entropyEffect = (agentEntropy - 0.5) * 1.5;
  
  return Math.max(0.05, base + oscillation + entropyEffect + (Math.random() * 0.05));
};

/**
 * Probability check for glitch triggers
 * Higher entropy = higher probability
 */
export const shouldTriggerGlitch = (threshold = 0.95) => {
  const adjustedThreshold = threshold - (agentEntropy * 0.2);
  return Math.random() > adjustedThreshold;
};
