import React, { useState } from 'react';

const MedicalReferences = ({ references }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter references based on the search term
  const filteredReferences = Object.entries(references).reduce((acc, [category, tests]) => {
    const filteredTests = tests.filter((test) =>
      test.test.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredTests.length > 0) {
      acc[category] = filteredTests;
    }
    return acc;
  }, {});

  return (
    <div className="references-container">
      <h2>Medical Reference Ranges</h2>
      <input
        type="text"
        placeholder="Search for a test..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {Object.entries(filteredReferences).map(([category, tests]) => (
        <div key={category} className="category-section">
          <h3 className="category-title">{category}</h3>
          {tests.map((test, index) => (
            <div key={index} className="test-card">
              <h4 className="test-title">{test.test}</h4>
              <p><strong>Range:</strong> {test.range}</p>
              <p><strong>Explanation:</strong> {test.explanation}</p>
              {test.unit && <p><strong>Units:</strong> {test.unit}</p>}
              {test.image && <img src={test.image} alt={`${test.test} illustration`} className="test-image" />}
            </div>
          ))}
        </div>
      ))}
      {Object.keys(filteredReferences).length === 0 && (
        <p className="no-results">No tests match your search criteria.</p>
      )}
    </div>
  );
};

export default MedicalReferences;
