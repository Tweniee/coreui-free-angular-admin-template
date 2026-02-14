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
    name: 'Members',
    url: '/members',
    iconComponent: { name: 'cil-user' },
  },
  {
    name: 'Payments',
    url: '/payments',
    iconComponent: { name: 'cil-wallet' },
  },
  {
    name: 'Membership Plans',
    url: '/membership-plans',
    iconComponent: { name: 'cil-tags' },
  },
  {
    name: 'Trainer Assignments',
    url: '/member-trainer-assignments',
    iconComponent: { name: 'cil-user-follow' },
  },
  {
    name: 'Exercises',
    url: '/exercises',
    iconComponent: { name: 'cil-task' },
  },
];
