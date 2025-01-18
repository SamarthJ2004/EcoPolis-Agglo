import { useState, useEffect } from 'react';

function App() {
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeatherData = async (lat, lon) => {
    const weatherApiKey = 'your_actual_api_key';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;

    try {
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    fetchWeatherData(37.7749, -122.4194);
  }, []);

  return (
    <div className='text-4xl font-bold'>
      Weather Data:
      {weatherData && <pre>{JSON.stringify(weatherData, null, 2)}</pre>}
    </div>
  );
}

export default App;