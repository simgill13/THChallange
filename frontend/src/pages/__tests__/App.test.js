import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    }),
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App', () => {
  it('matches snapshot on the home route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot on an item detail route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/items/1']}>
        <App />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
