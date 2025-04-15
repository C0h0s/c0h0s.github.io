interface Source {
  id: string;
  name: string;
  quality: string;
  url: string;
  provider: StreamProvider;
}

type StreamProvider = 'VidGuard' | 'MixDrop' | 'VidPlay' | 'StreamHub' | 'StreamVid' | 'Direct';

interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: string;
  duration: string;
  description: string;
  category: string;
  featured?: boolean;
  sources: Source[];
  streamvid_id?: string;
}

interface TvShow {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  year: number;
  rating: string;
  seasons: number;
  description: string;
  category: string;
  featured?: boolean;
  episodes: Episode[];
  streamvid_id?: string;
}

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  season: number;
  episode: number;
  duration: string;
  sources: Source[];
  streamvid_id?: string;
}

type Content = Movie | TvShow;

const STREAMVID_API_KEY = "YOUR_STREAMVID_API_KEY";
const STREAMVID_API_BASE = "https://api.streamvid.co/v1";

const fetchFeaturedContent = async (): Promise<Content> => {
  return {
    id: "tt9362722",
    title: "Spider-Man: Across the Spider-Verse",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    year: 2023,
    rating: "PG-13",
    duration: "2h 20m",
    description: "Miles Morales returns for the next chapter of the Spider-Verse saga, spanning worlds and bringing a team of Spider-People to face a new threat.",
    category: "Animation",
    featured: true,
    sources: await generateSourcesWithStreamVid("tt9362722", "sv_1234567"),
    streamvid_id: "sv_1234567"
  };
};

const fetchStreamVidSources = async (streamvid_id: string): Promise<Source | null> => {
  if (!streamvid_id) return null;
  
  try {
    return {
      id: `sv-${streamvid_id}`,
      name: "StreamVid",
      quality: "1080p",
      provider: "StreamVid",
      url: `https://streamvid.co/player/${streamvid_id}`
    };
  } catch (error) {
    console.error("Error fetching StreamVid source:", error);
    return null;
  }
};

const generateMockSources = async (contentId: string, streamvid_id?: string): Promise<Source[]> => {
  const streamVidSource = streamvid_id ? await fetchStreamVidSources(streamvid_id) : null;
  
  const sources: Source[] = [
    {
      id: `${contentId}-vg`,
      name: "Server 1",
      quality: "1080p",
      provider: "VidGuard",
      url: "https://example.com/stream/vidguard-source"
    },
    {
      id: `${contentId}-md`,
      name: "Server 2",
      quality: "720p",
      provider: "MixDrop",
      url: "https://example.com/stream/mixdrop-source"
    },
    {
      id: `${contentId}-vp`,
      name: "Server 3",
      quality: "1080p",
      provider: "VidPlay",
      url: "https://example.com/stream/vidplay-source"
    },
    {
      id: `${contentId}-sh`,
      name: "Server 4",
      quality: "4K",
      provider: "StreamHub",
      url: "https://example.com/stream/streamhub-source"
    },
    {
      id: `${contentId}-direct`,
      name: "Direct Play",
      quality: "1080p",
      provider: "Direct",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }
  ];
  
  if (streamVidSource) {
    sources.unshift(streamVidSource);
  }
  
  return sources;
};

const generateSourcesWithStreamVid = async (contentId: string, streamvid_id?: string): Promise<Source[]> => {
  return await generateMockSources(contentId, streamvid_id);
};

const fetchContentByCategory = async (category: string): Promise<Content[]> => {
  const mockContent: Content[] = [
    {
      id: "tt9362722",
      title: "Spider-Man: Across the Spider-Verse",
      poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
      year: 2023,
      rating: "PG-13",
      duration: "2h 20m",
      description: "Miles Morales returns for the next chapter of the Spider-Verse saga.",
      category: "Animation",
      sources: await generateSourcesWithStreamVid("tt9362722", "sv_1234567"),
      streamvid_id: "sv_1234567"
    },
    {
      id: "tt6751668",
      title: "Parasite",
      poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
      year: 2019,
      rating: "R",
      duration: "2h 12m",
      description: "All unemployed, Ki-taek and his family take peculiar interest in the wealthy Park family.",
      category: "Thriller",
      sources: await generateSourcesWithStreamVid("tt6751668", "sv_7654321"),
      streamvid_id: "sv_7654321"
    },
    {
      id: "tt1375666",
      title: "Inception",
      poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      year: 2010,
      rating: "PG-13",
      duration: "2h 28m",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology.",
      category: "Sci-Fi",
      sources: await generateSourcesWithStreamVid("tt1375666", "sv_8765432"),
      streamvid_id: "sv_8765432"
    },
    {
      id: "tt0111161",
      title: "The Shawshank Redemption",
      poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      year: 1994,
      rating: "R",
      duration: "2h 22m",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption.",
      category: "Drama",
      sources: await generateSourcesWithStreamVid("tt0111161", "sv_3456789"),
      streamvid_id: "sv_3456789"
    },
    {
      id: "tt0468569",
      title: "The Dark Knight",
      poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/hqkIcbrOHL20crRWUqnRIp8DApI.jpg",
      year: 2008,
      rating: "PG-13",
      duration: "2h 32m",
      description: "Batman raises the stakes in his war on crime.",
      category: "Action",
      sources: await generateSourcesWithStreamVid("tt0468569", "sv_9876543"),
      streamvid_id: "sv_9876543"
    },
    {
      id: "tt0109830",
      title: "Forrest Gump",
      poster: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      backdrop: "https://image.tmdb.org/t/p/original/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
      year: 1994,
      rating: "PG-13",
      duration: "2h 22m",
      description: "The presidencies of Kennedy and Johnson, the Vietnam War, and other events unfold through the perspective of an Alabama man.",
      category: "Drama",
      sources: await generateSourcesWithStreamVid("tt0109830", "sv_6543210"),
      streamvid_id: "sv_6543210"
    }
  ];

  if (category !== "all" && category !== "featured") {
    return mockContent.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  return mockContent;
};

const searchContent = async (query: string): Promise<Content[]> => {
  const allContent = await fetchContentByCategory("all");
  
  if (!query.trim()) {
    return [];
  }
  
  return allContent.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
};

const getContentDetails = async (id: string): Promise<Content | null> => {
  const allContent = await fetchContentByCategory("all");
  return allContent.find(item => item.id === id) || null;
};

const getStreamSources = async (contentId: string): Promise<Source[]> => {
  const content = await getContentDetails(contentId);
  if (!content) {
    throw new Error("Content not found");
  }
  
  if ('sources' in content) {
    if (content.streamvid_id) {
      return await generateSourcesWithStreamVid(contentId, content.streamvid_id);
    }
    return content.sources;
  } else if ('episodes' in content && content.episodes.length > 0) {
    const firstEpisode = content.episodes[0];
    if (firstEpisode.streamvid_id) {
      return await generateSourcesWithStreamVid(contentId, firstEpisode.streamvid_id);
    }
    return firstEpisode.sources;
  }
  
  throw new Error("No streaming sources available");
};

export {
  fetchFeaturedContent,
  fetchContentByCategory,
  searchContent,
  getContentDetails,
  getStreamSources,
  type Movie,
  type TvShow,
  type Content,
  type Episode,
  type Source,
  type StreamProvider
};
