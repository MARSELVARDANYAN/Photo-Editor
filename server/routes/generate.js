import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    console.log('🟢 Sending request to Hugging Face:', prompt);

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          Accept: 'image/png',
        },
        responseType: 'arraybuffer',
        timeout: 25000, 
        validateStatus: (status) => status < 500,
      }
    );

    const status = response.status;
    const contentType = response.headers['content-type'] || '';

    if (status === 200 && contentType.includes('image/')) {
      const base64 = Buffer.from(response.data).toString('base64');
      return res.json({ imageUrl: `data:${contentType};base64,${base64}` }); 
    }

    const responseBody = response.data.toString();
    let errorMessage = 'Image generation failed';

    try {
      const errorData = JSON.parse(responseBody);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = responseBody.substring(0, 500);
    }

    console.error(`❌ Error from Hugging Face (${status}):`, errorMessage);
    return res.status(status > 400 ? status : 500).json({ 
      message: errorMessage,
      details: responseBody.length > 500 ? responseBody.substring(0, 500) + '...' : responseBody
    });

  } catch (err) {
    console.error('❌ Internal Server Error:', err.message);
    res.status(500).json({ 
      message: 'Internal server error',
      error: err.message 
    });
  }
});

export default router;