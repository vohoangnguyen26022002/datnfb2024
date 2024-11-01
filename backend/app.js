const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require("./routes/admin");
const cors = require('cors');

const app = express();
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/auth', authRoutes);
app.use("/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server running on port 8000");
});
