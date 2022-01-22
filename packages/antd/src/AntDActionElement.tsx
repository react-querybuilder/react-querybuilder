import { Button } from 'antd';
import type { ActionProps } from 'react-querybuilder';

const AntDActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    type="primary"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={e => handleOnClick(e)}
    disabled={disabled && !disabledTranslation}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

AntDActionElement.displayName = 'AntDActionElement';

export default AntDActionElement;
