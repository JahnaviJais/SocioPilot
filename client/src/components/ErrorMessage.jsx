import React from 'react';
const ErrorMessage = ({ error }) => (
  error ? (
    <div className="error-card">
      <p>{error}</p>
    </div>
  ) : null
);

export default ErrorMessage;