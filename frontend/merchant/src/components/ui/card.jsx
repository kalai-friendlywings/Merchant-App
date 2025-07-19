// Card.jsx
import React from 'react';
import styles from './Card.module.css';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`${styles.card} ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${styles.cardContent} ${className}`}>
    {children}
  </div>
);