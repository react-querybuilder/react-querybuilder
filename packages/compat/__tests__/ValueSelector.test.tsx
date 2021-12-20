import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ValueSelectorProps } from 'react-querybuilder';
import { findSelect } from './utils';

export const testValueSelector = (ValueSelector: React.ComponentType<ValueSelectorProps>) => {
  const componentName = ValueSelector.displayName ?? 'ValueSelector';

  const props: ValueSelectorProps = {
    handleOnChange: () => {},
    title: componentName,
    options: [
      { name: 'foo', label: 'foo label' },
      { name: 'bar', label: 'bar label' },
    ],
    level: 0,
    path: [],
  };

  describe(componentName, () => {
    it('should have the options passed into the <select />', () => {
      const { getByTitle } = render(<ValueSelector {...props} />);
      expect(getByTitle(componentName).querySelectorAll('option')).toHaveLength(2);
    });

    it('should have the value passed into the <select />', () => {
      const { getByTitle } = render(<ValueSelector {...props} value="foo" />);
      expect(findSelect(getByTitle(componentName)).value).toBe('foo');
    });

    it('should have the className passed into the <select />', () => {
      const { getByTitle } = render(<ValueSelector {...props} className="foo" />);
      expect(getByTitle(componentName).classList).toContain('foo');
    });

    it('should call the onChange method passed in', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(<ValueSelector {...props} handleOnChange={onChange} />);
      userEvent.selectOptions(findSelect(getByTitle(componentName)), 'foo');
      expect(onChange).toHaveBeenCalled();
    });

    it('should be disabled by the disabled prop', () => {
      const onChange = jest.fn();
      const { getByTitle } = render(
        <ValueSelector {...props} handleOnChange={onChange} disabled />
      );
      userEvent.selectOptions(findSelect(getByTitle(componentName)), 'foo');
      expect(onChange).not.toHaveBeenCalled();
    });
  });
};
