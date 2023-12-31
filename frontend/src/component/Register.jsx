import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [formData, SetFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errorMessage, seterrorMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (event) => {
    SetFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password || !formData.username) {
      return seterrorMessage("Please Provide all details");
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/register",
        formData
      );
      navigate("/login");
    } catch (error) {
      if (error) {
        seterrorMessage("Email Already in use ..");
      }
    }
  };

  return (
    <div>
      <h2> Registration Form </h2>
      {errorMessage && <p> {errorMessage}</p>}
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username"> Name : </label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
          />
          <br></br>
          <label htmlFor="email"> Email : </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
          />
          <br></br>
          <label htmlFor="password"> Password </label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          <br></br>
          <button type="submit"> Register </button>
        </form>
        <p>
          Already User? <Link to="/login">click here!</Link>
        </p>
      </div>
    </div>
  );
}
