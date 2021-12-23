import type { ActionProps } from 'react-querybuilder';

export const BulmaActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
}: ActionProps) => (
  <button
    className={`${className} button is-small`}
    title={title}
    onClick={e => handleOnClick(e)}
    disabled={disabled}>
    {label}
  </button>
);

BulmaActionElement.displayName = 'BulmaActionElement';
