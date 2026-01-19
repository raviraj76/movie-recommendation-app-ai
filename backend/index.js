require("dotenv").config();
const Fastify = require("fastify");
const axios = require("axios");
const db = require("./db");

const app = Fastify({ logger: true });

// Enable CORS
app.register(require("@fastify/cors"), {
  origin: true
});

// Health check route (IMPORTANT for Render debugging)
app.get("/", async () => {
  return { status: "Backend is running 🚀" };
});

app.post("/recommend", async (req, reply) => {
  try {
    const { userInput } = req.body;

    if (!userInput) {
      return reply.status(400).send({ error: "userInput is required" });
    }

    const prompt = `
Recommend 3 to 5 movies based on this preference:
"${userInput}"
Return only movie names separated by commas.
`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const movies = response.data.choices[0].message.content;

    // Save to DB
    db.prepare(
      "INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)"
    ).run(userInput, movies);

    return {
      recommendations: movies.split(",").map(m => m.trim())
    };

  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: "Something went wrong" });
  }
});

// 🔥 MOST IMPORTANT PART FOR RENDER
const PORT = process.env.PORT || 3001;

app.listen(
  {
    port: PORT,
    host: "0.0.0.0"
  },
  () => {
    console.log(`✅ Backend running on port ${PORT}`);
  }
);
