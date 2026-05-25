import { useState } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import './Card.scss';

export default function Card({ children, variant, collapsible = false }) {
  const [open, setOpen] = useState(true);

  if (!collapsible) {
    return (
      <div className={`card${variant ? ` card--${variant}` : ''}`}>
        {children}
      </div>
    );
  }

  const childArr = React.Children.toArray(children);
  const header   = childArr[0];
  const body     = childArr.slice(1);

  return (
    <div className={`card${variant ? ` card--${variant}` : ''} card--collapsible`}>
      <div className="card__collapsible-header">
        <div className="card__collapsible-title">{header}</div>
        <button
          className={`card__collapse-btn${open ? '' : ' card__collapse-btn--closed'}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-label={open ? 'Collapse section' : 'Expand section'}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>
      <div className={`card__collapsible-body${open ? '' : ' card__collapsible-body--hidden'}`}>
        {body}
      </div>
    </div>
  );
}

Card.propTypes = {
  children:    PropTypes.node.isRequired,
  variant:     PropTypes.oneOf(['alert']),
  collapsible: PropTypes.bool,
};
