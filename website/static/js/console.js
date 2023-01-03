// Uncomment the line below to expose the `ReactQueryBuilder` object in the console
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// var process = { env: { NODE_ENV: 'development' } };

const commonStyles = 'font-family: monospace;';
const primary = '#82a7dd';
const secondary = '#3c649f';
const textShadow = '2px 2px 2px rgba(152, 152, 152, 0.69)';

const rqb = `%c
██████%c╗%c        █████%c╗%c       ██████%c╗%c
██%c╔══%c██%c╗%c      ██%c╔══%c██%c╗%c      ██%c╔══%c██%c╗%c
██████%c╔╝%c      ██%c║%c  ██%c║%c      ██████%c╔╝%c
██%c╔═%c██%c║%c       ██%c║%c ███%c║%c      ██%c╔══%c██%c╗%c
██%c║%c %c╚%c██%c╗%ceact%c   ███%c╔%c██%c╣%cuery%c  ██████%c╔╝%cuilder%c
╚═╝  ╚═╝       ╚══╩══╝      ╚═════╝
`;

const styleSequence = [
  `${commonStyles} color: ${primary}; text-shadow: none;`, // start line 1
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`, // first shadow in line 2
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`, // first shadow in line 3
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`, // first shadow in line 4
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`, // first shadow in line 5
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: ${textShadow};`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: ${textShadow};`,
  `${commonStyles} color: ${primary}; text-shadow: none;`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`,
  `${commonStyles} color: ${primary}; text-shadow: ${textShadow};`,
  `${commonStyles} color: ${secondary}; text-shadow: none;`, // end line 5 to end
];

console.log.apply(globalThis, [rqb, ...styleSequence]);
