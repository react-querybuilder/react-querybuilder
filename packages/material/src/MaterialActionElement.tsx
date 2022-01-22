import Button from '@mui/material/Button';
import type { ActionProps } from 'react-querybuilder';

const MaterialActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    variant="contained"
    color="primary"
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    size="small"
    disabled={disabled && !disabledTranslation}
    onClick={e => handleOnClick(e)}>
    {disabledTranslation && disabled ? disabledTranslation.label : label}
  </Button>
);

MaterialActionElement.displayName = 'MaterialActionElement';

export default MaterialActionElement;
