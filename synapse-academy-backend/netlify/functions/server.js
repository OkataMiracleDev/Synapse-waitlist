const express = require("express");
const cors = require('cors');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const serverless = require("serverless-http"); // <-- ADDED

const app = express();

const allowedOrigins = ['https://synapse-waitlist.netlify.app'];

// Apply CORS middleware to the entire app with a custom origin function
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman/no-origin requests

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.post("/waitlist", async (req, res) => {
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

// REMOVED app.listen()

// Export the Express app as a serverless function handler
module.exports.handler = serverless(app); // <-- ADDED