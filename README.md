# React Query Builder

[![npm][badge-npm]](https://www.npmjs.com/package/react-querybuilder)
[![Demo][badge-demo]](https://react-querybuilder.js.org/demo)
[![Docs][badge-docs]](https://react-querybuilder.js.org/)
[![Learn from the maintainer][badge-training]](https://www.newline.co/courses/building-advanced-admin-reporting-in-react)
[![Chat][badge-discord]](https://react-querybuilder.js.org/discord)

[![CI][badge-ci]](https://github.com/react-querybuilder/react-querybuilder/actions/workflows/main.yml)
[![codecov.io][badge-codecov]][codecov-link]
[![All Contributors][badge-all-contributors]](#contributors-)

**React Query Builder** is a fully customizable query builder component for React, along with a collection of utility functions for [importing from](https://react-querybuilder.js.org/docs/utils/import), and [exporting to](https://react-querybuilder.js.org/docs/utils/export), various query languages like SQL, MongoDB, and more. Demo is [here](https://react-querybuilder.js.org/demo).

_**Complete documentation is available at [react-querybuilder.js.org](https://react-querybuilder.js.org)**._

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

For a more complete introduction, see the [main package README](packages/react-querybuilder/README.md), dive into the [full documentation](https://react-querybuilder.js.org/docs/intro), or browse the [example projects](./examples/).

To enable drag-and-drop functionality, see the [`@react-querybuilder/dnd` package README](packages/dnd/README.md).

_For instructions on migrating from earlier versions of `react-querybuilder`, [click here](https://react-querybuilder.js.org/docs/migrate)._

## Compatibility packages

[![Ant Design](https://img.shields.io/badge/RQB-for_Ant%20Design-blue?logo=antdesign)](https://www.npmjs.com/package/@react-querybuilder/antd)
[![Bootstrap](https://img.shields.io/badge/RQB-for_Bootstrap-blue?logo=bootstrap)](https://www.npmjs.com/package/@react-querybuilder/bootstrap)
[![Bulma](https://img.shields.io/badge/RQB-for_Bulma-blue?logo=bulma)](https://www.npmjs.com/package/@react-querybuilder/bulma)
[![Chakra UI](https://img.shields.io/badge/RQB-for_Chakra%20UI-blue?logo=chakraui)](https://www.npmjs.com/package/@react-querybuilder/chakra)<br />
[![Fluent UI](https://img.shields.io/badge/RQB-for_Fluent%20UI-blue?logo=fluentui)](https://www.npmjs.com/package/@react-querybuilder/fluent)
[![Mantine](https://img.shields.io/badge/RQB-for_Mantine-blue?logo=mantine)](https://www.npmjs.com/package/@react-querybuilder/mantine)
[![MUI](https://img.shields.io/badge/RQB-for_MUI-blue?logo=mui)](https://www.npmjs.com/package/@react-querybuilder/material)
[![React Native](https://img.shields.io/badge/RQB-for_React_Native-blue?logo=react)](https://www.npmjs.com/package/@react-querybuilder/native)

In addition to the main [`react-querybuilder`](https://www.npmjs.com/package/react-querybuilder) package, this repo also hosts official compatibility component packages for use with several popular style libraries including [Ant Design](https://www.npmjs.com/package/@react-querybuilder/antd), [Bootstrap](https://www.npmjs.com/package/@react-querybuilder/bootstrap), [Bulma](https://www.npmjs.com/package/@react-querybuilder/bulma), [Chakra UI](https://www.npmjs.com/package/@react-querybuilder/chakra), [Fluent UI](https://www.npmjs.com/package/@react-querybuilder/fluent), [Mantine](https://www.npmjs.com/package/@react-querybuilder/mantine), and [MUI](https://www.npmjs.com/package/@react-querybuilder/material). A functionally equivalent [React Native-compatible component](https://www.npmjs.com/package/@react-querybuilder/native) is also available.

## Development

> _Most scripts in this repository require [Bun](https://bun.sh/)._

To run a test page with a basic query builder using the default components, run `bun start`.

To run the documentation website, run `bun run build && bun run web`. Click "Demo" in the page header to load the full demo with all options and compatibility components available.

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
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Austin-Stowe"><img src="https://avatars.githubusercontent.com/u/60020423?v=4?s=100" width="100px;" alt="Austin Stowe"/><br /><sub><b>Austin Stowe</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=Austin-Stowe" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mnlfischer"><img src="https://avatars.githubusercontent.com/u/3883653?v=4?s=100" width="100px;" alt="Manuel"/><br /><sub><b>Manuel</b></sub></a><br /><a href="https://github.com/react-querybuilder/react-querybuilder/commits?author=mnlfischer" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

<!-- prettier-ignore-start -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[badge-all-contributors]: https://img.shields.io/badge/all_contributors-29-orange.svg
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- prettier-ignore-end -->

[badge-demo]: https://img.shields.io/badge/demo-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAHYAAAB2AH6XKZyAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAA7JJREFUWIW1ld9PW2UYx7/P6ZHhVrMFcAQBQWHuB5h17sKpGTaBocRFK+yCxCwmaozxL/DO7c4rYyIXS7xaTIwaHZsyAu3KoKXQbMlW2Jjlx5RKC7RCW9qChZ5zHi9mk42+3dpy+lyez/Oez5P3fZ/3oZ6JmJ/BCooUE3enjE7XWLmINTa8uCQzWCGiumLI/1lZwbj7RjbsMbe0XJWKIQaAzeQm+gdtUFTB5hLCkLiztOQppSgFMDMG7XbE4nER1sDSB4f9rr8AQCaQzMw+PQsYdbv3+Rb8e0XspcYDw+2t5hPAxydAZCaLxaKnG97qk6eZ+QqAjN1lRt9MZeI9i8ejpb/pegSzz7U0MvP3Qjkwt7XLcPZhOQBQz0RslKHtuA1TKVX6+dKlY5HomnE7IwNrBzt9t5+pWU88UhSRLDO4hkjacRuOuByIRNeErL5tUTLWrh/nDMI+XY5g8s4UvNMzQrb/2CrKm6JZ1+64gOVgCE63W8j2VG2gtiX42PUygfzM2nwh8kRivaRvYOAVTVV3bWeGUnWroSNwS5J4E5l7D+DBHSi4DaMmk7wU2nMNoDcFWCGW2g4tOUae9J+Cj2AxZPwqixwEfJGLHHjQhnlPw9m5+7utQ0PPsmBrKyrKvd1dZ34CtEyYYSdz3tMwEo3iutMJkRzAdDASf9X+5dlYLv9qPX/xnJyrGABSKQX9Vhu2tlIinFBVdDYvDuUkT0fOd4AZuDY8jHA4IsRg+qg5OHovHzkAyEQ0wMylT0p0uMaa5+7/eVzE6p+vGz/d0d4EfNKUbwE5taG35g0za2QDkHlkjOGqysSpfR5PQfOEvr0TNz8uYcE3X9ZntX2nKlpZxmIDhw+84/90b8PaaiFyAJDB/CMBlSKoaRpu3pqAqmS2FEmMg2fmy4zVG78wqFB/UAJzMht1jo1jcXlZyGrNyzBWbxQqTkcyaxfMzM5h8u6UkJUdXsN+U3incgCABKKMDlgNh2EfcQgXPF2RRH1bQBc5gFIZRN0PP2rBlZCxt/f3C4qiVG/PJkKiyhT5zCBrgWwTLt94pA0vX+6lQ59//SuD3xfkMhN3HQm4evVR/19Az2TsQvohGnI4j977w2sSJTa8UO/oaD91XU85AMjM/DYR1S0EAvB6p7Pl2ftvaG+VuD5U9ZS3nr94TgKARDyBQZsdmmjEEf3NCrotqR90ladDUhSFrlqt+DcpfA6SIOo6EhpdKYYcAOjdb66sT8/M7hbBoy83/3by9dduF0sOIvN/iyuX1reeUXwAAAAASUVORK5CYII=
[badge-docs]: https://img.shields.io/badge/📖_documentation-blue.svg
[badge-npm]: https://img.shields.io/npm/v/react-querybuilder.svg?cacheSeconds=3600&logo=npm
[badge-training]: https://img.shields.io/badge/training-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAEIAAABCAFpWn9CAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAgdJREFUKJGNkb9rE2EYxz/33l0uubTXwYSLwWroIgoWIUqoBUF0KS4HQkAKkqndtDi5mLb/h4sGIUOwQkDIkoAiblo0ASXEwSKVYEtKk+Zi877nYmNLsfjdngc+3+/zQ3NdN+q67rNYLHZFKSX4t/bbPzbrkc9f7kx63j7T09Olfr8f/I/KL1+ou5nJp57nIeLxeDocDjMYDAiC4IRAuH7jpiZCodsAQgihA8zOzlIul08EhRBEjeDU2qU3V0c7LS4uks/nR6mdTodms0m9XqfRaBwxUEK7PwJzuRzdbpdSqQRApVIhk8mwsLBAOp1mZ2fnLxmQHYGmaZLP51lZWUFKiWmaJBIJarUag8GAdrv9h0EBIRFCjx7A8/PzKKUoFosYhoFSCsuyjozZhy6AMJH6QVPXdZaXl1ldXcW2bZLJJABTU1OYpgmAFR3awFCgadphx2w2i23bbGxsUK1WAWi1WqRSKQA0HYOo/GQEUh47eaFQIBKJHHtHr9cjainU2X5KP+84ufFEIhZ3XXzfx/d9HMfBtu1R7fs+nU6HpUcP1L3L68Mzroxor+bmnMb2dqspZUwGBD/luZ6hRcaGmhx+C4ekJgxLiq1dJjfHQ9cmeJL6+PrCcGtc8zyPNdO8uC/le8DqBae/fvi1lATC6xNj76oxZwZg79bjt9L5PhNXe7Xnu5WHvwH2M+1kJKUCQwAAAABJRU5ErkJggg==
[badge-ci]: https://github.com/react-querybuilder/react-querybuilder/actions/workflows/main.yml/badge.svg
[badge-codecov]: https://codecov.io/gh/react-querybuilder/react-querybuilder/branch/main/graph/badge.svg?token=AeYWGCFJO0
[codecov-link]: https://codecov.io/gh/react-querybuilder/react-querybuilder
[badge-discord]: https://img.shields.io/badge/discord-blue.svg?logo=discord&logoColor=white
