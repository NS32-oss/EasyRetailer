import { useState } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { MinusCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const plans = [
  {
    name: "Free",
    price: 0,
    limit: 1,
    description:
      "✔ Apply for 1 internship\n✔ Basic support\n✔ No recurring charges",
    options: [
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Apply for 1 internship",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Basic support",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "No recurring charges",
      },
    ],
  },
  {
    name: "Bronze",
    price: 100,
    limit: 3,
    description:
      "✔ Apply for up to 3 internships per month\n✔ Priority support\n✔ Affordable and flexible",
    options: [
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Apply for up to 3 internships per month",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Priority support",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Affordable and flexible",
      },
    ],
  },
  {
    name: "Silver",
    price: 300,
    limit: 5,
    description:
      "✔ Apply for up to 5 internships per month\n✔ Faster application processing\n✔ Premium support",
    options: [
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Apply for up to 5 internships per month",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Faster application processing",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Premium support",
      },
    ],
  },
  {
    name: "Gold",
    price: 1000,
    limit: "Unlimited",
    description:
      "✔ Unlimited internship applications\n✔ Priority placement assistance\n✔ Exclusive career resources & support",
    options: [
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Unlimited internship applications",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Priority placement assistance",
      },
      {
        icon: <CheckCircleIcon className="h-5 w-5 text-blue-gray-900" />,
        info: "Exclusive career resources & support",
      },
    ],
  },
];

const Subscriptions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubscription = async () => {
    if (!selectedPlan || !email) {
      alert("Please enter email and select a plan.");
      return;
    }

    if (selectedPlan === "Free") {
      alert("Free plan activated!");
      navigate("/"); // Redirect to home page
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/payment/subscribe`,
        {
          email,
          plan: selectedPlan,
        }
      );

      if (data.subscription_id) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: plans.find((p) => p.name === selectedPlan).price * 100,
          currency: "INR",
          name: "Subscription Portal",
          description: `Subscription for ${selectedPlan} Plan`,
          subscription_id: data.subscription_id,
          handler: function (response) {
            alert("Payment Successful!");
            navigate("/"); // Redirect to home page after successful subscription
          },
          prefill: {
            email: email,
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        alert("Payment is allowed only between 10-11 AM IST.");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Payment failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-5xl font-extrabold mb-6 text-blue-800">
        Choose a Subscription Plan
      </h1>
      <Typography
        variant="lead"
        className="mb-10 font-normal text-gray-500 max-w-xl text-center"
      >
        Find the right plan that fits your needs and apply for internships
        seamlessly!
      </Typography>

      <div className="mb-4 w-80">
        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
          Email:
        </label>
        <input
          type="email"
          id="email"
          placeholder="Enter your email"
          className="p-2 border rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid gap-6 justify-items-center md:grid-cols-2 lg:grid-cols-4 max-w-5xl">
        {plans.map((plan, key) => (
          <Card
            key={key}
            variant="gradient"
            color="white"
            className={`cursor-pointer ${
              selectedPlan === plan.name ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setSelectedPlan(plan.name)}
          >
            <CardHeader
              floated={false}
              shadow={false}
              color="transparent"
              className="!m-0 p-4 text-center"
            >
              <Typography
                variant="h6"
                color="blue-gray"
                className="capitalize font-bold mb-1"
              >
                {plan.name}
              </Typography>
              <Typography variant="small" className="font-normal text-gray-500">
                {plan.limit} members
              </Typography>
              <Typography
                variant="h3"
                color="blue-gray"
                className="mt-2 flex items-center justify-center gap-1 text-3xl"
              >
                ₹{plan.price}
                <Typography
                  as="span"
                  color="blue-gray"
                  className="opacity-70 text-lg font-bold"
                >
                  /month
                </Typography>
              </Typography>
            </CardHeader>
            <CardBody className="pt-0">
              <ul className="flex flex-col gap-2 mb-4">
                {plan.options.map((option, key) => (
                  <li
                    key={key}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <span className="flex items-center justify-center w-6 h-6">
                      {option.icon}
                    </span>
                    <Typography
                      variant="small"
                      className="font-normal text-inherit"
                    >
                      {option.info}
                    </Typography>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth
                variant="gradient"
                color="gray"
                className="text-lg py-3 hover:bg-blue-500 hover:text-white transition-colors duration-300"
              >
                Select Plan
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <button
        className="mt-12 px-6 py-3 bg-green-500 text-white rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors duration-300"
        onClick={handleSubscription}
      >
        Subscribe Now
      </button>
    </div>
  );
};

export default Subscriptions;
