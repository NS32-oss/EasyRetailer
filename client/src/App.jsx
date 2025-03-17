import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, selectUser } from "./feature/Userslice.js";
import { auth } from "./firebase/firebase";

// Components
import Home from "./components/Home/Home";
import Register from "./components/auth/Register";
import Intern from "./components/Internships/Intern";
import JobAvl from "./components/Job/JobAvl";
import JobDetail from "./components/Job/JobDetail";
import InternDetail from "./components/Internships/InternDetail";
import Profile from "./profile/Profile";
import AdminLogin from "./admin/AdminLogin";
import Adminpanel from "./admin/Adminpanel";
import ViewAllApplication from "./admin/ViewAllApplication";
import Postinternships from "./admin/Postinternships";
import DetailApplication from "./applications/DetailApplication";
import UserApplication from "./profile/UserApplication";
import UserApplicationDetail from "./applications/DetailApplicationUser";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import Subscriptions from "./components/Payment/Subscriptions";
import PostJob from "./admin/PostJob.jsx";

function App() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photo: authUser.photoURL,
            name: authUser.displayName,
            email: authUser.email,
            phoneNumber: authUser.phoneNumber,
          })
        );
      } else {
        dispatch(logout());
      }
    });

    return () => unsubscribe(); // Cleanup for Vite's fast refresh
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Internship" element={<Intern />} />
        <Route path="/Jobs" element={<JobAvl />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/detailjob" element={<JobDetail />} />
        <Route path="/detailInternship" element={<InternDetail />} />
        <Route path="/detailApplication" element={<DetailApplication />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/Adminpanel" element={<Adminpanel />} />
        <Route path="/Postinternships" element={<Postinternships />} />
        <Route path="/PostJob" element={<PostJob />} />
        <Route path="/applications" element={<ViewAllApplication />} />
        <Route path="/userapplicationdetail" element={<UserApplicationDetail />} />
        <Route path="/userapplication" element={<UserApplication />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;