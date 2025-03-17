import axios from "axios";
import React, { useEffect, useState } from "react";
import "./user.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../feature/Userslice";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function UserApplication() {
  const [application, setApplication] = useState([]);
  const user = useSelector(selectUser);
  const userapplication = application.filter(
    (app) => app.user?.name === user.name
  );
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/application`
        );
        setApplication(response.data);
      } catch (error) {
        alert(error);
      }
    };
    fetchApplication();
  }, []);
  return (
    <div>
      <div className="hide">
        <h1 className="text-3xl font-semibold mt-3">Total Applications</h1>
        <div className="flex justify-center " id="tabel">
          <div className="applications flex flex-col mt-7">
            <div className="overflow-x-auto sm:-mx-6 lg:mx-8">
              <table className="inline-block min-w-full text-left text-sm font-light">
                <thead className="border-b font-medium">
                  <tr className="bg-gray-200">
                    <th scope="col" className="px-5 py-4">
                      Company
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Applied On
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Applied By
                    </th>
                    <th scope="col" className="px-5 py-4">
                      View Detail
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Application Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userapplication.map((data) => (
                    <tr className="border-b" key={data._id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        {data.company}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {data.category}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {new Date(data?.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {data.user.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link to={`/userapplicationdetail?a=${data._id}`}>
                          <i className="bi bi-envelope-open text-blue-500"></i>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {data.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="show">
        <h1>View All Applications</h1>
        {userapplication.map((data) => (
          <section className="text-gray-600 body-font" key={data._id}>
            <div className="container px-5 py-2 mx-auto flex flex-wrap">
              <div className="flex flex-wrap -m-4">
                <div className="p-4 lg:w-1/2 md:w-full">
                  <div className="flex border-2 rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col">
                    <div className="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                        company name {data.company}
                      </h2>
                      <p className="leading-relaxed text-base">
                        Applied by {data.user.name}
                      </p>
                      <p className="leading-relaxed text-base">
                        Applied on{" "}
                        {new Date(data?.createdAt).toLocaleDateString()}
                      </p>
                      <p className="leading-relaxed text-base">
                        Application status {data.status}
                      </p>
                      <Link
                        to={`/userapplicationdetail?a=${data._id}`}
                        className="mt-3 text-indigo-500 inline-flex items-center"
                      >
                        View in detail
                        <i className="bi bi-chevron-compact-right text-blue-500"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default UserApplication;
