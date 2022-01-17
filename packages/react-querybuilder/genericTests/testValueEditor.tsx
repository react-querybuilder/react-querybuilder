import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NameLabelPair, OptionGroup, ValueEditorProps } from '../src/types';
import { defaultValueSelectorProps, testSelect } from './testValueSelector';
import { errorMessageIsAboutPointerEventsNone, findInput } from './utils';

type ValueEditorTestsToSkip = Partial<{
  def: boolean;
  select: boolean;
  checkbox: boolean;
  radio: boolean;
}>;
interface ValueEditorAsSelectProps extends ValueEditorProps {
  values: NameLabelPair[] | OptionGroup[];
  testID: string;
}

export const defaultValueEditorProps: ValueEditorProps = {
  field: 'TEST',
  fieldData: { name: 'TEST', label: 'Test' },
  operator: '=',
  handleOnChange: () => {},
  level: 0,
  path: [],
};

export const testValueEditor = (
  ValueEditor: React.ComponentType<ValueEditorProps>,
  skip: ValueEditorTestsToSkip = {}
) => {
  const title = ValueEditor.displayName ?? 'ValueEditor';
  const props = { ...defaultValueEditorProps, title };

  describe(title, () => {
    (skip.def ? describe.skip : describe)('when using default rendering', () => {
      it('should have the value passed into the <input />', () => {
        const { getByTitle } = render(<ValueEditor {...props} value="test" />);
        expect(findInput(getByTitle(title))).toHaveValue('test');
      });

      it('should render nothing for operator "null"', () => {
        const { getByTitle } = render(<ValueEditor {...props} operator="null" />);
        expect(() => getByTitle(title)).toThrow();
      });

      it('should render nothing for operator "notNull"', () => {
        const { getByTitle } = render(<ValueEditor {...props} operator="notNull" />);
        expect(() => getByTitle(title)).toThrow();
      });

      it('should call the onChange method passed in', () => {
        const onChange = jest.fn();
        const { getByTitle } = render(<ValueEditor {...props} handleOnChange={onChange} />);
        userEvent.type(findInput(getByTitle(title)), 'foo');
        expect(onChange).toHaveBeenCalledWith('foo');
      });

      it('should make the inputType "text" if operator is "between" or "notBetween"', () => {
        const { getByTitle } = render(
          <ValueEditor {...props} inputType="number" operator="between" />
        );
        expect(findInput(getByTitle(title))).toHaveAttribute('type', 'text');
      });

      it('should set the value to "" if operator is not "between" or "notBetween" and inputType is "number" and value contains a comma', () => {
        const handleOnChange = jest.fn();
        const { rerender } = render(
          <ValueEditor
            {...props}
            inputType="number"
            operator="between"
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        rerender(
          <ValueEditor
            {...props}
            inputType="number"
            operator="notBetween"
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        expect(handleOnChange).not.toHaveBeenCalledWith('');
        rerender(
          <ValueEditor
            {...props}
            inputType="number"
            operator="="
            value="12,14"
            handleOnChange={handleOnChange}
          />
        );
        expect(handleOnChange).toHaveBeenCalledWith('');
      });
    });

    if (!skip.select) {
      const valueEditorAsSelectProps: ValueEditorAsSelectProps = {
        ...defaultValueEditorProps,
        type: 'select',
        values: defaultValueSelectorProps.options,
        title,
        testID: 'value-editor',
      };
      testSelect(title, ValueEditor, valueEditorAsSelectProps);
    }

    (skip.checkbox ? describe.skip : describe)('when rendering a checkbox', () => {
      it('should render the checkbox and react to changes', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} />
        );
        expect(() => findInput(getByTitle(title))).not.toThrow();
        expect(findInput(getByTitle(title))).toHaveAttribute('type', 'checkbox');
        userEvent.click(findInput(getByTitle(title)));
        expect(handleOnChange).toHaveBeenCalledWith(true);
      });

      it('should be disabled by the disabled prop', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} disabled />
        );
        expect(findInput(getByTitle(title))).toBeDisabled();
        try {
          userEvent.click(findInput(getByTitle(title)));
        } catch (e: any) {
          if (!errorMessageIsAboutPointerEventsNone(e)) {
            throw e;
          }
        }
        expect(handleOnChange).not.toHaveBeenCalled();
      });
    });

    (skip.radio ? describe.skip : describe)('when rendering a radio button set', () => {
      it('should render the radio buttons with labels', () => {
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="radio"
            values={[
              { name: 'test1', label: 'Test 1' },
              { name: 'test2', label: 'Test 2' },
            ]}
          />
        );
        const radioButtons = getByTitle(title).querySelectorAll('input[type="radio"]');
        expect(radioButtons).toHaveLength(2);
        radioButtons.forEach(r => {
          expect(r).toHaveAttribute('type', 'radio');
        });
      });

      it('should call the onChange handler', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="radio"
            handleOnChange={handleOnChange}
            values={[
              { name: 'test1', label: 'Test 1' },
              { name: 'test2', label: 'Test 2' },
            ]}
          />
        );
        getByTitle(title)
          .querySelectorAll('input[type="radio"]')
          .forEach(r => {
            userEvent.click(r);
          });
        expect(handleOnChange).toHaveBeenCalledWith('test1');
        expect(handleOnChange).toHaveBeenCalledWith('test2');
      });

      it('should be disabled by the disabled prop', () => {
        const handleOnChange = jest.fn();
        const { getByTitle } = render(
          <ValueEditor
            {...props}
            type="radio"
            handleOnChange={handleOnChange}
            values={[
              { name: 'test1', label: 'Test 1' },
              { name: 'test2', label: 'Test 2' },
            ]}
            disabled
          />
        );
        getByTitle(title)
          .querySelectorAll('input[type="radio"]')
          .forEach(r => {
            expect(r).toBeDisabled();
            try {
              userEvent.click(r);
            } catch (e: any) {
              if (!errorMessageIsAboutPointerEventsNone(e)) {
                throw e;
              }
            }
          });
        expect(handleOnChange).not.toHaveBeenCalled();
      });
    });
  });
};
