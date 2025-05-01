import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"
import "./index.css";
import { Amplify } from "aws-amplify";

Amplify.configure({
  "auth": {
      "aws_region": "us-east-1",
      "user_pool_id": "us-east-1_zC67IuLJg",
      "user_pool_client_id": "l4l839e6bh1cpi9b62addaf2i",
      "oauth": {
          "redirect_sign_in_uri": [
              `${window.location.origin}`
          ],
          "redirect_sign_out_uri": [
              `${window.location.origin}`
          ],
          "response_type": "code",
          "scopes": [
              "phone",
              "email",
              "openid",
              "profile",
              "aws.cognito.signin.user.admin"
          ],
          "domain": "custatt.auth.us-east-1.amazoncognito.com"
      },
  },
  "version": "1"
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
