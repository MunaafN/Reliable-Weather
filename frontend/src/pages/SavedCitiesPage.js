import React from 'react';
import SavedCities from '../components/SavedCities';

function SavedCitiesPage({ onSelectCity, units }) {
  return (
    <div className="space-y-4 min-w-0">
      <SavedCities onSelectCity={onSelectCity} units={units} />
    </div>
  );
}

export default SavedCitiesPage;
