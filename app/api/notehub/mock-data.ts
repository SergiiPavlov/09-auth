import type { Note, NoteTag } from '@/types/note';

type ListParams = {
  page?: number;
  perPage?: number;
  search?: string | null;
  tag?: string | null;
};

const VALID_TAGS: readonly NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

const MOCK_NOTES: Note[] = [
  {
    id: 'mock-1',
    title: 'Welcome to NoteHub',
    content: 'This is mock data used when the NoteHub API is unreachable.',
    tag: 'Todo',
    createdAt: '2024-01-03T09:00:00.000Z',
    updatedAt: '2024-02-10T15:30:00.000Z',
  },
  {
    id: 'mock-2',
    title: 'Sprint planning meeting',
    content: 'Prepare agenda and invite the core team.',
    tag: 'Meeting',
    createdAt: '2024-03-12T11:00:00.000Z',
    updatedAt: '2024-03-12T11:00:00.000Z',
  },
  {
    id: 'mock-3',
    title: 'Grocery list',
    content: 'Milk, coffee beans, pasta, basil, cherry tomatoes.',
    tag: 'Shopping',
    createdAt: '2024-04-02T08:25:00.000Z',
    updatedAt: '2024-04-08T19:42:00.000Z',
  },
  {
    id: 'mock-4',
    title: 'Q2 product roadmap',
    content: 'Finalize roadmap draft and share with leadership.',
    tag: 'Work',
    createdAt: '2024-02-19T10:05:00.000Z',
    updatedAt: '2024-02-27T16:18:00.000Z',
  },
  {
    id: 'mock-5',
    title: 'Vacation ideas',
    content: 'Research hiking trips across the Alps and Pyrenees.',
    tag: 'Personal',
    createdAt: '2024-05-01T07:55:00.000Z',
    updatedAt: '2024-05-15T09:12:00.000Z',
  },
  {
    id: 'mock-6',
    title: 'Team retrospective notes',
    content: 'Capture action items from the last sprint retrospective.',
    tag: 'Work',
    createdAt: '2024-05-21T14:30:00.000Z',
    updatedAt: '2024-05-21T14:30:00.000Z',
  },
  {
    id: 'mock-7',
    title: 'One-on-one topics',
    content: 'Feedback on new onboarding flow and training sessions.',
    tag: 'Meeting',
    createdAt: '2024-05-30T13:10:00.000Z',
    updatedAt: '2024-05-30T13:10:00.000Z',
  },
  {
    id: 'mock-8',
    title: 'Personal reading list',
    content: 'Finish “Clean Architecture” and start “Designing Data-Intensive Applications”.',
    tag: 'Personal',
    createdAt: '2024-06-05T18:05:00.000Z',
    updatedAt: '2024-06-05T18:05:00.000Z',
  },
];

function normalizePage(value?: number): number {
  if (!value || Number.isNaN(value)) return 1;
  return Math.max(1, Math.floor(value));
}

function normalizePerPage(value?: number): number {
  if (!value || Number.isNaN(value)) return 12;
  return Math.max(1, Math.floor(value));
}

function normalizeTag(tag?: string | null): NoteTag | undefined {
  if (!tag) return undefined;
  const normalized = tag.trim();
  return VALID_TAGS.find((item) => item.toLowerCase() === normalized.toLowerCase());
}

function matchesSearch(note: Note, search?: string): boolean {
  if (!search) return true;
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return (
    note.title.toLowerCase().includes(normalized) ||
    note.content.toLowerCase().includes(normalized)
  );
}

export function getMockNotes(params: ListParams) {
  const page = normalizePage(params.page);
  const perPage = normalizePerPage(params.perPage);
  const search = params.search ?? '';
  const tag = normalizeTag(params.tag);

  const filtered = MOCK_NOTES.filter((note) => {
    const matchesTag = tag ? note.tag === tag : true;
    return matchesTag && matchesSearch(note, search);
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const startIndex = (page - 1) * perPage;
  const paginated = filtered.slice(startIndex, startIndex + perPage);

  return {
    notes: paginated,
    page,
    perPage,
    totalItems,
    totalPages,
  } satisfies {
    notes: Note[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export function getMockNoteById(id: string): Note | undefined {
  return MOCK_NOTES.find((note) => note.id === id);
}
