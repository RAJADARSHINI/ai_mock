/**
 * interview-script.js - AI Mock Interview System
 * Handles interview page functionality:
 * - Camera and microphone access
 * - Speech-to-text recognition
 * - Question navigation
 * - Timer countdown
 * - Basic AI feedback simulation
 * - localStorage for data persistence
 */

// ========================================
// CONFIGURATION & DATA
// ========================================

// Questions loaded from JSON file
let allQuestions = [];

// Default questions if loading fails
const defaultQuestions = [
  { text: "Tell me about yourself and your background.", keywords: ["background", "experience", "education", "skills"] },
  { text: "Why do you want to work for our company?", keywords: ["company", "interest", "motivation", "culture"] },
  { text: "What are your greatest strengths?", keywords: ["strength", "skill", "ability", "expertise"] }
];

// ========================================
// DOM ELEMENTS
// ========================================

const timerEl = document.getElementById('timer');
const statusEl = document.getElementById('status');
const videoEl = document.getElementById('interviewCamera');
const cameraErrorEl = document.getElementById('cameraError');
const retryCameraBtn = document.getElementById('retryCameraBtn');
const questionTextEl = document.getElementById('questionText');
const questionNumberEl = document.getElementById('questionNumber');
const transcriptEl = document.getElementById('transcript');
const wordCountEl = document.getElementById('wordCount');
const listeningIndicatorEl = document.getElementById('listeningIndicator');

const clearAnswerBtn = document.getElementById('clearAnswerBtn');
const prevQuestionBtn = document.getElementById('prevQuestionBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const submitNextBtn = document.getElementById('submitNextBtn');
const submitInterviewBtn = document.getElementById('submitInterviewBtn');
const camToggleBtn = document.getElementById('camToggleBtn');
const micToggleBtn = document.getElementById('micToggleBtn');

const relevanceScoreEl = document.getElementById('relevanceScore');
const clarityScoreEl = document.getElementById('clarityScore');
const completenessScoreEl = document.getElementById('completenessScore');
const feedbackTextEl = document.getElementById('feedbackText');

// ========================================
// STATE MANAGEMENT
// ========================================

let state = {
  currentQuestionIndex: 0,
  questions: [],
  answers: [],
  responses: [],
  mediaStream: null,
  recognition: null,
  isRecording: false,
  isCameraOn: false,
  timeRemaining: 30 * 60, // 30 minutes in seconds
  timerInterval: null,
  interviewLevel: 'hr'
};

// ========================================
// INITIALIZATION
// ========================================

async function loadQuestionsFromJSON() {
  try {
    const response = await fetch('data/questions.json');
    if (!response.ok) {
      throw new Error('Failed to load questions');
    }
    allQuestions = await response.json();
    console.log('Loaded questions from JSON:', allQuestions.length);
  } catch (error) {
    console.error('Error loading questions:', error);
    // Use default questions as fallback
    allQuestions = defaultQuestions.map((q, idx) => ({
      id: idx + 1,
      domain: 'HR',
      question: q.text,
      ideal_answer: '',
      keywords: q.keywords
    }));
  }
}

function filterQuestionsByDomain(domain) {
  // Normalize domain name
  const domainMap = {
    'hr': 'HR',
    'technical': 'Technical',
    'behavioral': 'Behavioral',
    'coding': 'Coding'
  };
  
  const normalizedDomain = domainMap[domain.toLowerCase()] || 'HR';
  
  // Filter questions by domain
  const filtered = allQuestions.filter(q => q.domain === normalizedDomain);
  
  return filtered.length > 0 ? filtered : allQuestions.slice(0, 5);
}

async function init() {
  // Load questions from JSON file
  await loadQuestionsFromJSON();
  
  // Get interview level from localStorage
  state.interviewLevel = localStorage.getItem('interviewLevel') || 'hr';
  
  // Filter questions by selected domain
  state.questions = filterQuestionsByDomain(state.interviewLevel);
  
  console.log('Selected domain:', state.interviewLevel);
  console.log('Filtered questions:', state.questions.length);
  
  // Initialize answers array
  state.answers = state.questions.map(q => ({
    questionId: q.id,
    question: q.question,
    keywords: q.keywords,
    answer: '',
    wordCount: 0,
    relevance: null,
    clarity: null,
    completeness: null,
    feedback: '',
    submitted: false
  }));
  
  // Initialize responses array for feedback
  state.responses = [];
  
  // Load first question
  loadQuestion(0);
  
  // Initialize speech recognition
  initSpeechRecognition();
  
  // Setup event listeners
  setupEventListeners();
  
  // MANDATORY CAMERA: Disable all controls until camera is ready
  disableInterviewControls();
  updateStatus('🎥 Camera REQUIRED - Requesting access...');
  
  // Try to initialize camera - MANDATORY
  initCamera().then(success => {
    if (success) {
      console.log('✅ Camera initialized successfully');
      updateStatus('✅ Camera Ready - Interview Active');
      
      // Enable controls and start timer
      enableInterviewControls();
      startTimer();
    } else {
      console.error('❌ Camera initialization failed');
      updateStatus('❌ CAMERA REQUIRED - Please enable camera');
    }
  }).catch(err => {
    console.error('❌ Camera error:', err);
    updateStatus('❌ CAMERA REQUIRED - Please enable camera');
  });
}

// ========================================
// PERMISSION CHECKING
// ========================================

async function checkCameraPermission() {
  try {
    // Try to query camera permission if Permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        return result.state; // 'granted', 'denied', or 'prompt'
      } catch (e) {
        // Permissions API might not support camera on all browsers
        console.log('Permissions API not fully supported, will attempt direct access');
      }
    }
    // If Permissions API unavailable, return 'prompt' to attempt access
    return 'prompt';
  } catch (error) {
    console.error('Permission check error:', error);
    return 'prompt';
  }
}

