import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { apiHelper } from '../utils/apiHelper';

const DataContext = createContext();

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  query: '',
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        items: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
        totalPages: action.payload.totalPages,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_QUERY':
      return { ...state, query: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);

  const fetchItems = useCallback(async (page = 1, query = '') => {
    // Cancel any in-flight request so we never set stale state
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: 'FETCH_START' });

    try {
      const queryParams = { page, limit: 20 };
      if (query) queryParams.q = query;

      const json = await apiHelper('/items', {
        params: queryParams,
        signal: controller.signal,
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: json });
    } catch (err) {
      if (err.name === 'AbortError') return; // unmount or superseded — ignore
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, []);

  const setQuery = useCallback((q) => dispatch({ type: 'SET_QUERY', payload: q }), []);
  const setPage = useCallback((p) => dispatch({ type: 'SET_PAGE', payload: p }), []);

  return (
    <DataContext.Provider value={{ ...state, fetchItems, setQuery, setPage }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
