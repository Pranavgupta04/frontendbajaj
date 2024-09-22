import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [serverStatus, setServerStatus] = useState("Checking...");

  const API_BASE_URL = "http://localhost:5001"; // Updated to use port 5001

  const options = [
    { value: "alphabets", label: "Alphabets" },
    { value: "numbers", label: "Numbers" },
    {
      value: "highest_lowercase_alphabet",
      label: "Highest lowercase alphabet",
    },
    { value: "file_valid", label: "File Valid" },
    { value: "file_mime_type", label: "File MIME Type" },
    { value: "file_size_kb", label: "File Size (KB)" },
  ];

  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}`);
      setServerStatus("Server is running. " + res.data.message);
    } catch (err) {
      console.error("Server status check error:", err);
      setServerStatus(
        "Server is not responding. Error: " + (err.message || "Unknown error")
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResponse(null);
    try {
      let jsonInput;
      try {
        jsonInput = JSON.parse(input);
      } catch (parseError) {
        setError("Invalid JSON input. Please check your input format.");
        return;
      }

      if (!Array.isArray(jsonInput.data)) {
        setError('Invalid input: "data" must be an array.');
        return;
      }

      console.log("Sending request to server:", jsonInput);
      const res = await axios.post(`${API_BASE_URL}/bfhl`, jsonInput);
      console.log("Received response from server:", res.data);
      setResponse(res.data);
    } catch (err) {
      console.error("API error:", err);
      if (err.response) {
        setError(
          `API error: ${err.response.status} - ${
            err.response.data.message || JSON.stringify(err.response.data)
          }`
        );
      } else if (err.request) {
        setError(
          "Network error: No response received from the server. Error: " +
            err.message
        );
      } else {
        setError("Error: " + err.message);
      }
    }
  };

  const filterResponse = () => {
    if (!response) return null;
    const filteredResponse = {};
    selectedOptions.forEach((option) => {
      filteredResponse[option.value] = response[option.value];
    });
    return filteredResponse;
  };

  return (
    <div className="App">
      <h1>BFHL Operation</h1>
      <p>{serverStatus}</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter JSON input (e.g., {'data': ['A', '1', 'B', '2'], 'file_b64': ''})"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <Select
            isMulti
            options={options}
            onChange={setSelectedOptions}
            value={selectedOptions}
          />
          <pre>{JSON.stringify(filterResponse(), null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
