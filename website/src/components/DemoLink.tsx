export const DemoLink = ({
  option,
  disabled = false,
  text,
}: {
  option: string;
  disabled?: boolean;
  text?: string;
}) => (
  <a href={`/demo#${option}=${!disabled}`}>
    {text ? text : `Click here for demo${disabled ? ' with this feature disabled' : ''}`}
  </a>
);
