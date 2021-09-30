import { mount, shallow } from 'enzyme';
import { ValueEditor } from '..';
import { ValueEditorProps } from '../../types';

describe('<ValueEditor />', () => {
  const props: ValueEditorProps = {
    field: 'TEST',
    fieldData: { name: 'TEST', label: 'Test' },
    operator: '=',
    handleOnChange: () => {},
    level: 0
  };

  it('should exist', () => {
    expect(ValueEditor).toBeDefined();
  });

  describe('when using default rendering', () => {
    it('should have an <input /> element', () => {
      const dom = shallow(<ValueEditor {...props} />);
      expect(dom.find('input')).toHaveLength(1);
    });

    it('should have the value passed into the <input />', () => {
      const dom = shallow(<ValueEditor {...props} value="test" />);
      expect(dom.find('input').props().value).toBe('test');
    });

    it('should render nothing for operator "null"', () => {
      const dom = shallow(<ValueEditor {...props} operator="null" />);
      expect(dom.type()).toBeNull();
    });

    it('should render nothing for operator "notNull"', () => {
      const dom = shallow(<ValueEditor {...props} operator="notNull" />);
      expect(dom.type()).toBeNull();
    });

    it('should call the onChange method passed in', () => {
      let count = 0;
      const mockEvent = { target: { value: 'foo' } };
      const onChange = () => count++;
      const dom = shallow(<ValueEditor {...props} handleOnChange={onChange} />);

      dom.find('input').simulate('change', mockEvent);
      expect(count).toBe(1);
    });
  });

  describe('when rendering a select', () => {
    it('should render the correct number of options', () => {
      const wrapper = mount(
        <ValueEditor {...props} type="select" values={[{ name: 'test', label: 'Test' }]} />
      );

      const select = wrapper.find('select');
      expect(select.length).toBe(1);

      const opts = wrapper.find('select option');
      expect(opts.length).toBe(1);
    });

    it('should call the onChange method passed in', () => {
      const handleOnChange = jest.fn();
      const wrapper = mount(
        <ValueEditor
          {...props}
          type="select"
          handleOnChange={handleOnChange}
          values={[{ name: 'test', label: 'Test' }]}
        />
      );

      const select = wrapper.find('select');
      select.simulate('change', { target: { value: 'test' } });
      expect(handleOnChange).toHaveBeenCalledWith('test');
    });
  });

  describe('when rendering a checkbox', () => {
    it('should render the checkbox and react to changes', () => {
      const handleOnChange = jest.fn();
      const wrapper = mount(
        <ValueEditor {...props} type="checkbox" handleOnChange={handleOnChange} />
      );

      const checkbox = wrapper.find('input[type="checkbox"]');
      expect(checkbox.length).toBe(1);

      wrapper.simulate('change', { target: { checked: true } });
      expect(handleOnChange).toHaveBeenCalledWith(true);
    });
  });

  describe('when rendering a radio button set', () => {
    it('should render the radio buttons with labels', () => {
      const wrapper = mount(
        <ValueEditor {...props} type="radio" values={[{ name: 'test', label: 'Test' }]} />
      );

      const input = wrapper.find('label input[type="radio"]');
      expect(input.length).toBe(1);
    });

    it('should call the onChange handler', () => {
      const handleOnChange = jest.fn();
      const wrapper = mount(
        <ValueEditor
          {...props}
          type="radio"
          handleOnChange={handleOnChange}
          values={[{ name: 'test', label: 'Test' }]}
        />
      );

      const input = wrapper.find('input');
      input.simulate('change', { target: { value: 'test' } });
      expect(handleOnChange).toHaveBeenCalledWith('test');
    });
  });
});
