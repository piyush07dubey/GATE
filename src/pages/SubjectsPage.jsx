import React, { useState } from 'react';
import { subjects } from '../data/seedData';
import SubjectCard from '../components/SubjectCard';
import FilterBar from '../components/FilterBar';

const SubjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.syllabus.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-3xl)' }}>
        <h1 className="section-title" style={{ fontSize: 'var(--text-5xl)' }}>GATE CSE Syllabus</h1>
        <p className="section-subtitle">
          Complete breakdown of all 14 subjects. Select a subject to view its syllabus and solve Previous Year Questions.
        </p>
      </div>

      <FilterBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        filters={[]}
        onFilterChange={() => {}}
      />

      <div className="grid-3">
        {filteredSubjects.map((subject, index) => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            delay={Math.min(index * 0.05, 0.5)} 
          />
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3 className="empty-state-title">No subjects found</h3>
          <p className="empty-state-text">
            We couldn't find any subjects matching "{searchTerm}". Try checking for typos or searching for a broader term.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