async function checkMicrophonePermission() {
  try {
    // Try to query microphone permission if Permissions API is available
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        return result.state; // 'granted', 'denied', or 'prompt'
      } catch (e) {
        // Permissions API might not support microphone on all browsers
        console.log('Permissions API not fully supported, will attempt direct access');
      }
    }
    // If Permissions API unavailable, return 'prompt' to attempt access
    return 'prompt';
  } catch (error) {
    console.error('Permission check error:', error);
    return 'prompt';
  }
}

// ========================================
// CAMERA FUNCTIONALITY
// ========================================

async function initCamera() {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported');
      throw new Error('NotSupportedError');
    }
    
    console.log('🎥 Requesting camera access...');
    console.log('📹 Video element reference:', videoEl);
    console.log('📹 Video element display:', window.getComputedStyle(videoEl).display);
    
    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        width: { ideal: 1280 }, 
        height: { ideal: 720 },
        facingMode: 'user'
      }, 
      audio: false
    });
    
    console.log('✅ Camera stream obtained successfully');
    console.log('📊 Stream tracks:', state.mediaStream.getTracks());
    
    // Assign stream to video element
    console.log('📺 Assigning stream to video element...');
    console.log('📺 Video element parent:', videoEl.parentElement);
    console.log('📺 Video element parent size:', videoEl.parentElement.offsetWidth, 'x', videoEl.parentElement.offsetHeight);
    
    videoEl.srcObject = state.mediaStream;
    console.log('✅ Stream assigned to video element');
    console.log('📺 Stream:', state.mediaStream);
    console.log('📺 Tracks:', state.mediaStream.getTracks().map(t => t.label));
    
    // Force absolute positioning to fill container
    const parent = videoEl.parentElement;
    videoEl.style.position = 'absolute';
    videoEl.style.top = '0';
    videoEl.style.left = '0';
    videoEl.style.display = 'block !important';
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover';
    videoEl.style.backgroundColor = '#000';
    videoEl.style.zIndex = '1';
    console.log('✅ Video element styling applied');
    
    // Hide error overlay so video is visible
    cameraErrorEl.style.display = 'none';
    cameraErrorEl.style.zIndex = '0';
    
    // Wait longer for stream to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Play the video
    try {
      console.log('🎬 Attempting to play video...');
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('✅ Video playing successfully');
        console.log('🎥 Video is playing:', !videoEl.paused);
        console.log('🎥 Video dimensions:', videoEl.videoWidth, 'x', videoEl.videoHeight);
      }
    } catch (playErr) {
      console.error('❌ Video play error:', playErr);
      // Try playing again
      setTimeout(() => {
        videoEl.play().catch(e => console.error('Retry play failed:', e));
      }, 100);
    }
    
    // Monitor video readiness
    videoEl.onloadedmetadata = function() {
      console.log('✅ Video metadata loaded - dimensions:', videoEl.videoWidth, 'x', videoEl.videoHeight);
    };
    
    state.isCameraOn = true;
    camToggleBtn.classList.add('active');
    cameraErrorEl.style.display = 'none';
    if (retryCameraBtn) {
      retryCameraBtn.style.display = 'none';
    }
    updateStatus('🎥 Camera is ON');
    
    console.log('✅ Camera initialized successfully - Face should be visible now!');
    return true;
    
  } catch (error) {
    console.error('❌ Camera access error:', error);
    console.error('📋 Error name:', error.name);
    console.error('📋 Error message:', error.message);
    
    state.isCameraOn = false;
    camToggleBtn.classList.remove('active');
    
    // Show error in camera panel but don't block the interview
    let errorMessage = 'Camera unavailable';
    let errorHTML = '<i class="fas fa-exclamation-triangle"></i><p>Camera unavailable</p>';
    
    if (error.name === 'NotAllowedError' || error.message === 'NotAllowedError') {
      errorMessage = 'Camera permission denied.';
      errorHTML = `
        <i class="fas fa-lock"></i>
        <p style="margin-bottom: 8px; color: #ff4444;">🚫 CAMERA REQUIRED</p>
        <small style="display: block; margin-bottom: 12px; color: #fff;">
          <strong>Camera is MANDATORY for this interview!</strong><br/><br/>
          <strong style="color: #ffd700;">Step 1:</strong> Windows Settings<br/>
          <strong style="color: #ffd700;">Step 2:</strong> Privacy & security → Camera<br/>
          <strong style="color: #ffd700;">Step 3:</strong> Toggle Camera ON<br/>
          <strong style="color: #ffd700;">Step 4:</strong> Allow your browser<br/>
          <strong style="color: #ffd700;">Step 5:</strong> Click "Retry Camera" ↓
        </small>
      `;
      updateStatus('🚫 CAMERA PERMISSION DENIED - Camera is mandatory');
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
      errorHTML = '<i class="fas fa-video-slash"></i><p style="color: #ff4444;">❌ NO CAMERA FOUND</p><small>A camera is REQUIRED. Connect a webcam and retry.</small>';
      updateStatus('❌ No camera - cannot proceed');
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is already in use by another app.';
      errorHTML = '<i class="fas fa-exclamation-triangle"></i><p style="color: #ff4444;">⚠️ CAMERA IN USE</p><small>Close other apps using camera and click Retry</small>';
      updateStatus('⚠️ Camera in use - close other apps and retry');
    } else if (error.name === 'NotSupportedError' || error.message === 'NotSupportedError') {
      errorMessage = 'Camera not supported in this browser.';
      errorHTML = '<i class="fas fa-exclamation-triangle"></i><p style="color: #ff4444;">⚠️ NOT SUPPORTED</p><small>Try Chrome, Edge, or Firefox</small>';
      updateStatus('⚠️ Camera not supported - try different browser');
    } else {
      errorHTML = '<i class="fas fa-exclamation-triangle"></i><p style="color: #ff4444;">❌ CAMERA ERROR</p><small>Error: ' + error.message + '</small>';
      updateStatus('❌ Camera error - cannot proceed');
    }
    
    cameraErrorEl.innerHTML = errorHTML;
    cameraErrorEl.style.display = 'flex';
    
    // Show retry button
    if (retryCameraBtn) {
      retryCameraBtn.style.display = 'block';
    }
    
    console.warn('❌ ' + errorMessage);
    console.error('Camera error details:', error);
    
    return false;
  }
}

