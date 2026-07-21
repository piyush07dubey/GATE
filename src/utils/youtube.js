const GATE_YOUTUBE_CHANNELS = [
  { id: 'UCd6DSiBzOr5jVf5rR865FkA', name: 'GO Classes' },
  { id: 'UCX4h5ysik1a116XrmQQfCvw', name: 'Neso Academy' },
  { id: 'UCCmQeZ5ya0XaBB2enLUOuIg', name: 'GATE CSE' },
  { id: 'UCzuY3MWp0lPf5wUzO3yPd1A', name: 'Unacademy GATE' },
];

const extractVideoId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const parseYouTubeXML = (xmlText, channelName) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const entries = doc.querySelectorAll('entry');

  return Array.from(entries).map(entry => {
    const title = entry.querySelector('title')?.textContent || '';
    const linkEl = entry.querySelector('link');
    const videoUrl = linkEl?.getAttribute('href') || '';
    const videoId = extractVideoId(videoUrl);
    const description = entry.querySelector('content')?.textContent || '';
    const published = entry.querySelector('published')?.textContent || '';
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';

    return {
      id: videoId || `yt-${Date.now()}-${Math.random()}`,
      title,
      description: description.replace(/<[^>]*>/g, '').substring(0, 200),
      url: videoUrl,
      thumbnail,
      channel: channelName,
      type: 'youtube',
      publishedAt: published,
    };
  });
};

export const fetchYouTubeVideos = async () => {
  const results = [];

  await Promise.allSettled(
    GATE_YOUTUBE_CHANNELS.map(async (channel) => {
      try {
        const response = await fetch(
          `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`
        );
        if (!response.ok) return;
        const text = await response.text();
        const videos = parseYouTubeXML(text, channel.name);
        results.push(...videos.slice(0, 10));
      } catch (err) {
        console.error(`Failed to fetch ${channel.name}:`, err);
      }
    })
  );

  return results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
};

export const searchYouTube = (query) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' GATE CSE')}`;
};

export default { fetchYouTubeVideos, searchYouTube };
