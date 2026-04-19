/* ============================================
   INTERVIEW SYSTEM - JavaScript
   ============================================ */

// ============================================
// DOM ELEMENTS
// ============================================

const videoEl = document.getElementById('interviewCamera');
const cameraEmptyEl = document.getElementById('cameraEmpty');
const cameraErrorEl = document.getElementById('cameraError');
const recordingBadgeEl = document.getElementById('recordingBadge');
const recordingIndicatorEl = document.getElementById('recordingIndicator');
const enableCameraBtn = document.getElementById('enableCameraBtn');
const statusTextEl = document.getElementById('statusText');
const statusDotEl = document.querySelector('.status-dot');

const answerTextEl = document.getElementById('answerText');
const micBtn = document.getElementById('micBtn');
const clearBtn = document.getElementById('clearBtn');
const wordCountEl = document.getElementById('wordCount');
const wordProgressEl = document.getElementById('wordProgress');
const listeningIndicatorEl = document.getElementById('listeningIndicator');
const timerEl = document.getElementById('timer');

const questionTextEl = document.getElementById('questionText');
const questionNumEl = document.getElementById('questionNum');
const questionCountEl = document.getElementById('questionCount');
const questionNavEl = document.getElementById('questionNav');
const prevBtnEl = document.getElementById('prevBtn');
const nextBtnEl = document.getElementById('nextBtn');

const submitNextBtnEl = document.getElementById('submitNextBtn');
const submitFinalBtnEl = document.getElementById('submitFinalBtn');
const toastContainerEl = document.getElementById('toastContainer');

// ============================================
// STATE MANAGEMENT
// ============================================

let state = {
  mediaStream: null,
  isCameraOn: false,
  isRecording: false,
  isListening: false,
  currentQuestionIndex: 0,
  questions: [],
  answers: {},
  timerInterval: null,
  timeRemaining: 30 * 60, // 30 minutes in seconds
  speechRecognition: null,
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎥 Interview System Initializing...');
  await loadQuestions();
  setupEventListeners();
  loadQuestion(0);
  startTimer();
  attemptAutoCamera();
});

// ============================================
// CAMERA FUNCTIONALITY
// ============================================

async function initCamera() {
  try {
    console.log('📷 Requesting camera access...');
    
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Camera not supported in this browser');
    }

    // Request camera
    state.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    });

    // Assign to video element
    videoEl.srcObject = state.mediaStream;
    
    // Wait for video to load
    await new Promise((resolve) => {
      videoEl.onloadedmetadata = resolve;
      setTimeout(resolve, 500);
    });

    // Play video
    await videoEl.play();

    // Update UI
    state.isCameraOn = true;
    videoEl.classList.add('active');
    cameraEmptyEl.classList.add('hidden');
    recordingBadgeEl.style.display = 'flex';
    recordingIndicatorEl.style.display = 'flex';
    
    updateStatus('Camera Active', true);
    showToast('Camera enabled successfully', 'success');
    
    console.log('✅ Camera initialized successfully');
    return true;

  } catch (error) {
    console.error('❌ Camera error:', error);
    handleCameraError(error);
    return false;
  }
}

function handleCameraError(error) {
  let errorMessage = 'Camera access failed';
  let isPermissionError = false;

  if (error.name === 'NotAllowedError') {
    errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
    isPermissionError = true;
  } else if (error.name === 'NotFoundError') {
    errorMessage = 'No camera detected. Please connect a camera and retry.';
  } else if (error.name === 'NotReadableError') {
    errorMessage = 'Camera is in use by another application. Please close it and retry.';
  } else if (error.name === 'NotSupportedError') {
    errorMessage = 'Camera not supported. Try using Chrome, Firefox, or Edge.';
  } else if (error.message.includes('Camera not supported')) {
    errorMessage = 'Your browser does not support camera access.';
  }

  cameraErrorEl.textContent = errorMessage;
  cameraErrorEl.style.display = 'block';
  updateStatus('Camera unavailable', false);
  
  if (!isPermissionError) {
    showToast(errorMessage, 'error');
  }
}

