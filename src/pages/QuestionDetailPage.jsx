import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiCheck, FiX, FiMessageSquare, FiThumbsUp,
  FiUpload, FiEdit2, FiLoader, FiBookOpen, FiAlertCircle,
  FiCpu, FiSend
} from 'react-icons/fi';
import { questions, subjects, sampleComments, sampleSolutions } from '../data/seedData';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise correctAnswer to a 0-based index, or null if unavailable */
const resolveCorrectIndex = (correctAnswer, options) => {
  if (correctAnswer === null || correctAnswer === undefined) return null;

  // Number type: could be 0-based index or 1-based index
  if (typeof correctAnswer === 'number') {
    // Treat as 0-based if < options.length, otherwise 1-based
    if (correctAnswer < options.length) return correctAnswer;
    if (correctAnswer - 1 >= 0 && correctAnswer - 1 < options.length) return correctAnswer - 1;
    return null;
  }

  const s = String(correctAnswer).trim();

  // Single letter "A"/"B"/"C"/"D"
  if (/^[A-Da-d]$/.test(s)) return s.toUpperCase().charCodeAt(0) - 65;

  // Try matching option text
  const lower = s.toLowerCase();
  const idx = options.findIndex(opt => {
    const optText = typeof opt === 'object' ? (opt.text || '') : String(opt);
    return optText.toLowerCase() === lower;
  });
  return idx >= 0 ? idx : null;
};

/** Get option text from string or {letter, text} object */
const getOptionText = (opt) => (typeof opt === 'object' ? (opt.text ?? '') : String(opt));

/** Generate a plain-language solution from the question data */
const buildLocalSolution = (question, correctIdx) => {
  if (question.type === 'NAT') {
    return `**Correct Answer:** ${question.correctAnswer}\n\nThis is a Numerical Answer Type (NAT) question. The answer must be computed based on the given conditions.\n\n${question.explanation || 'Review the relevant concept and apply systematically.'}`;
  }

  if ((question.type === 'MCQ' || question.type === 'MSQ') && correctIdx !== null) {
    const letter = String.fromCharCode(65 + correctIdx);
    const text = getOptionText(question.options[correctIdx] ?? '');
    const lines = [
      `## Step-by-step Solution`,
      '',
      `**Correct Answer: (${letter}) ${text}**`,
      '',
      `**Evaluation of options:**`,
    ];
    question.options.forEach((opt, i) => {
      const l = String.fromCharCode(65 + i);
      const t = getOptionText(opt);
      lines.push(`- **(${l})** ${t} — ${i === correctIdx ? '✓ Correct' : '✗ Incorrect'}`);
    });
    lines.push('');
    if (question.explanation) {
      lines.push(`**Explanation:** ${question.explanation}`);
    } else {
      lines.push(`**Key Insight:** Option (${letter}) aligns with the fundamental principle being tested. Master this topic by reviewing similar PYQs from the same year.`);
    }
    return lines.join('\n');
  }

  return question.explanation || 'See the official answer key for this question.';
};

// ─── Component ────────────────────────────────────────────────────────────────

