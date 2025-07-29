import React from 'react';
import FireStationHeader from '../FireStationHeader';

export default function FireStationLayout({ children }) {
  return (
    <>
      <FireStationHeader />
      {children}
    </>
  );
}
