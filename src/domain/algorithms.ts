import type { Algorithm, AlgorithmId } from './types';

// Реестр алгоритмов. Описания живут здесь, а не в UI.

export const ALGORITHMS: Record<AlgorithmId, Algorithm> = {
  nearest: {
    id: 'nearest',
    name: 'Ближайший доступный',
    description:
      'Выбирает ближайший свободный лифт. Оптимален при малой нагрузке, ' +
      'но может быть неэффективен при большом количестве вызовов, ' +
      'так как не учитывает долгосрочные очереди.',
  },
  totalTime: {
    id: 'totalTime',
    name: 'Прогнозирующий по полному времени',
    description:
      'Прогнозирует полное время завершения поездки для каждого лифта ' +
      '(с учётом текущей очереди и остановок) и выбирает минимальное. ' +
      'Снижает среднее время ожидания в пиковые нагрузки.',
  },
};

export function getAlgorithm(id: AlgorithmId): Algorithm {
  return ALGORITHMS[id];
}

export function getAllAlgorithms(): Algorithm[] {
  return Object.values(ALGORITHMS);
}