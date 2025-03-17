import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../../feature/Userslice";
import "./detail.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function InternDetail() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [isDivVisible, setDivVisible] = useState(false);
  const [textarea, setTextarea] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  let search = window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get("q");

  useEffect(() => {
    if (!user) {
      navigate("/register");
    }
  }, [user, navigate]);

  const show = () => {
    setDivVisible(true);
  };

  const hide = () => {
    setDivVisible(false);
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/training-programs/${id}`
      );
      setData(response.data);

      const { company, category } = response.data;
      setCompany(company);
      setCategory(category);
    };
    fetchData();
  }, [id]);

  const sendOtp = async () => {
    // Send OTP to user's email
    await axios.post(`${API_BASE_URL}/api/otp/send-otp`, {
      email: user.email,
    });
    setOtpSent(true);
  };

  const verifyOtp = async () => {
    // Verify OTP
    const response = await axios.post(`${API_BASE_URL}/api/otp/verify-otp`, {
      email: user.email,
      otp,
    });
    if (response.data.success) {
      setIsOtpVerified(true);
      alert("OTP verified successfully. Proceed with the application");
    } else {
      alert("Invalid OTP");
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file.size > 100 * 1024 * 1024) {
      alert("File size should not exceed 100MB");
      return;
    }
    const videoDuration = document.createElement("video");
    videoDuration.preload = "metadata";
    videoDuration.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoDuration.src);
      if (videoDuration.duration > 300) {
        alert("Video length should not exceed 5 minutes");
        return;
      }
      setVideoFile(file);
      setVideoFileName(file.name);
    };
    videoDuration.src = URL.createObjectURL(file);
  };

  const isUploadTimeValid = () => {
    const now = new Date();
    const hours = now.getUTCHours() + 5; // Convert to IST
    const minutes = now.getUTCMinutes() + 30;
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 14 * 60; // 2 PM IST
    const endMinutes = 19 * 60; // 7 PM IST
    return totalMinutes >= startMinutes && totalMinutes <= endMinutes;
  };

  const submitApplication = async () => {
    const text = document.getElementById("text");
    if (text.value === "") {
      alert("Fill the mandatory fields");
      return;
    }
    if (!isOtpVerified) {
      alert("Please verify OTP before submitting the application");
      return;
    }
    if (!isUploadTimeValid()) {
      alert("Video uploads are allowed only between 2 PM to 7 PM IST");
      return;
    }

    const formData = new FormData();
    formData.append("coverLetter", textarea);
    formData.append("category", category);
    formData.append("company", company);
    formData.append("user", JSON.stringify(user));
    formData.append("application", id);
    if (videoFile) {
      formData.append("video", videoFile);
    }

    await axios
      .post(`${API_BASE_URL}/api/application`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {})
      .catch((err) => {
        console.log("An error occurred");
      });
    alert("Internship application submitted successfully");
    navigate("/Jobs");
  };

  return (
    <div>
      <div className="details-app">
        <>
          <h1 className="font-bold text-3xl">{data.title}</h1>
          <div className="m-14 shadow-sm rounded-md border">
            <p className="mb-4 mt-3" id="boxer">
              <i className="bi bi-arrow-up-right text-blue-500"></i> Actively
              Hiring
            </p>
            <div className="main-info align-baseline mr-96 mt-7">
              <p className="text-xl font-bold mt-4">{data.title}</p>
              <p className="text-sm text-slate-300 font-bold">{data.title}</p>
              <p>
                <i className="bi bi-geo-alt-fill"></i> {data.location}
              </p>
            </div>
            <div className="flex text-sm justify-between">
              <p className="mt-3 text-slate-400">
                <i className="bi bi-play-circle-fill"></i> Start Date <br />{" "}
                {data.StartDate}
              </p>
              <p className="mt-3 text-slate-400">
                <i className="bi bi-calendar-check-fill"></i> Duration <br />{" "}
                {data.Duration}
              </p>
              <p className="mt-3 text-slate-400">
                <i className="bi bi-cash"></i> Stipend <br /> {data.stipend}
              </p>
            </div>
            <div className="flex">
              <p className="bg-green-100 rounded-md ml-4 text-green-300">
                <i className="bi bi-clock"></i> 12/12/2012
              </p>
            </div>
            <hr />
            <div className="aboutCompany flex justify-start">
              <p className="mt-3 text-xl font-bold text-start">
                About {data.company}
              </p>
              <br />
            </div>
            <div className="flex">
              <p className="text-blue-500">
                Instagram page <i className="bi bi-arrow-up-right-square"></i>
              </p>
            </div>
            <p className="mt-4">{data.aboutCompany}</p>
            <div className="about-Job">
              <p className="mt-3 text-xl font-bold text-start">About Job</p>
              <p>{data.aboutJob}</p>
            </div>
            <p className="text-blue-500 justify-start">
              Learn Business Communication
            </p>
            <div className="whocan">
              <p className="mt-3 text-xl font-bold text-start">Who can apply</p>
              <p>{data.Whocanapply}</p>
            </div>
            <p className="mt-3 text-xl font-bold text-start">Perks</p>
            <p>{data.perks}</p>
            <p className="mt-3 text-xl font-bold text-start">
              Additional information
            </p>
            <p>{data.AdditionalInfo}</p>
            <p className="mt-3 text-xl font-bold text-start">
              Number of openings
            </p>
            <p className="text-start">{data.numberOfopning}</p>
            <div className="flex justify-center mt-6 bg-blue-500 w-40 text-center text-white font-bold">
              <button
                className="flex justify-center align-middle"
                onClick={show}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      </div>
      {isDivVisible && (
        <>
          <div className="application-page">
            <div className="bg">
              <button className="close2" onClick={hide}>
                <i className="bi bi-x"></i> Close
              </button>
              <p>Applying for {data.company}</p>
              <p className="mt-3 text-sm font-bold text-start mb-3">
                {data.aboutCompany}
              </p>
            </div>
            <div className="moreSteps">
              <p className="font-semibold text-xl">Your resume</p>
              <small>
                Your current resume will be submitted along with the application
              </small>
              <p className="mt-5 font-semibold text-xl">Cover letter</p>
              <br />
              <p>Why should we hire you for this role?</p>
              <textarea
                name="coverLetter"
                placeholder=""
                id="text"
                value={textarea}
                onChange={(e) => setTextarea(e.target.value)}
              ></textarea>
              <p className="mt-5 font-semibold text-xl">Your availability</p>
              <p>Confirm your availability</p>
              <div>
                <label>
                  <input
                    type="radio"
                    value="Yes, I am available to join immediately"
                  />
                  Yes, I am available to join immediately
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    value="No, I am currently on notice period"
                  />
                  No, I am currently on notice period
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    value="No, I will have to serve notice period"
                  />
                  No, I will have to serve notice period
                </label>
              </div>
              <div>
                <label>
                  <input type="radio" value="Other" />
                  Other{" "}
                  <span className="text-slate-500">
                    (Please specify your availability)
                  </span>
                </label>
              </div>
              <p className="mt-5 font-semibold text-xl">
                Custom resume <span className="text-slate-500">(Optional)</span>
              </p>
              <small className="text-slate-500">
                Employer can download and view this resume
              </small>
              <div className="mt-5">
                <p className="font-semibold text-xl">Upload Video</p>
                <small>Upload a video about yourself (Max 5 mins, 100MB)</small>
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
                >
                  Choose Video
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                {videoFileName && (
                  <p className="mt-2 text-sm text-gray-600">
                    Video File : {videoFileName}
                  </p>
                )}
              </div>
              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  className="mt-5 bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mt-2"
                  />
                  <button
                    onClick={verifyOtp}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Verify OTP
                  </button>
                </>
              )}
              <div className="submit flex justify-center mt-5">
                {user ? (
                  <button className="submit-btn" onClick={submitApplication}>
                    Submit application
                  </button>
                ) : (
                  <Link to={"/register"}>
                    <button className="submit-btn">Submit application</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InternDetail;
