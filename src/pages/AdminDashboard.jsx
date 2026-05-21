import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';

const views = [
  { key: 'all', label: 'All profiles' },
  { key: 'pending', label: 'Pending profiles' },
  { key: 'rejected', label: 'Rejected profiles' },
  { key: 'users', label: 'Users' },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('pending');
  const [allProfiles, setAllProfiles] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [rejectedProfiles, setRejectedProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    const [allResponse, pendingResponse, rejectedResponse, usersResponse] = await Promise.all([
      api.get('/admin/profiles').catch(() => ({ data: { data: [] } })),
      api.get('/admin/profiles/pending').catch(() => ({ data: { data: [] } })),
      api.get('/admin/profiles/rejected').catch(() => ({ data: { data: [] } })),
      api.get('/admin/users').catch(() => ({ data: { data: [] } })),
    ]);

    setAllProfiles(allResponse.data.data || []);
    setPendingProfiles(pendingResponse.data.data || []);
    setRejectedProfiles(rejectedResponse.data.data || []);
    setUsers(usersResponse.data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAction = async (url) => {
    setActionLoading(true);
    try {
      await api.post(url);
      await refreshData();
    } catch (error) {
      alert(`Action failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const currentProfiles = view === 'pending' ? pendingProfiles : view === 'rejected' ? rejectedProfiles : allProfiles;
  const getProfileCount = (viewKey) => {
    if (viewKey === 'all') return allProfiles.length;
    if (viewKey === 'pending') return pendingProfiles.length;
    if (viewKey === 'rejected') return rejectedProfiles.length;
    if (viewKey === 'users') return users.length;
    return 0;
  };

  const renderProfiles = (profilesList) => (
    profilesList.length ? profilesList.map((profile) => (
      <div key={profile.id} className="admin-row">
        <div>
          <strong>{profile.display_name || profile.email || `Profile ${profile.id}`}</strong>
          <p>{profile.bio?.slice(0, 80) || profile.summary?.slice(0, 80) || 'No summary available.'}</p>
          {profile.status && <small>Status: {profile.status}</small>}
        </div>
        <div className="admin-actions">
          <button className="button button--small" onClick={() => navigate(`/admin/profiles/${profile.id}`)}>View Full Profile</button>
          {profile.status === 'rejected' && (
            <button className="button button--small" onClick={() => handleAction(`/admin/profiles/${profile.id}/approve`)} disabled={actionLoading}>Approve</button>
          )}
        </div>
      </div>
    )) : <p className="empty-state">No profiles found.</p>
  );

  const renderUsers = () => (
    users.length ? users.map((user) => (
      <div key={user.id} className="admin-row">
        <div>
          <strong>{user.email}</strong>
          <p>Status: {user.status || 'Unknown'}</p>
          {user.name && <small>{user.name}</small>}
        </div>
        <div className="admin-actions">
          {user.status === 'suspended' ? (
            <button className="button button--secondary button--small" onClick={() => handleAction(`/admin/users/${user.id}/activate`)} disabled={actionLoading}>Activate</button>
          ) : (
            <button className="button button--small" onClick={() => handleAction(`/admin/users/${user.id}/suspend`)} disabled={actionLoading}>Suspend</button>
          )}
        </div>
      </div>
    )) : <p className="empty-state">No users found.</p>
  );

  return (
    <section className="page-card admin-page">
      <div className="page-header">
        <h1>Admin dashboard</h1>
        <p>Use the sidebar to switch between all profiles, pending reviews, rejected profiles, and users.</p>
      </div>

      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <div className="admin-layout">
          <aside className="admin-sidebar">
            {views.map((item) => (
              <button
                key={item.key}
                className={`button button--small ${view === item.key ? 'active' : ''}`}
                onClick={() => setView(item.key)}
              >
                <span>{item.label}</span>
                <span className="sidebar-count">{getProfileCount(item.key)}</span>
              </button>
            ))}
          </aside>

          <div className="admin-content">
            {view === 'users' ? (
              <Card title="Users">
                {renderUsers()}
              </Card>
            ) : (
              <Card title={views.find((item) => item.key === view)?.label || 'Profiles'}>
                {renderProfiles(currentProfiles)}
              </Card>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;
