import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const bottomRef = useRef(null);

  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* VOICE INPUT */

  const startVoice = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.start();

    recognition.onresult = (event) => {

      const speech = event.results[0][0].transcript;

      setQuestion(speech);

    };

  };

  /* SEND QUESTION */

  const sendQuestion = async () => {

    if (!question) return;

    const userMessage = {
      sender: "user",
      text: question
    };

    setMessages(prev => [...prev, userMessage]);

    setLoading(true);

    try {

      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: question
        })
      });

      const data = await response.json();

      setLoading(false);

      /* STREAMING / TYPING EFFECT */

      const fullText = data.response;

      let index = 0;

      let currentText = "";

      const aiMessage = { sender: "ai", text: "" };

      setMessages(prev => [...prev, aiMessage]);

      const typing = setInterval(() => {

        currentText += fullText[index];

        index++;

        setMessages(prev => {

          const updated = [...prev];

          updated[updated.length - 1] = {
            sender: "ai",
            text: currentText
          };

          return updated;

        });

        if (index >= fullText.length) {
          clearInterval(typing);
        }

      }, 15);

    } catch {

      setLoading(false);

      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: "Error connecting to backend"
        }
      ]);

    }

    setQuestion("");

  };

  /* OCR DOCUMENT UPLOAD */

  const uploadDocument = async () => {

    if (!file) {
      alert("Please choose a file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload-document", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    setMessages(prev => [
      ...prev,
      {
        sender: "ai",
        text: "Extracted text:\n" + data.extracted_text
      }
    ]);

  };

  /* CAMERA */

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      streamRef.current = stream;

      setCameraOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

    } catch {

      alert("Camera access denied");

    }

  };

  const capturePhoto = () => {

    const video = videoRef.current;

    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    setCapturedImage(imageData);

    streamRef.current.getTracks().forEach(track => track.stop());

    setCameraOn(false);

  };

  return (

    <div className="app">

      {/* SIDEBAR */}

      <div className="side-panel">

        <h2>JanAI</h2>

        <h3>Upload Document</h3>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={uploadDocument}>
          Upload & Scan
        </button>

        <hr />

        <h3>Scan Document</h3>

        {!cameraOn && (

          <button onClick={startCamera}>
            Open Camera
          </button>

        )}

        <div className="camera-box">

          {cameraOn && (

            <video
              ref={videoRef}
              autoPlay
              className="camera-preview"
            />

          )}

          {capturedImage && (

            <img
              src={capturedImage}
              alt="captured"
              className="captured-image"
            />

          )}

        </div>

        {cameraOn && (

          <button onClick={capturePhoto}>
            Capture Photo
          </button>

        )}

        <canvas
          ref={canvasRef}
          style={{ display: "none" }}
        />

      </div>

      {/* CHAT AREA */}

      <div className="chat-container">

        <div className="chat-box">

          {messages.map((msg, index) => (

            <div key={index} className={msg.sender}>

              {msg.text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}

            </div>

          ))}

          {loading && (

            <div className="ai typing">
              JanAI is thinking...
            </div>

          )}

          <div ref={bottomRef}></div>

        </div>

        {/* INPUT BAR */}

        <div className="input-box">

          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about Kerala services..."
          />

          <button onClick={startVoice}>
            🎤
          </button>

          <button onClick={sendQuestion}>
            Send
          </button>

        </div>

      </div>

    </div>

  );

}

export default App;