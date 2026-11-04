import { fireEvent, render, screen } from '@testing-library/react';
import App from '../../src/App';
import { loadQuote } from '../../src/api';

jest.mock('../../src/api');
const request = jest.mocked(loadQuote);
beforeEach(() => request.mockReset());

it('shows an empty, accessible order form before calculation', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A clear price');
  expect(screen.getByRole('region', { name: 'Quote summary' })).toHaveTextContent('Enter your order details');
  expect(screen.getByLabelText('Quantity')).toHaveValue(2);
});
it('submits the order and displays the server quote', async () => {
  request.mockResolvedValue({ subtotalCents: 100000, discountCents: 10000, shippingCents: 0, totalCents: 90000 });
  render(<App apiBaseUrl="https://api.example.test" />);
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
  fireEvent.change(screen.getByLabelText('Unit price (₱)'), { target: { value: '100' } });
  fireEvent.click(screen.getByRole('button', { name: 'Calculate quote' }));
  expect(screen.getByRole('button', { name: 'Calculating…' })).toBeDisabled();
  expect(await screen.findByLabelText('Order total')).toHaveTextContent('900.00');
  expect(request).toHaveBeenCalledWith({ quantity: 10, unitPriceCents: 10000 }, 'https://api.example.test');
  expect(screen.getByRole('button', { name: 'Calculate quote' })).toBeEnabled();
});
it('shows a useful error and allows retry after the backend fails', async () => {
  request.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ subtotalCents: 50000, discountCents: 0, shippingCents: 5000, totalCents: 55000 });
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Calculate quote' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Check the values');
  fireEvent.click(screen.getByRole('button', { name: 'Calculate quote' }));
  expect(await screen.findByLabelText('Order total')).toHaveTextContent('550.00');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
