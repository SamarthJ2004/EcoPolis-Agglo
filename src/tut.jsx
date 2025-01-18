import { useState, useEffect } from 'react';

function App() {
  const [allData, setAllData] = useState({ biodiversity: null, weather: null });

  const fetchData = async (lat, lon) => {
    const biodiversityUrl = `https://api.gbif.org/v1/occurrence/search?decimalLatitude=${lat}&decimalLongitude=${lon}&radius=10`;
    const weatherApiKey = '9cdf050abe7b42592268c0bf78c0195a';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;

    try {
      const [biodiversityResponse, weatherResponse] = await Promise.all([
        fetch(biodiversityUrl),
        fetch(weatherUrl)
      ]);

      const biodiversityData = await biodiversityResponse.json();
      const weatherData = await weatherResponse.json();

      setAllData({ biodiversity: biodiversityData, weather: weatherData });
      console.log("Fetched Data:", { biodiversityData, weatherData });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(37.7749, -122.4194);
  }, []);

  return (
    <div className='text-4xl font-bold'>
      Hello
      {allData.biodiversity && allData.weather && (
        <div>
          <div>
            <h2>Biodiversity Data:</h2>
            <pre>{JSON.stringify(allData.biodiversity, null, 2)}</pre>
          </div>
          <div>
            <h2>Weather Data:</h2>
            <pre>{JSON.stringify(allData.weather, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;