export type NoteBlock = { type: 'para' | 'bullet'; text: string }
export type NoteTopic = { title: string; blocks: NoteBlock[] }
export type NoteSection = { title: string; topics: NoteTopic[] }

export const MCAT_NOTES_PREAMBLE: NoteBlock[] = [];
export const MCAT_NOTES_SECTIONS: NoteSection[] = [];
