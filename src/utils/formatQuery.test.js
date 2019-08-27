import { formatQuery } from '.';

const query = {
  id: 'g-067a4722-55e0-49c3-83b5-b31e10e69f9d',
  rules: [
    {
      id: 'r-74bbb7e6-b046-40d2-9170-48113afbfe3e',
      field: 'firstName',
      value: '',
      operator: 'null'
    },
    {
      id: 'r-11af1a9a-10eb-4c5d-a7cb-64b776328ab7',
      field: 'lastName',
      value: '',
      operator: 'notNull'
    },
    {
      id: 'r-8c8882ad-b754-419a-9481-dec597a66570',
      field: 'firstName',
      value: 'Test,This',
      operator: 'in'
    },
    {
      id: 'r-85206a73-9806-434b-95ac-9d00a02a2d48',
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn'
    },
    {
      id: 'r-7e764eaf-7c2f-436b-84b8-e1c4e24fcd7f',
      field: 'age',
      value: '26',
      operator: '='
    },
    {
      id: 'r-6d653dae-7c2f-436b-84b8-e1c4e24fcd7f',
      field: 'isMusician',
      value: true,
      operator: '='
    },
    {
      id: 'g-e87d3d99-41e6-48e9-b032-6db996039670',
      rules: [
        {
          id: 'r-86463d12-d045-4172-8489-0d9c42490967',
          field: 'gender',
          value: 'M',
          operator: '='
        },
        {
          id: 'r-a0d80c26-1daa-44ae-98ef-594c741b6eb5',
          field: 'job',
          value: 'Programmer',
          operator: '!='
        }
      ],
      combinator: 'or'
    }
  ],
  combinator: 'and'
};

const sqlString =
  '(firstName is null and lastName is not null and firstName in ("Test", "This") and lastName not in ("Test", "This") and age = "26" and isMusician = TRUE and (gender = "M" or job != "Programmer"))';

describe('formatQuery', () => {
  it('formats JSON correctly', () => {
    expect(formatQuery(query, 'json')).to.equal(JSON.stringify(query, null, 2));
  });

  it('formats SQL correctly', () => {
    expect(formatQuery(query, 'sql')).to.equal(sqlString);
  });

  it('handles invalid type correctly', () => {
    expect(formatQuery(query, 'null')).to.equal('');
  });

  it('handles custom valueProcessor correctly', () => {
    const queryWithArrayValue = {
      id: 'g-8953ed65-f5ff-4b77-8d03-8d8788beb50b',
      rules: [
        {
          id: 'r-32ef0844-07e3-4f3b-aeca-3873da3e208b',
          field: 'instrument',
          value: ['Guitar', 'Vocals'],
          operator: 'in'
        },
        {
          id: 'r-3db9ba21-080d-4a5e-b4da-d949b4ad055b',
          field: 'lastName',
          value: 'Vai',
          operator: '='
        }
      ],
      combinator: 'and'
    };

    const valueProcessor = (field, operator, value) => {
      if (operator === 'in') {
        return `(${value.map((v) => `"${v.trim()}"`).join(',')})`;
      } else {
        return `"${value}"`;
      }
    };

    expect(formatQuery(queryWithArrayValue, 'sql', valueProcessor)).to.equal(
      '(instrument in ("Guitar","Vocals") and lastName = "Vai")'
    );
  });
});
