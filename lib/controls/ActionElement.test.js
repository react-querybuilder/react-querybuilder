import React from 'react';
import { shallow } from 'enzyme';

import { ActionElement } from './index';

describe('<ActionElement />', ()=> {

    it('should exist', ()=> {
        expect(ActionElement).to.exist;
    });

    describe('when using default rendering', ()=> {
        it('should have a <button /> element', ()=> {
            const dom = shallow(<ActionElement />);
            expect(dom.find('button')).to.have.length(1);
        });

        it('should have the label passed into the <button />', ()=> {
            const dom = shallow(<ActionElement label='test'/>);
            expect(dom.find('button').text()).to.equal('test');
        });

        it('should have the className passed into the <button />', ()=> {
            const dom = shallow(<ActionElement className='my-css-class'/>);
            expect(dom.find('button').hasClass('my-css-class')).to.equal(true);
        });

        it('should call the onClick method passed in', ()=> {
            let count = 0;
            const onClick = ()=>count++;
            const dom = shallow(<ActionElement handleOnClick={onClick} />);

            dom.find('button').simulate('click');
            expect(count).to.equal(1);
        });
    });
});
