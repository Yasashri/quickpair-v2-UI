import { useEffect, useState } from 'react';
import api from '../api/api';
import Card from '../components/Card';

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({ first_name: '', last_name: '', display_name: '', age: '', gender: 'male', looking_for: 'any', city: '', country: '', occupation: '', education: '', relationship_goal: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/my-profile').then((response) => {
      const profileData = response.data.profile;
      setProfile(profileData);
      if (profileData) {
        setData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          display_name: profileData.display_name || '',
          age: profileData.age || '',
          gender: profileData.gender || 'male',
          looking_for: profileData.looking_for || 'any',
          city: profileData.city || '',
          country: profileData.country || '',
          occupation: profileData.occupation || '',
          education: profileData.education || '',
          relationship_goal: profileData.relationship_goal || '',
          bio: profileData.bio || '',
        });
      }
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) => payload.append(key, value));
      const url = profile ? '/my-profile' : '/my-profile';
      const method = profile ? api.put : api.post;
      await method(url, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Profile submitted for review.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-card">
      <Card title={profile ? 'Update your profile' : 'Create your profile'}>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              First name
              <input value={data.first_name} onChange={(e) => setData({ ...data, first_name: e.target.value })} required />
            </label>
            <label>
              Last name
              <input value={data.last_name} onChange={(e) => setData({ ...data, last_name: e.target.value })} required />
            </label>
            <label>
              Display name
              <input value={data.display_name} onChange={(e) => setData({ ...data, display_name: e.target.value })} required />
            </label>
            <label>
              Age
              <input value={data.age} onChange={(e) => setData({ ...data, age: e.target.value })} type="number" min="18" required />
            </label>
            <label>
              Gender
              <select value={data.gender} onChange={(e) => setData({ ...data, gender: e.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Looking for
              <select value={data.looking_for} onChange={(e) => setData({ ...data, looking_for: e.target.value })}>
                <option value="any">Anyone</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <label>
            City
            <input value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
          </label>
          <label>
            Country
            <input value={data.country} onChange={(e) => setData({ ...data, country: e.target.value })} />
          </label>
          <label>
            Occupation
            <input value={data.occupation} onChange={(e) => setData({ ...data, occupation: e.target.value })} />
          </label>
          <label>
            Education
            <input value={data.education} onChange={(e) => setData({ ...data, education: e.target.value })} />
          </label>
          <label>
            Goal
            <input value={data.relationship_goal} onChange={(e) => setData({ ...data, relationship_goal: e.target.value })} />
          </label>
          <label>
            Bio
            <textarea value={data.bio} onChange={(e) => setData({ ...data, bio: e.target.value })} rows="5" />
          </label>
          <label>
            Profile image
            <input type="file" accept="image/*" name="profile_image" onChange={(e) => setData({ ...data, profile_image: e.target.files[0] })} />
          </label>
          {message && <p className="form-note">{message}</p>}
          <button type="submit" className="button" disabled={saving}>{saving ? 'Saving...' : profile ? 'Update profile' : 'Create profile'}</button>
        </form>
      </Card>
    </section>
  );
}

export default MyProfile;
