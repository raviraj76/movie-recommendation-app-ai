import { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getMovies = async () => {
    // Empty input check
    if (!input.trim()) {
      alert("Please enter a movie preference");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMovies([]);

      const res = await fetch("https://movie-recommendation-backend-rwko.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input })
      });

      const data = await res.json();

      if (data.recommendations) {
        setMovies(data.recommendations);
      } else {
        setError("No recommendations found.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h2>🎬 Movie Recommendation App</h2>

      <input
        type="text"
        placeholder="e.g. action movies with strong female lead"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "320px", padding: "8px" }}
      />

      <br /><br />

      <button onClick={getMovies} disabled={loading}>
        {loading ? "Loading..." : "Get Recommendations"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
      )}

      <ul style={{ marginTop: "20px" }}>
        {movies.map((movie, i) => (
          <li key={i}>{movie}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