function stopCamera() {
  if (state.mediaStream) {
    state.mediaStream.getTracks().forEach(track => track.stop());
    state.mediaStream = null;
  }
  
  state.isCameraOn = false;
  videoEl.srcObject = null;
  videoEl.classList.remove('active');
  recordingBadgeEl.style.display = 'none';
  recordingIndicatorEl.style.display = 'none';
}

async function attemptAutoCamera() {
  // Try to initialize camera automatically
  // User can manually enable if permission is denied
  console.log('🎯 Attempting automatic camera initialization...');
  await initCamera().catch(() => {
    console.log('ℹ️  Camera auto-init skipped - user can enable manually');
  });
}

// ============================================
// TIMER
// ============================================

function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      submitFinal();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(state.timeRemaining / 60);
  const seconds = state.timeRemaining % 60;
  timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============================================
// QUESTIONS
// ============================================

async function loadQuestions() {
  try {
    const response = await fetch('data/questions.json');
    const data = await response.json();
    state.questions = data.questions || [];
    
    console.log(`✅ Loaded ${state.questions.length} questions`);
  } catch (error) {
    console.error('Error loading questions:', error);
    state.questions = generateSampleQuestions();
  }
}

function generateSampleQuestions() {
  return [
    {
      id: 1,
      question: 'Tell me about your background and why you're interested in this position.',
      category: 'introduction'
    },
    {
      id: 2,
      question: 'Describe a time when you had to overcome a challenge at work.',
      category: 'behavioral'
    },
    {
      id: 3,
      question: 'What are your greatest strengths and how do they apply to this role?',
      category: 'skills'
    },
    {
      id: 4,
      question: 'Tell me about a project you're proud of and your role in it.',
      category: 'technical'
    },
    {
      id: 5,
      question: 'How do you handle working with difficult team members?',
      category: 'interpersonal'
    },
    {
      id: 6,
      question: 'What do you know about our company and this industry?',
      category: 'research'
    },
    {
      id: 7,
      question: 'Where do you see yourself in 5 years?',
      category: 'goals'
    },
    {
      id: 8,
      question: 'Describe your approach to solving complex problems.',
      category: 'problem-solving'
    },
    {
      id: 9,
      question: 'How do you stay updated with industry trends and technologies?',
      category: 'learning'
    },
    {
      id: 10,
      question: 'Do you have any questions for us?',
      category: 'closing'
    }
  ];
}

function loadQuestion(index) {
  if (index < 0 || index >= state.questions.length) return;

  state.currentQuestionIndex = index;
  const question = state.questions[index];

  questionTextEl.textContent = question.question;
  questionNumEl.textContent = index + 1;
  questionCountEl.textContent = `${index + 1} / ${state.questions.length}`;

  // Load saved answer if exists
  answerTextEl.value = state.answers[index] || '';
  updateWordCount();

  // Show navigation if more than one question
  if (state.questions.length > 1) {
    questionNavEl.style.display = 'flex';
    prevBtnEl.disabled = index === 0;
    nextBtnEl.disabled = index === state.questions.length - 1;
  }

  // Show/hide final submit button
  const isLastQuestion = index === state.questions.length - 1;
  if (isLastQuestion) {
    submitNextBtnEl.style.display = 'none';
    submitFinalBtnEl.style.display = 'flex';
  } else {
    submitNextBtnEl.style.display = 'flex';
    submitFinalBtnEl.style.display = 'none';
  }
}

// ============================================
// ANSWER TRACKING
// ============================================

function updateWordCount() {
  const text = answerTextEl.value.trim();
  const words = text.length > 0 ? text.split(/\s+/).length : 0;
  
  wordCountEl.textContent = words;
  
  // Update progress bar (max 500 words)
  const progress = Math.min((words / 500) * 100, 100);
  wordProgressEl.style.width = progress + '%';
}

function saveCurrentAnswer() {
  state.answers[state.currentQuestionIndex] = answerTextEl.value;
}

