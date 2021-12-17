import { MouseEvent } from 'react';
import { Button } from 'react-bulma-components';
import type { ActionProps } from 'react-querybuilder';

const BulmaActionElement = ({ className, handleOnClick, label, title, disabled }: ActionProps) => (
  <Button
    className={className}
    title={title}
    onClick={(e: MouseEvent) => handleOnClick(e)}
    size="small"
    disabled={disabled}>
    {label}
  </Button>
);

BulmaActionElement.displayName = 'BulmaActionElement';

export default BulmaActionElement;
