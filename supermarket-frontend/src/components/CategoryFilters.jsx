// src/components/CategoryFilters.jsx
import React from 'react';
import './CategoryFilters.css';  // ή App.css αν το έβαλες εκεί
//import './App.css';  // ή App.css αν το έβαλες εκεί


const CategoryFilters = ({ categories, active, onSelect }) => (
  <div className="category-filters">
    {categories.map(cat => (
      <button
        key={cat}
        className={`filter-pill${active === cat ? ' active' : ''}`}
        onClick={() => onSelect(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryFilters;
