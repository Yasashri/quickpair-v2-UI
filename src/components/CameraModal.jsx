import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CameraModal.scss";

function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);

  // Initialize camera stream
  const startCamera = async (deviceIndex = 0, availableDevices = devices) => {
    setLoading(true);
    setHasError(false);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          aspectRatio: { ideal: 1 },
        },
        audio: false,
      };

      // If we have a specific device, use its deviceId
      if (availableDevices.length > 0 && availableDevices[deviceIndex]) {
        constraints.video.deviceId = { exact: availableDevices[deviceIndex].deviceId };
      } else {
        constraints.video.facingMode = "user"; // Default to selfie
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasError(true);
      setErrorMessage(
        "Could not access camera. Please ensure permissions are granted and no other application is using it."
      );
      setLoading(false);
    }
  };

  // Get available video devices
  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      return videoDevices;
    } catch (e) {
      console.warn("Could not enumerate devices:", e);
      return [];
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCapturedImage(null);
      
      const init = async () => {
        const videoDevices = await getDevices();
        await startCamera(0, videoDevices);
      };

      init();
    } else {
      document.body.style.overflow = "";
      stopCamera();
    }

    return () => {
      document.body.style.overflow = "";
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    await startCamera(nextIndex);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // We want a square crop for profile photos
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    // Draw video to canvas (mirrored for natural preview)
    context.translate(size, 0);
    context.scale(-1, 1);
    context.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    
    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(currentDeviceIndex);
  };

  const usePhoto = () => {
    if (!capturedImage) return;

    // Convert dataUrl to blob and then File
    fetch(capturedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
        onCapture(file, capturedImage);
        onClose();
      })
      .catch((err) => {
        console.error("Failed to generate file from snapshot:", err);
        alert("Failed to process captured image.");
      });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="camera-modal-backdrop" onClick={onClose}>
        <motion.div
          className="camera-modal-dialog"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        >
          <button className="camera-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>

          <h2 className="camera-modal-title">
            {capturedImage ? "Preview Profile Photo" : "Take Profile Photo"}
          </h2>

          <div className="camera-modal-viewport">
            {loading && !capturedImage && (
              <div className="camera-modal-status">
                <span className="camera-spinner"></span>
                <p>Initializing camera...</p>
              </div>
            )}

            {hasError && !capturedImage && (
              <div className="camera-modal-error">
                <span className="error-icon">⚠️</span>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Live Camera Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                display: !capturedImage && !hasError && !loading ? "block" : "none",
              }}
            />

            {/* Captured Snapshot Display */}
            {capturedImage && (
              <img src={capturedImage} alt="Captured preview" className="captured-image-preview" />
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div className="camera-modal-actions">
            {!capturedImage ? (
              <>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={onClose}
                >
                  Cancel
                </button>

                {devices.length > 1 && (
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={switchCamera}
                    disabled={loading || hasError}
                  >
                    Switch Camera 🔄
                  </button>
                )}

                <button
                  type="button"
                  className="button button-capture"
                  onClick={capturePhoto}
                  disabled={loading || hasError}
                >
                  Capture Photo 📸
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={retakePhoto}
                >
                  Retake Photo 🔄
                </button>
                <button
                  type="button"
                  className="button button-use"
                  onClick={usePhoto}
                >
                  Use Photo ✓
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

export default CameraModal;
