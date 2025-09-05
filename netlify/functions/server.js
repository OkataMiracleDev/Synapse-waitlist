const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const serverless = require("serverless-http");

const app = express();

// ✅ Allowed origins (CORS)
const allowedOrigins = ["https://synapse-waitlist.netlify.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl/postman/no-origin requests
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());

// ✅ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ Test GET route (for sanity check)
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// ✅ POST / → Add email to waitlist
app.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const { error } = await supabase.from("waitlist").insert([{ email }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Subscription successful!" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Export as Netlify function
module.exports.handler = serverless(app);
