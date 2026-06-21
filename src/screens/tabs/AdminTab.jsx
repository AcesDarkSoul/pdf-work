import { useState, useEffect } from 'react';
import { getAllUsers, updateUserPremiumStatus, updateUserTaskCount, updateUserWalletBalance, isFirebaseConfigured } from '../../firebase';

const AdminTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({ isPremium: false, taskCount: 0, walletBalance: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditData({
      isPremium: user.isPremium || false,
      taskCount: user.taskCount || 0,
      walletBalance: user.walletBalance || 0,
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    setMessage('');

    try {
      await updateUserPremiumStatus(editingUser, editData.isPremium);
      await updateUserTaskCount(editingUser, editData.taskCount);
      await updateUserWalletBalance(editingUser, editData.walletBalance);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser 
          ? { ...user, ...editData }
          : user
      ));
      
      setEditingUser(null);
      setMessage('✅ User data updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user', error);
      setMessage('❌ Failed to update user data');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading users...</div>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Firebase not configured. Admin features unavailable.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)' }}>
        User Management
      </h2>
      
      {message && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          borderRadius: '8px',
          background: message.includes('✅') ? 'rgba(0, 195, 126, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.includes('✅') ? 'var(--accent-primary)' : '#ef4444',
          border: `1px solid ${message.includes('✅') ? 'var(--accent-primary)' : '#ef4444'}`,
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 100px 100px 100px 120px', 
          gap: '16px',
          padding: '16px 20px',
          background: 'var(--bg-primary)',
          fontWeight: 'bold',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>Name</div>
          <div>Phone</div>
          <div>Premium</div>
          <div>Tasks</div>
          <div>Balance</div>
          <div>Actions</div>
        </div>
        
        {users.map((user) => (
          <div key={user.id} style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 100px 100px 100px 120px', 
            gap: '16px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            alignItems: 'center'
          }}>
            {editingUser === user.id ? (
              <>
                <div>{user.name || 'N/A'}</div>
                <div>{user.phone || user.id}</div>
                <div>
                  <input
                    type="checkbox"
                    checked={editData.isPremium}
                    onChange={(e) => setEditData({...editData, isPremium: e.target.checked})}
                    style={{ width: '16px', height: '16px' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={editData.taskCount}
                    onChange={(e) => setEditData({...editData, taskCount: parseInt(e.target.value) || 0})}
                    style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.walletBalance}
                    onChange={(e) => setEditData({...editData, walletBalance: parseFloat(e.target.value) || 0})}
                    style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    style={{ 
                      padding: '6px 12px', 
                      background: saving ? 'var(--text-secondary)' : 'var(--accent-primary)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1
                    }}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    style={{ 
                      padding: '6px 12px', 
                      background: 'var(--bg-secondary)', 
                      color: 'var(--text-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: '500' }}>{user.name || 'N/A'}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{user.phone || user.id}</div>
                <div>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    background: user.isPremium ? 'rgba(0, 195, 126, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                    color: user.isPremium ? 'var(--accent-primary)' : 'var(--text-secondary)'
                  }}>
                    {user.isPremium ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>{user.taskCount || 0}</div>
                <div>₹{user.walletBalance || 0}</div>
                <div>
                  <button 
                    onClick={() => handleEdit(user)}
                    style={{ 
                      padding: '6px 12px', 
                      background: 'var(--accent-primary)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No users found
        </div>
      )}
    </div>
  );
};

export default AdminTab;