function disableInterviewControls() {
  micToggleBtn.disabled = true;
  transcriptEl.disabled = true;
  submitInterviewBtn.disabled = true;
}

function enableInterviewControls() {
  micToggleBtn.disabled = false;
  transcriptEl.disabled = false;
  submitInterviewBtn.disabled = false;
}

function toggleCamera() {
  if (state.isCameraOn) {
    // Turn off camera
    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach(track => track.stop());
      videoEl.srcObject = null;
    }
    state.isCameraOn = false;
    camToggleBtn.classList.remove('active');
    cameraErrorEl.style.display = 'none'; // Hide error, just stop video
    updateStatus('Camera turned off');
    console.log('📹 Camera turned off');
  } else {
    // Turn on camera - make it async
    console.log('🎬 Attempting to enable camera...');
    initCamera().then(success => {
      if (success) {
        console.log('✅ Camera enabled successfully');
      } else {
        console.log('❌ Camera failed to enable');
      }
    }).catch(err => {
      console.error('❌ Camera error:', err);
    });
  }
}

// ========================================
// SPEECH RECOGNITION
// ========================================

function initSpeechRecognition() {
  // Check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported');
    micToggleBtn.disabled = true;
    micToggleBtn.title = 'Speech recognition not supported in this browser';
    return;
  }
  
  state.recognition = new SpeechRecognition();
  state.recognition.continuous = true;
  state.recognition.interimResults = true;
  state.recognition.lang = 'en-US';
  
  state.recognition.onstart = () => {
    state.isRecording = true;
    listeningIndicatorEl.style.display = 'flex';
    micToggleBtn.classList.add('active');
    updateStatus('Listening...');
  };
  
  state.recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Update transcript
    if (finalTranscript) {
      transcriptEl.value += finalTranscript;
      updateWordCount();
      analyzeAnswer();
    }
  };
  
  state.recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    
    // Handle specific speech recognition errors
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      alert('Microphone access is required for voice answers. Please enable it in browser settings.');
      updateStatus('Microphone access denied');
    } else if (event.error === 'no-speech') {
      console.log('No speech detected, continuing...');
      return; // Don't stop recording for no-speech
    } else if (event.error === 'audio-capture') {
      alert('Microphone is not working. Please check your device and try again.');
      updateStatus('Microphone error');
    } else if (event.error === 'network') {
      alert('Network error. Speech recognition may not work offline.');
      updateStatus('Network error');
    } else {
      updateStatus('Speech error: ' + event.error);
    }
    
    stopRecording();
  };
  
  state.recognition.onend = () => {
    if (state.isRecording) {
      // Restart if still supposed to be recording
      state.recognition.start();
    }
  };
}

