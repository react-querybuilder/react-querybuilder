export interface SampleMusician {
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number;
  isMusician: boolean;
  instrument: string;
  alsoPlays: string[];
  monthlyListeners: number;
  genre: string;
  rating: number;
}

// Preset facts to run the rules engine against. Chosen to exercise different
// branches of the seed rules engine.
export const sampleMusicians: SampleMusician[] = [
  {
    firstName: 'Steve',
    lastName: 'Vai',
    age: 65,
    isMusician: true,
    instrument: 'guitar',
    alsoPlays: ['cowbell'],
    monthlyListeners: 1_200_000,
    genre: 'Rock',
    rating: 5,
  },
  {
    firstName: 'Stevie',
    middleName: 'Ray',
    lastName: 'Vaughan',
    age: 67,
    isMusician: true,
    instrument: 'drum_kit',
    alsoPlays: ['marimba'],
    monthlyListeners: 850_000,
    genre: 'Rock',
    rating: 5,
  },
  {
    firstName: 'Neal',
    lastName: 'Peart',
    age: 67,
    isMusician: true,
    instrument: 'drum_kit',
    alsoPlays: ['marimba'],
    monthlyListeners: 850_000,
    genre: 'Rock',
    rating: 5,
  },
  {
    firstName: 'Casey',
    lastName: 'Newcomer',
    age: 24,
    isMusician: true,
    instrument: 'ukulele',
    alsoPlays: ['tambourine'],
    monthlyListeners: 4200,
    genre: 'Folk',
    rating: 3,
  },
  {
    firstName: 'Jamie',
    lastName: 'Amateur',
    age: 17,
    isMusician: false,
    instrument: 'triangle',
    alsoPlays: ['more_cowbell'],
    monthlyListeners: 0,
    genre: 'Bedroom Pop',
    rating: 2,
  },
];
