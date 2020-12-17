import { Static } from 'runtypes';

import { User } from '../api/types/types';

export interface GlobalStatePageNotFound {
  type: 'GlobalStatePageNotFound';
}

export interface GlobalStateLandingPage {
  type: 'GlobalStateLandingPage';
}

export interface GlobalStateRedirectToHomePage {
  type: 'GlobalStateRedirectToHomePage';
}

export interface GlobalStateHomePage {
  type: 'GlobalStateHomePage';
  user: Static<typeof User>;
}

export type GlobalState =
  | GlobalStatePageNotFound
  | GlobalStateLandingPage
  | GlobalStateRedirectToHomePage
  | GlobalStateHomePage;
