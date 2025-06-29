import express from 'express';
import generateKandinskyImage from './kandinskyGenerator.js';

const router = express.Router();

// Измените путь с '/' на '/generate'
router.post('/generate', async (req, res) => {  // <-- ИЗМЕНИТЕ ЭТУ СТРОКУ
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    console.log('🟢 Generating Kandinsky image for:', prompt);
    const startTime = Date.now();
    
    const result = await generateKandinskyImage(prompt);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    console.log(`✅ Image generated in ${Date.now() - startTime}ms`);
    res.json({ imageUrl: result.image });
    
  } catch (err) {
    console.error('❌ Kandinsky processing error:', err);
    res.status(500).json({ 
      message: 'Image generation failed',
      error: err.message 
    });
  }
});

export default router;