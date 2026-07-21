import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiMessageSquare, FiThumbsUp, FiUpload, FiEdit2 } from 'react-icons/fi';
import { questions, subjects, sampleComments, sampleSolutions } from '../data/seedData';
import { useAuth } from '../context/AuthContext';

const QuestionDetailPage = () => {
  const { questionId } = useParams();
  const { user } = useAuth();
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeTab, setActiveTab] = useState('discussion'); // 'discussion', 'solutions', 'scratchpad'
  const [newComment, setNewComment] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [newSolutionText, setNewSolutionText] = useState('');

  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    return <div className="container section empty-state">Question not found</div>;
  }

  const subject = subjects.find(s => s.id === question.subjectId);
  const comments = sampleComments.filter(c => c.questionId === questionId);
  const solutions = sampleSolutions.filter(s => s.questionId === questionId);

  const handleOptionClick = (index) => {
    if (showAnswer) return; // Prevent changing after answer is shown
    setSelectedOption(index);
  };

  const checkAnswer = () => {
    if (selectedOption !== null || question.type === 'NAT') {
      setShowAnswer(true);
    }
  };

  const getOptionClass = (index) => {
    if (!showAnswer) {
      return selectedOption === index ? 'option selected' : 'option';
    }
    if (index === question.correctAnswer) return 'option correct';
    if (selectedOption === index && index !== question.correctAnswer) return 'option incorrect';
    return 'option';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImages(prev => [...prev, {
        id: Date.now().toString(),
        url: event.target.result,
        name: file.name,
      }]);
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePostSolution = () => {
    if (!user) {
      toast.error('Please sign in to post a solution');
      return;
    }
    if (!newSolutionText.trim() && uploadedImages.length === 0) {
      toast.error('Please write something or upload an image');
      return;
    }
    toast.success('Solution posted!');
    setNewSolutionText('');
    setUploadedImages([]);
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
          {/* Main Question Card */}
          <div className="glass-card" style={{ padding: 'var(--space-2xl)' }}>
            <div className="question-header">
              <div className="question-meta">
                <span className="badge" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
                  {subject.name}
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  GATE {question.year}
                </span>
                <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>
                  {question.topic}
                </span>
              </div>
              <div className="badge badge-cyan">
                {question.marks} Mark{question.marks > 1 ? 's' : ''}
              </div>
            </div>

            <div className="question-text" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2xl)' }}>
              {question.questionText}
            </div>

            {(question.type === 'MCQ' || question.type === 'MSQ') && (
              <div className="question-options">
                {question.options.map((opt, idx) => (
                  <div 
                    key={idx} 
                    className={getOptionClass(idx)}
                    onClick={() => handleOptionClick(idx)}
                  >
                    <div className="option-label">{String.fromCharCode(65 + idx)}</div>
                    <div>{opt}</div>
                    {showAnswer && idx === question.correctAnswer && (
                      <FiCheck style={{ marginLeft: 'auto', color: 'var(--color-accent-green)', fontSize: '1.2rem' }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {question.type === 'NAT' && (
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Enter your numerical answer..." 
                  style={{ maxWidth: '300px', fontSize: 'var(--text-lg)' }}
                  disabled={showAnswer}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-lg)' }}>
              <button 
                className="btn btn-primary" 
                onClick={checkAnswer}
                disabled={showAnswer || (question.type === 'MCQ' && selectedOption === null)}
              >
                {showAnswer ? 'Answer Revealed' : 'Check Answer'}
              </button>
            </div>

            {/* Explanation Section */}
            {showAnswer && (
              <div className="animate-fade-in-up" style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--color-bg-input)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--color-accent-green)' }}>
                <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--color-text-primary)' }}>Explanation</h4>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {question.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Tabs for Discussion/Solutions */}
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
                        placeholder={user ? "Add to the discussion..." : "Sign in to add a comment..."}
                        style={{ minHeight: '80px', marginBottom: 'var(--space-sm)' }}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
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
                        <div className="comment-avatar">
                          {comment.userName.charAt(0)}
                        </div>
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Uploaded images preview */}
                  {uploadedImages.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
                      {uploadedImages.map(img => (
                        <div key={img.id} style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <img src={img.url} alt={img.name} style={{ maxWidth: '200px', maxHeight: '150px', display: 'block' }} />
                          <button
                            onClick={() => setUploadedImages(prev => prev.filter(i => i.id !== img.id))}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.7)',
                              border: 'none',
                              color: 'white',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '2px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New solution composer */}
                  {user && (
                    <div style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                      <textarea
                        className="textarea"
                        placeholder="Write your solution here... (Markdown supported)"
                        value={newSolutionText}
                        onChange={(e) => setNewSolutionText(e.target.value)}
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
                        {sol.content?.split('\n').map((line, i) => {
                          if (line.startsWith('##')) return <h3 key={i} style={{ color: 'var(--color-text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.replace(/#/g, '').trim()}</h3>;
                          if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} style={{ display: 'block', color: 'var(--color-text-primary)', marginTop: '0.5rem' }}>{line.replace(/\*/g, '')}</strong>;
                          if (line.startsWith('-')) return <li key={i}>{line.substring(1).trim()}</li>;
                          if (!line.trim()) return <br key={i} />;
                          return <p key={i}>{line}</p>;
                        })}
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
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="question-detail-sidebar">
          {/* Quick Stats / Info */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-md)' }}>Question Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Difficulty</span>
                <span style={{ color: 'var(--color-accent-amber)' }}>{question.difficulty}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Correct Rate</span>
                <span style={{ color: 'var(--color-text-primary)' }}>45%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Total Attempts</span>
                <span style={{ color: 'var(--color-text-primary)' }}>1,204</span>
              </div>
            </div>
          </div>

          {/* Quick Scratchpad */}
          <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: 'var(--text-base)' }}>Mini Scratchpad</h3>
              <Link to="/drawing-board" className="btn btn-ghost btn-sm" title="Open full board"><FiEdit2 /></Link>
            </div>
            <textarea 
              className="textarea" 
              placeholder="Jot down formulas or quick calculations here..."
              style={{ minHeight: '200px', backgroundColor: 'var(--color-bg-secondary)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;
