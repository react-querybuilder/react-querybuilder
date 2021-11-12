import { mount } from 'enzyme';
import { DragHandle } from '..';
import type { DragHandleProps } from '../../types';

describe('<DragHandle />', () => {
  const props: DragHandleProps = {
    level: 1
  };

  it('should exist', () => {
    expect(DragHandle).toBeDefined();
  });

  it('should have a <span /> element', () => {
    const dom = mount(<DragHandle {...props} />);
    expect(dom.find('span')).toHaveLength(1);
  });

  it('should have the className passed into the <span />', () => {
    const dom = mount(<DragHandle {...props} className="foo" />);
    expect(dom.find('span').hasClass('foo')).toBe(true);
  });
});
