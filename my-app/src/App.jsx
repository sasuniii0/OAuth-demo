import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allUsers, setAllUsers] = useState([]);

  // Modal state
  const [editModal, setEditModal] = useState(null);     // user object or null
  const [deleteModal, setDeleteModal] = useState(null); // user object or null
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  const backendUrl = 'http://localhost:8080';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/user`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Network error fetching user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/users`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    if (activeTab === 'users' && user) fetchAllUsers();
  }, [activeTab, user]);

  const loginWithGoogle = () => {
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  const logout = () => {
    window.location.href = `${backendUrl}/logout`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  // ── Open edit modal ─────────────────────────────────────────
  const openEdit = (u) => {
    setEditForm({ name: u.name, email: u.email });
    setEditModal(u);
  };

  // ── Save update ─────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/${editModal.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name, email: editForm.email }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        if (user.id === updated.id) setUser(updated);
        setEditModal(null);
        showToast('User updated successfully');
      } else {
        showToast('Failed to update user', 'error');
      }
    } catch (err) {
      console.error('Update error:', err);
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm delete ──────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${backendUrl}/api/users/${deleteModal.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setAllUsers(prev => prev.filter(u => u.id !== deleteModal.id));
        setDeleteModal(null);
        showToast('User deleted successfully');
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Network error', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-glow" />
        <div className="login-card">
          <div className="login-logo">M</div>
          <h1>Welcome back</h1>
          <p>Sign in to access your dashboard</p>
          <button onClick={loginWithGoogle} className="google-btn">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <p className="login-footer">Secure authentication powered by Google OAuth2</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'All Users',
      badge: allUsers.length || null,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="8" r="3"/><path d="M2 20c0-3.3 3.1-6 7-6"/>
          <circle cx="17" cy="8" r="3"/><path d="M14 14c3.9 0 7 2.7 7 6"/>
        </svg>
      ),
    },
  ];

  const tabTitles = { dashboard: 'Dashboard', profile: 'My Profile', users: 'All Users' };
  const avatarColors = ['amber', 'accent', 'teal', 'coral', 'green'];

  return (
    <div className="dashboard">

      {/* ── Toast notification ──────────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className={`toast-dot ${toast.type === 'success' ? 'dot-green' : 'dot-red'}`} />
          {toast.message}
        </div>
      )}

      {/* ── Edit Modal ──────────────────────────────────────── */}
      {editModal && (
        <div className="modal-backdrop" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit User</span>
              <button className="modal-close" onClick={() => setEditModal(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar">
                {editModal.picture
                  ? <img src={editModal.picture} alt="avatar" />
                  : getInitials(editModal.name)
                }
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdate} disabled={saving}>
                {saving && <span className="btn-spinner" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      {deleteModal && (
        <div className="modal-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete User</span>
              <button className="modal-close" onClick={() => setDeleteModal(null)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <p className="delete-title">Delete <strong>{deleteModal.name}</strong>?</p>
              <p className="delete-sub">This action cannot be undone. The user and all associated data will be permanently removed.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting && <span className="btn-spinner" />}
                {deleting ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">M</div>
          <span className="logo-name">MyApp</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user.picture ? <img src={user.picture} alt="avatar" /> : getInitials(user.name)}
          </div>
          <div className="user-meta">
            <div className="name">{user.name}</div>
            <div className="email">{user.email}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="main">
        <header className="topbar">
          <span className="topbar-title">{tabTitles[activeTab]}</span>
          <div className="topbar-spacer" />
          <div className="topbar-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search...
          </div>
          <div className="live-badge">
            <span className="status-dot" />
            Live
          </div>
        </header>

        <div className="content">

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="dash-tab">
              <div className="dash-hero">
                <div className="hero-avatar">
                  {user.picture ? <img src={user.picture} alt="avatar" /> : getInitials(user.name)}
                </div>
                <div className="hero-text">
                  <h2>Welcome back, {user.name.split(' ')[0]}</h2>
                  <p>Signed in via Google OAuth2 · Session active</p>
                </div>
                <div className="hero-badge">
                  <span className="status-dot" />
                  Active
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Email</div>
                  <div className="stat-value email-val">{user.email}</div>
                  <div className="stat-icon">✉</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Provider</div>
                  <div className="stat-value accent-val">Google</div>
                  <div className="stat-icon">🔑</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Status</div>
                  <div className="stat-value green-val">Active</div>
                  <div className="stat-icon success-icon">✓</div>
                </div>
              </div>

              <div className="section-title">Recent Activity</div>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-dot dot-green" />
                  <span className="activity-text"><strong>Login successful</strong> via Google OAuth2</span>
                  <span className="activity-time">just now</span>
                </div>
                <div className="activity-item">
                  <span className="activity-dot dot-accent" />
                  <span className="activity-text"><strong>Session started</strong> on this device</span>
                  <span className="activity-time">2m ago</span>
                </div>
                <div className="activity-item">
                  <span className="activity-dot dot-amber" />
                  <span className="activity-text"><strong>Profile synced</strong> from Google account</span>
                  <span className="activity-time">2m ago</span>
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-wrapper">
              <div className="profile-card-main">
                <div className="profile-banner">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar-inner">
                      {user.picture ? <img src={user.picture} alt="avatar" /> : getInitials(user.name)}
                    </div>
                  </div>
                </div>
                <div className="profile-body">
                  <div className="profile-name-row">
                    <div>
                      <div className="profile-name">{user.name}</div>
                      <div className="profile-email">{user.email}</div>
                    </div>
                    <button className="btn-edit-profile" onClick={() => openEdit(user)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit Profile
                    </button>
                  </div>
                  <div className="profile-fields">
                    <div className="field-row">
                      <span className="field-label">Full name</span>
                      <span className="field-val">{user.name}</span>
                    </div>
                    <div className="field-row">
                      <span className="field-label">Email</span>
                      <span className="field-val">{user.email}</span>
                    </div>
                    <div className="field-row">
                      <span className="field-label">Account type</span>
                      <span className="field-tag">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google Account
                      </span>
                    </div>
                    {user.sub && (
                      <div className="field-row">
                        <span className="field-label">Google ID</span>
                        <span className="field-val mono-val">{user.sub}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="users-header">
                <div>
                  <div className="users-title">All Users</div>
                  <div className="users-count">{allUsers.length} registered accounts</div>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u, i) => (
                      <tr key={u.id}>
                        <td>
                          <div className="td-user">
                            <div className={`td-avatar color-${avatarColors[i % avatarColors.length]}`}>
                              {u.picture ? <img src={u.picture} alt="avatar" /> : getInitials(u.name)}
                            </div>
                            <span className="td-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="td-email">{u.email}</td>
                        <td><span className="provider-pill">{u.provider}</span></td>
                        <td>
                          <span className="status-active">
                            <span className="status-dot" />
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button className="action-btn edit-btn" onClick={() => openEdit(u)} title="Edit">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                            <button className="action-btn delete-btn" onClick={() => setDeleteModal(u)} title="Delete">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allUsers.length === 0 && (
                  <div className="empty-state">No users found.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;