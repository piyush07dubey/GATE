import React, { useState } from 'react';
import { sampleNotes, subjects } from '../data/seedData';
import { FiThumbsUp, FiMessageSquare, FiClock, FiPlus, FiEye, FiX } from 'react-icons/fi';
import FilterBar from '../components/FilterBar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NotesPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState(sampleNotes);
  const [sortBy, setSortBy] = useState('recent');

  const allKeywords = [
    ...subjects.map(s => s.name),
    ...subjects.flatMap(s => s.syllabus),
    ...notes.map(n => n.title),
  ];

  const filters = [
    {
      key: 'subject',
      label: 'All Subjects',
      options: subjects.map(s => ({ value: s.id, label: s.name }))
    },
    {
      key: 'sort',
      label: 'Sort By',
      options: [
        { value: 'recent', label: 'Most Recent' },
        { value: 'top', label: 'Top Rated' }
      ]
    }
  ];

  const displayedNotes = notes
    .filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            n.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject ? n.subjectId === selectedSubject : true;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'top') return b.upvotes - a.upvotes;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleCreateNote = () => {
    if (!user) {
      toast.error('Please sign in to create a note');
      return;
    }
    setIsModalOpen(true);
  };

  const handleUpvote = (noteId) => {
    if (!user) {
      toast.error('Please sign in to upvote');
      return;
    }
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, upvotes: n.upvotes + 1 } : n
    ));
    toast.success('Upvoted!');
  };

  const getSubjectName = (sId) => {
    return subjects.find(s => s.id === sId)?.name || 'Unknown Subject';
  };

  return (
    <div className="container section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-2xl)' }}>
        <div>
          <h1 className="section-title">Community Notes</h1>
          <p className="section-subtitle">
            Cheat sheets, formulas, and short notes shared by top students.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateNote}>
          <FiPlus /> Share Note
        </button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === 'subject') setSelectedSubject(value);
          if (key === 'sort') setSortBy(value);
        }}
        suggestions={allKeywords}
      />

      <div className="grid-3">
        {displayedNotes.map(note => (
          <div
            key={note.id}
            className="note-card"
            onClick={() => setSelectedNote(note)}
            style={{ cursor: 'pointer' }}
          >
            <div className="badge badge-cyan" style={{ marginBottom: 'var(--space-sm)', alignSelf: 'flex-start' }}>
              {getSubjectName(note.subjectId)}
            </div>
            <h3 className="note-title">{note.title}</h3>
            <div className="note-excerpt">
              {note.content.substring(0, 150)}...
            </div>

            <div className="note-footer" style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
              <div className="note-author">
                <div className="comment-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                  {note.userName.charAt(0)}
                </div>
                <span>{note.userName}</span>
              </div>
              <div className="note-stats">
                <button
                  className="comment-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpvote(note.id);
                  }}
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  <FiThumbsUp /> {note.upvotes}
                </button>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  <FiClock /> {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayedNotes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No notes found</h3>
          <p className="empty-state-text">
            No notes match your current filters. Be the first to share one!
          </p>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="modal-overlay" onClick={() => setSelectedNote(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <div>
                <div className="badge badge-cyan" style={{ marginBottom: 'var(--space-sm)' }}>
                  {getSubjectName(selectedNote.subjectId)}
                </div>
                <h3 className="modal-title">{selectedNote.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedNote(null)}>×</button>
            </div>
            <div style={{ padding: 'var(--space-lg)', color: 'var(--color-text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {selectedNote.content}
            </div>
            <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
                <div className="comment-avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                  {selectedNote.userName.charAt(0)}
                </div>
                {selectedNote.userName} · {new Date(selectedNote.createdAt).toLocaleDateString()}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  handleUpvote(selectedNote.id);
                  setSelectedNote(prev => ({ ...prev, upvotes: prev.upvotes + 1 }));
                }}
              >
                <FiThumbsUp /> {selectedNote.upvotes}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Note Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Share a Note</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="auth-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="input" placeholder="E.g., Master Theorem Summary" />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select className="select">
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Content (Markdown supported)</label>
                <textarea className="textarea" placeholder="Write your notes here..." style={{ minHeight: '200px' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => {
                  toast.success('Note published successfully!');
                  setIsModalOpen(false);
                }}>Publish Note</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
