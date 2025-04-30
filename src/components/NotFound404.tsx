// NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      color: '#333',
      padding: '40px',
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
        Sorry, the page you’re looking for doesn’t exist.
      </p>
      <Link to="/home" style={{
        padding: '12px 24px',
        backgroundColor: '#f59e0b',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: 'bold',
      }}>
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
