import { shallow } from 'enzyme';
import { ActionElement } from '..';
import type { ActionProps } from '../../types';

describe('<ActionElement />', () => {
  const props: ActionProps = {
    handleOnClick: () => {},
    className: '',
    level: 0
  };

  it('should exist', () => {
    expect(ActionElement).toBeDefined();
  });

  describe('when using default rendering', () => {
    it('should have a <button /> element', () => {
      const dom = shallow(<ActionElement {...props} />);
      expect(dom.find('button')).toHaveLength(1);
    });

    it('should have the label passed into the <button />', () => {
      const dom = shallow(<ActionElement {...props} label="test" />);
      expect(dom.find('button').text()).toBe('test');
    });

    it('should have the className passed into the <button />', () => {
      const dom = shallow(<ActionElement {...props} className="my-css-class" />);
      expect(dom.find('button').hasClass('my-css-class')).toBe(true);
    });

    it('should call the onClick method passed in', () => {
      let count = 0;
      const onClick = () => count++;
      const dom = shallow(<ActionElement {...props} handleOnClick={onClick} />);

      dom.find('button').simulate('click');
      expect(count).toBe(1);
    });
  });
});
