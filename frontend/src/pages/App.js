import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      <nav
        style={{
          padding: '12px 24px',
          borderBottom: '1px solid #e0e0e0',
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ fontWeight: 600, fontSize: 18, textDecoration: 'none', color: '#333' }}>
          Item Catalog
        </Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Items />} />
          <Route path="/items/:id" element={<ItemDetail />} />
        </Routes>
      </main>
    </DataProvider>
  );
}

export default App;
