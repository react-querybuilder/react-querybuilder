import { standardClassnames } from '../defaults';
import { DragHandleProps } from '../types';
import { c } from '../utils';

const DragHandle = ({ schema: { classNames } }: DragHandleProps) => {
  const className = c(standardClassnames.dragHandle, classNames.dragHandle);

  return <span className={className}>☰</span>;
};

DragHandle.displayName = 'DragHandle';

export default DragHandle;
