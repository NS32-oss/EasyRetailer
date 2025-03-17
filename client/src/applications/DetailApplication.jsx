import axios from "axios";
import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

function DetailApplication() {
  const [data, setData] = useState([]);
  let search = window.location.search;
  const params = new URLSearchParams(search);
  const id = params.get("a");

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`${API_BASE_URL}/api/application/${id}`);
      setData([response.data]);
    };
    fetchData();
  }, [id]);

  const handleAcceptAndReject = async (id, action) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/application/${id}`,
        { action }
      );
      const UpdateApplication = data.map((app) =>
        app._id === id ? response.data.data : app
      );
      setData(UpdateApplication);
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div>
      {data.map((data) => (
        <section
          className="text-gray-600 body-font overflow-hidden"
          key={data._id}
        >
          <div className="container px-5 py-24 mx-auto">
            <div className="lg:w-4/5 mx-auto flex flex-wrap">
              <img
                alt="ecommerce"
                className="lg:w-1/2 w-full lg:h-auto h-64 object-cover rounded"
                src={data.user.photo}
              />
              <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                <h2 className="text-sm title-font text-gray-500 tracking-widest">
                  Company name
                </h2>
                <h1 className="text-gray-900 font-bold title-font mb-1 -mt-8">
                  {data.company}
                </h1>
                <h2>Cover Letter</h2>
                <p className="leading-relaxed font-bold -mt-8">
                  {data.coverLetter}
                </p>
                <div className="flex mt-6 pb-5 border-b-2 border-gray-100 mb-5">
                  <span className="mr-3">Application Date</span>
                  <br />
                  <p className="font-bold">
                    {new Date(data?.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <h4 className="mt-9">Applied By</h4>
                <p className="font-bold -mt-8">{data.user.name}</p>
                <div className="flex mt-24 justify-around">
                  <button
                    className="bg-blue-700 text-green-400 w-24 font-bold"
                    onClick={() => handleAcceptAndReject(data._id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-blue-700 text-red-600 w-24 font-bold"
                    onClick={() => handleAcceptAndReject(data._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export default DetailApplication;
