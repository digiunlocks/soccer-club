import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function MarketplaceFeeConfig() {
  const [fees, setFees] = useState({
    postingFee: 0,
    extensionFee: 0,
    featuredFee: 0,
    premiumFee: 0,
    feeType: 'fixed',
    defaultExpirationDays: 90,
    extensionDays: 30,
    maxExtensions: 3,
    freePostingLimit: 3,
    freeExtensionLimit: 1,
    currency: 'USD',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCurrentFees();
  }, []);

  const fetchCurrentFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/fees/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fees) {
          setFees(data.fees);
        }
      } else {
        console.error('Failed to fetch fees');
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFees(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/marketplace/fees/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fees)
      });

      if (response.ok) {
        toast.success('Fee configuration updated successfully!');
        await fetchCurrentFees();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update fee configuration');
      }
    } catch (error) {
      console.error('Error updating fees:', error);
      toast.error('Error updating fee configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Marketplace Fee Configuration</h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Configure fees and settings for the marketplace. Changes will take effect immediately.
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="row">
                {/* Fee Settings */}
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Fee Settings</h6>
                  
                  <div className="mb-3">
                    <label className="form-label">Fee Type</label>
                    <select 
                      className="form-select" 
                      name="feeType" 
                      value={fees.feeType} 
                      onChange={handleInputChange}
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Currency</label>
                    <select 
                      className="form-select" 
                      name="currency" 
                      value={fees.currency} 
                      onChange={handleInputChange}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Posting Fee ({fees.currency})</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="postingFee" 
                      value={fees.postingFee} 
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <div className="form-text">Fee charged for posting a new item</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Extension Fee ({fees.currency})</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="extensionFee" 
                      value={fees.extensionFee} 
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <div className="form-text">Fee charged for extending an item listing</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Featured Fee ({fees.currency})</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="featuredFee" 
                      value={fees.featuredFee} 
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <div className="form-text">Fee charged for featuring an item</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Premium Fee ({fees.currency})</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="premiumFee" 
                      value={fees.premiumFee} 
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                    <div className="form-text">Fee charged for premium placement</div>
                  </div>
                </div>

                {/* Expiration Settings */}
                <div className="col-md-6">
                  <h6 className="text-primary mb-3">Expiration Settings</h6>
                  
                  <div className="mb-3">
                    <label className="form-label">Default Expiration (Days)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="defaultExpirationDays" 
                      value={fees.defaultExpirationDays} 
                      onChange={handleInputChange}
                      min="1"
                      max="365"
                    />
                    <div className="form-text">Default number of days before items expire</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Extension Period (Days)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="extensionDays" 
                      value={fees.extensionDays} 
                      onChange={handleInputChange}
                      min="1"
                      max="90"
                    />
                    <div className="form-text">Number of days added when extending</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Max Extensions per Item</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="maxExtensions" 
                      value={fees.maxExtensions} 
                      onChange={handleInputChange}
                      min="0"
                      max="10"
                    />
                    <div className="form-text">Maximum number of extensions allowed per item</div>
                  </div>

                  <h6 className="text-primary mb-3 mt-4">Free Limits</h6>
                  
                  <div className="mb-3">
                    <label className="form-label">Free Posting Limit (per month)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="freePostingLimit" 
                      value={fees.freePostingLimit} 
                      onChange={handleInputChange}
                      min="0"
                    />
                    <div className="form-text">Number of free posts per user per month</div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Free Extension Limit (per month)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="freeExtensionLimit" 
                      value={fees.freeExtensionLimit} 
                      onChange={handleInputChange}
                      min="0"
                    />
                    <div className="form-text">Number of free extensions per user per month</div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        name="isActive" 
                        checked={fees.isActive} 
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">
                        Fee System Active
                      </label>
                    </div>
                    <div className="form-text">Enable or disable the fee system</div>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Configuration
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={fetchCurrentFees}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
