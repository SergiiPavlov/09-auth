export const paths = {
  home: () => '/',
  signIn: () => '/sign-in',
  signUp: () => '/sign-up',
  profile: () => '/profile',
  profileEdit: () => '/profile/edit',
  notes: () => '/notes',
  notesFilterAll: () => '/notes/filter/All',
  notesFilterByTag: (tag: string) => `/notes/filter/${encodeURIComponent(tag)}`,
  notesActionCreate: () => '/notes/action/create',
  noteDetails: (id: string | number) => `/notes/${encodeURIComponent(String(id))}`,
};

export type AppPaths = typeof paths;
