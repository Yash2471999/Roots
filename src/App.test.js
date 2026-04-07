import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Jenkins pipeline app', () => {
  render(<App />);
  const pipelineText = screen.getByText(/Jenkins CI\/CD Pipeline/i);
  expect(pipelineText).toBeInTheDocument();
});
