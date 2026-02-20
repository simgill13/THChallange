import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiHelper } from '../utils/apiHelper';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    apiHelper(`/items/${id}`, { signal: controller.signal })
      .then(setItem)
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
      });

    return () => controller.abort();
  }, [id, navigate]);

  if (error) {
    return (
      <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
        <p role="alert" style={{ color: '#d32f2f' }}>{error}</p>
        <Link to="/">&larr; Back to items</Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
        <div style={{ height: 24, width: 200, background: '#eee', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 16, width: 140, background: '#eee', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 16, width: 100, background: '#eee', borderRadius: 4 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 16, color: '#1976d2', textDecoration: 'none' }}>
        &larr; Back to items
      </Link>
      <h2 style={{ marginBottom: 8 }}>{item.name}</h2>
      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Price:</strong> ${item.price}</p>
    </div>
  );
}

export default ItemDetail;
