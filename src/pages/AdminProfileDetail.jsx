import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';

function extractResource(data) {
  if (!data) return null;
  if (data.data && typeof data.data === 'object') return data.data;
  if (data.profile && typeof data.profile === 'object') return data.profile;
  if (data.user && typeof data.user === 'object') return data.user;
  return data;
}

function formatFieldLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function AdminProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      let profileData = null;
      let userData = null;

      try {
        const profileResponse = await api.get(`/admin/profiles/${id}`);
        profileData = extractResource(profileResponse.data);
      } catch (error) {
        try {
          const fallbackResponse = await api.get(`/profiles/${id}`);
          profileData = extractResource(fallbackResponse.data);
        } catch {
          profileData = null;
        }
      }

      try {
        const userResponse = await api.get(`/admin/profiles/${id}/user`);
        userData = extractResource(userResponse.data);
      } catch {
        userData = null;
      }

      setProfile(profileData);
      setUser(userData);
      setLoading(false);
    };

    loadProfile();
  }, [id]);

  const handleAction = async (action) => {
    if (action === 'reject' && !feedback.trim()) {
      alert('Rejection feedback is required.');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this profile?`)) return;

    setActionLoading(true);
    try {
      const body = action === 'reject' ? { feedback: feedback.trim() } : {};
      await api.post(`/admin/profiles/${id}/${action}`, body);
      alert(`Profile ${action}ed successfully.`);
      navigate('/admin/dashboard');
    } catch (error) {
      alert(`Failed to ${action} profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const profileEntries = profile
    ? Object.entries(profile).filter(([, value]) => value !== null && value !== undefined && value !== '')
    : [];

  const knownProfileKeys = [
    'display_name',
    'bio',
    'age',
    'city',
    'country',
    'occupation',
    'relationship_goal',
    'interests',
    'status',
    'created_at',
  ];

  const extraProfileEntries = profileEntries.filter(([key]) => !knownProfileKeys.includes(key));

  return (
    <section className="page-card admin-page">
      <div className="page-header">
        <h1>Profile Review</h1>
        <button className="button button--secondary" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p>Loading profile details...</p>
      ) : !profile ? (
        <div>
          <p>Profile not found.</p>
          <button className="button" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <Card title={`${profile.display_name || profile.email || 'Profile'} Details`}>
          <div className="profile-review-container">
            <dl className="profile-details">
              {user?.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              )}

              {profile.display_name && (
                <div>
                  <dt>Display Name</dt>
                  <dd>{profile.display_name}</dd>
                </div>
              )}

              {profile.bio && (
                <div>
                  <dt>Biography</dt>
                  <dd>{profile.bio}</dd>
                </div>
              )}

              {profile.age && (
                <div>
                  <dt>Age</dt>
                  <dd>{profile.age}</dd>
                </div>
              )}

              {(profile.city || profile.country) && (
                <div>
                  <dt>Location</dt>
                  <dd>{[profile.city, profile.country].filter(Boolean).join(', ')}</dd>
                </div>
              )}

              {profile.occupation && (
                <div>
                  <dt>Occupation</dt>
                  <dd>{profile.occupation}</dd>
                </div>
              )}

              {profile.relationship_goal && (
                <div>
                  <dt>Relationship Goal</dt>
                  <dd>{profile.relationship_goal}</dd>
                </div>
              )}

              {profile.interests && (
                <div>
                  <dt>Interests</dt>
                  <dd>{profile.interests}</dd>
                </div>
              )}

              {profile.status && (
                <div>
                  <dt>Status</dt>
                  <dd>{profile.status}</dd>
                </div>
              )}

              <div>
                <dt>Rejection feedback</dt>
                <dd>
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Enter rejection feedback here..."
                    rows={4}
                    className="rejection-feedback"
                  />
                </dd>
              </div>
            </dl>

            <div className="admin-actions-detailed">
              {profile.status === 'pending' && (
                <button className="button button--success" onClick={() => handleAction('approve')} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Approve Profile'}
                </button>
              )}
              <button className="button button--secondary" onClick={() => handleAction('reject')} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Reject Profile'}
              </button>
              {user?.status !== 'suspended' && user?.status && (
                <button className="button button--danger" onClick={() => handleAction('suspend')} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Suspend User'}
                </button>
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

export default AdminProfileDetail;
