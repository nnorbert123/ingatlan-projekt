import React from 'react';

const PropertyCardSkeleton = () => {
  return (
    <div className="property-card skeleton">
      <div className="skeleton-image"></div>
      <div className="property-info">
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
        <div className="skeleton-price"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
