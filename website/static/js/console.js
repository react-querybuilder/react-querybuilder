// Uncomment the line below to expose the `ReactQueryBuilder` object in the console
// var process = { env: { NODE_ENV: 'development' } };

const commonStyles = 'font-family: monospace';
const colorPrimary_n2 = 'color: #d0dbf2';
const colorPrimary_n1 = 'color: #aabee7';
const colorPrimary = 'color: #82a7dd';
const colorPrimary_p1 = 'color: #7395d7';
const colorPrimary_p2 = 'color: #5e86d1';
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
  [colorPrimary_n2, textShadowNone], // start of line 1
  [colorSecondary, textShadowNone],
  [colorPrimary_n2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 2
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_n1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 3
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 4
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p1, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone], // first shadow in line 5
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorPrimary_p2, textShadowNone],
  [colorSecondary, textShadowNone],
  [colorPrimary, textShadow],
  [colorSecondary, textShadowNone], // end of line 5 to the end
].map(styles => [commonStyles, ...styles].join('; '));

console.log.apply(globalThis, [rqb, ...styleSequence]);
