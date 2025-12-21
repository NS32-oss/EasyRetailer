import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { PageLoader } from "./components/common/Loader";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Eager load critical components
import Home from "./pages/Dashboard/Home";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";

// Lazy load other pages
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const FormElements = lazy(() => import("./pages/Forms/FormElements"));
const Blank = lazy(() => import("./pages/Blank"));
const SalesHistory = lazy(() => import("./pages/Forms/SalesHistory"));
const Inventory = lazy(() => import("./components/tables/Inventory"));
const SalesCart = lazy(() => import("./components/dashboard/SalesCart"));
const SalesCartHistory = lazy(() => import("./components/salesCartHistory/SalesCartHistory"));
const Barcode = lazy(() => import("./components/charts/bar/BarChartOne"));
const Return = lazy(() => import("./pages/Return"));

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate initial app setup/authentication check
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsAppReady(true);
    };

    initializeApp();
  }, []);

  if (!isAppReady) {
    return <PageLoader message="Initializing application..." />;
  }

  return (
    <>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader message="" />}>
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/new-transaction" element={<SalesCart />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/sales-history" element={<SalesHistory />} />
            <Route path="/sales-cart-history/:saleId" element={<SalesCartHistory />} />

            {/* Tables */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/scanner" element={<Barcode />} />
            <Route path="/return" element={<Return />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
    </>
  );
}
