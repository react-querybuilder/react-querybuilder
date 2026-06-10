import type { ConsequentTypeOption } from '@react-querybuilder/rules-engine';

// Musician-themed consequent (action) types available in the demo. Each type carries
// `properties`, which the built-in `consequentBuilderBody` renders as editable inputs.
// Property values are stored on the consequent under `params[name]`.
export const consequentTypes: ConsequentTypeOption[] = [
  {
    name: 'book_gig',
    label: 'Book a gig',
    properties: [
      { name: 'venue', label: 'Venue' },
      { name: 'fee', label: 'Fee', inputType: 'number' },
    ],
  },
  {
    name: 'send_fan_email',
    label: 'Send fan email',
    properties: [
      { name: 'subject', label: 'Subject' },
      { name: 'body', label: 'Body', inputType: 'textarea' },
    ],
  },
  {
    name: 'add_to_playlist',
    label: 'Add to playlist',
    properties: [{ name: 'playlist', label: 'Playlist' }],
  },
  {
    name: 'assign_tour',
    label: 'Assign to tour',
    properties: [{ name: 'tour', label: 'Tour' }],
  },
  {
    name: 'flag_review',
    label: 'Flag for review',
    properties: [{ name: 'reason', label: 'Reason' }],
  },
];
