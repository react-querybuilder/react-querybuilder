import type { RulesEngine } from '@react-querybuilder/rules-engine';
import { regenerateREIDs } from '@react-querybuilder/rules-engine';

export const initialRulesEngine: RulesEngine = regenerateREIDs({
  conditions: [
    // If a megastar (>1M listeners) -> book a big gig
    {
      antecedent: {
        combinator: 'and',
        rules: [{ field: 'monthlyListeners', operator: '>', value: 1_000_000 }],
      },
      consequent: {
        type: 'book_gig',
        params: { venue: 'Madison Square Garden', fee: 50_000 },
      },
    },
    // Else if active musician with a strong rating -> assign to tour
    {
      antecedent: {
        combinator: 'and',
        rules: [
          { field: 'isMusician', operator: '=', value: true },
          { field: 'rating', operator: '>=', value: 4 },
        ],
      },
      consequent: { type: 'assign_tour', params: { tour: 'Summer Amphitheater Run' } },
      // Nested subcondition: rising stars also get a fan email
      conditions: [
        {
          antecedent: {
            combinator: 'and',
            rules: [{ field: 'monthlyListeners', operator: '<', value: 1_000_000 }],
          },
          consequent: {
            type: 'send_fan_email',
            params: {
              subject: 'You are on the rise!',
              body: 'We are adding you to our summer tour lineup.',
            },
          },
        },
      ],
    },
  ],
  // Else -> flag for manual review
  defaultConsequent: { type: 'flag_review', params: { reason: 'No automated rule matched' } },
});
