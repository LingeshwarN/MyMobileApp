const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Movie = require('./models/Movie');
const Genre = require('./models/Genre');
const User = require('./models/User');
const Theater = require('./models/Theater');
const Showtime = require('./models/Showtime');

const moviesData = [
  {
    name: 'Galactic Odyssey',
    poster: 'https://picsum.photos/seed/movie1/300/450',
    rating: 4.5,
    genre: ['Sci-Fi', 'Action'],
    synopsis:
      'In the year 2450, humanity embarks on its greatest journey beyond the Milky Way. Captain Elara must navigate treacherous asteroid fields, alien diplomacy, and her own haunted past to save the last colony ship carrying one million souls to a new world.',
    releaseDate: '2026-01-15',
    language: 'English',
    duration: '2h 28m',
    director: 'James Mitchell',
    cast: ['Sarah Connor', 'David Park', 'Mia Reynolds'],
    availability: 'Now Showing',
    showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '9:00 PM'],
    price: 250,
  },
  {
    name: 'The Last Samurai Rising',
    poster: 'https://picsum.photos/seed/movie2/300/450',
    rating: 4.8,
    genre: ['Action', 'Drama'],
    synopsis: 'Set in feudal Japan, a dishonored ronin seeks redemption.',
    releaseDate: '2026-02-20',
    language: 'Japanese',
    duration: '2h 45m',
    director: 'Takeshi Kurosawa',
    cast: ['Ken Watanabe', 'Rinko Kikuchi'],
    availability: 'Now Showing',
    showtimes: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'],
    price: 300,
  },
  {
    name: 'Love in Paris',
    poster: 'https://picsum.photos/seed/movie3/300/450',
    rating: 4.2,
    genre: ['Romance', 'Comedy'],
    synopsis: 'A clumsy American tourist accidentally switches suitcases with a Parisian artist.',
    releaseDate: '2026-03-14',
    language: 'English',
    duration: '1h 52m',
    director: 'Sophie Laurent',
    cast: ['Emma Stone', 'Lucas Martin', 'Audrey Tautou'],
    availability: 'Now Showing',
    showtimes: ['10:30 AM', '1:00 PM', '4:30 PM', '7:30 PM'],
    price: 200,
  },
  {
    name: 'Shadow Protocol',
    poster: 'https://picsum.photos/seed/movie4/300/450',
    rating: 4.6,
    genre: ['Thriller', 'Action'],
    synopsis: 'A covert agent must go rogue to uncover a conspiracy at the highest levels of government.',
    releaseDate: '2026-04-01',
    language: 'English',
    duration: '2h 15m',
    director: 'Christopher Blake',
    cast: ['Tom Hardy', 'Charlize Theron', 'Oscar Isaac'],
    availability: 'Coming Soon',
    showtimes: ['12:00 PM', '3:30 PM', '7:00 PM', '10:00 PM'],
    price: 280,
  },
  {
    name: 'The Enchanted Forest',
    poster: 'https://picsum.photos/seed/movie5/300/450',
    rating: 4.3,
    genre: ['Animation', 'Fantasy'],
    synopsis: 'A young girl discovers a portal to an enchanted forest where animals can talk.',
    releaseDate: '2026-05-10',
    language: 'English',
    duration: '1h 40m',
    director: 'Pixie Animations',
    cast: ['Voice: Anna Kendrick', 'Voice: Idris Elba', 'Voice: Zendaya'],
    availability: 'Now Showing',
    showtimes: ['9:00 AM', '11:30 AM', '2:00 PM', '4:30 PM'],
    price: 180,
  },
  {
    name: 'Midnight Terror',
    poster: 'https://picsum.photos/seed/movie6/300/450',
    rating: 3.9,
    genre: ['Horror', 'Thriller'],
    synopsis: 'A group of students rent a remote cabin whose previous occupants never left.',
    releaseDate: '2026-06-13',
    language: 'English',
    duration: '1h 48m',
    director: 'Jordan Peele',
    cast: ['Lupita Nyongo', 'Daniel Kaluuya', 'Florence Pugh'],
    availability: 'Now Showing',
    showtimes: ['7:00 PM', '9:30 PM', '11:45 PM'],
    price: 220,
  },
  {
    name: 'Champions League',
    poster: 'https://picsum.photos/seed/movie7/300/450',
    rating: 4.1,
    genre: ['Drama', 'Sports'],
    synopsis: 'An underdog cricket team from a small Indian village defies all odds to win the national championship.',
    releaseDate: '2026-07-04',
    language: 'Hindi',
    duration: '2h 35m',
    director: 'Rajkumar Hirani',
    cast: ['Ranveer Singh', 'Deepika Padukone', 'Amitabh Bachchan'],
    availability: 'Advance Booking',
    showtimes: ['10:00 AM', '1:30 PM', '5:00 PM', '8:30 PM'],
    price: 350,
  },
  {
    name: "Ocean's Depths",
    poster: 'https://picsum.photos/seed/movie8/300/450',
    rating: 4.4,
    genre: ['Sci-Fi', 'Adventure'],
    synopsis: 'Deep-sea explorers discover an ancient underwater civilization at the bottom of the Mariana Trench.',
    releaseDate: '2026-08-22',
    language: 'English',
    duration: '2h 20m',
    director: 'James Cameron',
    cast: ['Chris Hemsworth', 'Gal Gadot', 'John Boyega'],
    availability: 'Coming Soon',
    showtimes: ['11:00 AM', '2:00 PM', '5:30 PM', '9:00 PM'],
    price: 320,
  },
  {
    name: 'The Comedy Club',
    poster: 'https://picsum.photos/seed/movie9/300/450',
    rating: 4.0,
    genre: ['Comedy'],
    synopsis: 'Three best friends decide to open a comedy club in downtown Mumbai.',
    releaseDate: '2026-09-05',
    language: 'Hindi',
    duration: '2h 05m',
    director: 'Anurag Basu',
    cast: ['Ayushmann Khurrana', 'Rajkummar Rao', 'Kriti Sanon'],
    availability: 'Now Showing',
    showtimes: ['10:30 AM', '1:30 PM', '4:30 PM', '7:30 PM'],
    price: 200,
  },
  {
    name: 'Neon Nights',
    poster: 'https://picsum.photos/seed/movie10/300/450',
    rating: 4.7,
    genre: ['Action', 'Sci-Fi'],
    synopsis: 'In a cyberpunk Tokyo of 2077, a street racer fights a mega-corporation through neural implants.',
    releaseDate: '2026-10-15',
    language: 'English',
    duration: '2h 10m',
    director: 'Denis Villeneuve',
    cast: ['Keanu Reeves', 'Ana de Armas', 'Dev Patel'],
    availability: 'Advance Booking',
    showtimes: ['12:00 PM', '3:00 PM', '6:30 PM', '10:00 PM'],
    price: 380,
  },
  {
    name: 'Whispers in the Wind',
    poster: 'https://picsum.photos/seed/movie11/300/450',
    rating: 4.6,
    genre: ['Drama', 'Romance'],
    synopsis: 'Two strangers connected by letters found in an old bookshop begin an anonymous correspondence.',
    releaseDate: '2026-11-20',
    language: 'English',
    duration: '2h 00m',
    director: 'Greta Gerwig',
    cast: ['Saoirse Ronan', 'Timothée Chalamet', 'Judi Dench'],
    availability: 'Coming Soon',
    showtimes: ['10:00 AM', '12:30 PM', '3:00 PM', '6:00 PM'],
    price: 230,
  },
  {
    name: 'Dragon Kingdom',
    poster: 'https://picsum.photos/seed/movie12/300/450',
    rating: 4.5,
    genre: ['Fantasy', 'Animation'],
    synopsis: 'A young dragon rider must reunite the five elemental dragons to prevent an ancient prophecy.',
    releaseDate: '2026-12-25',
    language: 'English',
    duration: '1h 55m',
    director: 'DreamWorks Animation',
    cast: ['Voice: Jack Black', 'Voice: Awkwafina', 'Voice: Benedict Cumberbatch'],
    availability: 'Advance Booking',
    showtimes: ['9:00 AM', '11:30 AM', '2:00 PM', '5:00 PM'],
    price: 200,
  },
];

