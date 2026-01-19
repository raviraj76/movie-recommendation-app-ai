require("dotenv").config();
const Fastify = require("fastify");
const axios = require("axios");
const db = require("./db");

const app = Fastify({ logger: true });

app.register(require("@fastify/cors"), { origin: true });

app.post("/recommend", async (req, reply) => {
  try {
    const { userInput } = req.body;

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

    db.prepare(
      "INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)"
    ).run(userInput, movies);

    return {
      recommendations: movies.split(",").map(m => m.trim())
    };

  } catch (error) {
    reply.status(500).send({ error: "Something went wrong" });
  }
});

app.listen({ port: 3001 }, () => {
  console.log("Backend running on http://localhost:3001");
});
