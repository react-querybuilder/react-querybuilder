import { shallow } from 'enzyme';
import { NotToggle } from '..';
import type { NotToggleProps } from '../../types';

describe('<NotToggle />', () => {
  const props: NotToggleProps = {
    handleOnChange: () => {},
    level: 0
  };

  it('should exist', () => {
    expect(NotToggle).toBeDefined();
  });

  describe('when using default rendering', () => {
    it('should have a <label /> element', () => {
      const dom = shallow(<NotToggle {...props} />);
      expect(dom.find('label')).toHaveLength(1);
    });

    it('should have an <input type="checkbox" /> element', () => {
      const dom = shallow(<NotToggle {...props} />);
      expect(dom.find('input[type="checkbox"]')).toHaveLength(1);
    });

    it('should have the value passed into the <input />', () => {
      const dom = shallow(<NotToggle {...props} checked={true} />);
      expect(dom.find('input').props().checked).toBe(true);
    });

    it('should have the className passed into the <label />', () => {
      const dom = shallow(<NotToggle {...props} className="foo" />);
      expect(dom.find('label').hasClass('foo')).toBe(true);
    });

    it('should call the onChange method passed in', () => {
      let count = 0;
      const mockEvent = { target: { checked: true } };
      const onChange = () => count++;
      const dom = shallow(<NotToggle {...props} handleOnChange={onChange} />);

      dom.find('input').simulate('change', mockEvent);
      expect(count).toBe(1);
    });
  });
});
