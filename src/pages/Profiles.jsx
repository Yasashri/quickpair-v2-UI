import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";
import ScrollToTop from "../components/ScrollToTop";
import { formatLastSeen } from "../utils/date";

function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [gender, setGender] = useState("all");

  const debounceDelay = 500;


  useEffect(() => {
    setLoading(true);

    const params = {
      search,
      sort: sortBy,
      ...(gender !== "all" && { gender }),
    };

    api
      .get("/profiles", { params })
      .then((response) => {
        setProfiles(response.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, sortBy, gender]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(query);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query]);

  const clearSearch = () => {
    setSearch("");
    setQuery("");
    setSortBy("recent");
    setGender("all");
  };

  return (
    <section className='container profiles-page'>
      <ScrollToTop />
      <div className='page-card'>
        <div className='page-header'>
          <span className='eyebrow'>Find your match</span>
          <h1>Browse profiles</h1>
          <p>
            Discover people who share your interests, favorite food spots, and
            dating goals.
          </p>
        </div>

        <div className='profiles-filter'>
          <div className='profiles-filter__search'>
            <input
              placeholder='Search by name, hobby, food, country, or city'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className='profiles-filter__controls'>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label='Sort profiles'
            >
              <option value='recent'>Sort: Recent</option>
              <option value='oldest'>Sort: Oldest</option>
              <option value='name-asc'>Sort: Name A-Z</option>
              <option value='name-desc'>Sort: Name Z-A</option>
            </select>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              aria-label='Filter by gender'
            >
              <option value='all'>All genders</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
              <option value='other'>Other</option>
            </select>

            {(search || sortBy !== "recent" || gender !== "all") && (
              <button
                type='button'
                className='button button--small button--ghost'
                onClick={clearSearch}
                aria-label='Clear search and reset filters'
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className='profiles-status'>Loading profiles...</p>
        ) : (
          <div className='grid-list'>
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                title={
                  <div className="profile-card-title">
                    <span>{profile.display_name || "New member"}</span>
                    {profile.user?.is_online && (
                      <span className="online-indicator-dot" title="Online" />
                    )}
                  </div>
                }
                image={`https://i.pravatar.cc/400?img=${(profile.id % 70) + 1}`}
                imageAlt={profile.display_name || "Profile image"}
              >
                <p>{profile.bio || "No bio yet."}</p>

                <p className='profile-meta'>
                  {profile.city
                    ? `${profile.city}, ${profile.country}`
                    : "Location hidden"}
                </p>

                <p className='active-status'>
                  {profile.user?.is_online ? (
                    <span className="active-status--online">Online</span>
                  ) : (
                    profile.user?.last_seen_at && (
                      <span className="active-status--offline">
                        Active {formatLastSeen(profile.user.last_seen_at)}
                      </span>
                    )
                  )}
                </p>

                <p className='profile-looking'>
                  Looking for: <span>{profile.looking_for || "anyone"}</span>
                </p>

                <Link
                  to={`/profiles/${profile.id}`}
                  className='button button--small'
                >
                  View profile
                </Link>
              </Card>
            ))}

            {profiles.length === 0 && (
              <p className='empty-state'>No profiles found.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Profiles;
