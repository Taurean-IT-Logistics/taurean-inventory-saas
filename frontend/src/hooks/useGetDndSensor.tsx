import {
  useSensor,
  useSensors,
  MouseSensor,
  PointerSensor,
  KeyboardSensor,
  TouchSensor
} from '@dnd-kit/core';

import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import is from 'is_js';

export const useGetDndSensor = () => {
  const webSensor = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 300, distance: 0, tolerance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const mobileSensor = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 10
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  return is.mobile() ? mobileSensor : webSensor;
};
