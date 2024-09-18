import { render } from '@testing-library/react';
import App from './App';

test('renders App component and matches snapshot', () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot();
});
