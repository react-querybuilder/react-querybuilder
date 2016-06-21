import React from 'react';
import {shallow, mount} from 'enzyme';

import {QueryBuilder, RuleGroup} from './index';

describe('<QueryBuilder />', ()=> {

    it('should exist', ()=> {
        expect(QueryBuilder).to.exist;
    });

    describe('when rendered', ()=> {
        it('should render the root RuleGroup', ()=> {
            const dom = shallow(<QueryBuilder />);
            expect(dom.find('RuleGroup')).to.have.length(1);
        });

        it('should show the list of combinators in the RuleGroup', ()=> {
            const dom = mount(<QueryBuilder />);
            const options = dom.find('select option');
            expect(options).to.have.length(2); // and, or
        });

    });

    describe('when fields are provided', ()=>{

        it('should show them in the select control', ()=> {
            const fields = [
                { name: 'firstName', label: 'First Name'},
                { name: 'lastName', label: 'Last Name'},
                { name: 'age', label: 'Age'},
            ];
        });

    });
    
});
