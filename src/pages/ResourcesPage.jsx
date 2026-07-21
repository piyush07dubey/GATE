import React, { useState, useEffect } from 'react';
import { resources, subjects } from '../data/seedData';
import { FiYoutube, FiFileText, FiBook, FiTool, FiExternalLink, FiThumbsUp, FiPlay, FiSearch } from 'react-icons/fi';
import { fetchYouTubeVideos, searchYouTube } from '../utils/youtube';
import FilterBar from '../components/FilterBar';

const YouTubeVideoCard = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="resource-card" style={{ cursor: 'pointer' }} onClick={() => window.open(video.url, '_blank')}>
      <div style={{ position: 'relative', marginBottom: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-bg-secondary)' }}>
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', opacity: 0.9 }}
            onMouseEnter={(e) => e.target.style.opacity = '0.7'}
            onMouseLeave={(e) => e.target.style.opacity = '0.9'}
          />
        )}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.25rem',
          }}>
            <FiPlay />
          </div>
        </div>
        <div className="badge badge-red" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem' }}>
          {video.channel}
        </div>
      </div>

      <div className="badge badge-violet" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-sm)' }}>
        GATE CSE
      </div>

      <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-xs)', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
        {video.title}
      </h3>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)', flex: 1, lineHeight: 1.5 }}>
        {video.description || 'Watch this GATE CSE lecture on YouTube'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: '#ff0000', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiYoutube /> Watch Now
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
          {new Date(video.publishedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const ResourcesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'videos', 'articles'

  const allKeywords = [
    ...subjects.map(s => s.name),
    ...subjects.flatMap(s => s.syllabus),
    ...resources.map(r => r.title),
    ...youtubeVideos.map(v => v.title),
  ];

  const filters = [
    {
      key: 'subject',
      label: 'All Subjects',
      options: subjects.map(s => ({ value: s.id, label: s.name }))
    },
    {
      key: 'type',
      label: 'All Types',
      options: [
        { value: 'youtube', label: 'Video Lectures' },
        { value: 'article', label: 'Articles & Guides' },
        { value: 'tool', label: 'Interactive Tools' }
      ]
    }
  ];

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const videos = await fetchYouTubeVideos();
      setYoutubeVideos(videos);
      setLoading(false);
    };
    loadVideos();
  }, []);

  const allResources = [
    ...resources.map(r => ({ ...r, source: 'static' })),
    ...youtubeVideos.map(v => ({ ...v, source: 'youtube' })),
  ];

  const filteredResources = allResources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject ? (r.subjectId === selectedSubject || (!r.subjectId && selectedType === 'youtube')) : true;
    const matchesType = selectedType ? r.type === selectedType : true;

    if (activeTab === 'videos' && r.type !== 'youtube') return false;
    if (activeTab === 'articles' && r.type === 'youtube') return false;

    return matchesSearch && matchesSubject && matchesType;
  });

  const getIconForType = (type) => {
    switch(type) {
      case 'youtube': return <FiYoutube />;
      case 'article': return <FiFileText />;
      case 'book': return <FiBook />;
      case 'tool': return <FiTool />;
      default: return <FiExternalLink />;
    }
  };

  const getSubjectName = (sId) => {
    return subjects.find(s => s.id === sId)?.name || 'GATE CSE';
  };

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-3xl)' }}>
        <h1 className="section-title">Curated Resources</h1>
        <p className="section-subtitle">
          The best free video lectures, articles, and interactive tools for GATE preparation, organized by subject.
        </p>
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('all')}
          >
            All Resources
          </button>
          <button
            className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('videos')}
          >
            <FiPlay /> YouTube Videos
          </button>
          <button
            className={`btn ${activeTab === 'articles' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setActiveTab('articles')}
          >
            <FiFileText /> Articles
          </button>
          <a
            href={searchYouTube(searchTerm || 'GATE CSE')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <FiSearch /> Search YouTube
          </a>
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === 'subject') setSelectedSubject(value);
          if (key === 'type') setSelectedType(value);
        }}
        suggestions={allKeywords}
      />

      {loading && (
        <div className="empty-state">
          <div className="loading-spinner" style={{ margin: '0 auto var(--space-md)' }}></div>
          <h3 className="empty-state-title">Loading YouTube videos...</h3>
          <p className="empty-state-text">Fetching latest GATE CSE videos from top channels.</p>
        </div>
      )}

      {!loading && filteredResources.length > 0 && (
        <>
          <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-text-tertiary)' }}>
            Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
            {selectedType && ` in ${selectedType}`}
            {selectedSubject && ` for ${getSubjectName(selectedSubject)}`}
          </div>
          <div className="grid-3">
            {filteredResources.map(resource => (
              resource.type === 'youtube' ? (
                <YouTubeVideoCard key={resource.id} video={resource} />
              ) : (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-card"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                >
                  <div className={`resource-type-icon ${resource.type}`}>
                    {getIconForType(resource.type)}
                  </div>

                  <div className="badge badge-violet" style={{ alignSelf: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                    {getSubjectName(resource.subjectId)}
                  </div>

                  <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xs)', color: 'var(--color-text-primary)' }}>
                    {resource.title}
                  </h3>

                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)', flex: 1 }}>
                    {resource.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Open Link <FiExternalLink />
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                      <FiThumbsUp /> {resource.upvotes}
                    </span>
                  </div>
                </a>
              )
            ))}
          </div>
        </>
      )}

      {!loading && filteredResources.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <h3 className="empty-state-title">No resources found</h3>
          <p className="empty-state-text">
            No resources match your current filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
