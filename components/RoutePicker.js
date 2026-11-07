'use client';

import { useEffect, useState } from 'react';
import { whatsappLink } from '@/lib/business';
import { formatDrive, formatKm, routeFareMessage, routes } from '@/lib/routes';

const CAR = 'M-9 2l1.4-4a1.8 1.8 0 0 1 1.7-1.2h11.8a1.8 1.8 0 0 1 1.7 1.2L9 2a1.8 1.8 0 0 1 1.8 1.8v3.5a.9.9 0 0 1-.9.9h-.9a1.8 1.8 0 0 1-3.6 0h-10.8a1.8 1.8 0 0 1-3.6 0h-.9a.9.9 0 0 1-.9-.9V3.8A1.8 1.8 0 0 1-9 2z';

// Stops of a circuit placed along a winding hill road (viewBox 340 x 150).
const STOPS = [
  [24, 112],
  [100, 42],
  [172, 104],
  [246, 38],
  [316, 92],
];
const PATH = 'M24 112 C 52 112, 70 42, 100 42 S 142 104, 172 104 S 214 38, 246 38 S 290 92, 316 92';
const DRAW = 3.2; // seconds to draw the whole circuit

// Each pick mounts a new <svg>, which starts its own SMIL clock, so the car and the line restart together.
function CircuitMap({ stops, still }) {

  return (
    <svg className="circuit" viewBox="0 0 340 150" role="img" aria-label={`Route: ${stops.join(', ')}`}>
      <path className="circuit-base" d={PATH} />
      <path className="circuit-path" d={PATH} pathLength="1" style={{ animationDuration: `${DRAW}s` }} />
      {stops.map((name, i) => {
        const [x, y] = STOPS[i];
        const peak = y < 70; // labels go outside the curve: above the peaks, below the valleys
        return (
          <g key={name} className="circuit-stop" style={{ animationDelay: `${(i / (stops.length - 1)) * DRAW}s` }}>
            <circle cx={x} cy={y} r="6" />
            <text x={x} y={peak ? y - 14 : y + 26} textAnchor="middle">
              {name}
            </text>
          </g>
        );
      })}
      <g className="circuit-car">
        <path d={CAR} transform={still ? `translate(${STOPS[stops.length - 1].join(' ')})` : undefined} />
        {!still && <animateMotion dur={`${DRAW}s`} fill="freeze" path={PATH} calcMode="spline" keySplines="0.42 0 0.58 1" keyTimes="0;1" keyPoints="0;1" />}
      </g>
    </svg>
  );
}

function StraightRoute({ to }) {
  return (
    <div className="route-line" aria-hidden="true">
      <span className="route-end">Zirakpur</span>
      <span className="route-track">
        <span className="route-car">
          <svg width="22" height="22" viewBox="-12 -6 24 16" fill="currentColor">
            <path d={CAR} />
          </svg>
        </span>
      </span>
      <span className="route-end">{to}</span>
    </div>
  );
}

// Pick a place to see the approximate drive from Zirakpur; the map re-animates on every pick.
export default function RoutePicker() {
  const [id, setId] = useState(routes[0].id);
  const [still, setStill] = useState(false);
  const route = routes.find((r) => r.id === id);

  useEffect(() => setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

  return (
    <section id="routes" className="section route-picker" aria-labelledby="routes-title">
      <div className="container route-layout">
        <div className="section-head">
          <span className="eyebrow">Plan your trip</span>
          <h2 id="routes-title">Where are you going?</h2>
          <p>Pick a place to see the usual drive from Zirakpur, Chandigarh or Mohali.</p>
          <div className="route-chips" role="group" aria-label="Choose a destination">
            {routes.map((r) => (
              <button key={r.id} type="button" className="route-chip" aria-pressed={r.id === id} onClick={() => setId(r.id)}>
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div key={route.id} className="route-card" aria-live="polite">
          {route.circuit ? <CircuitMap stops={route.circuit} still={still} /> : <StraightRoute to={route.name} />}
          <h3>{route.circuit ? route.name : `Zirakpur to ${route.name}`}</h3>
          <dl className="route-facts">
            <div>
              <dt>Distance</dt>
              <dd>{formatKm(route.km)}</dd>
            </div>
            <div>
              <dt>{route.circuit ? 'Trip' : 'Drive'}</dt>
              <dd>{formatDrive(route)}</dd>
            </div>
            <div>
              <dt>Suggested car</dt>
              <dd>{route.car}</dd>
            </div>
          </dl>
          <p className="route-note">{route.note}</p>
          <div className="route-actions">
            <a
              className="btn btn-accent"
              href="#book"
              data-book-drop={route.circuit ? undefined : route.name}
              data-book-package={route.book?.package}
            >
              Book this route
            </a>
            <a className="btn btn-light" href={whatsappLink(routeFareMessage(route))} target="_blank" rel="noopener noreferrer">
              Ask fare on WhatsApp
            </a>
          </div>
          <p className="route-disclaimer">Approximate road figures. Traffic, weather and stops can change them.</p>
        </div>
      </div>
    </section>
  );
}