async function startRecording() {
  if (!state.recognition) {
    alert('Speech recognition is not available in your browser. Please type your answer.');
    return;
  }
  
  try {
    // Check permission before attempting to access microphone
    const permissionState = await checkMicrophonePermission();
    
    if (permissionState === 'denied') {
      throw new Error('NotAllowedError');
    }
    
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('NotSupportedError');
    }
    
    // Test microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Microphone access granted, stop the test stream
    stream.getTracks().forEach(track => track.stop());
    
    // Now start speech recognition
    try {
      state.recognition.start();
    } catch (speechError) {
      console.error('Speech recognition start error:', speechError);
      // Handle case where recognition is already started
      if (speechError.message && speechError.message.includes('already started')) {
        console.log('Speech recognition already active');
      } else {
        throw speechError;
      }
    }
  } catch (error) {
    console.error('Microphone access error:', error);
    
    // Handle specific error types
    let errorMessage = 'Microphone access is required for voice answers.';
    
    if (error.name === 'NotAllowedError' || error.message === 'NotAllowedError') {
      errorMessage = 'Microphone access is required for voice answers. Please enable it in browser settings and refresh the page.';
      updateStatus('Microphone access denied');
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No microphone found. Please connect a microphone device and refresh the page.';
      updateStatus('No microphone found');
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Microphone is already in use by another application. Please close other applications and try again.';
      updateStatus('Microphone in use');
    } else if (error.name === 'NotSupportedError' || error.message === 'NotSupportedError') {
      errorMessage = 'Microphone is not supported in this browser. Please use Chrome, Edge, or Firefox.';
      updateStatus('Browser not supported');
    } else {
      errorMessage = 'Microphone access failed. You can type your answer instead.';
      updateStatus('Microphone unavailable');
    }
    
    alert(errorMessage);
  }
}

