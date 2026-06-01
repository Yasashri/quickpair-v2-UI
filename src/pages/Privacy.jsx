import { useEffect, useState } from "react";
import api from "../api/api";
import ScrollToTop from "../components/ScrollToTop";

function Privacy() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/policies/privacy")
      .then((res) => {
        setContent(res.data.content);
      })
      .catch((err) => {
        console.error("Failed to load Privacy Policy", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className="container policies-page">
      <ScrollToTop />
      <div className="policy-card">
        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.6)" }}>Loading Privacy Policy...</p>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </section>
  );
}

export default Privacy;
