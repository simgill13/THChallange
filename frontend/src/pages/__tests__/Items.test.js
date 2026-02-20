import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Items from '../Items';
import * as DataContext from '../../state/DataContext';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockSetQuery = jest.fn();
const mockSetPage = jest.fn();
const mockFetchItems = jest.fn();

function mockUseData(overrides = {}) {
  jest.spyOn(DataContext, 'useData').mockReturnValue({
    items: [],
    total: 0,
    page: 1,
    totalPages: 0,
    loading: false,
    error: null,
    query: '',
    fetchItems: mockFetchItems,
    setQuery: mockSetQuery,
    setPage: mockSetPage,
    ...overrides,
  });
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Items', () => {
  it('matches snapshot in loading state', () => {
    mockUseData({ loading: true });
    const { container } = render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with an empty result set', () => {
    mockUseData({ loading: false, items: [] });
    const { container } = render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with an empty search result', () => {
    mockUseData({ loading: false, items: [], query: 'nonexistent' });
    const { container } = render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with items and pagination', () => {
    mockUseData({
      loading: false,
      items: [
        { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
        { id: 2, name: 'Standing Desk', category: 'Furniture', price: 1199 },
      ],
      total: 5,
      page: 1,
      totalPages: 3,
    });
    const { container } = render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot in error state', () => {
    mockUseData({ error: 'Network failure' });
    const { container } = render(
      <MemoryRouter>
        <Items />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
