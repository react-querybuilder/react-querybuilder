# React Query Builder

[![npm][badge-npm]](https://www.npmjs.com/package/react-querybuilder)
[![Demo][badge-demo]](https://react-querybuilder.js.org/demo)
[![Docs][badge-docs]](https://react-querybuilder.js.org/)
[![Learn from the maintainer][badge-training]](https://www.newline.co/courses/building-advanced-admin-reporting-in-react)

[![Continuous Integration][badge-ci]](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/main.yml)
[![codecov.io][badge-codecov]](https://codecov.io/github/react-querybuilder/react-querybuilder?branch=main)
[![All Contributors][badge-all-contributors]](#contributors-)

**Full documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org)**.

![Screenshot](_assets/screenshot.png)

## Getting started

To get started, import the main component and the default stylesheet, then render the component in your app:

```tsx
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

export const App = () => {
  return <QueryBuilder />;
};
```

For a more complete introduction, see the [main package README](packages/react-querybuilder/README.md), dive into the [full documentation](https://react-querybuilder.js.org/docs/api/querybuilder), or browse the [example projects](./examples/).

To enable drag-and-drop functionality, see the [`@react-querybuilder/dnd` package README](packages/dnd/README.md).

_For instructions on migrating from earlier versions of `react-querybuilder`, [click here](https://react-querybuilder.js.org/docs/migrate)._

## Compatibility packages

[![Ant Design](https://img.shields.io/badge/RQB-for_Ant%20Design-blue?logo=antdesign)](https://www.npmjs.com/package/@react-querybuilder/antd)
[![Bootstrap](https://img.shields.io/badge/RQB-for_Bootstrap-blue?logo=bootstrap)](https://www.npmjs.com/package/@react-querybuilder/bootstrap)
[![Bulma](https://img.shields.io/badge/RQB-for_Bulma-blue?logo=bulma)](https://www.npmjs.com/package/@react-querybuilder/bulma)
[![Chakra](https://img.shields.io/badge/RQB-for_Chakra%20UI-blue?logo=chakraui)](https://www.npmjs.com/package/@react-querybuilder/chakra)
[![MUI](https://img.shields.io/badge/RQB-for_MUI-blue?logo=mui)](https://www.npmjs.com/package/@react-querybuilder/material)

In addition to the main [`react-querybuilder`](https://www.npmjs.com/package/react-querybuilder) package, this repo also hosts official compatibility component packages for use with several popular style libraries including [Ant Design](https://www.npmjs.com/package/@react-querybuilder/antd), [Bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap), [Bulma](https://www.npmjs.com/package/@react-querybuilder/bulma), [Chakra UI](https://www.npmjs.com/package/@react-querybuilder/chakra), and [MUI](https://www.npmjs.com/package/@react-querybuilder/material).

## Development

To run a test page with a basic query builder using the default components, run `yarn start`.

To run the documentation website, run `yarn website:start`. Click "Demo" in the page header to load the full demo with all options and compatibility components available.

## Credits

This component was inspired by prior work from:

- [jQuery QueryBuilder](http://querybuilder.js.org/)
- [Angular QueryBuilder](https://github.com/mfauveau/angular-query-builder)
- [React Awesome Query Builder](https://github.com/ukrbublik/react-awesome-query-builder)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jakeboone02"><img src="https://avatars1.githubusercontent.com/u/366438?v=4?s=100" width="100px;" alt="Jake Boone"/><br /><sub><b>Jake Boone</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=jakeboone02" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=jakeboone02" title="Documentation">📖</a> <a href="#maintenance-jakeboone02" title="Maintenance">🚧</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=jakeboone02" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://quicklens.app/"><img src="https://avatars0.githubusercontent.com/u/156846?v=4?s=100" width="100px;" alt="Pavan Podila"/><br /><sub><b>Pavan Podila</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=pavanpodila" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/maniax89"><img src="https://avatars2.githubusercontent.com/u/6325237?v=4?s=100" width="100px;" alt="Andrew Turgeon"/><br /><sub><b>Andrew Turgeon</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=maniax89" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=maniax89" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/miphe"><img src="https://avatars2.githubusercontent.com/u/393147?v=4?s=100" width="100px;" alt="André Drougge"/><br /><sub><b>André Drougge</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=miphe" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=miphe" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/oumar-sh"><img src="https://avatars0.githubusercontent.com/u/10144493?v=4?s=100" width="100px;" alt="Oumar Sharif DAMBABA"/><br /><sub><b>Oumar Sharif DAMBABA</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=oumar-sh" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/artenator"><img src="https://avatars2.githubusercontent.com/u/1946019?v=4?s=100" width="100px;" alt="Arte Ebrahimi"/><br /><sub><b>Arte Ebrahimi</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=artenator" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CharlyJazz"><img src="https://avatars0.githubusercontent.com/u/12489333?v=4?s=100" width="100px;" alt="Carlos Azuaje"/><br /><sub><b>Carlos Azuaje</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CharlyJazz" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/srinivasdamam"><img src="https://avatars0.githubusercontent.com/u/13461208?v=4?s=100" width="100px;" alt="Srinivas Damam"/><br /><sub><b>Srinivas Damam</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=srinivasdamam" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://matthewreishus.com/"><img src="https://avatars3.githubusercontent.com/u/937354?v=4?s=100" width="100px;" alt="Matthew Reishus"/><br /><sub><b>Matthew Reishus</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=mreishus" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/duwalanise"><img src="https://avatars2.githubusercontent.com/u/7278569?v=4?s=100" width="100px;" alt="Anish Duwal"/><br /><sub><b>Anish Duwal</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=duwalanise" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=duwalanise" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/RomanLamsal1337"><img src="https://avatars1.githubusercontent.com/u/66664277?v=4?s=100" width="100px;" alt="RomanLamsal1337"/><br /><sub><b>RomanLamsal1337</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=RomanLamsal1337" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/snakerxx"><img src="https://avatars2.githubusercontent.com/u/2099820?v=4?s=100" width="100px;" alt="Dmitriy Kolesnikov"/><br /><sub><b>Dmitriy Kolesnikov</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=xxsnakerxx" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://vitorbarbosa.com/"><img src="https://avatars2.githubusercontent.com/u/86801?v=4?s=100" width="100px;" alt="Vitor Barbosa"/><br /><sub><b>Vitor Barbosa</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=vitorhsb" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lakk1"><img src="https://avatars0.githubusercontent.com/u/9366737?v=4?s=100" width="100px;" alt="Laxminarayana"/><br /><sub><b>Laxminarayana</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=lakk1" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=lakk1" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://mundpropaganda.net/"><img src="https://avatars0.githubusercontent.com/u/3873068?v=4?s=100" width="100px;" alt="Christian Mund"/><br /><sub><b>Christian Mund</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kkkrist" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kkkrist" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://thegalacticdesignbureau.com/"><img src="https://avatars0.githubusercontent.com/u/6655746?v=4?s=100" width="100px;" alt="Dallas Larsen"/><br /><sub><b>Dallas Larsen</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=hellofantastic" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://geekayush.github.io/"><img src="https://avatars2.githubusercontent.com/u/22499864?v=4?s=100" width="100px;" alt="Ayush Srivastava"/><br /><sub><b>Ayush Srivastava</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=geekayush" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fabioespinosa"><img src="https://avatars2.githubusercontent.com/u/10719524?v=4?s=100" width="100px;" alt="Fabio Espinosa"/><br /><sub><b>Fabio Espinosa</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fabioespinosa" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://careers.stackoverflow.com/bubenkoff"><img src="https://avatars0.githubusercontent.com/u/427136?v=4?s=100" width="100px;" alt="Anatoly Bubenkov"/><br /><sub><b>Anatoly Bubenkov</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=bubenkoff" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/saurabhnemade"><img src="https://avatars0.githubusercontent.com/u/17445338?v=4?s=100" width="100px;" alt="Saurabh Nemade"/><br /><sub><b>Saurabh Nemade</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=saurabhnemade" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=saurabhnemade" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/edwin-xavier/"><img src="https://avatars2.githubusercontent.com/u/74540236?v=4?s=100" width="100px;" alt="Edwin Xavier"/><br /><sub><b>Edwin Xavier</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=eddie-xavi" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=eddie-xavi" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://stackoverflow.com/users/3875582/code-monk"><img src="https://avatars.githubusercontent.com/u/15674997?v=4?s=100" width="100px;" alt="Code Monk"/><br /><sub><b>Code Monk</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Code">💻</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Documentation">📖</a> <a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=CodMonk" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ZigZagT"><img src="https://avatars.githubusercontent.com/u/7879714?v=4?s=100" width="100px;" alt="ZigZagT"/><br /><sub><b>ZigZagT</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=ZigZagT" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mylawacad"><img src="https://avatars.githubusercontent.com/u/20267295?v=4?s=100" width="100px;" alt="mylawacad"/><br /><sub><b>mylawacad</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=mylawacad" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kyrylostepanchuk"><img src="https://avatars.githubusercontent.com/u/98354866?v=4?s=100" width="100px;" alt="Kyrylo Stepanchuk"/><br /><sub><b>Kyrylo Stepanchuk</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kyrylostepanchuk" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kculmback-eig"><img src="https://avatars.githubusercontent.com/u/81175351?v=4?s=100" width="100px;" alt="Kasey Culmback"/><br /><sub><b>Kasey Culmback</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=kculmback-eig" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://fasiha.github.io/"><img src="https://avatars.githubusercontent.com/u/37649?v=4?s=100" width="100px;" alt="Ahmed Fasih"/><br /><sub><b>Ahmed Fasih</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=fasiha" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[badge-all-contributors]: https://img.shields.io/badge/all_contributors-27-orange.svg
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

[badge-demo]: https://img.shields.io/badge/demo-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAHSAAAB0gGhKG2eAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA/VJREFUWIW1l21MW1UYx//P7aWUbQU6shleBtncYApxRNHETGb0yxaiiGZD2AdDNMaE+MG4LL4sWZaQaJZsM3NgFjVGo9EwMzWylddQWFllyV6kjrYrw6lQoZSEvr/ee48fdKb3Figt7fPt/s95nt//nnuec++lc2bv3wQUI4sRDAbRffGnQCgcVsXr2yvKZvhsggFAEARc6h+AP+DfKB+hm8/s26fnsm1g9KoJTueCUp4TVcILGk1eLKsGbtz6FRarTSmHmcQ13T33ziwAUKfZ0wFwBZmG3560VowYjc8zMIqTWW1NzddP1T95/d9LqqNls9cZlW+e2k0SxgHIbkytUZ954/W2D+5f5wQEgc6YWF5ugUuVUCXNMPaZdDen7w4TsDNeJw4/6w47Wgq3CNJ9LTRbJPLqTf4xJmoezQRckiS4wiEolzWvKILdrfcaVWoxKDNV7u/J6Ca8MmbCrMMh03iNiJ1Nf0GlFpfNyZgB8+1J/GaxyDTiGB5snEFuQXTFvIwYcMzNwfjLeIJe8ewctGWBVXN5AF+AoT9d+PyCs7BH39smiWJevF64w39jyyNLhtVyJUaT62rDqldPaqFRmQDUxOsMGCzZ6m8YOXFCSFaDuiZ8B0FSbqpwSRLpm+6L77o9nup4XaPRLLS+1HRWm68NJS3CMM8zYp8BVJiqgavXrsPt8Shl3+aN+Y06zQYbosvv+viIqlVH0nobWu1TuDVhVsoiI2oxdLxyzdCxtjqdZp+QchfMO50wjF5JHCD2tr3riD7VeimtQCAYgL5/CKIoX14GfGnvOvpxqnAAoE/M7sckRkmNuN2e3O4ffjwfjcUeitfzN2lnWpsPfpWTwyd/6Eo4KLDGNmRU1X76OwAvKwb+FCT2xPT5owlfHGs20TnhfZ/Atq02adAwUme1T9XJEjkWqWhwnCqq8jhWyksKZ/QHD7BDjKh2pUnTv9+DbWpKmYkdDY5cXaXnGFi6eACMXVq1C1yLixgYNoApIKV7XdBVJpwBacWKBkKhEC73DUAQ5KepbpcXxY8vZgQOADyIYgBkFEkUoR8YUvn8ftkm3bA1jO0HZgFaz7rLY9kuqGo//TnAXpOJnOTa9vRCc/EetzNTcIngS+j/mrc+ei8WFeVwokhJSWnbiw+32xDLFB4gUYjwXWbvSUbYDAAWq61seNS4XzGP7amu/ra+fm+5JLHyzOEBAlfLM+AwGMqW3G6MmcbBFFueMXx4of3AsQuZJP8XnWbfcQ4AIuEIenr7EIkmfLv12hfLj2eB/X9wjEnQDw7B4/HKBohgEVXqFnzfnPIZn0pQ09ket/XOHdkfDM/nhBuf2/9pyQPFS1mFc1T6D+rMjhBdvrClAAAAAElFTkSuQmCC
[badge-docs]: https://img.shields.io/badge/📖_documentation-blue.svg
[badge-npm]: https://img.shields.io/npm/v/react-querybuilder.svg?cacheSeconds=3600&logo=npm
[badge-training]: https://img.shields.io/badge/training-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAEIAAABCAFpWn9CAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAgdJREFUKJGNkb9rE2EYxz/33l0uubTXwYSLwWroIgoWIUqoBUF0KS4HQkAKkqndtDi5mLb/h4sGIUOwQkDIkoAiblo0ASXEwSKVYEtKk+Zi877nYmNLsfjdngc+3+/zQ3NdN+q67rNYLHZFKSX4t/bbPzbrkc9f7kx63j7T09Olfr8f/I/KL1+ou5nJp57nIeLxeDocDjMYDAiC4IRAuH7jpiZCodsAQgihA8zOzlIul08EhRBEjeDU2qU3V0c7LS4uks/nR6mdTodms0m9XqfRaBwxUEK7PwJzuRzdbpdSqQRApVIhk8mwsLBAOp1mZ2fnLxmQHYGmaZLP51lZWUFKiWmaJBIJarUag8GAdrv9h0EBIRFCjx7A8/PzKKUoFosYhoFSCsuyjozZhy6AMJH6QVPXdZaXl1ldXcW2bZLJJABTU1OYpgmAFR3awFCgadphx2w2i23bbGxsUK1WAWi1WqRSKQA0HYOo/GQEUh47eaFQIBKJHHtHr9cjainU2X5KP+84ufFEIhZ3XXzfx/d9HMfBtu1R7fs+nU6HpUcP1L3L68Mzroxor+bmnMb2dqspZUwGBD/luZ6hRcaGmhx+C4ekJgxLiq1dJjfHQ9cmeJL6+PrCcGtc8zyPNdO8uC/le8DqBae/fvi1lATC6xNj76oxZwZg79bjt9L5PhNXe7Xnu5WHvwH2M+1kJKUCQwAAAABJRU5ErkJggg==
[badge-ci]: https://github.com/react-querybuilder/react-querybuilder/actions/workflows/main.yml/badge.svg
[badge-codecov]: https://codecov.io/github/react-querybuilder/react-querybuilder/coverage.svg?branch=main
