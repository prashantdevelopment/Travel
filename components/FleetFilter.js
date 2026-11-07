'use client';

import { useState } from 'react';
import { groupSizes } from '@/lib/business';

// Chips filter the server-rendered cards by data-group; hidden cards stay in the DOM.
export default function FleetFilter({ counts, children }) {
  const [group, setGroup] = useState('all');
  const shown = group === 'all' ? counts.all : counts[group];

  return (
    <>
      <div className="chips" role="group" aria-label="Filter cars by group size">
        {groupSizes.map((size) => (
          <button
            key={size.id}
            type="button"
            className="chip"
            aria-pressed={group === size.id}
            onClick={() => setGroup(size.id)}
          >
            {size.label}
          </button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {shown} {shown === 1 ? 'car' : 'cars'}
      </p>
      <ul className="fleet-grid" data-filter={group}>
        {children}
      </ul>
    </>
  );
}
