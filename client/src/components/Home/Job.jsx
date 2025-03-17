import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function Job() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [jobData, setJobData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/positions`);
        setJobData(response.data);
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };
    fetchData();
  }, []);

  const handleJob = (direction) => {
    const container = document.getElementById("container3");
    if (container) {
      sideScrollJob(container, direction, 25, 100, 10);
    }
  };

  const categories = [
    "All",
    "Big Brand",
    "Work From Home",
    "Part-time",
    "MBA",
    "Engineering",
    "Media",
    "Design",
    "Data Science",
  ];

  const filteredJobs = jobData.filter(
    (job) =>
      selectedCategory === "All" ||
      job.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div>
      <div className="info-intern mt-12">
        <div className="categories flex flex-wrap mt-14">
          <p>POPULAR CATEGORIES :</p>
          {categories.map((category, index) => (
            <span
              key={index}
              className={`category mr-4 ml-6 ${
                selectedCategory === category ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      <div className="internships" id="container3">
        <div className="internShip-Info flex">
          {filteredJobs.map((job, index) => (
            <div className="int-1 mt-6" key={index}>
              <p className="mb-4 mt-3" id="boxer">
                <i className="bi bi-arrow-up-right text-blue-500"></i> Actively
                Hiring
              </p>
              <p>{job.title}</p>
              <small className="text-slate-400 text-sm">{job.company}</small>

              <hr className="mt-5" />
              <p className="mt-3">
                <i className="bi bi-geo-alt-fill"></i> {job.location}
              </p>
              <p className="mt-1">
                <i className="bi bi-cash-stack"></i> {job.CTC}
              </p>
              <p className="mt-1">
                <i className="bi bi-calendar-fill"></i> {job.Experience}
              </p>
              <div className="more flex justify-between mt-6">
                <span className="bg-slate-200 text-slate-400 w-20 rounded-sm text-center">
                  Job
                </span>
                <Link to={`detailjob?q=${job._id}`}>
                  <span className="text-blue-500 mr-2">
                    View details <i className="bi bi-chevron-right"></i>
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex BUttons mt-9">
        <button className="back" onClick={() => handleJob("left")}>
          <i className="bi bi-chevron-left" id="sideBack"></i>
        </button>
        <button className="next" onClick={() => handleJob("right")}>
          <i className="bi bi-chevron-right" id="slide"></i>
        </button>
      </div>
    </div>
  );
}

export default Job;

function sideScrollJob(element, direction, speed, distance, step) {
  let scrollAmount = 0;
  const slideTimer = setInterval(() => {
    if (direction === "left") {
      element.scrollLeft -= step;
    } else {
      element.scrollLeft += step;
    }
    scrollAmount += step;
    if (scrollAmount >= distance) {
      clearInterval(slideTimer);
    }
  }, speed);
}
