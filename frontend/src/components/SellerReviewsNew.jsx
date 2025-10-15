import React from 'react';

export default function SellerReviewsNew({ sellerId, itemId }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Reviews</h3>
      <p>Reviews for seller: {sellerId}</p>
    </div>
  );
}
