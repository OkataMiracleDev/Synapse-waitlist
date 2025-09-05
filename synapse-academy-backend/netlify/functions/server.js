const express = require("express");
const cors = require('cors');
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

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

// Express.js will automatically handle the OPTIONS preflight requests for the routes where CORS is enabled.
// You do not need to explicitly define a separate route for `app.options('*', cors());`
// Remove the problematic line below.
// app.options('*', cors()); // <--- REMOVE THIS LINE

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// These console logs are not necessary for the application to run, but they're useful for debugging.
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Key:", process.env.SUPABASE_ANON_KEY);
