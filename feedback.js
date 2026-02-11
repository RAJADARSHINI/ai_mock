/**
 * feedback.js - Feedback Page Logic
 * Displays comprehensive interview feedback report
 * Retrieves data from localStorage
 */

// ========================================
// DOM ELEMENTS
// ========================================

const userEmailEl = document.getElementById('userEmail');
const overallRelevanceEl = document.getElementById('overallRelevance');
const overallClarityEl = document.getElementById('overallClarity');
const overallCompletenessEl = document.getElementById('overallCompleteness');
const relevanceBarEl = document.getElementById('relevanceBar');
const clarityBarEl = document.getElementById('clarityBar');
const completenessBarEl = document.getElementById('completenessBar');

const totalQuestionsEl = document.getElementById('totalQuestions');
const totalWordsEl = document.getElementById('totalWords');
const avgWordsEl = document.getElementById('avgWords');
const durationEl = document.getElementById('duration');

const questionFeedbackListEl = document.getElementById('questionFeedbackList');
const finalFeedbackEl = document.getElementById('finalFeedback');

const restartBtn = document.getElementById('restartBtn');
const levelsBtn = document.getElementById('levelsBtn');
const printBtn = document.getElementById('printBtn');

// ========================================
// DATA LOADING
// ========================================

function loadFeedbackData() {
  // Get user email
  const userEmail = localStorage.getItem('userEmail') || 'Guest';
  userEmailEl.textContent = userEmail;
  
  // Try to load new format responses first
  const responsesJson = localStorage.getItem('interviewResponses');
  
  if (responsesJson) {
    // New format with keyword evaluation
    const responses = JSON.parse(responsesJson);
    displayResponseFeedback(responses);
    return;
  }
  
  // Fallback to old format
  const answersJson = localStorage.getItem('interviewAnswers');
  const statsJson = localStorage.getItem('interviewStats');
  
  if (!answersJson || !statsJson) {
    showNoDataMessage();
    return;
  }
  
  const answers = JSON.parse(answersJson);
  const stats = JSON.parse(statsJson);
  
  // Display overall scores
  displayOverallScores(stats);
  
  // Display summary stats
  displaySummaryStats(stats);
  
  // Display question-wise feedback
  displayQuestionFeedback(answers);
  
  // Generate final feedback
  generateFinalFeedback(answers, stats);
}

// ========================================
// DISPLAY FUNCTIONS
// ========================================

function displayOverallScores(stats) {
  // Update score values
  overallRelevanceEl.textContent = `${stats.avgRelevance}/10`;
  overallClarityEl.textContent = `${stats.avgClarity}/10`;
  overallCompletenessEl.textContent = `${stats.avgCompleteness}/10`;
  
  // Animate progress bars
  setTimeout(() => {
    relevanceBarEl.style.width = `${(stats.avgRelevance / 10) * 100}%`;
    clarityBarEl.style.width = `${(stats.avgClarity / 10) * 100}%`;
    completenessBarEl.style.width = `${(stats.avgCompleteness / 10) * 100}%`;
  }, 300);
}

function displaySummaryStats(stats) {
  totalQuestionsEl.textContent = `${stats.answeredQuestions}/${stats.totalQuestions}`;
  totalWordsEl.textContent = stats.totalWords;
  
  const avgWords = stats.answeredQuestions > 0 
    ? Math.round(stats.totalWords / stats.answeredQuestions) 
    : 0;
  avgWordsEl.textContent = avgWords;
  
  // Format duration
  const minutes = Math.floor(stats.timeSpent / 60);
  const seconds = stats.timeSpent % 60;
  durationEl.textContent = `${minutes}m ${seconds}s`;
}

function displayQuestionFeedback(answers) {
  questionFeedbackListEl.innerHTML = '';
  
  answers.forEach((answer, index) => {
    const feedbackItem = createFeedbackItem(answer, index);
    questionFeedbackListEl.appendChild(feedbackItem);
  });
}

