import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NameLabelPair, OptionGroup, ValueEditorProps } from '../src/types';
import { defaultValueSelectorProps, testSelect } from './testValueSelector';
import { errorMessageIsAboutPointerEventsNone, findInput, findTextarea } from './utils';

type ValueEditorTestsToSkip = Partial<{
  def: boolean;
  select: boolean;
  multiselect: boolean;
  checkbox: boolean;
  radio: boolean;
  textarea: boolean;
  switch: boolean;
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
  valueSource: 'value',
};

export const testValueEditor = (
  ValueEditor: React.ComponentType<ValueEditorProps>,
  skip: ValueEditorTestsToSkip = {}
) => {
  const user = userEvent.setup();
  const title = ValueEditor.displayName ?? 'ValueEditor';
  const props = { ...defaultValueEditorProps, title };

  const testCheckbox = (type: 'checkbox' | 'switch') => {
    it('should render the checkbox and react to changes', async () => {
      const handleOnChange = jest.fn();
      const { getByTitle } = render(
        <ValueEditor {...props} type={type} handleOnChange={handleOnChange} />
      );
      expect(() => findInput(getByTitle(title))).not.toThrow();
      expect(findInput(getByTitle(title))).toHaveAttribute('type', 'checkbox');
      await user.click(findInput(getByTitle(title)));
      expect(handleOnChange).toHaveBeenCalledWith(true);
    });

    it('should be disabled by the disabled prop', async () => {
      const handleOnChange = jest.fn();
      const { getByTitle } = render(
        <ValueEditor {...props} type={type} handleOnChange={handleOnChange} disabled />
      );
      expect(findInput(getByTitle(title))).toBeDisabled();
      try {
        await user.click(findInput(getByTitle(title)));
      } catch (e: any) {
        if (!errorMessageIsAboutPointerEventsNone(e)) {
          throw e;
        }
      }
      expect(handleOnChange).not.toHaveBeenCalled();
    });
  };

  describe(title, () => {
    if (!skip.def) {
      describe('when using default rendering', () => {
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

        it('should call the onChange method passed in', async () => {
          const onChange = jest.fn();
          const { getByTitle } = render(<ValueEditor {...props} handleOnChange={onChange} />);
          await user.type(findInput(getByTitle(title)), 'foo');
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
    }

    if (!skip.select) {
      const titleForSelectorTest = `${title} (as ValueSelector)`;
      const valueEditorAsSelectProps: ValueEditorAsSelectProps = {
        ...defaultValueEditorProps,
        type: 'select',
        values: defaultValueSelectorProps.options,
        title: titleForSelectorTest,
        testID: 'value-editor',
      };
      testSelect(titleForSelectorTest, ValueEditor, valueEditorAsSelectProps);
    }

    if (!skip.multiselect) {
      const titleForSelectorTest = `${title} (as ValueSelector multiselect)`;
      const valueEditorAsMultiselectProps: ValueEditorAsSelectProps = {
        ...defaultValueEditorProps,
        type: 'multiselect',
        values: defaultValueSelectorProps.options,
        title: titleForSelectorTest,
        testID: 'value-editor',
      };
      testSelect(titleForSelectorTest, ValueEditor, valueEditorAsMultiselectProps);
    }

    if (!skip.checkbox) {
      describe('when rendering as a checkbox', () => {
        testCheckbox('checkbox');
      });
    }

    if (!skip.switch) {
      describe('when rendering as a switch', () => {
        testCheckbox('switch');
      });
    }

    if (!skip.radio) {
      describe('when rendering a radio button set', () => {
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

        it('should call the onChange handler', async () => {
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
          const radioButtons = Array.from(
            getByTitle(title).querySelectorAll('input[type="radio"]')
          );
          for (const r of radioButtons) {
            await user.click(r);
          }
          expect(handleOnChange).toHaveBeenCalledWith('test1');
          expect(handleOnChange).toHaveBeenCalledWith('test2');
        });

        it('should be disabled by the disabled prop', async () => {
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
          for (const r of getByTitle(title).querySelectorAll('input[type="radio"]')) {
            expect(r).toBeDisabled();
            try {
              await user.click(r);
            } catch (e: any) {
              if (!errorMessageIsAboutPointerEventsNone(e)) {
                throw e;
              }
            }
          }
          expect(handleOnChange).not.toHaveBeenCalled();
        });
      });
    }

    if (!skip.textarea) {
      describe('when rendering a textarea', () => {
        it('should have the value passed into the <input />', () => {
          const { getByTitle } = render(<ValueEditor {...props} type="textarea" value="test" />);
          expect(findTextarea(getByTitle(title))).toHaveValue('test');
        });

        it('should call the onChange method passed in', async () => {
          const onChange = jest.fn();
          const { getByTitle } = render(
            <ValueEditor {...props} type="textarea" handleOnChange={onChange} />
          );
          await user.type(findTextarea(getByTitle(title)), 'foo');
          expect(onChange).toHaveBeenCalledWith('foo');
        });
      });
    }
  });
};
