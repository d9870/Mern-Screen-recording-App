import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecordRTC from "recordrtc";
import axios from "axios";
import jwt_decode from "jwt-decode";

export default function ScreenRecord() {
  const [recordingBlob, setRecordingBlob] = useState({
    webcamVideo: null,
    screenVideo: null,
  });

  const webCamRef = useRef(null);
  const screenRef = useRef(null);
  const recorderRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("Token");
    navigate("/login");
  };

  const handleStart = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: 1920,
          height: 1080,
          frameRate: 30,
        },
        audio: true,
      });

      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const screenRecorder = new RecordRTC(screenStream, {
        type: "video",
      });

      const camRecorder = new RecordRTC(cameraStream, {
        type: "video",
      });

      screenRecorder.startRecording();
      camRecorder.startRecording();

      webCamRef.current = screenStream;
      screenRef.current = cameraStream;

      recorderRef.current = { webcam: camRecorder, screen: screenRecorder };
    } catch (error) {
      console.error("Error starting recording: ", error);
    }
  };

  const handleStop = async () => {
    const { webcam, screen } = recorderRef.current;

    await Promise.all([
      new Promise((resolve) => webcam.stopRecording(resolve)),
      new Promise((resolve) => screen.stopRecording(resolve)),
    ]);

    const webcamBlob = webcam.getBlob();
    const screenBlob = screen.getBlob();

    setRecordingBlob({ webcamVideo: webcamBlob, screenVideo: screenBlob });

    webCamRef.current.getTracks().forEach((track) => track.stop());
    screenRef.current.getTracks().forEach((track) => track.stop());
  };

  const saveRecordedDataToDB = async (usermail) => {
    try {
      if (recordingBlob.webcamVideo && recordingBlob.screenVideo) {
        const formData = new FormData();

        formData.append(
          "webcamVideo",
          recordingBlob.webcamVideo,
          "webcamVideo.webm"
        );
        formData.append(
          "screenVideo",
          recordingBlob.screenVideo,
          "screenVideo.webm"
        );

        formData.append("usermail", usermail);

        await axios.post("http://localhost:5000/recordings", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Recording saved successfully!");
      }
    } catch (error) {
      console.error("Error saving recorded data to the database:", error);
    }
  };

  const handleSaveToDB = async () => {
    try {
      if (recordingBlob.webcamVideo && recordingBlob.screenVideo) {
        const token = localStorage.getItem("Token");
        const decodedToken = jwt_decode(token);
        const usermail = decodedToken.email;

        await saveRecordedDataToDB(usermail);
      }
    } catch (e) {
      console.log("Error saving recorded data:", e);
    }
  };

  return (
    <div>
      <div>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleSaveToDB}>Save</button>
        <br />
        <button onClick={handleLogout}>Logout</button>
        {recordingBlob.webcamVideo && recordingBlob.screenVideo && (
          <div>
            <video controls>
              <source
                src={URL.createObjectURL(recordingBlob.webcamVideo)}
                type="video/webm"
              />
            </video>
            <br />
            <video controls>
              <source src={URL.createObjectURL(recordingBlob.screenVideo)} />
            </video>
          </div>
        )}
      </div>
    </div>
  );
}
