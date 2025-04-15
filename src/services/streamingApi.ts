
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
  videoUrl: string;
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
  videoUrl: string;
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
    videoUrl: "https://example.com/stream/spiderman-spiderverse"
  };
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
      videoUrl: "https://example.com/stream/spiderman-spiderverse"
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
      videoUrl: "https://example.com/stream/parasite"
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
      videoUrl: "https://example.com/stream/inception"
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
      videoUrl: "https://example.com/stream/shawshank-redemption"
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
      videoUrl: "https://example.com/stream/dark-knight"
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
      videoUrl: "https://example.com/stream/forrest-gump"
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

// Function to get content stream URL (in a real app, this would validate user session, etc.)
const getStreamUrl = async (contentId: string): Promise<string> => {
  const content = await getContentDetails(contentId);
  if (!content || !('videoUrl' in content)) {
    throw new Error("Stream not found");
  }
  
  return content.videoUrl;
};

export {
  fetchFeaturedContent,
  fetchContentByCategory,
  searchContent,
  getContentDetails,
  getStreamUrl,
  type Movie,
  type TvShow,
  type Content,
  type Episode
};
