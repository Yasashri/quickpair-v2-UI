import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";
import ScrollToTop from "../components/ScrollToTop";
import { formatLastSeen } from "../utils/date";

function Profiles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [gender, setGender] = useState("all");
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const debounceDelay = 500;

  // Keep state in sync with URL page changes (e.g. browser back/forward)
  useEffect(() => {
    if (pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [pageParam]);

  useEffect(() => {
    setLoading(true);

    const params = {
      search,
      sort: sortBy,
      page: currentPage,
      ...(gender !== "all" && { gender }),
    };

    api
      .get("/profiles", { params })
      .then((response) => {
        const paginator = response.data;
        setProfiles(paginator.data || []);
        const apiPage = paginator.current_page || 1;
        setCurrentPage(apiPage);
        setLastPage(paginator.last_page || 1);
        setTotal(paginator.total || 0);
        setLoading(false);

        // If returned page doesn't match URL query, sync it (e.g. page out of bounds)
        if (apiPage !== pageParam) {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            if (apiPage === 1) {
              next.delete("page");
            } else {
              next.set("page", apiPage);
            }
            return next;
          });
        }
      })
      .catch(() => setLoading(false));
  }, [search, sortBy, gender, currentPage, pageParam]);

  useEffect(() => {
    if (query === "" && search === "") return;

    const handler = setTimeout(() => {
      setSearch(query);
      changePage(1);
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [query]);

  const changePage = (page) => {
    setCurrentPage(page);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (page === 1) {
        next.delete("page");
      } else {
        next.set("page", page);
      }
      return next;
    });
  };

  const clearSearch = () => {
    setSearch("");
    setQuery("");
    setSortBy("recent");
    setGender("all");
    changePage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1; // number of pages to show on either side of currentPage
    
    // Always include page 1
    pages.push(1);
    
    // Calculate range around currentPage
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
    
    // Always include lastPage if lastPage > 1
    if (lastPage > 1) {
      pages.push(lastPage);
    }
    
    return pages;
  };

  return (
    <section className='container profiles-page'>
      <ScrollToTop />
      <div className='page-card'>
        <div className='page-header'>
          <span className='eyebrow'>Find your match</span>
          <h1>QuickPair members</h1>
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
              onChange={(e) => {
                setSortBy(e.target.value);
                changePage(1);
              }}
              aria-label='Sort profiles'
            >
              <option value='recent'>Sort: Recent</option>
              <option value='oldest'>Sort: Oldest</option>
              <option value='name-asc'>Sort: Name A-Z</option>
              <option value='name-desc'>Sort: Name Z-A</option>
            </select>

            <select
              value={gender}
              onChange={(e) => {
                setGender(e.target.value);
                changePage(1);
              }}
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
          <div className='grid-list'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-link skeleton-card">
                <Card
                  title={<div className="skeleton skeleton-title"></div>}
                  image="data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 100 100'%2F%3E"
                  imageAlt="Loading..."
                >
                  <div className="skeleton skeleton-meta"></div>
                  <div className="skeleton skeleton-button"></div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className='grid-list'>
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to={`/profiles/${profile.id}`}
                className="card-link"
              >
                <Card
                  title={
                    <div className="profile-card-title">
                      <span>{`${profile.display_name || "New member"}${profile.age ? `, ${profile.age}` : ""}`}</span>
                      {profile.user?.phone_verified_at && (
                        <span className="verified-badge-tick" title="Phone Verified" style={{ color: "#10b981", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                          &nbsp;✓
                        </span>
                      )}
                    </div>
                  }
                  image={profile.profile_image_url || `/avatar.jpg`}
                  imageAlt={profile.display_name || "Profile image"}
                >
                  <p className='profile-meta'>
                    {profile.city
                      ? `${profile.city}, ${profile.country}`
                      : "Location hidden"}
                  </p>

                  <div className="profile-status-inline">
                    <span 
                      className={`status-indicator-badge-inline ${
                        profile.user?.is_online ? 'online' : 'offline'
                      }`}
                    >
                      {profile.user?.is_online ? (
                        <span className="status-badge-dot" />
                      ) : (
                        <span className="status-badge-dot-offline" />
                      )}
                      <span>
                        {profile.user?.is_online 
                          ? 'Online' 
                          : profile.user?.last_seen_at 
                            ? `Active ${formatLastSeen(profile.user.last_seen_at)}` 
                            : 'Offline'
                        }
                      </span>
                    </span>
                  </div>

                  <div className="profile-tags">
                    {profile.gender && (
                      <span className="profile-tag profile-tag--gender">
                        {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                      </span>
                    )}
                    <span className="profile-tag profile-tag--looking">
                      Looking: <strong>{profile.looking_for || "anyone"}</strong>
                    </span>
                  </div>

                  <div className='button button--small'>
                    View profile
                  </div>
                </Card>
              </Link>
            ))}

            {profiles.length === 0 && (
              <p className='empty-state'>No profiles found.</p>
            )}
          </div>
        )}

        {!loading && lastPage > 1 && (
          <div className="pagination">
            <button
              className="pagination__btn pagination__btn--arrow"
              onClick={() => changePage(Math.max(1, currentPage - 1))}
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
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => changePage(page)}
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
              onClick={() => changePage(Math.min(lastPage, currentPage + 1))}
              disabled={currentPage === lastPage}
              aria-label="Next page"
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Profiles;