function stopRecording() {
  if (state.recognition && state.isRecording) {
    state.isRecording = false;
    state.recognition.stop();
    listeningIndicatorEl.style.display = 'none';
    micToggleBtn.classList.remove('active');
    updateStatus('Processing answer...');
    
    // Save answer
    saveCurrentAnswer();
    
    setTimeout(() => {
      updateStatus('Answer saved');
    }, 500);
  }
}

// ========================================
// QUESTION NAVIGATION
// ========================================

function loadQuestion(index) {
  if (index < 0 || index >= state.questions.length) return;
  
  state.currentQuestionIndex = index;
  const question = state.questions[index];
  const answer = state.answers[index];
  
  // Update UI
  questionTextEl.textContent = question.question;
  questionNumberEl.textContent = index + 1;
  transcriptEl.value = answer.answer;
  
  // Check if this question was already submitted
  if (answer.submitted) {
    // Lock the answer input
    transcriptEl.disabled = true;
    micToggleBtn.disabled = true;
    clearAnswerBtn.disabled = true;
    submitNextBtn.disabled = true;
    submitNextBtn.textContent = 'Answer Submitted';
    submitNextBtn.innerHTML = '<i class="fas fa-check"></i><span>Answer Submitted</span>';
  } else {
    // Unlock the answer input
    transcriptEl.disabled = false;
    micToggleBtn.disabled = false;
    clearAnswerBtn.disabled = false;
    submitNextBtn.disabled = false;
    submitNextBtn.innerHTML = '<i class="fas fa-arrow-right"></i><span>Submit & Next</span>';
  }
  
  // Update navigation buttons
  prevQuestionBtn.disabled = index === 0;
  nextQuestionBtn.disabled = index === state.questions.length - 1;
  
  // Update feedback
  updateFeedbackDisplay();
  updateWordCount();
}

function nextQuestion() {
  saveCurrentAnswer();
  loadQuestion(state.currentQuestionIndex + 1);
}

function prevQuestion() {
  saveCurrentAnswer();
  loadQuestion(state.currentQuestionIndex - 1);
}

async function saveCurrentAnswer() {
  const answer = state.answers[state.currentQuestionIndex];
  answer.answer = transcriptEl.value.trim();
  answer.wordCount = countWords(answer.answer);
  
  // Analyze answer
  const analysis = await analyzeAnswerQuality(answer.answer, answer.keywords);
  answer.relevance = analysis.relevance;
  answer.clarity = analysis.clarity;
  answer.completeness = analysis.completeness;
  answer.feedback = analysis.feedback;
}

// ========================================
// ANSWER ANALYSIS
// ========================================

