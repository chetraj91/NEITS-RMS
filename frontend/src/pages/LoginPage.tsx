import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      console.log(res.data);

      sessionStorage.setItem(
        "token",
        res.data.data.token
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(res.data.data.user)
      );

      console.log(
        "LOGGED IN USER:",
        res.data.data.user
      );

      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 400,
          background: "white",
          padding: 30,
          borderRadius: 10,
          boxShadow:
            "0 0 15px rgba(0,0,0,.15)",
        }}
      >
        <h1>NEITS RMS</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={{
            width: "100%",
            marginTop: 15,
            padding: 10,
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            marginTop: 10,
            padding: 10,
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 12,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}