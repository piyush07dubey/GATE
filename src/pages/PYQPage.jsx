import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questions, subjects } from '../data/seedData';
import QuestionCard from '../components/QuestionCard';
import FilterBar from '../components/FilterBar';

const ITEMS_PER_PAGE = 10;

const PYQPage = () => {
  const { subjectId } = useParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjectId === 'all' ? '' : subjectId);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (subjectId !== 'all') {
      setSelectedSubject(subjectId);
    }
    setCurrentPage(1);
  }, [subjectId]);

  const currentSubject = subjects.find(s => s.id === selectedSubject);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            q.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject ? q.subjectId === selectedSubject : true;
      const matchesYear = selectedYear ? q.year.toString() === selectedYear : true;
      const matchesDifficulty = selectedDifficulty ? q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase() : true;

      return matchesSearch && matchesSubject && matchesYear && matchesDifficulty;
    });
  // questions is a module-level constant — intentionally omitted from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedSubject, selectedYear, selectedDifficulty]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, selectedYear, selectedDifficulty]);

  const allKeywords = [
    ...subjects.map(s => s.name),
    ...subjects.flatMap(s => s.syllabus),
    ...questions.map(q => q.topic),
    ...new Set(questions.map(q => q.year.toString())),
  ];

  const filters = [
    {
      key: 'subject',
      label: 'All Subjects',
      options: subjects.map(s => ({ value: s.id, label: s.name }))
    },
    {
      key: 'year',
      label: 'All Years',
      options: [...new Set(questions.map(q => q.year))].sort().reverse().map(y => ({ value: y.toString(), label: y.toString() }))
    },
    {
      key: 'difficulty',
      label: 'All Difficulties',
      options: [
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ]
    }
  ];

  const handleFilterChange = (key, value) => {
    if (key === 'subject') setSelectedSubject(value);
    if (key === 'year') setSelectedYear(value);
    if (key === 'difficulty') setSelectedDifficulty(value);
  };

  const goToPage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <div className="badge badge-violet" style={{ marginBottom: 'var(--space-md)' }}>
          Question Bank
        </div>
        <h1 className="section-title">
          {currentSubject ? `${currentSubject.name} PYQs` : 'All Previous Year Questions'}
        </h1>
        <p className="section-subtitle">
          Practice questions from past GATE exams. Categorized by subject and topic.
        </p>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        suggestions={allKeywords}
      />

      {currentSubject && (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-2xl)', display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>Syllabus Topics</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {currentSubject.syllabus.slice(0, 5).map((topic, i) => (
                <span key={i} className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>{topic}</span>
              ))}
              {currentSubject.syllabus.length > 5 && (
                <span className="badge" style={{ backgroundColor: 'var(--color-bg-input)' }}>+{currentSubject.syllabus.length - 5} more</span>
              )}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div className="stat-number" style={{ fontSize: 'var(--text-2xl)' }}>
              {filteredQuestions.length}
            </div>
            <div className="stat-label">Questions Found</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {paginatedQuestions.map((q) => {
          const { name, color } = subjects.find(s => s.id === q.subjectId) || { name: 'Unknown', color: '#8b5cf6' };
          return (
            <QuestionCard
              key={q.id}
              question={q}
              subjectName={name}
              subjectColor={color}
            />
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">No questions found</h3>
          <p className="empty-state-text">
            Try adjusting your filters or search term to find more questions.
          </p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: 'var(--space-lg)' }}
            onClick={() => {
              setSearchTerm('');
              setSelectedSubject('');
              setSelectedYear('');
              setSelectedDifficulty('');
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={safeCurrentPage === 1}
            onClick={() => goToPage(safeCurrentPage - 1)}
          >
            ←
          </button>

          {safeCurrentPage > 2 && (
            <>
              <button className="page-btn" onClick={() => goToPage(1)}>1</button>
              {safeCurrentPage > 3 && <span className="page-btn" style={{ cursor: 'default', border: 'none' }}>…</span>}
            </>
          )}

          {getPageNumbers().map(page => (
            <button
              key={page}
              className={`page-btn ${page === safeCurrentPage ? 'active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}

          {safeCurrentPage < totalPages - 1 && (
            <>
              {safeCurrentPage < totalPages - 2 && <span className="page-btn" style={{ cursor: 'default', border: 'none' }}>…</span>}
              <button className="page-btn" onClick={() => goToPage(totalPages)}>{totalPages}</button>
            </>
          )}

          <button
            className="page-btn"
            disabled={safeCurrentPage === totalPages}
            onClick={() => goToPage(safeCurrentPage + 1)}
          >
            →
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
          Page {safeCurrentPage} of {totalPages} • {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default PYQPage;
