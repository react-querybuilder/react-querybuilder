import React from 'react';
import { shallow } from 'enzyme';

import { ValueSelector } from './index';

describe('<ValueSelector />', ()=> {

    it('should exist', ()=> {
        expect(ValueSelector).to.exist;
    });

    describe('when using default rendering', ()=> {
        const options = [
            {name: "foo", label: "foo label"},
            {name: "bar", label: "bar label"}
        ]

        it('should have an <select /> element', ()=> {
            const dom = shallow(<ValueSelector options={options}/>);
            expect(dom.find('select')).to.have.length(1);
        });

        it('should have the options passed into the <select />', ()=> {
            const dom = shallow(<ValueSelector options={options} />);
            expect(dom.find('option')).to.have.length(2);
        });

        it('should have the value passed into the <select />', ()=> {
            const dom = shallow(<ValueSelector options={options} value='foo'/>);
            expect(dom.find('select').props().value).to.equal('foo');
        });

        it('should have the className passed into the <select />', ()=> {
            const dom = shallow(<ValueSelector options={options} className='foo'/>);
            expect(dom.find('select').hasClass('foo')).to.equal(true);
        });

        it('should call the onChange method passed in', ()=> {
            let count = 0;
            const mockEvent = {target:{value:"foo"}};
            const onChange = ()=>count++;
            const dom = shallow(<ValueSelector options={options} handleOnChange={onChange} />);

            dom.find('select').simulate('change', mockEvent);
            expect(count).to.equal(1);
        });
    });

    describe('when the fields have the id key', ()=> {
        const fooId = '3';
        const barId = '5';

        const options = [
            {name: "foo", label: "foo label", id: fooId},
            {name: "bar", label: "bar label", id: barId}
        ]

        it('the options should have keys 3 and 5', ()=> {
            const dom = shallow(<ValueSelector options={options} />);
            expect(dom.find('option').at(0).key()).to.equal(fooId);
            expect(dom.find('option').at(1).key()).to.equal(barId);
        });
    });
});
