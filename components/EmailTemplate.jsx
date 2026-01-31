import * as React from 'react';

export const EmailTemplate = ({ name, content }) => (
  <div style={{ fontFamily: 'Georgia, serif', color: '#2b2118' }}>
    <h1 style={{ color: '#b45309' }}>Fragments of Me</h1>
    <p>Dear {name},</p>
    <div style={{ lineHeight: '1.6', fontSize: '16px' }}>
      {content}
    </div>
    <hr style={{ borderTop: '1px solid #e5e5e5', marginTop: '20px' }} />
    <p style={{ fontSize: '12px', color: '#857f72' }}>
      A digital sanctuary for the unsaid.
    </p>
  </div>
);