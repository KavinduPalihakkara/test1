import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

const Main = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [tireSize, setTireSize] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraOpened, setCameraOpened] = useState(false);

  const openCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      videoRef.current.srcObject = newStream;
      setStream(newStream);
      setCameraOpened(true);
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  };

  const closePicture = () => {
    setCapturedImage(null);
    setTireSize("");
    setError("");
    openCamera(); // Reopen camera when closing the picture
  };

  const captureImage = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    await extractTextFromImage(imageData);
  };

  const extractTextFromImage = async (imageBase64) => {
    setLoading(true);
    try {
      const { data } = await Tesseract.recognize(imageBase64, "eng");
      const extractedText = data.text.replace(/\n/g, " ").trim();

      console.log("Extracted Text:", extractedText);
      const tireSizeMatch = extractedText.match(/\b\d{3}\/\d{2}R\d{2}\b/);

      if (tireSizeMatch) {
        setTireSize(tireSizeMatch[0]);
        setError("");
      } else {
        setError("No valid tire size detected. Please retry.");
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to extract text from image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {!cameraOpened && <button style={styles.button} onClick={openCamera}>Open Camera</button>}
      {stream && !capturedImage && (
        <button style={styles.button} onClick={captureImage}>Capture Image</button>
      )}
      {!capturedImage && <video ref={videoRef} autoPlay style={styles.video}></video>}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      {capturedImage && (
        <>
          <img src={capturedImage} alt="Captured" style={styles.capturedImage} />
          <button style={styles.button} onClick={closePicture}>Close Picture</button>
        </>
      )}
      {loading && <p>Processing image...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {tireSize && <p>Detected Tire Size: {tireSize}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    overflowY: "auto",
    padding: "20px",
  },
  button: {
    padding: "10px 15px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  video: {
    marginTop: "20px",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "10px",
  },
  capturedImage: {
    marginTop: "20px",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "10px",
  },
};

export default Main;