import express from 'express';
import generateImage from './kandinskyGenerator.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    console.log('🟢 Generating image for:', prompt);
    const result = await generateImage(prompt);
    
    if (result.success) {
      res.json({ imageUrl: result.image });
    } else {
      res.status(500).json({ message: result.message });
    }
    
  } catch (err) {
    console.error('❌ Processing error:', err);
    res.status(500).json({ message: 'Image generation failed' });
  }
});

export default router;