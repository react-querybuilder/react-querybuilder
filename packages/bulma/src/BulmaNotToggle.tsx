import { Form } from 'react-bulma-components';
import type { NotToggleProps } from 'react-querybuilder';

const { Checkbox, Control } = Form;

const BulmaNotToggle = ({
  className,
  handleOnChange,
  label,
  checked,
  title,
  disabled,
}: NotToggleProps) => (
  <Control title={title}>
    <Checkbox
      className={className}
      disabled={disabled}
      checked={checked}
      onChange={e => handleOnChange(e.target.checked)}>
      {label}
    </Checkbox>
  </Control>
);

BulmaNotToggle.displayName = 'BulmaNotToggle';

export default BulmaNotToggle;
