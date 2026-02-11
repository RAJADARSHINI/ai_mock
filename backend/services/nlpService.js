import natural from 'natural';
import Sentiment from 'sentiment';
import compromise from 'compromise';

const tokenizer = new natural.WordTokenizer();
const sentiment = new Sentiment();
const TfIdf = natural.TfIdf;

// ========================================
// NLP EVALUATION SERVICE
// ========================================

/**
 * Evaluate answer relevance based on keyword matching
 */
export function evaluateRelevance(answer, keywords = []) {
  if (!answer || answer.length === 0) return 0;
  if (!keywords || keywords.length === 0) return 50;
  
  const answerLower = answer.toLowerCase();
  const tokens = tokenizer.tokenize(answerLower);
  
  let matchedKeywords = 0;
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    // Check for exact match or partial match
    if (answerLower.includes(keywordLower)) {
      matchedKeywords++;
    } else {
      // Check token-level matching
      tokens.forEach(token => {
        const distance = natural.LevenshteinDistance(token, keywordLower);
        if (distance <= 2 && token.length > 3) {
          matchedKeywords += 0.5;
        }
      });
    }
  });
  
  const relevanceScore = Math.min((matchedKeywords / keywords.length) * 100, 100);
  return Math.round(relevanceScore);
}

/**
 * Evaluate answer clarity based on sentence structure and coherence
 */
export function evaluateClarity(answer) {
  if (!answer || answer.length === 0) return 0;
  
  const doc = compromise(answer);
  const sentences = doc.sentences().out('array');
  
  if (sentences.length === 0) return 20;
  
  let clarityScore = 50;
  
  // Check average sentence length (ideal: 15-25 words)
  const words = tokenizer.tokenize(answer);
  const avgSentenceLength = words.length / sentences.length;
  
  if (avgSentenceLength >= 10 && avgSentenceLength <= 30) {
    clarityScore += 20;
  } else if (avgSentenceLength < 5 || avgSentenceLength > 50) {
    clarityScore -= 15;
  }
  
  // Check for proper sentence structure
  const properSentences = sentences.filter(s => {
    return s.length > 10 && /[.!?]$/.test(s.trim());
  });
  
  clarityScore += (properSentences.length / sentences.length) * 20;
  
  // Penalize excessive filler words
  const fillerWords = ['um', 'uh', 'like', 'you know', 'actually', 'basically', 'literally'];
  const fillerCount = fillerWords.reduce((count, filler) => {
    return count + (answer.toLowerCase().match(new RegExp(filler, 'g')) || []).length;
  }, 0);
  
  if (fillerCount > 5) {
    clarityScore -= Math.min(fillerCount * 2, 20);
  }
  
  return Math.max(Math.min(Math.round(clarityScore), 100), 0);
}

/**
 * Evaluate answer completeness based on length and detail
 */
export function evaluateCompleteness(answer, idealWordCount = 100) {
  if (!answer || answer.length === 0) return 0;
  
  const words = tokenizer.tokenize(answer);
  const wordCount = words.length;
  
  // Too short
  if (wordCount < 20) {
    return Math.round((wordCount / 20) * 30);
  }
  
  // Ideal range
  if (wordCount >= 50 && wordCount <= 200) {
    return 85 + Math.random() * 15;
  }
  
  // Calculate based on proximity to ideal
  const ratio = wordCount / idealWordCount;
  let score = 100 * Math.min(ratio, 1);
  
  // Penalize if too long
  if (wordCount > 300) {
    score -= (wordCount - 300) * 0.1;
  }
  
  return Math.max(Math.min(Math.round(score), 100), 30);
}

/**
 * Analyze sentiment of the answer
 */
export function analyzeSentiment(answer) {
  if (!answer) {
    return {
      score: 0,
      comparative: 0,
      positive: [],
      negative: []
    };
  }
  
  const result = sentiment.analyze(answer);
  
  return {
    score: result.score,
    comparative: result.comparative,
    positive: result.positive,
    negative: result.negative
  };
}

/**
 * Calculate confidence score based on linguistic features
 */
export function evaluateConfidence(answer) {
  if (!answer || answer.length === 0) return 0;
  
  let confidenceScore = 50;
  const answerLower = answer.toLowerCase();
  
  // Check for confident language
  const confidentPhrases = ['i believe', 'i am confident', 'certainly', 'definitely', 'absolutely'];
  const uncertainPhrases = ['maybe', 'perhaps', 'i think', 'i guess', 'not sure', 'probably'];
  
  confidentPhrases.forEach(phrase => {
    if (answerLower.includes(phrase)) confidenceScore += 10;
  });
  
  uncertainPhrases.forEach(phrase => {
    if (answerLower.includes(phrase)) confidenceScore -= 8;
  });
  
  // Check for specific examples and numbers
  if (/\d+/.test(answer)) confidenceScore += 10;
  if (/for example|for instance|such as/.test(answerLower)) confidenceScore += 15;
  
  // Active voice is more confident
  const doc = compromise(answer);
  const verbs = doc.verbs().out('array');
  if (verbs.length > 0) confidenceScore += 10;
  
  return Math.max(Math.min(Math.round(confidenceScore), 100), 0);
}

