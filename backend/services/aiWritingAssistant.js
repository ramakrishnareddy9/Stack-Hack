const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let genAI = null;
let model = null;

try {
  if (process.env.GEMINI_API_KEY) {
    console.log('🔑 GEMINI_API_KEY found, initializing AI Writing Assistant...');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash (fast, efficient, and free)
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('✨ AI Writing Assistant initialized successfully with gemini-2.5-flash');
  } else {
    console.log('⚠️  GEMINI_API_KEY not found - AI Writing Assistant disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize AI Writing Assistant:', error.message);
  console.error('   Stack:', error.stack);
}

/**
 * Generate AI-assisted report content based on user input
 */
async function generateReportContent(prompt, context = {}) {
  if (!model) {
    throw new Error('AI Writing Assistant not configured. Please add GEMINI_API_KEY to .env');
  }

  try {
    const { eventTitle, eventType, userInput, reportType = 'event' } = context;

    let systemPrompt = '';

    if (reportType === 'event') {
      systemPrompt = `You are a helpful assistant for NSS (National Service Scheme) students writing event reports.
      
Event: ${eventTitle || 'NSS Event'}
Event Type: ${eventType || 'Community Service'}

The student has provided: "${userInput || prompt}"

Please help them write a detailed, professional event report with the following sections:

1. **Introduction** - Brief overview of the event
2. **Objectives** - What the event aimed to achieve
3. **Activities** - What activities were conducted
4. **Personal Experience** - Student's participation and learnings
5. **Community Impact** - How the event benefited the community
6. **Conclusion** - Summary and reflections

Write in first person, be specific, and maintain a professional yet personal tone.
Keep the total length to 300-500 words.`;
    } else if (reportType === 'contribution') {
      systemPrompt = `You are helping an NSS student write their contribution report.

Event: ${eventTitle || 'NSS Event'}

The student wants to write about: "${userInput || prompt}"

Please help them write a comprehensive contribution report covering:

1. **My Role** - What specific tasks they performed
2. **Learnings** - Skills and knowledge gained
3. **Challenges** - Any difficulties faced and how they overcame them
4. **Impact** - How their contribution made a difference
5. **Personal Growth** - How this experience helped them grow

Write in first person, be honest and reflective.
Keep it to 250-400 words.`;
    } else {
      systemPrompt = prompt;
    }

    console.log('📝 Generating content with AI...');
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Content generated successfully');

    return {
      success: true,
      content: text,
      wordCount: text.split(/\s+/).length
    };
  } catch (error) {
    console.error('❌ AI Writing Assistant error:', error);
    console.error('   Error name:', error.name);
    console.error('   Error message:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Improve existing text
 */
async function improveText(text, improvementType = 'grammar') {
  if (!model) {
    throw new Error('AI Writing Assistant not configured');
  }

  try {
    let prompt = '';

    switch (improvementType) {
      case 'grammar':
        prompt = `Please improve the grammar, spelling, and punctuation of the following text while maintaining its original meaning and tone:\n\n${text}`;
        break;
      case 'professional':
        prompt = `Please rewrite the following text in a more professional and formal tone suitable for an official NSS report:\n\n${text}`;
        break;
      case 'detailed':
        prompt = `Please expand and add more details to the following text, making it more comprehensive while keeping the same key points:\n\n${text}`;
        break;
      case 'concise':
        prompt = `Please make the following text more concise and to-the-point while retaining all important information:\n\n${text}`;
        break;
      default:
        prompt = `Please improve the following text:\n\n${text}`;
    }

    console.log(`📝 Improving text (${improvementType})...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text();
    console.log('✅ Text improved successfully');

    return {
      success: true,
      originalText: text,
      improvedText: improvedText,
      improvementType: improvementType
    };
  } catch (error) {
    console.error('❌ Text improvement error:', error);
    console.error('   Error message:', error.message);
    throw new Error(`Failed to improve text: ${error.message}`);
  }
}

/**
 * Generate suggestions based on partial input
 */
async function getSuggestions(partialText, eventContext = {}) {
  if (!model) {
    throw new Error('AI Writing Assistant not configured');
  }

  try {
    const { eventTitle, eventType } = eventContext;

    const prompt = `Based on this partial text for an NSS event report about "${eventTitle}" (${eventType}):

"${partialText}"

Please provide 3 specific, actionable suggestions to continue or improve this section. Each suggestion should be 1-2 sentences.`;

    console.log('💡 Getting suggestions...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Suggestions generated successfully');

    // Parse suggestions (assuming they're numbered)
    const suggestions = text
      .split(/\d+\.|•|-/)
      .filter(s => s.trim())
      .slice(0, 3)
      .map(s => s.trim());

    return {
      success: true,
      suggestions: suggestions
    };
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    console.error('   Error message:', error.message);
    throw new Error(`Failed to generate suggestions: ${error.message}`);
  }
}

/**
 * Check if AI Writing Assistant is available
 */
function isAvailable() {
  return model !== null;
}

module.exports = {
  generateReportContent,
  improveText,
  getSuggestions,
  isAvailable
};
