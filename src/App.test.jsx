import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';
import App from './App.jsx';

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

test('renders the weather form', () => {
  render(<App />);

  expect(screen.getByText('Weather App')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('city')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Country')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
});

test('requests a city before fetching weather', async () => {
  const user = userEvent.setup();
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<App />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(alertMock).toHaveBeenCalledWith('Add values');
  expect(fetchMock).not.toHaveBeenCalled();
});

test('displays weather returned for the submitted city and country', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValueOnce({
    json: async () => ({
      cod: 200,
      name: 'London',
      sys: { country: 'GB', sunrise: 1710000000, sunset: 1710040000 },
      main: {
        temp: 293.15,
        temp_max: 295.15,
        temp_min: 290.15,
        humidity: 65,
        pressure: 1015,
      },
      weather: [{ icon: '01d', main: 'Clear', description: 'clear sky' }],
      visibility: 10000,
      wind: { speed: 5, deg: 180 },
    }),
  });
  render(<App />);

  await user.type(screen.getByPlaceholderText('city'), 'London');
  await user.type(screen.getByPlaceholderText('Country'), 'GB');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.openweathermap.org/data/2.5/weather?q=London,GB&APPID=Enter Your API Key',
  );
  expect(await screen.findByText('London , GB. Weather')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('20');
  expect(screen.getByText('clear sky')).toBeInTheDocument();
  expect(screen.getByText('65 %')).toBeInTheDocument();
});

test('displays the existing numeric 404 response', async () => {
  const user = userEvent.setup();
  fetchMock.mockResolvedValueOnce({
    json: async () => ({ cod: 404, message: 'city not found' }),
  });
  render(<App />);

  await user.type(screen.getByPlaceholderText('city'), 'Missing');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(await screen.findByRole('heading', { name: 'city not found' })).toBeInTheDocument();
  expect(screen.queryByText('High/Low')).not.toBeInTheDocument();
});