function nextQuestion() {
  saveCurrentAnswer();
  if (state.currentQuestionIndex < state.questions.length - 1) {
    loadQuestion(state.currentQuestionIndex + 1);
  }
}

function prevQuestion() {
  saveCurrentAnswer();
  if (state.currentQuestionIndex > 0) {
    loadQuestion(state.currentQuestionIndex - 1);
  }
}

function clearAnswer() {
  if (confirm('Are you sure you want to clear your answer?')) {
    answerTextEl.value = '';
    updateWordCount();
    showToast('Answer cleared', 'success');
  }
}

// ============================================
// SPEECH RECOGNITION
// ============================================

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported');
    micBtn.disabled = true;
    return;
  }

  state.speechRecognition = new SpeechRecognition();
  state.speechRecognition.continuous = true;
  state.speechRecognition.interimResults = true;
  state.speechRecognition.lang = 'en-US';

  let interimTranscript = '';

  state.speechRecognition.onstart = () => {
    state.isListening = true;
    listeningIndicatorEl.style.display = 'flex';
    micBtn.classList.add('active');
  };

  state.speechRecognition.onresult = (event) => {
    interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        answerTextEl.value += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    
    updateWordCount();
  };

  state.speechRecognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    showToast('Microphone error: ' + event.error, 'error');
  };

  state.speechRecognition.onend = () => {
    state.isListening = false;
    listeningIndicatorEl.style.display = 'none';
    micBtn.classList.remove('active');
  };
}

function toggleMicrophone() {
  if (!state.speechRecognition) {
    showToast('Speech recognition not supported', 'error');
    return;
  }

  if (state.isListening) {
    state.speechRecognition.stop();
  } else {
    state.speechRecognition.start();
  }
}

// ============================================
// SUBMISSION
// ============================================

function submitNext() {
  saveCurrentAnswer();
  nextQuestion();
  showToast('Answer saved', 'success');
}

function submitFinal() {
  saveCurrentAnswer();
  stopCamera();
  clearInterval(state.timerInterval);
  
  console.log('📋 Interview Complete. Answers:', state.answers);
  
  // Save to localStorage
  localStorage.setItem('interviewAnswers', JSON.stringify(state.answers));
  
  // Redirect to feedback page
  setTimeout(() => {
    window.location.href = 'feedback.html';
  }, 1000);
}

// ============================================
// STATUS & NOTIFICATIONS
// ============================================

function updateStatus(text, isActive = false) {
  statusTextEl.textContent = text;
  
  if (isActive) {
    statusDotEl.classList.add('active');
  } else {
    statusDotEl.classList.remove('active');
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="toast-icon ${iconMap[type]}"></i>
    <span class="toast-message">${message}</span>
  `;
  
  toastContainerEl.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-in-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Camera
  enableCameraBtn.addEventListener('click', async () => {
    enableCameraBtn.disabled = true;
    enableCameraBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Enabling camera...';
    
    const success = await initCamera();
    
    if (!success) {
      enableCameraBtn.disabled = false;
      enableCameraBtn.innerHTML = '<i class="fas fa-video"></i>Enable Camera';
    }
  });

  // Navigation
  prevBtnEl.addEventListener('click', prevQuestion);
  nextBtnEl.addEventListener('click', nextQuestion);
  submitNextBtnEl.addEventListener('click', submitNext);
  submitFinalBtnEl.addEventListener('click', submitFinal);

  // Answer
  clearBtn.addEventListener('click', clearAnswer);
  answerTextEl.addEventListener('input', () => {
    updateWordCount();
    saveCurrentAnswer();
  });

  // Microphone
  if (state.speechRecognition) {
    initSpeechRecognition();
    micBtn.addEventListener('click', toggleMicrophone);
  }

  // Cleanup on page leave
  window.addEventListener('beforeunload', () => {
    stopCamera();
    clearInterval(state.timerInterval);
    if (state.speechRecognition) {
      state.speechRecognition.stop();
    }
  });

  console.log('✅ Event listeners setup complete');
}

// ============================================
// STARTUP
// ============================================

console.log('🚀 Interview System Ready');