function countWords(text) {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function updateWordCount() {
  const count = countWords(transcriptEl.value);
  wordCountEl.textContent = count;
}

async function analyzeAnswer() {
  const answer = transcriptEl.value.trim();
  const keywords = state.questions[state.currentQuestionIndex].keywords;
  
  if (!answer) {
    relevanceScoreEl.textContent = '—';
    clarityScoreEl.textContent = '—';
    completenessScoreEl.textContent = '—';
    feedbackTextEl.innerHTML = '<i class="fas fa-info-circle"></i> Answer the question to receive AI feedback.';
    return;
  }
  
  const analysis = await analyzeAnswerQuality(answer, keywords);
  
  // Update scores
  relevanceScoreEl.textContent = analysis.relevance + '/10';
  clarityScoreEl.textContent = analysis.clarity + '/10';
  completenessScoreEl.textContent = analysis.completeness + '/10';
  feedbackTextEl.innerHTML = `<i class="fas fa-robot"></i> ${analysis.feedback}`;
}

async function analyzeAnswerQuality(answer, keywords) {
  const wordCount = countWords(answer);
  const question = state.questions[state.currentQuestionIndex].question;
  
  // Try to call Node.js backend API
  try {
    const response = await fetch('http://localhost:5000/api/evaluation/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        answer: answer,
        keywords: keywords,
        idealWordCount: 100
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      const evaluation = result.data;
      
      // Convert scores (0-100) to 0-10 scale
      const relevance = Math.round(evaluation.scores.relevance / 10);
      const clarity = Math.round(evaluation.scores.clarity / 10);
      const completeness = Math.round(evaluation.scores.completeness / 10);
      
      const matchedKeywords = (evaluation.keywordMatches || [])
        .filter(k => k.found)
        .map(k => k.keyword);
      const missingKeywords = (evaluation.keywordMatches || [])
        .filter(k => !k.found)
        .map(k => k.keyword);
      
      return {
        relevance,
        clarity,
        completeness,
        feedback: evaluation.feedback,
        relevancePercentage: evaluation.scores.overall,
        matchedKeywords,
        missingKeywords
      };
    }
  } catch (error) {
    console.log('Backend not available, using local evaluation');
  }
  
  // Fallback to local evaluation if backend is unavailable
  const lowerAnswer = answer.toLowerCase();
  
  // Relevance: Check keyword matches
  let keywordMatches = 0;
  const matchedKeywords = [];
  const missingKeywords = [];
  
  keywords.forEach(keyword => {
    if (lowerAnswer.includes(keyword.toLowerCase())) {
      keywordMatches++;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  // Calculate relevance percentage
  const relevancePercentage = keywords.length > 0 
    ? Math.round((keywordMatches / keywords.length) * 100) 
    : 0;
  
  const relevance = Math.min(10, Math.round((keywordMatches / keywords.length) * 10) + 2);
  
  // Clarity: Based on sentence structure and length
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
  let clarity = 5;
  
  if (avgWordsPerSentence > 10 && avgWordsPerSentence < 25) {
    clarity = 8;
  } else if (avgWordsPerSentence >= 25 && avgWordsPerSentence < 40) {
    clarity = 7;
  } else if (avgWordsPerSentence >= 5) {
    clarity = 6;
  }
  
  // Completeness: Based on word count
  let completeness = 5;
  if (wordCount >= 100) completeness = 9;
  else if (wordCount >= 75) completeness = 8;
  else if (wordCount >= 50) completeness = 7;
  else if (wordCount >= 30) completeness = 6;
  else if (wordCount >= 15) completeness = 5;
  else completeness = 3;
  
  // Generate feedback
  let feedback = '';
  
  if (relevance < 5) {
    feedback += 'Your answer could be more relevant to the question. Try to address the key points directly. ';
  } else if (relevance >= 8) {
    feedback += 'Great job addressing the key points! ';
  }
  
  if (clarity < 6) {
    feedback += 'Try to structure your answer more clearly with well-formed sentences. ';
  } else if (clarity >= 8) {
    feedback += 'Your answer is clear and well-structured. ';
  }
  
  if (completeness < 6) {
    feedback += 'Consider providing more detail and examples to make your answer more complete.';
  } else if (completeness >= 8) {
    feedback += 'Your answer is comprehensive and detailed.';
  }
  
  if (!feedback) {
    feedback = 'Good answer! Keep practicing to improve further.';
  }
  
  return { 
    relevance, 
    clarity, 
    completeness, 
    feedback: feedback.trim(),
    relevancePercentage,
    matchedKeywords,
    missingKeywords
  };
}

// ========================================
// TIMER
// ========================================

function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      clearInterval(state.timerInterval);
      handleTimeUp();
    }
    
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Change color when time is running low
  if (state.timeRemaining <= 300) { // 5 minutes
    timerEl.parentElement.style.borderColor = 'var(--accent-warning)';
    timerEl.parentElement.style.color = 'var(--accent-warning)';
  }
  
  if (state.timeRemaining <= 60) { // 1 minute
    timerEl.parentElement.style.borderColor = 'var(--accent-danger)';
    timerEl.parentElement.style.color = 'var(--accent-danger)';
  }
}

function handleTimeUp() {
  // Stop recording
  if (state.isRecording) {
    stopRecording();
  }
  
  // Disable inputs
  micToggleBtn.disabled = true;
  transcriptEl.disabled = true;
  
  // Show message
  updateStatus('Time is up!');
  alert('Time is up! Please submit your interview.');
}

// ========================================
// SUBMIT INTERVIEW
// ========================================

function submitInterview() {
  // Confirm submission
  const answeredCount = state.answers.filter(a => a.answer.trim().length > 0).length;
  const unansweredCount = state.questions.length - answeredCount;
  
  let confirmMessage = `Ready to submit your interview?\n\n`;
  confirmMessage += `✓ Answered: ${answeredCount} question${answeredCount !== 1 ? 's' : ''}\n`;
  if (unansweredCount > 0) {
    confirmMessage += `✗ Unanswered: ${unansweredCount} question${unansweredCount !== 1 ? 's' : ''}\n\n`;
    confirmMessage += `You can still submit, but answering all questions will give you better feedback.`;
  } else {
    confirmMessage += `\nGreat! You answered all questions.`;
  }
  
  if (!confirm(confirmMessage)) {
    return; // User cancelled
  }
  
  // Save current answer
  saveCurrentAnswer();
  
  // Calculate statistics
  const stats = {
    level: state.interviewLevel,
    totalQuestions: state.questions.length,
    answeredQuestions: answeredCount,
    totalWords: state.answers.reduce((sum, a) => sum + a.wordCount, 0),
    avgRelevance: calculateAverage(state.answers.map(a => a.relevance)),
    avgClarity: calculateAverage(state.answers.map(a => a.clarity)),
    avgCompleteness: calculateAverage(state.answers.map(a => a.completeness)),
    timeSpent: (30 * 60) - state.timeRemaining,
    submittedAt: new Date().toISOString()
  };
  
  // Store in localStorage
  localStorage.setItem('interviewAnswers', JSON.stringify(state.answers));
  localStorage.setItem('interviewStats', JSON.stringify(stats));
  
  // Stop timer
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
  }
  
  // Stop camera
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach(track => track.stop());
  }
  
  // Redirect to feedback page
  window.location.href = 'feedback.html';
}