/**
 * Generate feedback based on scores
 */
export function generateFeedback(scores) {
  const feedback = [];
  
  // Relevance feedback
  if (scores.relevance >= 75) {
    feedback.push('Excellent relevance! You addressed all key points effectively.');
  } else if (scores.relevance >= 50) {
    feedback.push('Good relevance, but try to incorporate more key concepts from the question.');
  } else {
    feedback.push('Focus more on the core topic and use relevant keywords.');
  }
  
  // Clarity feedback
  if (scores.clarity >= 75) {
    feedback.push('Very clear and well-structured answer.');
  } else if (scores.clarity >= 50) {
    feedback.push('Fairly clear, but work on sentence structure and reduce filler words.');
  } else {
    feedback.push('Improve clarity by using shorter, more focused sentences.');
  }
  
  // Completeness feedback
  if (scores.completeness >= 75) {
    feedback.push('Comprehensive answer with good detail.');
  } else if (scores.completeness >= 50) {
    feedback.push('Add more examples or specifics to make your answer more complete.');
  } else {
    feedback.push('Your answer needs more depth and detail.');
  }
  
  // Confidence feedback
  if (scores.confidence >= 70) {
    feedback.push('You demonstrated strong confidence in your response.');
  } else {
    feedback.push('Try to sound more confident by using assertive language and specific examples.');
  }
  
  return feedback;
}

/**
 * Extract key strengths from the answer
 */
export function extractStrengths(answer, scores) {
  const strengths = [];
  
  if (scores.relevance >= 70) strengths.push('Strong understanding of the topic');
  if (scores.clarity >= 70) strengths.push('Clear and articulate communication');
  if (scores.completeness >= 70) strengths.push('Comprehensive and detailed response');
  if (scores.confidence >= 70) strengths.push('Confident delivery');
  
  // Check for examples
  if (/for example|for instance|such as/.test(answer.toLowerCase())) {
    strengths.push('Good use of examples');
  }
  
  // Check for structured approach
  if (/first|second|third|finally/.test(answer.toLowerCase())) {
    strengths.push('Well-structured answer');
  }
  
  if (strengths.length === 0) {
    strengths.push('Provided an answer to the question');
  }
  
  return strengths;
}

/**
 * Extract areas for improvement
 */
export function extractImprovements(answer, scores) {
  const improvements = [];
  
  if (scores.relevance < 60) improvements.push('Focus more on key concepts and relevant topics');
  if (scores.clarity < 60) improvements.push('Improve sentence structure and reduce filler words');
  if (scores.completeness < 60) improvements.push('Provide more detailed and comprehensive answers');
  if (scores.confidence < 60) improvements.push('Use more confident and assertive language');
  
  // Word count check
  const wordCount = tokenizer.tokenize(answer).length;
  if (wordCount < 30) improvements.push('Expand your answers with more detail');
  if (wordCount > 250) improvements.push('Be more concise in your responses');
  
  if (improvements.length === 0) {
    improvements.push('Continue practicing to refine your interview skills');
  }
  
  return improvements;
}

/**
 * Complete evaluation of an answer
 */
export function evaluateAnswer(answer, keywords = [], idealWordCount = 100) {
  const relevance = evaluateRelevance(answer, keywords);
  const clarity = evaluateClarity(answer);
  const completeness = evaluateCompleteness(answer, idealWordCount);
  const confidence = evaluateConfidence(answer);
  const sentimentAnalysis = analyzeSentiment(answer);
  
  const scores = {
    relevance,
    clarity,
    completeness,
    confidence,
    overall: Math.round((relevance + clarity + completeness + confidence) / 4)
  };
  
  const feedback = generateFeedback(scores);
  const strengths = extractStrengths(answer, scores);
  const improvements = extractImprovements(answer, scores);
  
  return {
    scores,
    sentimentAnalysis,
    feedback: feedback.join(' '),
    strengths,
    improvements,
    wordCount: tokenizer.tokenize(answer).length,
    keywordMatches: keywords.map(keyword => ({
      keyword,
      found: answer.toLowerCase().includes(keyword.toLowerCase())
    }))
  };
}
