import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import "./register.css";
import { auth, provider } from "../../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function Register() {
  const [isStudent, setStudent] = useState(true);
  const [isDivVisible, setDivVisible] = useState(false);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let navigate = useNavigate();

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        toast.success("Login Success");
        navigate("/subscriptions"); // Redirect to subscriptions page after successful signup
      })
      .catch((err) => {
        console.log(err);
        toast.error("Login Failed");
      });
  };

  const setTrueForStudent = () => {
    setStudent(false);
  };

  const setFalseForStudent = () => {
    setStudent(true);
  };

  const showLogin = () => {
    setDivVisible(true);
  };

  const closeLogin = () => {
    setDivVisible(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          Sign-up and Apply For Free
        </h1>
        <p className="text-center text-gray-600 mb-8">
          1,50,000+ companies hiring on Internshala
        </p>
        <div className="flex justify-center mb-6">
          <button
            onClick={handleSignIn}
            className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 px-6 py-3"
          >
            <svg className="h-6 w-6 mr-2" viewBox="0 0 40 40">
              <path
                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                fill="#FFC107"
              />
              <path
                d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                fill="#FF3D00"
              />
              <path
                d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                fill="#4CAF50"
              />
              <path
                d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                fill="#1976D2"
              />
            </svg>
            <span className="text-gray-600 font-bold">Sign in with Google</span>
          </button>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="border-b w-1/5 lg:w-1/4"></span>
          <p className="text-xs text-center text-gray-500 uppercase">or</p>
          <span className="border-b w-1/5 lg:w-1/4"></span>
        </div>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
            id="email"
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
            id="password"
          />
        </div>
        <div className="mb-6 flex justify-between">
          <div className="w-1/2 pr-2">
            <label
              htmlFor="Fname"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
              id="Fname"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
          </div>
          <div className="w-1/2 pl-2">
            <label
              htmlFor="Lname"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
              id="Lname"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
          </div>
        </div>
        <small className="block text-center mb-6">
          By signing up, you agree to our{" "}
          <span className="text-blue-400">Term and Conditions.</span>
        </small>
        <button className="bg-blue-500 h-10 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
          Sign Up
        </button>
        <p className="text-center mt-6">
          Already registered?{" "}
          <span className="text-blue-400 cursor-pointer" onClick={showLogin}>
            Login
          </span>
        </p>
      </div>

      {isDivVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              id="cross"
              onClick={closeLogin}
              className="absolute top-4 right-4"
            >
              <i className="bi bi-x text-2xl"></i>
            </button>
            <h5 id="state" className="mb-6 text-center">
              <span
                id="Sign-in"
                style={{ cursor: "pointer" }}
                className={`auth-tab ${isStudent ? "active" : ""}`}
                onClick={setFalseForStudent}
              >
                Student
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              <span
                id="join-in"
                style={{ cursor: "pointer" }}
                className={`auth-tab ${isStudent ? "active" : ""}`}
                onClick={setTrueForStudent}
              >
                Employee and T&P
              </span>
            </h5>
            {isStudent ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={handleSignIn}
                    className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-100 px-6 py-3 w-full"
                  >
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 40 40">
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#FFC107"
                      />
                      <path
                        d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z"
                        fill="#4CAF50"
                      />
                      <path
                        d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z"
                        fill="#1976D2"
                      />
                    </svg>
                    <span className="text-gray-600 font-bold">
                      Login With Google
                    </span>
                  </button>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                  <p className="text-xs text-center text-gray-500 uppercase">
                    or
                  </p>
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="mb-6">
                  <div className="flex justify-between">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <p className="text-xs text-blue-500">Forget Password?</p>
                  </div>
                  <input
                    className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    placeholder="Must be at least 6 characters"
                    type="password"
                  />
                </div>
                <div className="mt-8">
                  <button className="bg-blue-500 h-10 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
                    Login
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm">
                    New to Internship Hub? Register (
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={closeLogin}
                    >
                      Student
                    </span>
                    /
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={closeLogin}
                    >
                      Company
                    </span>
                    )
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="mb-6">
                  <div className="flex justify-between">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <p className="text-xs text-blue-500">Forget Password?</p>
                  </div>
                  <input
                    className="text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
                    placeholder="Must be at least 6 characters"
                    type="password"
                  />
                </div>
                <div className="mt-8">
                  <button className="bg-blue-500 h-10 text-white font-bold py-2 px-4 w-full rounded hover:bg-blue-600">
                    Login
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm">
                    New to Internship Hub? Register (
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={closeLogin}
                    >
                      Student
                    </span>
                    /
                    <span
                      className="text-blue-500 cursor-pointer"
                      onClick={closeLogin}
                    >
                      Company
                    </span>
                    )
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
