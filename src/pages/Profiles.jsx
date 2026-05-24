import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [gender, setGender] = useState('all');
  const debounceDelay = 500; // ms

  // Fetch profiles with search, sort, and gender filter
  useEffect(() => {
    setLoading(true);
    const params = {
      search,
      sort: sortBy,
      ...(gender !== 'all' && { gender }),
    };

    api.get('/profiles', { params })
      .then((response) => {
        setProfiles(response.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, sortBy, gender]);

  // Debounce query -> search so we don't call API on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(query);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query, debounceDelay]);

  const clearSearch = () => {
    setSearch('');
    setQuery('');
    setSortBy('recent');
    setGender('all');
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <h1>Browse profiles</h1>
      </div>

      {/* Search Bar */}
      <input
        placeholder="Search by name, hobby, food, country, or city"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%' }}
      />

      {/* Sort and Gender Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort profiles"
        >
          <option value="recent">Sort: Recent</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
        </select>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          aria-label="Filter by gender"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        {(search || sortBy !== 'recent' || gender !== 'all') && (
          <button
            onClick={clearSearch}
            aria-label="Clear search and reset filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
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
