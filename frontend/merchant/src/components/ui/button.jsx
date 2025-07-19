// Button.jsx
import React from 'react';
import styles from './Button.module.css';

export const Button = ({ children, className = '', ...props }) => (
  <button
    className={`${styles.button} ${className}`}
    {...props}
  >
    {children}
  </button>
);