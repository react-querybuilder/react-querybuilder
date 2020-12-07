import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

Enzyme.configure({ adapter: new Adapter() });

const context = require.context('./src', true, /\.test\.(t|j)sx?$/);
context.keys().forEach(context);
