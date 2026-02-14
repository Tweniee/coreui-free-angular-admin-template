import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Modules',
    url: '/modules',
    iconComponent: { name: 'cil-layers' },
  },
  {
    name: 'Roles',
    url: '/roles',
    iconComponent: { name: 'cil-shield-alt' },
  },
  {
    name: 'Permissions',
    url: '/permissions',
    iconComponent: { name: 'cil-lock-locked' },
  },
  {
    name: 'Users',
    url: '/users',
    iconComponent: { name: 'cil-people' },
  },
  {
    name: 'Payments',
    url: '/payments',
    iconComponent: { name: 'cil-wallet' },
  },
];