function calculateAverage(numbers) {
  const validNumbers = numbers.filter(n => n !== null && !isNaN(n));
  if (validNumbers.length === 0) return 0;
  return Math.round(validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length);
}

// ========================================
// UI UPDATES
// ========================================

function updateStatus(message) {
  statusEl.textContent = message;
}

function updateFeedbackDisplay() {
  const answer = state.answers[state.currentQuestionIndex];
  
  if (answer.relevance !== null) {
    relevanceScoreEl.textContent = answer.relevance + '/10';
    clarityScoreEl.textContent = answer.clarity + '/10';
    completenessScoreEl.textContent = answer.completeness + '/10';
    feedbackTextEl.innerHTML = `<i class="fas fa-robot"></i> ${answer.feedback}`;
  } else {
    relevanceScoreEl.textContent = '—';
    clarityScoreEl.textContent = '—';
    completenessScoreEl.textContent = '—';
    feedbackTextEl.innerHTML = '<i class="fas fa-info-circle"></i> Answer the question to receive AI feedback.';
  }
}

function clearAnswer() {
  if (confirm('Are you sure you want to clear your answer?')) {
    transcriptEl.value = '';
    updateWordCount();
    state.answers[state.currentQuestionIndex].answer = '';
    updateFeedbackDisplay();
  }
}

