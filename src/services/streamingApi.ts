
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
}

interface Episode {
  id: string;
  title: string;
  thumbnail: string;
  season: number;
  episode: number;
  duration: string;
  sources: Source[];
}

type Content = Movie | TvShow;

// Mock API endpoints to simulate a real streaming service
const fetchFeaturedContent = async (): Promise<Content> => {
  // This would be an actual API call in a real app
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
    sources: generateMockSources("tt9362722")
  };
};

const generateMockSources = (contentId: string): Source[] => {
  return [
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
      id: `${contentId}-sv`,
      name: "Server 5",
      quality: "720p",
      provider: "StreamVid",
      url: "https://example.com/stream/streamvid-source"
    },
    {
      id: `${contentId}-direct`,
      name: "Direct Play",
      quality: "1080p",
      provider: "Direct",
      // Using a real sample video for demonstration purposes
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    }
  ];
};

const fetchContentByCategory = async (category: string): Promise<Content[]> => {
  // This would be an actual API call in a real app
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
      sources: generateMockSources("tt9362722")
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
      sources: generateMockSources("tt6751668")
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
      sources: generateMockSources("tt1375666")
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
      sources: generateMockSources("tt0111161")
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
      sources: generateMockSources("tt0468569")
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
      sources: generateMockSources("tt0109830")
    }
  ];

  // Filter by category if provided, otherwise return all
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

// Function to get content stream sources
const getStreamSources = async (contentId: string): Promise<Source[]> => {
  const content = await getContentDetails(contentId);
  if (!content) {
    throw new Error("Content not found");
  }
  
  if ('sources' in content) {
    return content.sources;
  } else if ('episodes' in content && content.episodes.length > 0) {
    // Return sources of the first episode for TV shows
    return content.episodes[0].sources;
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
