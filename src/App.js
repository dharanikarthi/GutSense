import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const analyzeFood = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(selectedImage);
      
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🍎 Food Analyzer</h1>
        <p className="subtitle">Upload a food image to identify it and check if it's safe to eat</p>
        
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="upload-button">
            📸 Choose Image
          </label>
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Selected food" />
            <button 
              onClick={analyzeFood} 
              disabled={loading}
              className="analyze-button"
            >
              {loading ? '🔍 Analyzing...' : '🔍 Analyze Food'}
            </button>
          </div>
        )}

        {error && (
          <div className="error">
            ❌ Error: {error}
          </div>
        )}

        {analysis && (
          <div className="analysis-result">
            <h2>Analysis Result</h2>
            <div className="food-info">
              <h3>🍽️ Food Identified: {analysis.foodName}</h3>
              <div className={`safety-status ${analysis.isSafe ? 'safe' : 'unsafe'}`}>
                {analysis.isSafe ? '✅ Safe to Eat' : '⚠️ Not Safe to Eat'}
              </div>
              <p className="explanation">{analysis.explanation}</p>
              {analysis.warnings && analysis.warnings.length > 0 && (
                <div className="warnings">
                  <h4>⚠️ Warnings:</h4>
                  <ul>
                    {analysis.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;