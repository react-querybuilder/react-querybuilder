import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
const TESTID = 'TESTID';

const Select = ({ onChange }: { onChange: jest.Mock }) => (
  <select
    data-testid="TESTID"
    onChange={e => onChange(Array.from(e.target.selectedOptions).map(op => op.value))}
    defaultValue={[]}
    multiple>
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="D">D</option>
  </select>
);

// const reportOptions = () => {
//   console.log(Array.from((screen.getByTestId(TESTID) as HTMLSelectElement).selectedOptions));
// };

it('works', async () => {
  const onChange = jest.fn();
  render(<Select onChange={onChange} />);
  await user.selectOptions(screen.getByTestId(TESTID), ['A', 'B']);
  expect(screen.getByTestId(TESTID)).toHaveValue(['A', 'B']);
  expect(onChange).toHaveBeenCalledWith(['A']);
  expect(onChange).toHaveBeenCalledWith(['A', 'B']);
});
