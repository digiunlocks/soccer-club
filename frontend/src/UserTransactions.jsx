import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload);
        fetchTransactions();
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/transactions/my-transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Transaction completed successfully!');
        fetchTransactions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to complete transaction');
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      toast.error('Failed to complete transaction');
    }
  };

  const handleCancelTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to cancel this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Transaction cancelled successfully!');
        fetchTransactions();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to cancel transaction');
      }
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast.error('Failed to cancel transaction');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600">Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Transactions</h1>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {transaction.item?.title || 'Item Title'}
                  </h3>
                  <p className="text-gray-600">
                    {transaction.buyer?.username === user.username ? 'Buying from' : 'Selling to'}{' '}
                    {transaction.buyer?.username === user.username 
                      ? transaction.seller?.username 
                      : transaction.buyer?.username}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">${transaction.amount}</div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    transaction.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Payment Method:</span>
                  <span className="ml-2 text-gray-600">{transaction.paymentMethod}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(transaction.transactionDate).toLocaleDateString()}
                  </span>
                </div>
                {transaction.meetingLocation && (
                  <div>
                    <span className="font-medium text-gray-700">Meeting Location:</span>
                    <span className="ml-2 text-gray-600">{transaction.meetingLocation}</span>
                  </div>
                )}
                {transaction.meetingDate && (
                  <div>
                    <span className="font-medium text-gray-700">Meeting Date:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(transaction.meetingDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {transaction.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-600 mt-1">{transaction.notes}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                {transaction.status === 'pending' && (
                  <>
                    {transaction.seller?._id === user.id && (
                      <button
                        onClick={() => handleCompleteTransaction(transaction._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelTransaction(transaction._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Cancel Transaction
                    </button>
                  </>
                )}
                
                {transaction.status === 'completed' && (
                  <div className="text-green-600 font-medium">
                    ✓ Transaction completed on {new Date(transaction.completedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTransactions;
