import { describe, it, expect } from 'vitest';
import { getScenario, DEFAULT_SCENARIO_ID, SCENARIOS } from '@/domain/scenarios';

describe('scenarios', () => {
  it('DEFAULT_SCENARIO_ID существует в реестре', () => {
    expect(SCENARIOS[DEFAULT_SCENARIO_ID]).toBeDefined();
  });

  it('getScenario возвращает сценарий по id', () => {
    const s = getScenario(DEFAULT_SCENARIO_ID);
    expect(s.id).toBe(DEFAULT_SCENARIO_ID);
    expect(s.steps.length).toBeGreaterThan(0);
  });

  it('getScenario бросает ошибку на неизвестный id', () => {
    expect(() => getScenario('unknown')).toThrow();
  });

  it('все шаги имеют валидные этажи', () => {
    const s = getScenario(DEFAULT_SCENARIO_ID);
    for (const step of s.steps) {
      expect(step.from).toBeGreaterThanOrEqual(0);
      expect(step.from).toBeLessThan(25);
      for (const to of step.to) {
        expect(to).toBeGreaterThanOrEqual(0);
        expect(to).toBeLessThan(25);
      }
      expect(step.timeMs).toBeGreaterThanOrEqual(0);
    }
  });
});