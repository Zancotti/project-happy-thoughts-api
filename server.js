import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const Thought = mongoose.model("Thought", {
  message: { type: String, required: true, minlength: 5, maxlength: 140 },
  hearts: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
});

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Start defining your routes here
app.post("/thoughts", async (req, res) => {
  try {
    const thought = new Thought({ text: req.body.text });
    await thought.save();
    res.json(thought);
  } catch (error) {
    res.status(400).json({
      response: "The text needs to be betweeen 5-140 characters.",
      success: false,
    });
  }
});

app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find();
  res.json(thoughts);
});

app.post("/thoughts/:id/like", async (req, res) => {
  const { id } = req.params;

  const thought = await Thought.findOne({ _id: id });

  if (thought) {
    thought.hearts += 1;
    await thought.save();
    res.json(thought);
  } else {
    res.status(404).json({ response: "Could not save heart!", success: false });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
