
export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  category: string;
}

export const games: Game[] = [
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    thumbnail: 'https://play-lh.googleusercontent.com/JzFSE6MI0F_5bWcyYLXma-BiCRfRrhh1Of1qZizM3DenOa8v_1mnNiO0BoOFOAIScDA',
    url: 'https://yell0wsuit.page/assets/games/subway-surfers/index.html',
    category: 'Endless Runner'
  },
  {
    id: 'cut-the-rope',
    title: 'Cut The Rope',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/en/6/66/Cut_the_Rope_%28App_icon%29.png',
    url: 'https://yell0wsuit.page/assets/games/ctrexp/index.html',
    category: 'Puzzle'
  },
  {
    id: 'cut-the-rope-2',
    title: 'Cut The Rope 2',
    thumbnail: 'https://play-lh.googleusercontent.com/mcTuR3TnaIY8OMD1kGgUhrI2Q-xH8YXu6zPS78pimfnh_RlpxhiPmph7DbmuF62Zdw',
    url: 'https://yell0wsuit.page/assets/games/ctr2/index.html',
    category: 'Puzzle'
  },
  {
    id: 'angry-birds',
    title: 'Angry Birds',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Angry_Birds_promo_art.png',
    url: 'https://yell0wsuit.page/assets/games/angry-birds-chrome/index.html',
    category: 'Puzzle'
  },
  {
    id: 'jetpack-joyride',
    title: 'Jetpack Joyride',
    thumbnail: 'https://img.poki-cdn.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/d5d34cb9ce7b617b93338982aa0958ab.png',
    url: 'https://yell0wsuit.page/assets/games/jetpackjoyride/index.html',
    category: 'Action'
  }
];
