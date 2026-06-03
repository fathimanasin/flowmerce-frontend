import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function FlowmerceDashboard() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('flowmerce_token') || '');
  const [tenantId, setTenantId] = useState(localStorage.getItem('flowmerce_tenant_id') || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [conversations, setConversations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [orderForm, setOrderForm] = useState({ 
    customer_name: '', 
    customer_phone: '', 
    product: '', 
    quantity: 1, 
    price: 0 
  });

  useEffect(() => {
    if (token) {
      setPage('dashboard');
      loadConversations(token);
    }
  }, [token]);

  // ===== LOGIN =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      
      localStorage.setItem('flowmerce_token', data.token);
      localStorage.setItem('flowmerce_tenant_id', data.tenant_id);
      setToken(data.token);
      setTenantId(data.tenant_id);
      setPage('dashboard');
      setLoginForm({ email: '', password: '' });
    } catch (err) {
      setError('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOAD CONVERSATIONS =====
  const loadConversations = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  // ===== CREATE ORDER =====
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversation_id: selectedConversation?.id,
          customer_name: orderForm.customer_name,
          items: [{ product: orderForm.product, qty: orderForm.quantity, price: orderForm.price }],
          total_amount: orderForm.quantity * orderForm.price
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to create order');
        return;
      }
      
      setError('');
      setOrderForm({ customer_name: '', customer_phone: '', product: '', quantity: 1, price: 0 });
      setSelectedConversation(null);
      
      await loadConversations(token);
    } catch (err) {
      setError('Error creating order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('flowmerce_token');
    localStorage.removeItem('flowmerce_tenant_id');
    setToken('');
    setTenantId('');
    setPage('login');
    setConversations([]);
    setSelectedConversation(null);
  };

  // ===== RENDER LOGIN PAGE =====
  if (page === 'login') {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '0.5rem', textAlign: 'center', color: '#1f2937' }}>
          Flowmerce
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem', fontSize: '14px' }}>
          Manage your social commerce business
        </p>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
              Email
            </label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="seller@example.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
              Password
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontFamily: 'inherit'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem', 
              backgroundColor: '#fee2e2', 
              color: '#991b1b',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '13px', color: '#6b7280' }}>
          Demo: seller@flowmerce.com / password123
        </p>
      </div>
    );
  }

  // ===== RENDER DASHBOARD =====
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937' }}>Flowmerce Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            color: '#1f2937',
            fontFamily: 'inherit'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* LEFT: CONVERSATIONS LIST */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1rem', color: '#1f2937', fontWeight: 500 }}>
            Conversations
          </h2>
          
          {conversations.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No conversations yet. Messages from WhatsApp will appear here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setOrderForm({
                      customer_name: conv.customer_name || '',
                      customer_phone: conv.customer_phone || '',
                      product: '',
                      quantity: 1,
                      price: 0
                    });
                  }}
                  style={{
                    padding: '1rem',
                    border: selectedConversation?.id === conv.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.id === conv.id ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 500, color: '#1f2937', fontSize: '14px' }}>
                    {conv.customer_name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                    {conv.customer_phone}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    "{conv.message_text?.substring(0, 50)}..."
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {new Date(conv.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CREATE ORDER */}
        <div>
          <h2 style={{ fontSize: '18px', marginBottom: '1rem', color: '#1f2937', fontWeight: 500 }}>
            Create Order
          </h2>
          
          {!selectedConversation ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Select a conversation to create an order.
            </p>
          ) : (
            <form onSubmit={handleCreateOrder}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                  Product
                </label>
                <input
                  type="text"
                  value={orderForm.product}
                  onChange={(e) => setOrderForm({ ...orderForm, product: e.target.value })}
                  placeholder="e.g., Red Shirt Size M"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) })}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                    Price
                  </label>
                  <input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) })}
                    min="0"
                    step="10"
                    placeholder="500"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      fontFamily: 'inherit'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ 
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '14px',
                fontWeight: 500,
                color: '#1f2937'
              }}>
                Total: ₹{(orderForm.quantity * orderForm.price).toFixed(2)}
              </div>

              {error && (
                <div style={{ 
                  padding: '0.75rem', 
                  marginBottom: '1rem', 
                  backgroundColor: '#fee2e2', 
                  color: '#991b1b',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'inherit'
                }}
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
