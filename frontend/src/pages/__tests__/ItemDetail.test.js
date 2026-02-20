import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';
import ItemDetail from '../ItemDetail';

afterEach(() => {
  jest.restoreAllMocks();
});

function renderWithRoute(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/items/${id}`]}>
      <Routes>
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/" element={<p>Home</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ItemDetail', () => {
  it('matches snapshot in loading state', () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    const { container } = renderWithRoute();
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot after item loads', async () => {
    const item = { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 };
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(item) }),
    );

    const { container } = renderWithRoute('1');

    await waitFor(() => {
      expect(container.querySelector('h2')).toHaveTextContent('Laptop Pro');
    });

    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in error state', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: { message: 'Item not found' } }),
      }),
    );

    const { container } = renderWithRoute('999');

    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
