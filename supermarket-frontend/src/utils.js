// src/utils.js

// Δημιουργία μοναδικού κωδικού παραγγελίας
export function generateOrderCode() {
  // Παράδειγμα: ORD-8K3Z1Q-4M7
  const part1 = Math.random().toString(36).slice(2, 8).toUpperCase();
  const part2 = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `ORD-${part1}-${part2}`;
}