async function handleSubmitNext() {
  const currentAnswer = transcriptEl.value.trim();
  
  // Validate that an answer is present
  if (!currentAnswer || currentAnswer.length === 0) {
    alert('Please provide an answer before moving to the next question. You can type your answer or use the microphone to record it.');
    return;
  }
  
  // Stop recording if currently recording
  if (state.isRecording) {
    stopRecording();
  }
  
  // Save the current answer
  await saveCurrentAnswer();
  
  // Get current question and answer data
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentAnswerData = state.answers[state.currentQuestionIndex];
  
  // Evaluate the answer with keyword matching
  const evaluation = await analyzeAnswerQuality(currentAnswer, currentQuestion.keywords);
  
  // Store response for feedback page
  state.responses.push({
    question: currentQuestion.question,
    userAnswer: currentAnswer,
    keywords: currentQuestion.keywords,
    matchedKeywords: evaluation.matchedKeywords,
    missingKeywords: evaluation.missingKeywords,
    relevanceScore: evaluation.relevancePercentage,
    relevance: evaluation.relevance,
    clarity: evaluation.clarity,
    completeness: evaluation.completeness,
    feedback: evaluation.feedback
  });
  
  // Mark as submitted and lock the input
  state.answers[state.currentQuestionIndex].submitted = true;
  transcriptEl.disabled = true;
  micToggleBtn.disabled = true;
  clearAnswerBtn.disabled = true;
  submitNextBtn.disabled = true;
  submitNextBtn.innerHTML = '<i class="fas fa-check"></i><span>Answer Submitted</span>';
  
  // Auto-advance to next question after a brief delay
  setTimeout(() => {
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex < state.questions.length) {
      // Move to next question
      loadQuestion(nextIndex);
    } else {
      // Last question - store responses and redirect to feedback
      localStorage.setItem('interviewResponses', JSON.stringify(state.responses));
      alert('You have completed all questions! Redirecting to feedback page...');
      
      // Redirect to feedback page
      setTimeout(() => {
        window.location.href = 'feedback.html';
      }, 1000);
    }
  }, 500);
}

// ========================================
// MICROPHONE TOGGLE
// ========================================

function toggleMicrophone() {
  if (state.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
  // Recording controls
  clearAnswerBtn.addEventListener('click', clearAnswer);
  
  // Navigation
  prevQuestionBtn.addEventListener('click', prevQuestion);
  nextQuestionBtn.addEventListener('click', nextQuestion);
  submitNextBtn.addEventListener('click', handleSubmitNext);
  submitInterviewBtn.addEventListener('click', submitInterview);
  
  // Camera toggle
  camToggleBtn.addEventListener('click', toggleCamera);
  
  // Retry camera button
  if (retryCameraBtn) {
    retryCameraBtn.addEventListener('click', async () => {
      console.log('🔄 Retrying camera access (MANDATORY)...');
      retryCameraBtn.disabled = true;
      retryCameraBtn.textContent = 'Retrying...';
      updateStatus('🔄 Retrying camera access...');
      
      // Close the last camera stream if any
      if (state.mediaStream) {
        state.mediaStream.getTracks().forEach(track => track.stop());
        state.mediaStream = null;
      }
      
      const success = await initCamera();
      if (success) {
        console.log('✅ Camera retry successful - MANDATORY camera enabled');
        updateStatus('✅ Camera Enabled - Starting Interview');
        
        // Enable interview controls NOW
        enableInterviewControls();
        loadQuestion(0);
        initSpeechRecognition();
        startTimer();
        
        retryCameraBtn.textContent = 'Retry Camera';
      } else {
        console.log('❌ Camera retry failed');
        updateStatus('❌ Camera retry failed - Check Settings and try again');
        retryCameraBtn.textContent = 'Retry Camera';
      }
      retryCameraBtn.disabled = false;
    });
  }
  
  // Microphone toggle for speech recording
  micToggleBtn.addEventListener('click', toggleMicrophone);
  
  // Transcript changes
  transcriptEl.addEventListener('input', () => {
    updateWordCount();
    // Debounce analysis
    clearTimeout(state.analysisTimeout);
    state.analysisTimeout = setTimeout(analyzeAnswer, 1000);
  });
  
  // Prevent page unload
  window.addEventListener('beforeunload', (e) => {
    if (state.currentQuestionIndex > 0 || transcriptEl.value.trim().length > 0) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// ========================================
// START APPLICATION
// ========================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
