import React, { useEffect, useState } from "react";
import "./inter.css";
import compLogo from "../../assets/netflix.png";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function Intern() {
  const [searchCategory, setSearchCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterInternship, setFilterInternship] = useState([]);
  const [isDivVisible, setDivVisible] = useState(false);
  const [internData, setInternData] = useState([]);

  const showDiv = () => setDivVisible(true);
  const hideDiv = () => setDivVisible(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/training-programs`
        );
        setInternData(response.data);
        setFilterInternship(response.data); // Show all internships initially
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryValue = e.target.value;
    setSearchCategory(categoryValue);
    filterInternships(categoryValue, searchLocation);
  };

  const handleLocationChange = (e) => {
    const locationValue = e.target.value;
    setSearchLocation(locationValue);
    filterInternships(searchCategory, locationValue);
  };

  const filterInternships = (category, location) => {
    if (internData.length > 0) {
      const filteredData = internData.filter(
        (internship) =>
          internship.category.toLowerCase().includes(category.toLowerCase()) &&
          internship.location.toLowerCase().includes(location.toLowerCase())
      );
      setFilterInternship(filteredData);
    }
  };

  useEffect(() => {
    filterInternships(searchCategory, searchLocation);
  }, [searchCategory, searchLocation]);

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Main grid container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filter Panel (visible on desktop) */}
          <div className="hidden md:block md:col-span-1">
            <div className="bg-white shadow rounded p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                Filter
                <button onClick={showDiv} className="text-blue-500 md:hidden">
                  <i className="bi bi-funnel"></i>
                </button>
              </h2>
              <div className="flex flex-col">
                <label htmlFor="pro" className="mb-1">
                  Profile
                </label>
                <input
                  type="text"
                  id="pro"
                  value={searchCategory}
                  onChange={handleCategoryChange}
                  placeholder="Profile manager"
                  className="border border-gray-300 rounded p-2 mb-4"
                />
                <label htmlFor="loc" className="mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="loc"
                  value={searchLocation}
                  onChange={handleLocationChange}
                  placeholder="Mumbai"
                  className="border border-gray-300 rounded p-2 mb-4"
                />
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="wfh"
                      id="wfh"
                      className="mr-2"
                    />
                    Work From Home
                  </label>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="pt" id="pt" className="mr-2" />
                    Part-time
                  </label>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block">
                    Desired minimum monthly Stipend (₹)
                  </label>
                  <input
                    type="range"
                    name="stipend"
                    id="stipend"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0</span>
                    <span>2K</span>
                    <span>4K</span>
                    <span>6K</span>
                    <span>8K</span>
                    <span>10K</span>
                  </div>
                </div>
                <button className="text-blue-500 mb-2">
                  View more filters <i className="bi bi-chevron-down"></i>
                </button>
                <button className="text-blue-500">Clear all</button>
              </div>
            </div>
          </div>

          {/* Internships Listing */}
          <div className="md:col-span-3">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <p className="text-lg font-bold">
                {filterInternship.length} total internships
              </p>
              <div className="relative mt-4 md:mt-0">
                <input
                  type="text"
                  placeholder=" Design Media MBA"
                  className="border border-gray-300 rounded pl-10 pr-4 py-2"
                />
                <i className="bi bi-search absolute left-44 top-0 text-gray-400"></i>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterInternship.map((data, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-blue-500 flex items-center">
                        <i className="bi bi-arrow-up-right mr-1"></i> Actively
                        Hiring
                      </p>
                      <img src={compLogo} className="w-12" alt="Company Logo" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{data.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{data.company}</p>
                    <p className="mb-2">{data.location}</p>
                    <div className="flex justify-between text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p>{data.StartDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p>{data.Duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stipend</p>
                        <p>{data.stipend}</p>
                      </div>
                    </div>
                    <span className="bg-gray-200 text-gray-500 px-2 py-1 rounded text-xs inline-block">
                      Internship
                    </span>
                    <div className="flex justify-end mt-4">
                      <Link to={`/detailInternship?q=${data._id}`}>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isDivVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-11/12 md:w-1/3 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filter</h2>
                <button onClick={hideDiv}>
                  <i className="bi bi-x text-2xl"></i>
                </button>
              </div>
              <div className="flex flex-col">
                <label htmlFor="pro" className="mb-1">
                  Profile
                </label>
                <input
                  type="text"
                  id="pro"
                  value={searchCategory}
                  onChange={handleCategoryChange}
                  placeholder="Profile manager"
                  className="border border-gray-300 rounded p-2 mb-4"
                />
                <label htmlFor="loc" className="mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="loc"
                  value={searchLocation}
                  onChange={handleLocationChange}
                  placeholder="Mumbai"
                  className="border border-gray-300 rounded p-2 mb-4"
                />
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="wfh"
                      id="wfh"
                      className="mr-2"
                    />
                    Work From Home
                  </label>
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="pt" id="pt" className="mr-2" />
                    Part-time
                  </label>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block">
                    Desired minimum monthly Stipend (₹)
                  </label>
                  <input
                    type="range"
                    name="stipend"
                    id="stipend"
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0</span>
                    <span>2K</span>
                    <span>4K</span>
                    <span>6K</span>
                    <span>8K</span>
                    <span>10K</span>
                  </div>
                </div>
                <button className="text-blue-500 mb-2">
                  View more filters <i className="bi bi-chevron-down"></i>
                </button>
                <button className="text-blue-500">Clear all</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Intern;
