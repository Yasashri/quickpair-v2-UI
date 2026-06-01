import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';
import AdminPolicyEditor from '../components/AdminPolicyEditor';

const views = [
  { key: 'all', label: 'All profiles' },
  { key: 'pending', label: 'Pending profiles' },
  { key: 'rejected', label: 'Rejected profiles' },
  { key: 'users', label: 'Users' },
  { key: 'policies', label: 'Terms & Policies' },
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

  // Pagination states for each section
  const [allPage, setAllPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);

  const [allTotal, setAllTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [rejectedTotal, setRejectedTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);

  const [allLastPage, setAllLastPage] = useState(1);
  const [pendingLastPage, setPendingLastPage] = useState(1);
  const [rejectedLastPage, setRejectedLastPage] = useState(1);
  const [usersLastPage, setUsersLastPage] = useState(1);

  // Compute active pagination info dynamically
  const currentPage = view === 'pending'
    ? pendingPage
    : view === 'rejected'
      ? rejectedPage
      : view === 'all'
        ? allPage
        : usersPage;

  const lastPage = view === 'pending'
    ? pendingLastPage
    : view === 'rejected'
      ? rejectedLastPage
      : view === 'all'
        ? allLastPage
        : usersLastPage;

  const total = view === 'pending'
    ? pendingTotal
    : view === 'rejected'
      ? rejectedTotal
      : view === 'all'
        ? allTotal
        : usersTotal;

  const refreshData = async () => {
    setLoading(true);
    // Reset page states back to 1
    setAllPage(1);
    setPendingPage(1);
    setRejectedPage(1);
    setUsersPage(1);

    const [allResponse, pendingResponse, rejectedResponse, usersResponse] = await Promise.all([
      api.get('/admin/profiles?page=1').catch(() => ({ data: { data: [], total: 0, last_page: 1 } })),
      api.get('/admin/profiles/pending?page=1').catch(() => ({ data: { data: [], total: 0, last_page: 1 } })),
      api.get('/admin/profiles/rejected?page=1').catch(() => ({ data: { data: [], total: 0, last_page: 1 } })),
      api.get('/admin/users?page=1').catch(() => ({ data: { data: [], total: 0, last_page: 1 } })),
    ]);

    setAllProfiles(allResponse.data.data || []);
    setAllTotal(allResponse.data.total || 0);
    setAllLastPage(allResponse.data.last_page || 1);

    setPendingProfiles(pendingResponse.data.data || []);
    setPendingTotal(pendingResponse.data.total || 0);
    setPendingLastPage(pendingResponse.data.last_page || 1);

    setRejectedProfiles(rejectedResponse.data.data || []);
    setRejectedTotal(rejectedResponse.data.total || 0);
    setRejectedLastPage(rejectedResponse.data.last_page || 1);

    setUsers(usersResponse.data.data || []);
    setUsersTotal(usersResponse.data.total || 0);
    setUsersLastPage(usersResponse.data.last_page || 1);

    setLoading(false);
  };

  const fetchTabData = async (tabKey, page) => {
    if (tabKey === 'policies') return;
    let url = '';
    if (tabKey === 'all') url = '/admin/profiles';
    else if (tabKey === 'pending') url = '/admin/profiles/pending';
    else if (tabKey === 'rejected') url = '/admin/profiles/rejected';
    else if (tabKey === 'users') url = '/admin/users';

    try {
      const response = await api.get(url, { params: { page } });
      const paginator = response.data;
      
      if (tabKey === 'all') {
        setAllProfiles(paginator.data || []);
        setAllTotal(paginator.total || 0);
        setAllLastPage(paginator.last_page || 1);
      } else if (tabKey === 'pending') {
        setPendingProfiles(paginator.data || []);
        setPendingTotal(paginator.total || 0);
        setPendingLastPage(paginator.last_page || 1);
      } else if (tabKey === 'rejected') {
        setRejectedProfiles(paginator.data || []);
        setRejectedTotal(paginator.total || 0);
        setRejectedLastPage(paginator.last_page || 1);
      } else if (tabKey === 'users') {
        setUsers(paginator.data || []);
        setUsersTotal(paginator.total || 0);
        setUsersLastPage(paginator.last_page || 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePageChange = (newPage) => {
    if (view === 'pending') {
      setPendingPage(newPage);
    } else if (view === 'rejected') {
      setRejectedPage(newPage);
    } else if (view === 'all') {
      setAllPage(newPage);
    } else if (view === 'users') {
      setUsersPage(newPage);
    }
    fetchTabData(view, newPage);
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
    if (viewKey === 'all') return allTotal;
    if (viewKey === 'pending') return pendingTotal;
    if (viewKey === 'rejected') return rejectedTotal;
    if (viewKey === 'users') return usersTotal;
    return 0;
  };

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    pages.push(1);
    
    let startRange = Math.max(2, currentPage - windowSize);
    let endRange = Math.min(lastPage - 1, currentPage + windowSize);
    
    if (startRange > 2) {
      pages.push("...");
    }
    
    for (let i = startRange; i <= endRange; i++) {
      pages.push(i);
    }
    
    if (endRange < lastPage - 1) {
      pages.push("...");
    }
    
    if (lastPage > 1) {
      pages.push(lastPage);
    }
    
    return pages;
  };

  const renderPagination = () => {
    if (lastPage <= 1) return null;

    return (
      <div className="pagination" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '24px', paddingTop: '16px' }}>
        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          &larr; Prev
        </button>

        <div className="pagination__pages pagination__pages--desktop">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                &bull;&bull;&bull;
              </span>
            ) : (
              <button
                key={`page-${page}`}
                className={`pagination__btn ${
                  currentPage === page ? 'active' : ''
                }`}
                onClick={() => handlePageChange(page)}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <div className="pagination__pages pagination__pages--mobile">
          <span className="pagination__current">{currentPage}</span>
          <span className="pagination__divider">/</span>
          <span className="pagination__total">{lastPage}</span>
        </div>

        <button
          className="pagination__btn pagination__btn--arrow"
          onClick={() => handlePageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage === lastPage}
          aria-label="Next page"
        >
          Next &rarr;
        </button>
      </div>
    );
  };

  const renderProfiles = (profilesList) => (
    profilesList.length ? (
      <>
        {profilesList.map((profile) => (
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
        ))}
        {renderPagination()}
      </>
    ) : <p className="empty-state">No profiles found.</p>
  );

  const renderUsers = () => (
    users.length ? (
      <>
        {users.map((user) => (
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
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => window.open(`/admin/users/${user.id}/compliance-report`, '_blank')}
                style={{ marginLeft: "8px" }}
              >
                Print PDF
              </button>
            </div>
          </div>
        ))}
        {renderPagination()}
      </>
    ) : <p className="empty-state">No users found.</p>
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
                {item.key !== 'policies' && (
                  <span className="sidebar-count">{getProfileCount(item.key)}</span>
                )}
              </button>
            ))}
          </aside>

          <div className="admin-content">
            {view === 'users' ? (
              <Card title="Users">
                {renderUsers()}
              </Card>
            ) : view === 'policies' ? (
              <Card title="Manage Terms & Policies">
                <AdminPolicyEditor />
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
