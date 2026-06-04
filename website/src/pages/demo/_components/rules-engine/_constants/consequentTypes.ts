import type { BaseOption, FullOptionList } from 'react-querybuilder';
import { toFullOptionList } from 'react-querybuilder';

export type ParamInputType = 'text' | 'textarea' | 'number';

export interface ParamSchema {
  name: string;
  label: string;
  inputType: ParamInputType;
}

// Musician-themed consequent (action) types available in the demo.
export const consequentTypes: FullOptionList<BaseOption> = toFullOptionList([
  { value: 'book_gig', label: 'Book a gig' },
  { value: 'send_fan_email', label: 'Send fan email' },
  { value: 'add_to_playlist', label: 'Add to playlist' },
  { value: 'assign_tour', label: 'Assign to tour' },
  { value: 'flag_review', label: 'Flag for review' },
]);

// Editable params per consequent type, consumed by ConsequentParamsEditor.
export const paramSchemas: Record<string, ParamSchema[]> = {
  book_gig: [
    { name: 'venue', label: 'Venue', inputType: 'text' },
    { name: 'fee', label: 'Fee', inputType: 'number' },
  ],
  send_fan_email: [
    { name: 'subject', label: 'Subject', inputType: 'text' },
    { name: 'body', label: 'Body', inputType: 'textarea' },
  ],
  add_to_playlist: [{ name: 'playlist', label: 'Playlist', inputType: 'text' }],
  assign_tour: [{ name: 'tour', label: 'Tour', inputType: 'text' }],
  flag_review: [{ name: 'reason', label: 'Reason', inputType: 'text' }],
};
