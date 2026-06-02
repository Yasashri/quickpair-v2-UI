import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";
import ScrollToTop from "../components/ScrollToTop";
import useAuth from "../hooks/useAuth";
import Modal from "../components/Modal";
import CameraModal from "../components/CameraModal";

function MyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [previewImage, setPreviewImage] = useState("/avatar.jpg");
  const [showModal, setShowModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (user && !user.email_verified_at) {
      setShowModal(true);
    }
  }, [user]);

  const [data, setData] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    age: "",
    gender: "male",
    looking_for: "any",
    city: "",
    country: "",
    relationship_goal: "",
    profile_image: "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const getProfileStatus = () => {
    if (!profile) {
      return {
        className: "is-new",
        label: "No profile yet",
        text: "Create your dating profile and submit it for admin review.",
      };
    }

    if (profile.status === "approved") {
      return {
        className: "is-approved",
        label: "Approved",
        text: "Your profile is approved and visible to other users.",
      };
    }

    if (profile.status === "rejected") {
      return {
        className: "is-rejected",
        label: "Rejected",
        text:
          profile.admin_feedback ||
          "Your profile was rejected. Please update it and submit again.",
      };
    }

    return {
      className: "is-pending",
      label: "Submitted for approval",
      text: "Your profile is waiting for admin review.",
    };
  };

  useEffect(() => {
    api.get("/my-profile").then((response) => {
      const profileData = response.data.profile;

      setProfile(profileData);

      if (profileData) {
        setData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          display_name: profileData.display_name || "",
          age: profileData.age || "",
          gender: profileData.gender || "male",
          looking_for: profileData.looking_for || "any",
          city: profileData.city || "",
          country: profileData.country || "",
          relationship_goal: profileData.relationship_goal || "",
          profile_image: "",
        });

        if (profileData.profile_image_url) {
          setPreviewImage(profileData.profile_image_url);
        } else if (profileData.profile_image) {
          setPreviewImage(profileData.profile_image);
        }
      }
    });
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setData({ ...data, profile_image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCameraCapture = (file, dataUrl) => {
    setData({ ...data, profile_image: file });
    setPreviewImage(dataUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (user && !user.email_verified_at) {
      setShowModal(true);
      return;
    }

    setSaving(true);
    setMessage("");

    const usesFileUpload = data.profile_image instanceof File;
    const hasExistingImage =
      profile && (profile.profile_img_path || profile.profile_image_url);

    if (!usesFileUpload && !hasExistingImage) {
      setMessage("Profile image is required. Please upload a profile photo.");
      setSaving(false);
      return;
    }

    try {
      const usesFileUpload = data.profile_image instanceof File;

      let response;

      if (usesFileUpload) {
        const payload = new FormData();

        Object.entries(data).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            payload.append(key, value);
          }
        });

        if (profile) {
          payload.append("_method", "PUT");
        }

        response = await api.post("/my-profile", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const payload = { ...data };
        delete payload.profile_image;

        if (profile) {
          response = await api.put("/my-profile", payload);
        } else {
          response = await api.post("/my-profile", payload);
        }
      }

      if (response?.data?.profile) {
        setProfile(response.data.profile);
      }

      setMessage("Profile submitted for review.");
    } catch (error) {
      const errors = error.response?.data?.errors;
      const serverMessage = error.response?.data?.message;

      const feedback = errors
        ? Object.values(errors).flat().join(" ")
        : serverMessage;

      setMessage(feedback || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const status = getProfileStatus();

  return (
    <section className='page-card'>
      <ScrollToTop />

      {profile?.status === "rejected" && profile.admin_feedback && (
        <div className='profile-rejection-banner'>
          <h3>Profile Rejection Reason</h3>
          <p>{profile.admin_feedback}</p>
        </div>
      )}

      <Card title={profile ? "Update your profile" : "Create your profile"}>
        <form className='profile-form' onSubmit={handleSubmit}>
          <fieldset
            disabled={saving}
            style={{
              border: "none",
              padding: 0,
              margin: 0,
              display: "contents",
            }}
          >
            <div className={`profile-status-card ${status.className}`}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span>{status.label}</span>
                {user?.email_verified_at && (
                  <span
                    className='email-verified-badge-label'
                    style={{
                      color: "#10b981",
                      border: "1px solid rgba(16, 185, 129, 0.34)",
                      background: "rgba(16, 185, 129, 0.1)",
                      display: "inline-flex",
                      padding: "7px 12px",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    ✓ Email Verified
                  </span>
                )}
              </div>
              <p>{status.text}</p>
            </div>

            <div className='profile-image-preview'>
              <img
                src={previewImage ? previewImage : "/avatar.jpg"}
                alt='Profile preview'
              />

              <div>
                <h3>Profile photo</h3>
                <p>
                  Upload a clear photo. This image will be shown on your public
                  profile after approval.
                </p>
              </div>
            </div>

            <div className="photo-input-group">
              <label className="photo-file-label">
                Profile image <span style={{ color: "#ff4f7b" }}>*</span>
                <input
                  type='file'
                  accept='image/*'
                  name='profile_image'
                  onChange={handleImageChange}
                />
              </label>

              <button
                type="button"
                className="button button-camera-trigger"
                onClick={() => setIsCameraOpen(true)}
              >
                Take a Photo 📸
              </button>
            </div>

            <div className='form-grid'>
              <label>
                First name
                <input
                  value={data.first_name}
                  onChange={(e) =>
                    setData({ ...data, first_name: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Last name
                <input
                  value={data.last_name}
                  onChange={(e) =>
                    setData({ ...data, last_name: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Display name
                <input
                  value={data.display_name}
                  onChange={(e) =>
                    setData({ ...data, display_name: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                Age
                <input
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: e.target.value })}
                  type='number'
                  min='18'
                  required
                />
              </label>

              <label>
                Gender
                <select
                  value={data.gender}
                  onChange={(e) => setData({ ...data, gender: e.target.value })}
                >
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='other'>Other</option>
                </select>
              </label>

              <label>
                Looking for
                <select
                  value={data.looking_for}
                  onChange={(e) =>
                    setData({ ...data, looking_for: e.target.value })
                  }
                >
                  <option value='any'>Anyone</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='other'>Other</option>
                </select>
              </label>
            </div>

            <label>
              City
              <input
                required
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
              />
            </label>

            <label>
              Country
              <input
                required
                value={data.country}
                onChange={(e) => setData({ ...data, country: e.target.value })}
              />
            </label>

            {message && <p className='form-note'>{message}</p>}

            <button type='submit' className='button' disabled={saving}>
              {saving ? (
                <>
                  <span className='button-spinner'></span>
                  Saving...
                </>
              ) : profile ? (
                "Update profile"
              ) : (
                "Create profile"
              )}
            </button>
          </fieldset>
        </form>
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type='warning'
        title='Email Verification Required'
        message='Please verify your email address before updating your profile.'
        confirmText='Verify Now'
        cancelText='Close'
        onConfirm={() => navigate("/verify-email")}
      />
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </section>
  );
}

export default MyProfile;
