import React from 'react';
import { Link } from 'react-router-dom';

const QuestionCard = ({ question, subjectName, subjectColor }) => {
  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy': return 'badge-green';
      case 'medium': return 'badge-amber';
      case 'hard': return 'badge-red';
      default: return 'badge-cyan';
    }
  };

  return (
    <Link to={`/question/${question.id}`} className="question-card">
      <div className="question-header">
        <div className="question-meta">
          <span className="badge" style={{ backgroundColor: `${subjectColor}20`, color: subjectColor, borderColor: `${subjectColor}40` }}>
            {subjectName}
          </span>
          <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>
            GATE {question.year}
          </span>
          <span className={`badge ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>
        <div className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
          {question.marks} Mark{question.marks > 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="question-text">
        {question.questionText}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          Topic: {question.topic}
        </span>
        <span className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
          View Solution →
        </span>
      </div>
    </Link>
  );
};

export default QuestionCard;
