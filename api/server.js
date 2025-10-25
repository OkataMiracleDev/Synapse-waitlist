const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

// ✅ Fixed origins (no trailing slash)
const allowedOrigins = [
  "https://synapse-waitlist-sandy.vercel.app",
  "https://synapseonchain.xyz"
];

// Apply CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // allow curl/postman/no-origin requests
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      if (!allowedOrigins.includes(cleanOrigin)) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());

// 🧩 Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ✅ Route
router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const { error } = await supabase.from("waitlist").insert([{ email }]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: "Subscription successful!" });
});

app.use("/api/server", router);

// ✅ Export for Vercel
module.exports = app;
module.exports.handler = serverless(app);
