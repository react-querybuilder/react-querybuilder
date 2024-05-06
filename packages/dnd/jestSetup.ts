// This is only necessary until `react-dnd-test-utils` imports `act` from `react`.
jest.mock('react-dom/test-utils', () => ({
  act: jest.requireActual('react').act,
}));