const QuestionDetailPage = () => {
  const { questionId } = useParams();
  const { user } = useAuth();
  const natInputRef = useRef(null);

  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeTab, setActiveTab] = useState('discussion');
  const [newComment, setNewComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [newSolutionText, setNewSolutionText] = useState('');
  const [checking, setChecking] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [natValue, setNatValue] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const question = questions.find(q => q.id === questionId);

  if (!question) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <h3 className="empty-state-title">Question not found</h3>
          <p className="empty-state-text">This question may have been removed or the link is incorrect.</p>
          <Link to="/pyq/all" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse All Questions
          </Link>
        </div>
      </div>
    );
  }

  const subject = subjects.find(s => s.id === question.subjectId) || { id: 'unknown', name: 'Unknown', color: '#8b5cf6' };
  const comments = sampleComments.filter(c => c.questionId === questionId);
  const solutions = sampleSolutions.filter(s => s.questionId === questionId);

  // Normalise options: support both string[] and {letter,text}[]
  const normalisedOptions = (question.options || []).map(opt =>
    typeof opt === 'object' ? opt.text : String(opt)
  );

  const correctIdx = resolveCorrectIndex(question.correctAnswer, question.options);
  const hasAnswer = question.correctAnswer !== null && question.correctAnswer !== undefined;

  const handleOptionClick = (index) => {
    if (showAnswer) return;
    setSelectedOption(index);
  };

  // ── Ask AI ──────────────────────────────────────────────────────────────
  const handleAiSubmit = async (e) => {
    e?.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user', content: aiInput.trim() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const payload = {
        question: userMsg.content,
        context: `Question: ${question.questionText}\nType: ${question.type}\nOptions: ${normalisedOptions.join(', ')}`
      };
      const result = await api.post('/rag/ask', payload);
      setAiMessages(prev => [...prev, { role: 'ai', content: result.answer }]);
    } catch (err) {
      toast.error('Failed to get AI response');
      setAiMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ── Check Answer ──────────────────────────────────────────────────────────
  const checkAnswer = async () => {
    if (checking || showAnswer) return;

    let userAnswerLetter = null;
    let userNatValue = null;

    if (question.type === 'MCQ' || question.type === 'MSQ') {
      if (selectedOption === null) {
        toast.error('Please select an option first');
        return;
      }
      userAnswerLetter = String.fromCharCode(65 + selectedOption);
    } else if (question.type === 'NAT') {
      const v = natValue.trim();
      if (!v) {
        toast.error('Please enter a numerical answer');
        return;
      }
      userNatValue = v;
    } else {
      return;
    }

    setChecking(true);

    // Try the backend first — if it fails, fall back to local checking
    let result = null;
    try {
      const payload = {
        question_id: questionId,
        user_answer: userAnswerLetter || userNatValue,
      };
      result = await api.post('/check-answer', payload);
    } catch (_e) {
      // Backend unavailable → compute locally from seed data, or RAG fallback when no official answer
      result = await localFallback(userAnswerLetter, userNatValue);
    }

    setAnswerResult(result);
    setShowAnswer(true);
    setChecking(false);
  };

  const localFallback = async (userLetter, userNat) => {
    if (hasAnswer) {
      return computeLocalResult(userLetter, userNat);
    }

    // RAG fallback: no official answer indexed, generate a solution via AI
    try {
      const payload = {
        question: question.questionText,
        context: `Type: ${question.type}\nOptions: ${normalisedOptions.join(', ')}\nSubject: ${subject.name}\nTopic: ${question.topic}\nYear: ${question.year}`,
      };
      const rag = await api.post('/rag/ask', payload);
      const answer = rag.answer || '';
      return {
        is_correct: null,
        correct_answer: null,
        explanation: answer || 'The official answer for this question is not yet available in our database.',
        solution: answer || 'This question is from the PYQ bank. The official answer will be added soon.',
      };
    } catch (_e) {
      return {
        is_correct: null,
        correct_answer: null,
        explanation: 'The official answer for this question is not yet available in our database.',
        solution: 'This question is from the PYQ bank. The official answer will be added soon.',
      };
    }
  };

  const computeLocalResult = (userLetter, userNat) => {
    if (!hasAnswer) {
      return {
        is_correct: null,
        correct_answer: null,
        explanation: 'The official answer for this question is not yet available in our database.',
        solution: 'This question is from the PYQ bank. The official answer will be added soon.',
      };
    }

    let is_correct = false;
    const correctLetter = correctIdx !== null ? String.fromCharCode(65 + correctIdx) : null;

    if (question.type === 'NAT') {
      const expected = String(question.correctAnswer).trim();
      is_correct = userNat === expected || parseFloat(userNat) === parseFloat(expected);
    } else {
      is_correct = correctLetter !== null && userLetter === correctLetter;
    }

    return {
      is_correct,
      correct_answer: question.correctAnswer,
      explanation: question.explanation || `The correct answer is ${correctLetter || question.correctAnswer}.`,
      solution: buildLocalSolution(question, correctIdx),
    };
  };

  // ── Option Styling ────────────────────────────────────────────────────────
  const getOptionClass = (index) => {
    if (!showAnswer) {
      return selectedOption === index ? 'option selected' : 'option';
    }
    if (correctIdx !== null && index === correctIdx) return 'option correct';
    if (selectedOption === index) return 'option incorrect';
    return 'option';
  };

  // ── Image Upload ──────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImages(prev => [...prev, { id: Date.now().toString(), url: ev.target.result, name: file.name }]);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePostSolution = () => {
    if (!user) { toast.error('Please sign in to post a solution'); return; }
    if (!newSolutionText.trim() && uploadedImages.length === 0) { toast.error('Write something or upload an image'); return; }
    toast.success('Solution posted!');
    setNewSolutionText('');
    setUploadedImages([]);
  };

  // ── Render Solution Text ──────────────────────────────────────────────────
  const renderSolution = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h4 key={i} style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.05em' }}>{line.replace(/^## /, '')}</h4>;
      if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{ display: 'block', color: 'var(--color-text-primary)', marginTop: '0.75rem' }}>{line.replace(/\*\*/g, '')}</strong>;
      if (line.startsWith('- ')) return <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0', color: 'var(--color-text-secondary)' }}><span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>›</span><span>{line.slice(2)}</span></div>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i} style={{ margin: '0.25rem 0', color: 'var(--color-text-secondary)' }}>{line}</p>;
    });
  };

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Link to={`/pyq/${subject.id}`} className="btn btn-ghost" style={{ paddingLeft: 0, marginBottom: 'var(--space-md)' }}>
          <FiArrowLeft /> Back to {subject.name}
        </Link>
      </div>

      <div className="question-detail-layout">
        <div className="question-detail-main">

          {/* ── Main Question Card ──────────────────────────────────────── */}
          <div className="glass-card" style={{ padding: 'var(--space-2xl)', marginBottom: 'var(--space-lg)' }}>
            <div className="question-header">
              <div className="question-meta">
                <span className="badge" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                  {subject.name}
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  GATE {question.year}
                </span>
                {question.topic && (
                  <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                    {question.topic}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">{question.marks} Mark{question.marks > 1 ? 's' : ''}</span>
                <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>{question.type}</span>
                {!hasAnswer && (
                  <span className="badge badge-amber" title="Answer not yet in database">
                    <FiAlertCircle /> Answer TBD
                  </span>
                )}
              </div>
            </div>

            <div className="question-text" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2xl)', lineHeight: 1.8 }}>
              {question.questionText}
            </div>

            {/* MCQ / MSQ Options */}
            {(question.type === 'MCQ' || question.type === 'MSQ') && normalisedOptions.length > 0 && (
              <div className="question-options" style={{ marginBottom: 'var(--space-xl)' }}>
                {normalisedOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className={getOptionClass(idx)}
                    onClick={() => handleOptionClick(idx)}
                    style={{ cursor: showAnswer ? 'default' : 'pointer' }}
                  >
                    <div className="option-label">{String.fromCharCode(65 + idx)}</div>
                    <div style={{ flex: 1 }}>{opt}</div>
                    {showAnswer && getOptionClass(idx) === 'option correct' && (
                      <FiCheck style={{ marginLeft: 'auto', color: 'var(--color-accent-green)', fontSize: '1.2rem', flexShrink: 0 }} />
                    )}
                    {showAnswer && getOptionClass(idx) === 'option incorrect' && (
                      <FiX style={{ marginLeft: 'auto', color: 'var(--color-accent-red)', fontSize: '1.2rem', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* NAT Input */}
            {question.type === 'NAT' && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Numerical Answer
                </label>
                <input
                  ref={natInputRef}
                  type="number"
                  step="any"
                  className="input"
                  placeholder="Enter your numerical answer…"
                  style={{ maxWidth: '300px', fontSize: 'var(--text-lg)' }}
                  disabled={showAnswer}
                  value={natValue}
                  onChange={e => setNatValue(e.target.value)}
                />
              </div>
            )}

            {/* Action bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-lg)', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={checkAnswer}
                disabled={
                  showAnswer ||
                  checking ||
                  ((question.type === 'MCQ' || question.type === 'MSQ') && selectedOption === null) ||
                  (question.type === 'NAT' && !natValue.trim())
                }
                style={{ minWidth: '160px' }}
              >
                {checking
                  ? <><FiLoader style={{ animation: 'spin 0.8s linear infinite' }} /> Checking…</>
                  : showAnswer
                    ? 'Answer Revealed'
                    : 'Check Answer'}
              </button>

              {answerResult && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {answerResult.is_correct === null ? (
                    <span className="badge badge-amber">
                      <FiAlertCircle /> Answer Not Available
                    </span>
                  ) : answerResult.is_correct ? (
                    <span className="badge badge-green">
                      <FiCheck /> Correct!
                    </span>
                  ) : (
                    <span className="badge badge-red">
                      <FiX /> Incorrect
                    </span>
                  )}
                  {answerResult.is_correct === false && correctIdx !== null && (
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      Correct: <strong style={{ color: 'var(--color-accent-green)' }}>
                        ({String.fromCharCode(65 + correctIdx)}) {normalisedOptions[correctIdx]}
                      </strong>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Answer / Solution reveal */}
            {showAnswer && answerResult && (
              <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-xl)' }}>
                <div style={{
                  padding: 'var(--space-lg)',
                  background: 'var(--color-bg-input)',
                  borderRadius: 'var(--radius-lg)',
                  borderLeft: `4px solid ${
                    answerResult.is_correct === null
                      ? 'var(--color-accent-amber)'
                      : answerResult.is_correct
                        ? 'var(--color-accent-green)'
                        : 'var(--color-accent-red)'
                  }`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-md)' }}>
                    <FiBookOpen style={{ color: 'var(--color-accent)', fontSize: '1rem' }} />
                    <h4 style={{ color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                      PYQ Book Solution
                    </h4>
                  </div>

                  {answerResult.explanation && (
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: answerResult.solution ? 'var(--space-md)' : 0 }}>
                      {answerResult.explanation}
                    </p>
                  )}

                  {answerResult.solution && (
                    <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
                      {renderSolution(answerResult.solution)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Discussion / Solutions Tabs ─────────────────────────────── */}
          <div>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussion')}
              >
                <FiMessageSquare /> Discussion ({comments.length})
              </button>
              <button
                className={`tab ${activeTab === 'solutions' ? 'active' : ''}`}
                onClick={() => setActiveTab('solutions')}
              >
                <FiCheck /> Community Solutions ({solutions.length})
              </button>
              <button
                className={`tab ${activeTab === 'ask-ai' ? 'active' : ''}`}
                onClick={() => setActiveTab('ask-ai')}
              >
                <FiCpu /> Ask AI
              </button>
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
              {activeTab === 'discussion' && (
                <div>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                    <div className="comment-avatar" style={{ background: 'var(--gradient-primary)' }}>
                      {user ? (user.user_metadata?.full_name?.charAt(0) || 'U') : '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <textarea
                        className="textarea"
                        placeholder={user ? 'Add to the discussion…' : 'Sign in to add a comment…'}
                        style={{ minHeight: '80px', marginBottom: 'var(--space-sm)' }}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        disabled={!user}
                      />
                      <button className="btn btn-secondary btn-sm" disabled={!user || !newComment.trim()}>
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div className="comment-list">
                    {comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <div className="comment-avatar">{comment.userName.charAt(0)}</div>
                        <div className="comment-body">
                          <div>
                            <span className="comment-author">{comment.userName}</span>
                            <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="comment-content">{comment.content}</div>
                          <div className="comment-actions">
                            <button className="comment-action-btn"><FiThumbsUp /> 0</button>
                            <button className="comment-action-btn">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p style={{ color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                        No comments yet. Be the first to discuss!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'solutions' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)' }}>Detailed Solutions</h3>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      <FiUpload /> Upload Image
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                      {uploadedImages.map(img => (
                        <div key={img.id} style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <img src={img.url} alt={img.name} style={{ maxWidth: '200px', maxHeight: '150px', display: 'block' }} />
                          <button
                            onClick={() => setUploadedImages(prev => prev.filter(i => i.id !== img.id))}
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                      <textarea
                        className="textarea"
                        placeholder="Write your solution here… (Markdown supported)"
                        value={newSolutionText}
                        onChange={e => setNewSolutionText(e.target.value)}
                        style={{ minHeight: '100px', marginBottom: 'var(--space-sm)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-sm" onClick={handlePostSolution} disabled={!newSolutionText.trim() && uploadedImages.length === 0}>
                          Post Solution
                        </button>
                      </div>
                    </div>
                  )}

                  {solutions.map(sol => (
                    <div key={sol.id} className="solution-card">
                      <div className="solution-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div className="comment-avatar">{sol.userName.charAt(0)}</div>
                          <div>
                            <div className="comment-author">{sol.userName}</div>
                            <div className="comment-time" style={{ marginLeft: 0 }}>{new Date(sol.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="solution-votes">
                          <button className="vote-btn"><FiThumbsUp /></button>
                          <span className="vote-count">{sol.upvotes}</span>
                        </div>
                      </div>
                      <div className="solution-content">
                        {sol.images?.map((img, i) => (
                          <img key={i} src={img} alt={`Solution ${i + 1}`} style={{ maxWidth: '100%', marginTop: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }} />
                        ))}
                        {renderSolution(sol.content)}
                      </div>
                    </div>
                  ))}

                  {solutions.length === 0 && (
                    <div className="upload-area">
                      <div className="upload-icon"><FiUpload /></div>
                      <div className="upload-text">No solutions uploaded yet.</div>
                      <div className="upload-hint">Upload an image or type a detailed solution to help others.</div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ask-ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div style={{ background: 'var(--color-bg-input)', padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)' }}>
                    <h3 style={{ fontSize: 'var(--text-md)', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Chat with GATE AI</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                      Ask questions about this specific PYQ or general GATE concepts.
                    </p>
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    minHeight: '300px', 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-md)'
                  }}>
                    {aiMessages.length === 0 && (
                      <div style={{ margin: 'auto', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                        <FiCpu style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                        <p>Hi! I'm here to help you understand this question.</p>
                      </div>
                    )}
                    {aiMessages.map((msg, i) => (
                      <div key={i} style={{ 
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                        padding: 'var(--space-sm) var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        maxWidth: '85%'
                      }}>
                        {msg.role === 'ai' ? renderSolution(msg.content) : msg.content}
                      </div>
                    ))}
                    {isAiLoading && (
                      <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiLoader style={{ animation: 'spin 1s linear infinite' }} /> Thinking...
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleAiSubmit} style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <input 
                      type="text" 
                      className="input" 
                      style={{ flex: 1 }}
                      placeholder="Ask a question..."
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      disabled={isAiLoading}
                    />
                    <button type="submit" className="btn btn-primary" disabled={isAiLoading || !aiInput.trim()}>
                      <FiSend /> Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="question-detail-sidebar">
          {/* Stats */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>
              Question Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {[
                { label: 'Difficulty', value: question.difficulty || 'Medium', color: question.difficulty === 'Easy' ? 'var(--color-accent-green)' : question.difficulty === 'Hard' ? 'var(--color-accent-red)' : 'var(--color-accent-amber)' },
                { label: 'Marks', value: question.marks, color: 'var(--color-text-primary)' },
                { label: 'Year', value: question.year, color: 'var(--color-text-primary)' },
                { label: 'Type', value: question.type, color: 'var(--color-accent-cyan)' },
                { label: 'Answer', value: hasAnswer ? 'Available ✓' : 'Not yet indexed', color: hasAnswer ? 'var(--color-accent-green)' : 'var(--color-text-tertiary)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Scratchpad */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>Scratchpad</h3>
              <Link to="/drawing-board" className="btn btn-ghost btn-sm" title="Open Drawing Board">
                <FiEdit2 />
              </Link>
            </div>
            <textarea
              className="textarea"
              placeholder="Jot down formulas or quick calculations…"
              style={{ minHeight: '160px', backgroundColor: 'var(--color-bg-secondary)', fontSize: 'var(--text-sm)' }}
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem', marginBottom: 0 }}>
              Open the <Link to="/drawing-board" style={{ color: 'var(--color-accent)' }}>Drawing Board</Link> for diagrams
            </p>
          </div>

          {/* Navigate questions */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-md)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>
              More from {subject.name}
            </h3>
            <Link to={`/pyq/${subject.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              All {subject.name} PYQs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
