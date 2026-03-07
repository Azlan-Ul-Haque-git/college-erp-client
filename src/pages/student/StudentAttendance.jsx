import * as faceapi from "face-api.js";
import { useState, useRef, useEffect } from "react";
import axios from "../../utils/axiosInstance";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English"];

export default function StudentAttendance() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [selfie, setSelfie] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [myRecords, setMyRecords] = useState([]);
    const [cameraOn, setCameraOn] = useState(false);

    useEffect(() => {

        const loadModels = async () => {

            const MODEL_URL = "/models";

            await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

            console.log("Face models loaded");

        };

        loadModels();
        fetchMyAttendance();
        getLocation();

    }, []);

    const fetchMyAttendance = async () => {
        try {
            const { data } = await axios.get("/attendance/my");
            setMyRecords(data.data);
        } catch (err) { }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("GPS doesnt seem to be supported by your browser!");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setLocationError("");
            },
            (err) => setLocationError("Location access denied! Please allow location."),
            { enableHighAccuracy: true }
        );
    };

    const startCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
            setCameraOn(true);
        } catch (err) {
            setMessage("Camera access denied! Please allow camera.");
        }
    };

    const stopCamera = () => {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        setStream(null);
        setCameraOn(false);
    };

    const takeSelfie = async () => {

        const video = videoRef.current;

        const detection = await faceapi
            .detectSingleFace(video)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            setMessage("Face detection failed! Come closer to the camera.");
            return;
        }

        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext("2d").drawImage(video, 0, 0);

        const img = canvas.toDataURL("image/jpeg", 0.7);

        setSelfie(img);
        stopCamera();
    };




    const submitAttendance = async () => {
        if (!selfie) return setMessage("Take a selfie first!");
        if (!location) return setMessage("First get your location!");
        if (!subject) return setMessage("Select a subject!");

        setLoading(true);
        setMessage("");
        try {
            const { data } = await axios.post("/attendance/student-checkin", {
                selfie,
                latitude: location.latitude,
                longitude: location.longitude,
                subject,
            });
            setSuccess(true);
            setMessage(data.message);
            setSelfie(null);
            fetchMyAttendance();
        } catch (err) {
            setMessage(err.response?.data?.message || "Error aaya!");
        }
        setLoading(false);
    };

    const presentCount = myRecords.filter((r) => r.status === "present").length;
    const totalCount = myRecords.filter((r) => r.status !== "pending").length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📍 Mark Attendance </h1>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm text-gray-500">Present</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{percentage}%</div>
                    <div className="text-sm text-gray-500">Percentage</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{myRecords.length}</div>
                    <div className="text-sm text-gray-500">Total</div>
                </div>
            </div>

            {/* Attendance Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Aaj Ki Attendance</h2>

                {/* Location Status */}
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${location ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <span>{location ? "✅" : "❌"}</span>
                    <span className="text-sm">
                        {location ? `Location mili: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : locationError || "Location le raha hai..."}
                    </span>
                    {!location && (
                        <button onClick={getLocation} className="ml-auto text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            Retry
                        </button>
                    )}
                </div>

                {/* Subject Select */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                    >
                        {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                </div>

                {/* Camera */}
                <div className="mb-4">
                    {!cameraOn && !selfie && (
                        <button
                            onClick={startCamera}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700"
                        >
                            📷 Camera Kholo
                        </button>
                    )}

                    {cameraOn && (
                        <div className="text-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm mx-auto rounded-xl mb-3" />
                            <canvas ref={canvasRef} className="hidden" />
                            <div className="flex gap-3 justify-center">
                                <button onClick={takeSelfie} className="bg-green-600 text-white px-6 py-2 rounded-xl font-semibold">
                                    📸 Selfie Lo
                                </button>
                                <button onClick={stopCamera} className="bg-gray-400 text-white px-6 py-2 rounded-xl">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {selfie && (
                        <div className="text-center">
                            <img src={selfie} alt="selfie" className="w-40 h-40 object-cover rounded-full mx-auto mb-3 border-4 border-green-400" />
                            <p className="text-green-600 font-medium mb-2">✅ Selfie ready!</p>
                            <button onClick={() => { setSelfie(null); startCamera(); }} className="text-sm text-blue-500 underline">
                                Retake Selfie
                            </button>
                        </div>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {message}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={submitAttendance}
                    disabled={loading || !selfie || !location}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "✅ Mark Attendance"}
                </button>
            </div>

            {/* Records */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">My Attendance History</h2>
                {myRecords.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No Record Yet</p>
                ) : (
                    <div className="space-y-2">
                        {myRecords.slice(0, 20).map((r) => (
                            <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div>
                                    <p className="font-medium text-sm dark:text-white">{r.subject}</p>
                                    <p className="text-xs text-gray-400">{r.date}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === "present" ? "bg-green-100 text-green-700" :
                                    r.status === "absent" ? "bg-red-100 text-red-700" :
                                        "bg-yellow-100 text-yellow-700"
                                    }`}>
                                    {r.status === "present" ? "✅ Present" : r.status === "absent" ? "❌ Absent" : "⏳ Pending"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}