import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/profiles', { params: { search } }).then((response) => {
      setProfiles(response.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [search]);

  return (
    <section className="page-card">
      <div className="page-header">
        <h1>Browse profiles</h1>
        <input
          className="search-input"
          placeholder="Search by name, city, or bio"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading profiles...</p>
      ) : (
        <div className="grid-list">
          {profiles.map((profile) => (
            <Card key={profile.id} title={profile.display_name || 'New member'}>
              <p>{profile.bio || 'No bio yet.'}</p>
              <p>{profile.city ? `${profile.city}, ${profile.country}` : 'Location hidden'}</p>
              <p>Looking for: {profile.looking_for || 'anyone'}</p>
              <Link to={`/profiles/${profile.id}`} className="button button--small">View profile</Link>
            </Card>
          ))}
          {profiles.length === 0 && <p className="empty-state">No profiles found.</p>}
        </div>
      )}
    </section>
  );
}

export default Profiles;
