// Adapted from https://en.wikipedia.org/wiki/List_of_musical_instruments
import type { OptionGroup } from 'react-querybuilder/debug';

export const musicalInstruments: OptionGroup[] = [
  {
    label: 'Percussion instruments',
    instruments: [
      'Clapstick',
      'Cowbell',
      'Cymbal',
      'Gong',
      'Maraca',
      'Marimba',
      'More cowbell',
      'Spoon',
      'Steelpan',
      'Tambourine',
      'Triangle',
      'Vibraphone',
      'Washboard',
      'Wood block',
      'Wooden fish',
      'Xylophone',
    ],
  },
  {
    label: 'Membranophones',
    instruments: [
      'Barrel drum',
      'Bass drum',
      'Bongo drums',
      'Conga',
      'Drum',
      'Drum kit',
      "Jew's harp",
      'Octaban',
      'Samphor',
      'Snare drum',
      'Timpani',
      'Tom-tom',
    ],
  },
  {
    label: 'Wind instruments',
    instruments: [
      'Accordion',
      'Air horn',
      'Bagpipe',
      'Baritone horn',
      'Bassoon',
      'Bazooka',
      'Beatboxing',
      'Blown bottle',
      'Bugle',
      'Clarinet',
      'Conch',
      'Cornet',
      'Didgeridoo',
      'Double bell euphonium',
      'Doulophone',
      'English horn',
      'Euphonium',
      'Flugelhorn',
      'Flute',
      'French horn',
      'Harmonica',
      'Irish flute',
      'Jug',
      'Kazoo',
      'Melodeon',
      'Mezzo-soprano',
      'Oboe',
      'Ocarina',
      'Pan flute',
      'Piccolo',
      'Pipe organ',
      'Recorder',
      'Saxophone',
      'Slide whistle',
      'Sousaphone',
      'Trombone',
      'Trumpet',
      'Tuba',
      'Whistle',
    ],
  },
  {
    label: 'Stringed instruments',
    instruments: [
      'Aeolian harp',
      'Bandolin',
      'Banjo ukulele',
      'Cello',
      'Chapman stick',
      'Clavichord',
      'Clavinet',
      'Double bass',
      'Dulcimer',
      'Fiddle',
      'Guitar',
      'Hammered dulcimer',
      'Harp',
      'Harpsichord',
      'Lute',
      'Lyre',
      'Maguhu',
      'Mandola',
      'Mandolin',
      'Octobass',
      'Piano',
      'Sitar',
      'Ukulele',
      'Viol',
      'Violin',
      'Washtub bass',
    ],
  },
  {
    label: 'Electronic instruments',
    instruments: [
      'AlphaSphere',
      'Audiocubes',
      'Bass pedals',
      'Continuum Fingerboard',
      'Croix Sonore',
      "Denis d'or",
      'Dubreq stylophone',
      'Drum machine',
      'Eigenharp',
      'Electric guitar',
      'Electronic keyboard',
      'Electronic organ',
      'EWI',
      'Fingerboard synthesizer',
      'Hammond organ',
      'Keyboard',
      'Keytar',
      'Kraakdoos',
      'Laser harp',
      'Mellotron',
      'MIDI keyboard',
      'Omnichord',
      'Ondes Martenot',
      'Otamatone',
      'Sampler',
      'Seaboard music instrument',
      'Skoog',
      'Synclavier',
      'Synthesizer',
      'Teleharmonium',
      'Tenori-on',
      'Theremin',
      'trautonium',
      'Turntablism',
      'Turntable',
    ],
  },
].map(({ label, instruments }) => ({
  label,
  options: instruments.map(s => ({ name: s, label: s })),
}));
