// Uncomment the line below to expose the `ReactQueryBuilder` object in the console
// var process = { env: { NODE_ENV: 'development' } };

const commonStyles = 'font-family: monospace';
const colorPrimary = 'color: #82a7dd';
const colorSecondary = 'color: #3c649f';
const textShadowNone = 'text-shadow: none';
const textShadow = 'text-shadow: 2px 2px 2px rgba(152, 152, 152, 0.69)';
const s = `\u00A0`; // &nbsp;

const rqb = `%c
██████%c╗%c${s}${s}${s}${s}${s}${s}${s}${s}█████%c╗%c${s}${s}${s}${s}${s}${s}${s}██████%c╗%c
██%c╔══%c██%c╗%c${s}${s}${s}${s}${s}${s}██%c╔══%c██%c╗%c${s}${s}${s}${s}${s}${s}██%c╔══%c██%c╗%c
██████%c╔╝%c${s}${s}${s}${s}${s}${s}██%c║%c${s}${s}██%c║%c${s}${s}${s}${s}${s}${s}██████%c╔╝%c
██%c╔═%c██%c║%c${s}${s}${s}${s}${s}${s}${s}██%c║%c${s}███%c║%c${s}${s}${s}${s}${s}${s}██%c╔══%c██%c╗%c
██%c║%c${s}%c╚%c██%c╗%ceact%c${s}${s}${s}███%c╔%c██%c╣%cuery%c${s}${s}██████%c╔╝%cuilder%c
╚═╝${s}${s}╚═╝${s}${s}${s}${s}${s}${s}${s}╚══╩══╝${s}${s}${s}${s}${s}${s}╚═════╝
`;

const styleSequence = [
  [colorPrimary, textShadowNone], // start of line 1
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 2
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 3
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 4
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 5
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorSecondary, textShadowNone], // end of line 5 to the end
].map(s => [commonStyles, ...s].join('; '));

console.log.apply(globalThis, [rqb, ...styleSequence]);
