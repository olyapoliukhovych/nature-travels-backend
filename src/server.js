import { Story } from './models/story.js';
import express from 'express';
import { connectMongoDB } from './db/connectMongoDB.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// список усіх історій
app.get('/stories', async (req, res) => {
  const stories = await Story.find();
  res.status(200).json(stories);
});

//історія за ІД;
app.get('/stories/:storyId', async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);

  if (!story) {
    return res.status(404);
  }

  res.status(200).json(story);
});

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
