import type { NotToggleProps } from '../types';

const NotToggle = ({ className, handleOnChange, title, label, checked }: NotToggleProps) => (
  <label className={className} title={title}>
    <input type="checkbox" onChange={(e) => handleOnChange(e.target.checked)} checked={!!checked} />
    {label}
  </label>
);

NotToggle.displayName = 'NotToggle';

export default NotToggle;
