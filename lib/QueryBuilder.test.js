import React from 'react';
import { shallow } from 'enzyme';

import {QueryBuilder} from './index';

describe('<QueryBuilder />', ()=> {

    it('should exist', ()=> {
        expect(QueryBuilder).to.exist;
    });

    it('should render the root RuleGroup', ()=>{

        const wrapper = shallow(<QueryBuilder />);
        expect(wrapper.find('RuleGroup')).to.have.length(1);
    });
});
