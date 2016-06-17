import {QueryBuilder} from 'react-query-builder';
import {render} from 'react-dom';

const fields = [
    {name: 'firstName', label: 'First Name'},
    {name: 'lastName', label: 'Last Name'},
    {name: 'age', label: 'Age'},
    {name: 'address', label: 'Address'},
    {name: 'phone', label: 'Phone'},
    {name: 'email', label: 'Email'},
    {name: 'twitter', label: 'Twitter'},
    {name: 'isDev', label: 'Is a Developer?'},
];

const root = (
    <QueryBuilder fields={fields}/>
);

render(root, document.querySelector('.container'));