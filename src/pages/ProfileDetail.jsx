import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';

function ProfileDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/profiles/${id}`).then((response) => {
      setProfile(response.data.profile);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <section className="page-card"><p>Loading profile...</p></section>;
  }

  if (!profile) {
    return <section className="page-card"><p>Profile not found.</p></section>;
  }

  return (
    <section className="page-card">
      <Card title={profile.display_name || 'Profile'}>
        <p>{profile.bio || 'No biography available.'}</p>
        <dl className="profile-details">
          <div>
            <dt>Age</dt>
            <dd>{profile.age || '—'}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{profile.city ? `${profile.city}, ${profile.country}` : 'Not listed'}</dd>
          </div>
          <div>
            <dt>Occupation</dt>
            <dd>{profile.occupation || 'Not listed'}</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{profile.relationship_goal || 'Looking for connection'}</dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}

export default ProfileDetail;
