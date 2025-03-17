import React, { useState, useEffect, useRef } from "react";

// Replace with your environment variables or hardcoded (not recommended) keys
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const UserLocation = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef(null);

  // When location is updated, (re)load Google Maps
  useEffect(() => {
    if (location) {
      loadGoogleMaps();
    }
  }, [location]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          await fetchLocationDetails(latitude, longitude);
        },
        () => setError("Location access denied.")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const fetchLocationDetails = async (latitude, longitude) => {
    try {
      // 1. Reverse Geocode (Google Maps API)
      const geoRes = await fetch(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) throw new Error("No location data found.");

      const addressComponents = geoData.results[0].address_components;
      const city = addressComponents.find((comp) =>
        comp.types.includes("locality")
      )?.long_name;
      const state = addressComponents.find((comp) =>
        comp.types.includes("administrative_area_level_1")
      )?.long_name;
      const country = addressComponents.find((comp) =>
        comp.types.includes("country")
      )?.long_name;

      setLocation((prev) => ({ ...prev, city, state, country }));

      // 2. Fetch Weather Data (RapidAPI)
      const weatherRes = await fetch(
        `https://open-weather13.p.rapidapi.com/city/latlon/${latitude}/${longitude}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "open-weather13.p.rapidapi.com",
            "x-rapidapi-key": WEATHER_API_KEY,
          },
        }
      );
      if (!weatherRes.ok) throw new Error("Weather API error.");
      const weatherData = await weatherRes.json();

      setWeather({
        description: weatherData.weather[0]?.description || "N/A",
        temperature: (weatherData.main?.temp - 273.15).toFixed(2) || "N/A",
        humidity: weatherData.main?.humidity || "N/A",
        windSpeed: weatherData.wind?.speed || "N/A",
      });
    } catch (err) {
      setError(err.message || "Failed to fetch location details.");
    }
  };

  const loadGoogleMaps = () => {
    if (!window.google) {
      // Dynamically load the Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.gomaps.pro/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      // Once the script loads, set mapLoaded to true
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else {
      // If script is already loaded
      setMapLoaded(true);
    }
  };

  useEffect(() => {
    if (
      mapLoaded &&
      location?.latitude &&
      location?.longitude &&
      mapContainerRef.current
    ) {
      setTimeout(() => {
        initMap();
      }, 100); // 100ms delay to allow the DOM to update
    }
  }, [mapLoaded, location]);
  
  

  window.initMap = () => {
    if (!mapContainerRef.current) return;

    const { latitude, longitude } = location;
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: 12,
    });

    const marker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: "You are here!",
    });

    // // Create an InfoWindow with weather details
    // const infoWindowContent = `
    //   <div style="font-size: 14px;">
    //     <p><strong>${location.city || "Your Location"}</strong></p>
    //     <p>Weather: ${weather?.description || "N/A"}</p>
    //     <p>Temp: ${weather?.temperature || "N/A"}°C</p>
    //     <p>Humidity: ${weather?.humidity || "N/A"}%</p>
    //     <p>Wind: ${weather?.windSpeed || "N/A"} m/s</p>
    //   </div>
    // `;
    // const infoWindow = new window.google.maps.InfoWindow({
    //   content: infoWindowContent,
    // });
    // infoWindow.open(map, marker);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 my-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 ">User Location</h2>
      <button
        onClick={getLocation}
        className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-white hover:text-blue-600 transition-colors"
      >
        Obtain Location
      </button>

      {error && (
        <p className="mt-4 text-red-500 font-semibold transition-opacity duration-300">
          {error}
        </p>
      )}

      {location && (
        <div
          className="
            mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-white
            shadow-inner transition-transform transform hover:scale-[1.01]
          "
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1 text-left mb-4 md:mb-0">
              <p className="text-lg font-semibold text-gray-700">
                {location.city}, {location.state}, {location.country}
              </p>
              <p className="text-sm text-gray-600">
                Lat: <span className="font-medium">{location.latitude}</span>,{" "}
                Lng: <span className="font-medium">{location.longitude}</span>
              </p>
              {weather && (
                <div className="mt-2 text-gray-700">
                  <p>
                    <span className="font-medium">Weather:</span>{" "}
                    {weather.description}
                  </p>
                  <p>
                    <span className="font-medium">Temperature:</span>{" "}
                    {weather.temperature}°C
                  </p>
                  <p>
                    <span className="font-medium">Humidity:</span>{" "}
                    {weather.humidity}%
                  </p>
                  <p>
                    <span className="font-medium">Wind Speed:</span>{" "}
                    {weather.windSpeed} m/s
                  </p>
                </div>
              )}
            </div>
            {/* Map Container */}
            <div className="w-full md:w-1/2 h-64 rounded-md shadow-md overflow-hidden">
              <div
                id="map"
                ref={mapContainerRef}
                className="w-full h-full animate__animated animate__fadeIn"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLocation;
