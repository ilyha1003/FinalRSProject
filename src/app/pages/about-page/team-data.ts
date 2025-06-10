import { TeamMember } from '../../utils/interfaces/interfaces';

export const teamMembers: TeamMember[] = [
  {
    name: 'Ilya',
    role: 'Team lead, Frontend Developer',
    biographies: [
      'Minsk, Belarus',
      'Date of birth: 10.03.1999',
      'Place of work: Minsk Research Institute of Radio Materials, head of microwave devices department',
    ],
    github: 'https://github.com/ilyha1003',
    photoUrl: '/assets/images/ilya.jpeg',
    contributions: [
      'Connecting to Commercetools API',
      'Creating a profile page',
      'Working with the basket and orders',
    ],
  },
  {
    name: 'Vlad',
    role: 'Frontend Developer',
    biographies: ['Sankt-Peterburg, Russia'],
    github: 'https://github.com/lowraince',
    photoUrl: '/assets/images/vlad.jpeg',
    contributions: [
      'Сreating a registration and login page',
      'Creating a catalog page',
      'Working with the basket and orders',
    ],
  },
  {
    name: 'Marat',
    role: 'Frontend Developer',
    biographies: [
      'Ulyanovsk, Russia',
      'Date of birth: 25.02.1988',
      'Place of work: Former head of the purchasing department of one of the large enterprises in Ulyanovsk, individual entrepreneur',
    ],
    github: 'https://github.com/mavlekiev',
    photoUrl: '/assets/images/marat.jpeg',
    contributions: [
      'Header and footer design and layout',
      'Creating a product page',
      'Creating a about us page',
    ],
  },
];
