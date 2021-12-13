import type { ActionProps } from '../types';

const ActionElement = ({ className, handleOnClick, label, title, disabled }: ActionProps) => (
  <button disabled={disabled} className={className} title={title} onClick={e => handleOnClick(e)}>
    {label}
  </button>
);

ActionElement.displayName = 'ActionElement';

export default ActionElement;