function displayResponseFeedback(responses) {
  if (!responses || responses.length === 0) {
    showNoDataMessage();
    return;
  }
  
  // Calculate overall statistics
  const totalQuestions = responses.length;
  const totalWords = responses.reduce((sum, r) => sum + countWords(r.userAnswer), 0);
  const avgWords = Math.round(totalWords / totalQuestions);
  const avgRelevance = Math.round(responses.reduce((sum, r) => sum + (r.relevance || 0), 0) / totalQuestions);
  const avgClarity = Math.round(responses.reduce((sum, r) => sum + (r.clarity || 0), 0) / totalQuestions);
  const avgCompleteness = Math.round(responses.reduce((sum, r) => sum + (r.completeness || 0), 0) / totalQuestions);
  const avgRelevanceScore = Math.round(responses.reduce((sum, r) => sum + (r.relevanceScore || 0), 0) / totalQuestions);
  
  // Display overall scores
  overallRelevanceEl.textContent = `${avgRelevance}/10 (${avgRelevanceScore}%)`;
  overallClarityEl.textContent = `${avgClarity}/10`;
  overallCompletenessEl.textContent = `${avgCompleteness}/10`;
  
  // Animate progress bars
  setTimeout(() => {
    relevanceBarEl.style.width = `${(avgRelevance / 10) * 100}%`;
    clarityBarEl.style.width = `${(avgClarity / 10) * 100}%`;
    completenessBarEl.style.width = `${(avgCompleteness / 10) * 100}%`;
  }, 300);
  
  // Display summary stats
  totalQuestionsEl.textContent = `${totalQuestions}/${totalQuestions}`;
  totalWordsEl.textContent = totalWords;
  avgWordsEl.textContent = avgWords;
  durationEl.textContent = '—';
  
  // Display individual responses
  questionFeedbackListEl.innerHTML = '';
  responses.forEach((response, index) => {
    const feedbackItem = createResponseFeedbackItem(response, index);
    questionFeedbackListEl.appendChild(feedbackItem);
  });
  
  // Generate final feedback
  generateResponseFinalFeedback(responses, avgRelevance, avgClarity, avgCompleteness, avgRelevanceScore);
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function createResponseFeedbackItem(response, index) {
  const item = document.createElement('div');
  item.className = 'feedback-item';
  
  const wordCount = countWords(response.userAnswer);
  const relevanceScore = response.relevanceScore || 0;
  const matchedCount = (response.matchedKeywords || []).length;
  const totalKeywords = (response.keywords || []).length;
  
  let keywordFeedback = '';
  
  if (response.missingKeywords && response.missingKeywords.length > 0) {
    keywordFeedback = `<div style="margin-top: 12px; padding: 10px; background: rgba(255, 193, 7, 0.1); border-left: 3px solid var(--accent-warning); border-radius: 4px;">
      <strong>💡 Missing Keywords:</strong> Try including more points about: <em>${response.missingKeywords.join(', ')}</em>
    </div>`;
  }
  
  if (response.matchedKeywords && response.matchedKeywords.length > 0) {
    keywordFeedback += `<div style="margin-top: 8px; padding: 10px; background: rgba(76, 175, 80, 0.1); border-left: 3px solid var(--accent-success); border-radius: 4px;">
      <strong>✓ Covered Keywords:</strong> ${response.matchedKeywords.join(', ')}
    </div>`;
  }
  
  item.innerHTML = `
    <div class="feedback-item-header">
      <h3>Question ${index + 1}</h3>
      <div class="feedback-item-scores">
        <div class="mini-score">
          <label>Relevance</label>
          <div class="value">${response.relevance || 0}/10</div>
          <div style="font-size: 11px; color: var(--accent-primary);">${relevanceScore}%</div>
        </div>
        <div class="mini-score">
          <label>Clarity</label>
          <div class="value">${response.clarity || 0}/10</div>
        </div>
        <div class="mini-score">
          <label>Complete</label>
          <div class="value">${response.completeness || 0}/10</div>
        </div>
      </div>
    </div>
    <div class="feedback-question">
      <strong>Q:</strong> ${response.question}
    </div>
    <div class="feedback-answer">
      <strong>Your Answer:</strong><br>
      ${response.userAnswer}
      <div style="margin-top: 8px; color: var(--text-muted); font-size: 12px;">
        Word count: ${wordCount} | Keywords matched: ${matchedCount}/${totalKeywords}
      </div>
    </div>
    ${keywordFeedback}
    <div class="feedback-message">
      <strong><i class="fas fa-robot"></i> AI Feedback:</strong><br>
      ${response.feedback || 'Good answer! Keep practicing to improve further.'}
    </div>
  `;
  
  return item;
}

function generateResponseFinalFeedback(responses, avgRelevance, avgClarity, avgCompleteness, avgRelevanceScore) {
  const overallAvg = Math.round((avgRelevance + avgClarity + avgCompleteness) / 3);
  const totalQuestions = responses.length;
  const totalWords = responses.reduce((sum, r) => sum + countWords(r.userAnswer), 0);
  
  let feedback = '';
  
  // Overall performance assessment
  feedback += '<p style="background: rgba(98, 90, 245, 0.1); padding: 20px; border-left: 4px solid var(--accent-primary); margin-top: 20px; border-radius: 4px;"><strong>📊 Overall Performance Summary:</strong><br><br>';
  feedback += `You answered <strong>${totalQuestions} questions</strong> with an average keyword relevance score of <strong>${avgRelevanceScore}%</strong>. `;
  
  if (overallAvg >= 8) {
    feedback += 'Excellent work! Your answers were comprehensive, relevant, and well-structured.';
  } else if (overallAvg >= 7) {
    feedback += 'Very good performance! You demonstrated solid understanding with room for minor improvements.';
  } else if (overallAvg >= 6) {
    feedback += 'Good effort! Focus on including more key points and expanding your answers.';
  } else if (overallAvg >= 5) {
    feedback += 'Fair performance. Work on addressing key topics more thoroughly and providing specific examples.';
  } else {
    feedback += 'Keep practicing! Focus on understanding the question requirements and covering essential points.';
  }
  feedback += '</p>';
  
  // Keyword analysis
  const totalKeywords = responses.reduce((sum, r) => sum + (r.keywords?.length || 0), 0);
  const totalMatched = responses.reduce((sum, r) => sum + (r.matchedKeywords?.length || 0), 0);
  const matchPercentage = Math.round((totalMatched / totalKeywords) * 100);
  
  feedback += '<p><strong>🔑 Keyword Analysis:</strong></p>';
  feedback += `<p>You mentioned <strong>${totalMatched} out of ${totalKeywords}</strong> important keywords (${matchPercentage}%). `;
  
  if (matchPercentage >= 70) {
    feedback += 'Excellent coverage of key topics! You addressed most important points.';
  } else if (matchPercentage >= 50) {
    feedback += 'Good coverage, but try to include more relevant keywords in your answers.';
  } else {
    feedback += 'Focus on addressing the key points mentioned in the question. Review missing keywords above.';
  }
  feedback += '</p>';
  
  // Actionable recommendations
  feedback += '<p><strong>💡 Key Recommendations:</strong></p><ul>';
  
  if (avgRelevanceScore < 60) {
    feedback += '<li>Study the question carefully and identify key topics to address</li>';
    feedback += '<li>Include specific keywords and concepts mentioned in the question</li>';
  }
  
  if (totalWords < 400) {
    feedback += '<li>Expand your answers with more detail and examples (aim for 75-100 words per answer)</li>';
  }
  
  if (avgClarity < 7) {
    feedback += '<li>Structure your answers with clear beginning, middle, and end</li>';
    feedback += '<li>Use the STAR method for behavioral questions</li>';
  }
  
  feedback += '<li>Practice regularly to improve fluency and confidence</li>';
  feedback += '<li>Review missing keywords for each question and prepare better responses</li>';
  feedback += '</ul>';
  
  feedback += '<p style="margin-top: 20px;"><strong>Keep practicing and refining your interview skills. You\'re making progress!</strong></p>';
  
  finalFeedbackEl.innerHTML = feedback;
}

function generateEnhancedQuestionFeedback(answer, relevance, clarity, completeness) {
  let feedback = '<div style="line-height: 1.6;">';
  
  // What went well
  const strengths = [];
  if (relevance >= 7) strengths.push('your answer directly addressed the key points of the question');
  if (clarity >= 7) strengths.push('you communicated your thoughts clearly and coherently');
  if (completeness >= 7) strengths.push('you provided comprehensive details and examples');
  if (answer.wordCount >= 75) strengths.push('you gave a thorough response with good depth');
  
  if (strengths.length > 0) {
    feedback += '<p><strong>✓ What you did well:</strong><br>';
    feedback += strengths.map(s => '• ' + s.charAt(0).toUpperCase() + s.slice(1)).join('<br>');
    feedback += '</p>';
  }
  
  // Areas for improvement
  const improvements = [];
  if (relevance < 7) {
    if (relevance < 5) {
      improvements.push('Focus more on the specific question being asked. Make sure to identify and address the key points directly rather than providing general information.');
    } else {
      improvements.push('While your answer touched on relevant points, try to align your response more closely with what\'s being asked. Reference key terms from the question in your answer.');
    }
  }
  
  if (clarity < 7) {
    if (clarity < 5) {
      improvements.push('Work on organizing your thoughts before responding. Try structuring your answer with a clear beginning (context), middle (main points), and end (conclusion or summary).');
    } else {
      improvements.push('Your answer could be clearer. Use shorter, more direct sentences and avoid run-on thoughts. Pause between ideas to help the interviewer follow your reasoning.');
    }
  }
  
  if (completeness < 7) {
    if (completeness < 5) {
      improvements.push('Your answer needs more depth and detail. For behavioral questions, use the STAR method (Situation, Task, Action, Result). For technical questions, explain the "why" behind your answer, not just the "what."');
    } else {
      improvements.push('Add more specific examples or details to strengthen your answer. Real-world examples make your responses more memorable and credible.');
    }
  }
  
  if (answer.wordCount < 50) {
    improvements.push('Try to expand your answers. Aim for at least 50-100 words to give the interviewer enough context and detail. Brief answers can seem like you lack knowledge or preparation.');
  }
  
  if (improvements.length > 0) {
    feedback += '<p><strong>⚠ Areas to improve:</strong><br>';
    improvements.forEach(imp => {
      feedback += '• ' + imp + '<br>';
    });
    feedback += '</p>';
  }
  
  // Specific suggestions
  feedback += '<p><strong>💡 How to improve this answer:</strong><br>';
  
  if (relevance < 7 && completeness < 7) {
    feedback += '• Start by restating the question briefly to show you understood it<br>';
    feedback += '• Break your answer into clear segments (e.g., "There are three main reasons...", "I\'d approach this by...")<br>';
  }
  
  if (clarity < 7) {
    feedback += '• Practice the "rule of three" - make three key points rather than rambling<br>';
    feedback += '• Use transition words like "First," "Additionally," "Finally" to guide your listener<br>';
  }
  
  if (completeness < 7) {
    feedback += '• Include specific examples from your experience or concrete scenarios<br>';
    feedback += '• Explain the impact or outcome of your actions/decisions<br>';
  }
  
  feedback += '• Practice this answer out loud - speaking helps you refine your delivery and timing<br>';
  feedback += '</p>';
  
  feedback += '</div>';
  return feedback;
}

function createFeedbackItem(answer, index) {
  const item = document.createElement('div');
  item.className = 'feedback-item';
  
  // Determine if answer was provided
  const hasAnswer = answer.answer.trim().length > 0;
  const displayAnswer = hasAnswer ? answer.answer : '<em>No answer provided</em>';
  
  // Get scores or defaults
  const relevance = answer.relevance || 0;
  const clarity = answer.clarity || 0;
  const completeness = answer.completeness || 0;
  
  // Generate enhanced feedback based on scores
  let feedback = '';
  if (!hasAnswer) {
    feedback = 'No answer was provided for this question. In a real interview, it\'s important to attempt every question, even if you\'re unsure. Consider using phrases like "Based on my understanding..." or "While I may not have the complete answer, here\'s what I know..."';
  } else {
    feedback = generateEnhancedQuestionFeedback(answer, relevance, clarity, completeness);
  }
  
  item.innerHTML = `
    <div class="feedback-item-header">
      <h3>Question ${index + 1}</h3>
      <div class="feedback-item-scores">
        <div class="mini-score">
          <label>Relevance</label>
          <div class="value">${relevance}/10</div>
        </div>
        <div class="mini-score">
          <label>Clarity</label>
          <div class="value">${clarity}/10</div>
        </div>
        <div class="mini-score">
          <label>Complete</label>
          <div class="value">${completeness}/10</div>
        </div>
      </div>
    </div>
    <div class="feedback-question">
      <strong>Q:</strong> ${answer.question}
    </div>
    <div class="feedback-answer">
      <strong>Your Answer:</strong><br>
      ${displayAnswer}
      <div style="margin-top: 8px; color: var(--text-muted); font-size: 12px;">
        Word count: ${answer.wordCount}
      </div>
    </div>
    <div class="feedback-message">
      <strong><i class="fas fa-robot"></i> AI Feedback:</strong><br>
      ${feedback}
    </div>
  `;
  
  return item;
}

function generateFinalFeedback(answers, stats) {
  const avgRelevance = stats.avgRelevance;
  const avgClarity = stats.avgClarity;
  const avgCompleteness = stats.avgCompleteness;
  const overallAvg = Math.round((avgRelevance + avgClarity + avgCompleteness) / 3);
  
  let feedback = '';
  
  // Overall performance assessment
  feedback += '<p><strong>Overall Performance:</strong> ';
  if (overallAvg >= 8) {
    feedback += 'Excellent work! You demonstrated strong interview skills across all dimensions. Your answers were relevant, clear, and comprehensive. You\'re showing the kind of preparation and communication skills that interviewers look for. Keep up this level of quality and continue refining your delivery through practice.';
  } else if (overallAvg >= 7) {
    feedback += 'Very good performance! You answered most questions effectively and showed solid preparation. There are some areas where you can polish your responses further, but overall you\'re on the right track. Focus on adding more specific examples and ensuring every answer directly addresses what\'s being asked.';
  } else if (overallAvg >= 6) {
    feedback += 'Good effort! Your answers show potential and demonstrate basic understanding. However, there are notable areas that need attention. Work on being more specific and detailed in your responses. Practice structuring your answers using frameworks like STAR (Situation, Task, Action, Result) for behavioral questions.';
  } else if (overallAvg >= 5) {
    feedback += 'Fair performance with room for significant improvement. Your answers need more depth, clarity, and relevance. Consider preparing talking points for common questions in advance. Practice answering out loud to build confidence and fluency. Review sample answers to understand what interviewers are looking for.';
  } else {
    feedback += 'This is a good learning opportunity. Your responses need more preparation and structure. Start by researching common interview questions for your field. Practice the STAR method for behavioral questions. Focus on giving complete answers with specific examples. Remember, interviewing is a skill that improves with practice - keep working at it!';
  }
  feedback += '</p>';
  
  // Specific feedback on dimensions
  feedback += '<p><strong>Detailed Analysis:</strong></p><ul>';
  
  // Relevance feedback
  if (avgRelevance >= 7) {
    feedback += '<li><strong>Relevance (Strong):</strong> You consistently addressed the core of each question with relevant information. This shows you listen carefully and understand what interviewers are looking for. Continue this approach by always taking a moment to identify the key elements of a question before answering.</li>';
  } else if (avgRelevance >= 5) {
    feedback += '<li><strong>Relevance (Needs Improvement):</strong> Your answers were somewhat relevant but didn\'t always hit the mark. Before answering, pause to identify what the interviewer really wants to know. Use keywords from the question in your response to show you\'re addressing the specific point. If unsure, it\'s okay to ask for clarification.</li>';
  } else {
    feedback += '<li><strong>Relevance (Critical Area):</strong> Your answers often missed the core of what was being asked. To improve: (1) Listen carefully to the entire question, (2) Identify what specific information they want (a skill, experience, opinion, etc.), (3) Structure your answer around that specific request. Practice by writing down questions and outlining key points to cover before answering.</li>';
  }
  
  // Clarity feedback
  if (avgClarity >= 7) {
    feedback += '<li><strong>Clarity (Strong):</strong> Your answers were clear, well-structured, and easy to follow. You communicate your thoughts effectively, which is crucial in interviews. You likely used good pacing and logical organization. Keep this up, and consider how body language and tone can further enhance your clarity in real interviews.</li>';
  } else if (avgClarity >= 5) {
    feedback += '<li><strong>Clarity (Needs Improvement):</strong> Your responses could be clearer. Try organizing your thoughts before speaking - even a mental outline helps. Use signposting language like "First," "Second," and "Finally" to guide your listener. Keep sentences concise. If you find yourself rambling, pause and refocus on your main point.</li>';
  } else {
    feedback += '<li><strong>Clarity (Critical Area):</strong> Your answers lacked clear structure and were hard to follow. This can happen when thinking out loud without a plan. Practice the STAR method for behavioral questions (Situation, Task, Action, Result). For technical questions, try "Definition, Example, Why it matters." Record yourself answering questions to identify where you lose clarity.</li>';
  }
  
  // Completeness feedback
  if (avgCompleteness >= 7) {
    feedback += '<li><strong>Completeness (Strong):</strong> You provided comprehensive answers with sufficient detail and examples. This demonstrates preparation and depth of knowledge. Interviewers value candidates who can fully develop their thoughts. Continue including specific examples and explaining the impact or results of your actions.</li>';
  } else if (avgCompleteness >= 5) {
    feedback += '<li><strong>Completeness (Needs Improvement):</strong> Your answers had the right idea but lacked depth. Don\'t just state facts - explain the context, your reasoning, and the outcomes. Add specific examples from your experience. A complete answer typically takes 1-2 minutes to deliver (roughly 75-150 words). Practice expanding your responses without rambling.</li>';
  } else {
    feedback += '<li><strong>Completeness (Critical Area):</strong> Your answers were too brief and lacked necessary detail. Interviewers can\'t assess your abilities from short, surface-level responses. For each answer: (1) Provide context, (2) Explain your approach or thinking, (3) Describe the action or solution, (4) Share the result or lesson learned. Aim for 75-150 words per answer. Quality over quantity, but sufficient detail is essential.</li>';
  }
  
  feedback += '</ul>';
  
  // Personalized recommendations
  feedback += '<p><strong>Your Personalized Action Plan:</strong></p><ul>';
  
  if (stats.totalWords < 300) {
    feedback += '<li><strong>Expand your responses:</strong> Your total word count was ' + stats.totalWords + ' words across all questions. This suggests very brief answers. Practice elaborating on your points. For each answer, try to include: what you did, why you did it, how you did it, and what the result was. Aim for at least 75 words per question.</li>';
  }
  
  if (stats.answeredQuestions < stats.totalQuestions) {
    const unanswered = stats.totalQuestions - stats.answeredQuestions;
    feedback += '<li><strong>Answer all questions:</strong> You left ' + unanswered + ' question(s) unanswered. In real interviews, attempting every question is important, even if you\'re uncertain. It shows engagement and effort. If you don\'t know something, be honest but try to provide related knowledge or show your problem-solving approach.</li>';
  }
  
  if (avgRelevance < 6) {
    feedback += '<li><strong>Improve relevance:</strong> Research common interview questions for your field and prepare specific talking points. Create a "stories bank" - 5-7 experiences you can adapt to different questions. This helps you stay on-topic and relevant.</li>';
  }
  
  if (avgClarity < 6) {
    feedback += '<li><strong>Enhance clarity:</strong> Before your next practice session, outline your answer mentally or on paper. Practice transitional phrases. Record yourself answering questions and listen back - you\'ll notice where you lose focus or become unclear.</li>';
  }
  
  if (avgCompleteness < 6) {
    feedback += '<li><strong>Build completeness:</strong> Study the STAR method and practice applying it to behavioral questions. For technical questions, use the "Concept-Example-Application" structure. Always include specific, measurable outcomes when possible.</li>';
  }
  
  if (overallAvg >= 7) {
    feedback += '<li><strong>Polish your delivery:</strong> You\'re performing well! Now focus on refinement - work on your pacing, confidence, and making your examples even more compelling. Consider mock interviews with peers for real-time feedback.</li>';
  }
  
  feedback += '<li><strong>Consistent practice:</strong> Set aside 15-20 minutes daily to practice 2-3 interview questions. Record yourself, review, and iterate. Track your progress over time. Join interview prep communities online for additional practice and feedback.</li>';
  feedback += '<li><strong>Research the role:</strong> Tailor your preparation to the specific type of interview (HR, technical, behavioral). Study job descriptions to understand what skills and experiences to highlight.</li>';
  feedback += '</ul>';
  
  // Closing message with personalized encouragement
  feedback += '<p style="background: rgba(98, 90, 245, 0.1); padding: 20px; border-left: 4px solid var(--accent-primary); margin-top: 20px; border-radius: 4px;"><strong>🎯 Final Note:</strong><br><br>';
  
  if (overallAvg >= 7) {
    feedback += 'You\'re demonstrating strong interview skills! Your preparation is evident. As you continue practicing, focus on refining your delivery and staying authentic. Interviewers want to see the real you, not a scripted performance. ';
  } else if (overallAvg >= 5) {
    feedback += 'You\'re on the right path. Every interview, even practice ones, builds your skills. The feedback above gives you clear areas to focus on. Break them down into small, manageable goals and work on one at a time. Progress takes practice, but you\'re capable of significant improvement. ';
  } else {
    feedback += 'Don\'t be discouraged - everyone starts somewhere, and the fact that you\'re practicing shows initiative. Interview skills are learned, not innate. Focus on the fundamentals: listen carefully, structure your thoughts, and provide specific examples. Start with one area of improvement at a time. ';
  }
  
  feedback += '<br><br>Remember: this practice tool evaluates your responses based on relevance, clarity, and completeness - the same principles that matter in real interviews. ';
  feedback += 'Each practice session makes you stronger. Review this feedback, implement the suggestions, and come back to practice again. ';
  feedback += '<br><br><strong>You\'ve got this. Keep practicing, stay confident, and believe in your preparation!</strong>';
  feedback += '</p>';
  
  finalFeedbackEl.innerHTML = feedback;
}

function showNoDataMessage() {
  questionFeedbackListEl.innerHTML = `
    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
      <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: var(--accent-warning); margin-bottom: 20px;"></i>
      <h2>No Interview Data Found</h2>
      <p>Please complete an interview first.</p>
      <button onclick="window.location.href='levels.html'" style="margin-top: 20px;" class="btn-action">
        <i class="fas fa-arrow-left"></i>
        <span>Go to Interview Levels</span>
      </button>
    </div>
  `;
  
  // Hide other sections
  document.querySelector('.overall-scores').style.display = 'none';
  document.querySelector('.summary-stats').style.display = 'none';
  document.querySelector('.final-feedback').style.display = 'none';
}

// ========================================
// EVENT HANDLERS
// ========================================

function handleRestart() {
  if (confirm('Are you sure you want to start a new interview? Current results will be cleared.')) {
    // Clear localStorage
    localStorage.removeItem('interviewAnswers');
    localStorage.removeItem('interviewStats');
    
    // Redirect to levels
    window.location.href = 'levels.html';
  }
}

function handleGoToLevels() {
  window.location.href = 'levels.html';
}

function handlePrint() {
  window.print();
}

// ========================================
// EVENT LISTENERS
// ========================================

restartBtn.addEventListener('click', handleRestart);
levelsBtn.addEventListener('click', handleGoToLevels);
printBtn.addEventListener('click', handlePrint);

// ========================================
// INITIALIZATION
// ========================================

// Load feedback data when page loads
document.addEventListener('DOMContentLoaded', loadFeedbackData);
