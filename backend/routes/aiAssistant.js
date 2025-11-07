const express = require('express');
const { auth } = require('../middleware/auth');
const { 
  generateReportContent, 
  improveText, 
  getSuggestions,
  isAvailable 
} = require('../services/aiWritingAssistant');

const router = express.Router();

// @route   POST /api/ai-assistant/generate
// @desc    Generate report content with AI
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    if (!isAvailable()) {
      return res.status(503).json({ 
        message: 'AI Writing Assistant not available. Please configure GEMINI_API_KEY.' 
      });
    }

    const { prompt, context } = req.body;

    if (!prompt && !context?.userInput) {
      return res.status(400).json({ message: 'Prompt or user input is required' });
    }

    const result = await generateReportContent(prompt, context);
    res.json(result);
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ 
      message: 'Failed to generate content', 
      error: error.message 
    });
  }
});

// @route   POST /api/ai-assistant/improve
// @desc    Improve existing text with AI
// @access  Private
router.post('/improve', auth, async (req, res) => {
  try {
    if (!isAvailable()) {
      return res.status(503).json({ 
        message: 'AI Writing Assistant not available' 
      });
    }

    const { text, improvementType } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const result = await improveText(text, improvementType || 'grammar');
    res.json(result);
  } catch (error) {
    console.error('Improve text error:', error);
    res.status(500).json({ 
      message: 'Failed to improve text', 
      error: error.message 
    });
  }
});

// @route   POST /api/ai-assistant/suggestions
// @desc    Get writing suggestions based on partial text
// @access  Private
router.post('/suggestions', auth, async (req, res) => {
  try {
    if (!isAvailable()) {
      return res.status(503).json({ 
        message: 'AI Writing Assistant not available' 
      });
    }

    const { partialText, eventContext } = req.body;

    if (!partialText) {
      return res.status(400).json({ message: 'Partial text is required' });
    }

    const result = await getSuggestions(partialText, eventContext || {});
    res.json(result);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to get suggestions', 
      error: error.message 
    });
  }
});

// @route   GET /api/ai-assistant/status
// @desc    Check if AI Writing Assistant is available
// @access  Private
router.get('/status', auth, async (req, res) => {
  res.json({
    available: isAvailable(),
    message: isAvailable() 
      ? 'AI Writing Assistant is ready' 
      : 'AI Writing Assistant not configured'
  });
});

module.exports = router;
