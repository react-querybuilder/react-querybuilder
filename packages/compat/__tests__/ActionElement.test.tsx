import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ActionWithRulesProps } from 'react-querybuilder';

export const testActionElement = (ActionElement: React.ComponentType<ActionWithRulesProps>) => {
  const componentName = ActionElement.displayName ?? 'ActionElement';

  const props: ActionWithRulesProps = {
    title: componentName,
    handleOnClick: () => {},
    className: '',
    level: 0,
    path: [],
  };

  describe(componentName, () => {
    it('should have the label passed into the <button />', () => {
      const { getByText } = render(<ActionElement {...props} label="test" />);
      expect(() => getByText('test')).not.toThrow();
    });

    it('should have the className passed into the <button />', () => {
      const { getByTitle } = render(<ActionElement {...props} className="my-css-class" />);
      expect(getByTitle(componentName).classList).toContain('my-css-class');
    });

    it('should call the onClick method passed in', () => {
      const onClick = jest.fn();
      const { getByTitle } = render(<ActionElement {...props} handleOnClick={onClick} />);
      userEvent.click(getByTitle(componentName));
      expect(onClick).toHaveBeenCalled();
    });

    it('should be disabled by disabled prop', () => {
      const onClick = jest.fn();
      const { getByTitle } = render(<ActionElement {...props} handleOnClick={onClick} disabled />);
      userEvent.click(getByTitle(componentName));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
};
