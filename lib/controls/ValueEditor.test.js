import React from 'react';
import { shallow } from 'enzyme';

import { ValueEditor } from './index';

describe('<ValueEditor />', ()=> {

    it('should exist', ()=> {
        expect(ValueEditor).to.exist;
    });

    describe('when using default rendering', ()=> {
        it('should have an <input /> element', ()=> {
            const dom = shallow(<ValueEditor />);
            expect(dom.find('input')).to.have.length(1);
        });

        it('should have the value passed into the <input />', ()=> {
            const dom = shallow(<ValueEditor value='test'/>);
            expect(dom.find('input').props().value).to.equal('test');
        });

        it('should render nothing for operator "null"', ()=> {
            const dom = shallow(<ValueEditor operator="null" />);
            expect(dom.type()).to.be.null;
        });

        it('should render nothing for operator "notNull"', ()=> {
            const dom = shallow(<ValueEditor operator="notNull" />);
            expect(dom.type()).to.be.null;
        });

        it('should call the onChange method passed in', ()=> {
            let count = 0;
            const mockEvent = {target:{value:"foo"}};
            const onChange = ()=>count++;
            const dom = shallow(<ValueEditor handleOnChange={onChange} />);

            dom.find('input').simulate('change', mockEvent);
            expect(count).to.equal(1);
        });
    });
});
