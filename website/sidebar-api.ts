import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import type {
  SidebarItem,
  SidebarItemCategoryLinkDoc,
} from '@docusaurus/plugin-content-docs/src/sidebars/types.js';
import typedocGeneratedSidebarItems from './api/typedoc-sidebar.cjs';

const shiftToTop = (arr: SidebarItem[], item: SidebarItem) => {
  const index = arr.indexOf(item);

  if (index !== -1) {
    const item = arr.splice(index, 1)[0];
    arr.unshift(item);
  }
};

for (const item of typedocGeneratedSidebarItems) {
  for (const subItem of item.items) {
    if (
      subItem.type === 'category' &&
      (subItem.link as SidebarItemCategoryLinkDoc | undefined)?.id.endsWith('/index/index')
    ) {
      shiftToTop(item.items, subItem);
    }
  }
  if (
    item.type === 'category' &&
    (item.link as SidebarItemCategoryLinkDoc | undefined)?.id === 'react-querybuilder/index'
  ) {
    shiftToTop(typedocGeneratedSidebarItems, item);
  }
}

export default {
  apiSidebarItems: [
    {
      type: 'doc',
      label: 'React Query Builder API',
      id: 'index',
    },
    ...typedocGeneratedSidebarItems,
  ],
} satisfies SidebarsConfig;