const genresData = [
  {name: 'Action', icon: 'flame', color: '#FF5252'},
  {name: 'Comedy', icon: 'happy', color: '#FFB300'},
  {name: 'Drama', icon: 'heart', color: '#E040FB'},
  {name: 'Horror', icon: 'skull', color: '#607D8B'},
  {name: 'Romance', icon: 'rose', color: '#FF4081'},
  {name: 'Sci-Fi', icon: 'planet', color: '#448AFF'},
  {name: 'Thriller', icon: 'eye', color: '#FF6E40'},
  {name: 'Animation', icon: 'color-palette', color: '#69F0AE'},
  {name: 'Fantasy', icon: 'sparkles', color: '#B388FF'},
  {name: 'Adventure', icon: 'compass', color: '#00BCD4'},
  {name: 'Sports', icon: 'football', color: '#8BC34A'},
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cinebooks');
    console.log('Connected to MongoDB...');

    await Promise.all([
      Movie.deleteMany({}),
      Genre.deleteMany({}),
      Theater.deleteMany({}),
      Showtime.deleteMany({}),
    ]);

    await Movie.insertMany(moviesData);
    await Genre.insertMany(genresData);
    console.log(`Seeded ${moviesData.length} movies, ${genresData.length} genres`);

    // Demo user so the app has something to log in with
    const existingUser = await User.findOne({ email: 'lingesh@cinebooks.com' });
    if (!existingUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Cine@2026', salt);
      await User.create({
        name: 'Lingesh',
        email: 'lingesh@cinebooks.com',
        passwordHash,
        mobile: '9876543210',
        city: 'Madurai',
        address: '123 Cinema Street, Madurai, TN',
        avatar: 'https://picsum.photos/seed/lingesh/200/200',
      });
      console.log('Seeded demo user: lingesh@cinebooks.com / Cine@2026');
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedDB();