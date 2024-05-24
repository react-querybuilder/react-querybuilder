import * as React from 'react';
import type { DndDropTargetType, DropEffect, Path } from 'react-querybuilder';

export type GenericDropTargetProps = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: (typeof import('react-dnd'))['useDrop'];
  path: Path;
  type: DndDropTargetType;
  dropEffect: DropEffect;
};

export const GenericDropTarget = ({ useDrop, path, type, dropEffect }: GenericDropTargetProps) => {
  const [{ dropMonitorId }] = useDrop!(() => ({
    accept: ['rule', 'ruleGroup'],
    canDrop: () => true,
    collect: monitor => ({
      isOver: monitor.canDrop() && monitor.isOver(),
      dropMonitorId: monitor.getHandlerId() ?? '',
      dropEffect: (monitor.getDropResult() ?? {}).dropEffect,
    }),
    drop: () => ({ path, type, dropEffect }),
  }));

  return (
    <div
      data-testid={type === 'rule' ? 'rule' : /* istanbul ignore next */ 'rule-group'}
      data-dropmonitorid={dropMonitorId}>
      DnD
    </div>
  );
};
