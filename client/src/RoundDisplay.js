// client/src/RoundDisplay.js

import React from 'react';

export default function RoundDisplay({ assignment, roundInfo, theme }) {
  const { league, year } = roundInfo;

  return (
    <div className="assignment-container">
      <h2>{league.toUpperCase()} &ndash; {year}</h2>
      <p>
        <strong>Your Player:</strong> {assignment}
      </p>
    </div>
  );
}