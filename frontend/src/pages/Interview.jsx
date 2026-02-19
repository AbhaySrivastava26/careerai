import { useState, useEffect, useRef } from "react";
import EmptyState from "../components/EmptyState";
import "./Interview.css";

/* Professional AI Avatar */
function AIAvatar({ isSpeaking }) {
  return (
    <div className="avatar-container">
      <div className={`avatar-wrapper ${isSpeaking ? "speaking" : ""}`}>
        <img 
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4&hair=long01&hairColor=4a312c&eyes=default&mouth=smile&skinColor=light"
          alt="AI Interviewer"
          className="avatar-image"
        />
        {isSpeaking && <div className="speaking-animation" />}
      </div>

      <div className="avatar-badge">
        <div className="badge-name">Sarah Chen</div>
        <div className="badge-title">Senior Technical Recruiter</div>
      </div>

      {isSpeaking && (
        <div className="speaking-indicator">
          <div className="pulse-dot" />
          <span>Speaking</span>
        </div>
      )}
    </div>
  );
}

/* Webcam view */
function WebcamView({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="webcam-container">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="webcam-video"
      />
      <div className="webcam-label">You</div>
    </div>
  );
}

/* Transcript */
function TranscriptPanel({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="transcript-panel">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`message-wrapper ${msg.role === "interviewer" ? "interviewer-msg" : "candidate-msg"}`}
        >
          <div className={`message-bubble ${msg.role}`}>
            <div className="message-speaker">
              {msg.role === "interviewer" ? "Sarah Chen" : "You"}
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Main Interview Component */
export default function Interview({ data }) {
  const [stage, setStage] = useState("setup");
  const [difficulty, setDifficulty] = useState("medium");
  const [webcamStream, setWebcamStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [evaluations, setEvaluations] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]); // Dynamic questions
  const [askedQuestions, setAskedQuestions] = useState([]);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef("");

  if (!data) {
    return <EmptyState message="Upload your resume to start AI mock interview." />;
  }

  const role = data.career_matches?.[0]?.title || "Software Developer";
  const skills = (data.skills?.all || []).slice(0, 10).join(", ");
  const experience = (data.experience || []).slice(0, 2).map(e => `${e.role} at ${e.company}`).join("; ");
  const yearsOfExperience = data.experience?.length || 0;

  /* Generate personalized questions based on resume */
  const generateInterviewQuestions = async () => {
    const prompt = `You are a technical recruiter. Generate 7 personalized interview questions for a candidate applying for: ${role}

CANDIDATE PROFILE:
- Skills: ${skills}
- Experience: ${experience}
- Years of Experience: ${yearsOfExperience}
- Interview Difficulty: ${difficulty}

Generate questions that:
1. Are specific to their mentioned skills and experience
2. Reference their actual background/projects
3. Are customized for ${difficulty} difficulty level
4. Mix technical, behavioral, and career growth questions
5. Follow a natural interview flow (opening → technical → behavioral → closing)

Return ONLY a JSON array (no markdown):
[
  {"question": "Tell me about your experience with [specific skill/tech from their resume]...", "type": "technical"},
  {"question": "Can you describe a specific project where you used [technology]?", "type": "technical"},
  {"question": "What was the most challenging technical problem you solved at [company]?", "type": "challenge"},
  {"question": "Tell me about your experience working with [specific skill]", "type": "technical"},
  {"question": "How do you approach learning new technologies like [skill they might need]?", "type": "learning"},
  {"question": "Tell me about a time you had to collaborate with your team at [company]", "type": "behavioral"},
  {"question": "Where do you see yourself in your ${role} career in 5 years?", "type": "closing"}
]

Make questions specific to their background. Don't use generic questions.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let text = data.choices[0].message.content;
      
      // Clean up response
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      const questions = JSON.parse(text);
      return questions;
    } catch (error) {
      console.error("Question generation error:", error);
      // Fallback generic questions
      return [
        { question: `Tell me about your experience with ${skills.split(',')[0]} and how you've used it in your projects.`, type: "technical" },
        { question: `Can you describe a specific project from your time at ${experience.split('at')[1]?.trim() || "your previous company"}?`, type: "technical" },
        { question: "What was the most challenging technical problem you've encountered and how did you solve it?", type: "challenge" },
        { question: `How have you stayed updated with new technologies relevant to ${role}?`, type: "learning" },
        { question: "Tell me about a time you had to work with a difficult team member. How did you handle it?", type: "behavioral" },
        { question: "What's your approach to debugging complex issues in production?", type: "technical" },
        { question: `Where do you see yourself in your ${role} career in 5 years?`, type: "closing" }
      ];
    }
  };

  /* Setup webcam */
  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      setWebcamStream(stream);
      return true;
    } catch (err) {
      console.error("Webcam error:", err);
      alert("Please allow camera access. You can continue without video.");
      return false;
    }
  };

  /* Speech Recognition Setup */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
          setCurrentTranscript(finalTranscriptRef.current.trim());
        } else {
          interimTranscript += transcript;
        }
      }
      
      if (interimTranscript) {
        setCurrentTranscript(finalTranscriptRef.current + interimTranscript);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech error:", event.error);
      if (event.error !== "no-speech") {
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /* AI speaks */
  const speak = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.includes("Female") || 
        v.name.includes("Samantha") || 
        v.name.includes("Victoria") ||
        v.name.includes("Google US English")
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  /* Get AI response */
  const getAIResponse = async (userMessage) => {
    const conversationContext = conversationHistory
      .slice(-4)
      .map(m => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n");

    const nextQuestion = interviewQuestions[questionCount];

    const systemPrompt = `You are Sarah Chen, an experienced technical recruiter conducting a professional ${difficulty} difficulty interview for a ${role} position.

CANDIDATE BACKGROUND:
- Target Role: ${role}
- Key Skills: ${skills}
- Experience: ${experience || "Entry level"}

INTERVIEW PROGRESS:
- Question Number: ${questionCount + 1}/7
- Next Question: "${nextQuestion?.question}"

${conversationContext ? `\nRECENT CONVERSATION:\n${conversationContext}` : ""}

INSTRUCTIONS:
- Ask the next question provided above naturally
- Do NOT repeat previously asked questions
- Keep your response conversational and professional
- If their answer is short, add a brief follow-up
- Keep responses under 2 sentences
- Sound friendly but professional

Return only your next response as the interviewer.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory.slice(-4),
            { role: "user", content: userMessage }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      const aiText = data.choices[0].message.content || nextQuestion?.question;
      
      return aiText.replace(/\[.*?\]/g, "").trim();
    } catch (error) {
      console.error("AI error:", error);
      return nextQuestion?.question || "Tell me more about that.";
    }
  };

  /* Generate feedback */
  const generateFeedback = async () => {
    const fullTranscript = messages
      .map(m => `${m.role === "interviewer" ? "Interviewer" : "Candidate"}: ${m.content}`)
      .join("\n\n");

    const prompt = `You are a strict technical interview evaluator. Analyze this ${role} interview and score the candidate fairly.

CANDIDATE PROFILE:
- Role: ${role}
- Skills: ${skills}
- Experience: ${experience}

SCORING CRITERIA:
- 90-100: Outstanding answers, very clear technical explanations, excellent examples, professional communication
- 75-89: Good answers, mostly clear and relevant, minor gaps in depth or communication
- 60-74: Average answers, some vagueness, lacks specific examples or technical depth
- 40-59: Weak answers, mostly off-topic, unclear, or very generic responses
- 0-39: Poor answers, nonsensical, unprofessional, or completely off-topic

Evaluate strictly. If answers are vague or don't actually answer the question, score lower (30-50 range).
If answers are detailed, specific, and professional, score higher (75-95 range).

Return ONLY this JSON (no markdown, no code blocks):
{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "problemSolvingScore": <number 0-100>,
  "strengths": [<list of 2-3 actual strengths observed>],
  "improvements": [<list of 2-3 specific areas to improve>],
  "detailedFeedback": "<specific feedback based on actual answers>",
  "recommendation": "<Hire / Hire with Training / Continue Training / No Hire>"
}

INTERVIEW TRANSCRIPT:
${fullTranscript}`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            { role: "user", content: prompt }
          ],
          max_tokens: 1200,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error("API error");
      }

      const data = await response.json();
      let text = data.choices[0].message.content;
      
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      const result = JSON.parse(text);
      
      return {
        overallScore: Math.min(100, Math.max(0, parseInt(result.overallScore) || 50)),
        technicalScore: Math.min(100, Math.max(0, parseInt(result.technicalScore) || 50)),
        communicationScore: Math.min(100, Math.max(0, parseInt(result.communicationScore) || 50)),
        problemSolvingScore: Math.min(100, Math.max(0, parseInt(result.problemSolvingScore) || 50)),
        strengths: Array.isArray(result.strengths) ? result.strengths : ["Completed interview"],
        improvements: Array.isArray(result.improvements) ? result.improvements : ["Practice more"],
        detailedFeedback: result.detailedFeedback || "Interview completed",
        recommendation: result.recommendation || "Continue Training",
      };
    } catch (error) {
      console.error("Feedback error:", error);
      return {
        overallScore: 50,
        technicalScore: 50,
        communicationScore: 50,
        problemSolvingScore: 50,
        strengths: ["Participated in interview"],
        improvements: ["Practice technical communication", "Provide specific examples"],
        detailedFeedback: "Unable to generate detailed feedback. Please try again.",
        recommendation: "Continue Training",
      };
    }
  };

  /* Submit answer */
  const handleSubmitAnswer = async () => {
    const trimmed = currentTranscript.trim();
    if (!trimmed || isProcessing || trimmed.length < 10) return;
    
    setIsProcessing(true);
    
    setMessages(prev => [...prev, { role: "candidate", content: trimmed }]);
    setConversationHistory(prev => [...prev, { role: "user", content: trimmed }]);
    setCurrentTranscript("");
    finalTranscriptRef.current = "";
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const aiResponse = await getAIResponse(trimmed);
    setMessages(prev => [...prev, { role: "interviewer", content: aiResponse }]);
    setConversationHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
    
    if (questionCount < interviewQuestions.length) {
      setAskedQuestions(prev => [...prev, interviewQuestions[questionCount]]);
    }
    
    await speak(aiResponse);
    
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);

    if (nextCount >= 7) {
      setStage("processing");
      const feedback = await generateFeedback();
      setEvaluations(feedback);
      setStage("feedback");
    }
    
    setIsProcessing(false);
  };

  /* Toggle recording */
  const toggleRecording = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        finalTranscriptRef.current = "";
        setCurrentTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  /* Start interview */
  const startInterview = async () => {
    // Generate personalized questions first
    const questions = await generateInterviewQuestions();
    setInterviewQuestions(questions);
    
    await setupWebcam();
    setStage("interview");
    
    window.speechSynthesis.getVoices();
    
    const greeting = questions[0]?.question || "Tell me about your background.";
    setMessages([{ role: "interviewer", content: greeting }]);
    setConversationHistory([{ role: "assistant", content: greeting }]);
    setAskedQuestions([questions[0]]);
    
    setTimeout(() => speak(greeting), 500);
  };

  /* Setup screen */
  if (stage === "setup") {
    return (
      <div className="setup-container">
        <div className="setup-header">
          <h1>AI Interview Practice</h1>
          <p>Master your interview skills for <strong>{role}</strong></p>
        </div>

        <div className="setup-card">
          <div className="difficulty-section">
            <label className="section-label">Select Difficulty Level</label>
            <div className="difficulty-buttons">
              {["easy", "medium", "hard"].map(level => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`difficulty-btn ${difficulty === level ? "active" : ""}`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="info-box">
            <div className="info-label">What to Expect</div>
            <ul className="info-list">
              <li>Personalized questions based on your resume</li>
              <li>Questions tailored to {role} role</li>
              <li>7 customized questions (technical & behavioral)</li>
              <li>Detailed performance feedback</li>
              <li>No time pressure - speak naturally</li>
            </ul>
          </div>

          <button
            onClick={startInterview}
            className="start-button"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  /* Interview screen */
  if (stage === "interview") {
    return (
      <div className="interview-container">
        <div className="video-grid">
          <div className="video-section">
            <label className="video-label">You</label>
            <WebcamView stream={webcamStream} />
          </div>
          <div className="video-section">
            <label className="video-label">Sarah Chen</label>
            <AIAvatar isSpeaking={isSpeaking} />
          </div>
        </div>

        <div className="transcript-container">
          <div className="transcript-header">
            <span>Live Conversation</span>
            <span className="question-counter">Question {questionCount + 1}/7</span>
          </div>

          <TranscriptPanel messages={messages} />

          {currentTranscript && (
            <div className="current-input">
              <div className="input-label">Your response:</div>
              <div className="input-text">{currentTranscript}</div>
            </div>
          )}

          <div className="control-buttons">
            <button
              onClick={toggleRecording}
              disabled={isProcessing || isSpeaking}
              className={`control-btn record-btn ${isListening ? "recording" : ""}`}
            >
              {isListening ? "⏹ Stop Recording" : isSpeaking ? "🔊 AI Speaking..." : "🎤 Start Recording"}
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentTranscript.trim() || currentTranscript.trim().length < 10 || isProcessing || isSpeaking}
              className="control-btn submit-btn"
            >
              {isProcessing ? "⏳ Processing..." : "✓ Submit"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Processing */
  if (stage === "processing") {
    return (
      <div className="processing-container">
        <div className="spinner" />
        <h2>Analyzing Your Performance</h2>
        <p>Generating comprehensive feedback...</p>
      </div>
    );
  }

  /* Feedback */
  if (stage === "feedback" && evaluations) {
    return (
      <div className="feedback-container">
        <div className="feedback-header">
          <h1>Interview Complete</h1>
          <p>Performance Analysis</p>
        </div>

        <div className="overall-score">
          <div className="score-number">{evaluations.overallScore}</div>
          <div className="score-label">/100</div>
          <div className="recommendation-badge">
            {evaluations.recommendation}
          </div>
        </div>

        <div className="category-scores">
          <h3>Score Breakdown</h3>
          <div className="scores-grid">
            {[
              { label: "Technical", score: evaluations.technicalScore },
              { label: "Communication", score: evaluations.communicationScore },
              { label: "Problem Solving", score: evaluations.problemSolvingScore },
            ].map(cat => (
              <div key={cat.label} className="score-card">
                <div className="score-value">{cat.score}</div>
                <div className="score-name">{cat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="detailed-feedback">
          <h3>Feedback</h3>
          <p>{evaluations.detailedFeedback}</p>

          <div className="feedback-grid">
            <div className="feedback-section strengths">
              <h4>✓ Strengths</h4>
              <ul>
                {evaluations.strengths?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="feedback-section improvements">
              <h4>→ Areas to Improve</h4>
              <ul>
                {evaluations.improvements?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="feedback-actions">
          <button
            onClick={() => window.location.reload()}
            className="action-btn secondary"
          >
            Practice Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="action-btn primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}