// Quick API key test
require('dotenv').config({ path: './backend/.env' });

const https = require('https');

console.log('🔍 Quick API Key Test\n');

const apiKey = process.env.OPENWEATHER_API_KEY;

if (!apiKey) {
  console.log('❌ No API key found in environment');
  process.exit(1);
}

console.log(`✅ API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)} (${apiKey.length} chars)`);

// Test 1: Current weather
console.log('\n🧪 Test 1: Current weather for London');
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`;

https.get(weatherUrl, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      const weather = JSON.parse(data);
      console.log(`✅ Weather API: ${weather.name}, ${weather.sys.country} - ${weather.main.temp}°C`);
      
      // Test 2: City search
      console.log('\n🧪 Test 2: City search for "New"');
      const searchUrl = `http://api.openweathermap.org/geo/1.0/direct?q=New&limit=3&appid=${apiKey}`;
      
      https.get(searchUrl, (res2) => {
        let data2 = '';
        res2.on('data', chunk => data2 += chunk);
        res2.on('end', () => {
          if (res2.statusCode === 200) {
            const cities = JSON.parse(data2);
            console.log(`✅ Search API: Found ${cities.length} cities`);
            cities.forEach((city, i) => {
              console.log(`   ${i+1}. ${city.name}, ${city.country}${city.state ? ', ' + city.state : ''}`);
            });
            console.log('\n🎉 Both API endpoints working correctly!');
          } else {
            console.log(`❌ Search API error: ${res2.statusCode}`);
          }
        });
      }).on('error', err => console.log('❌ Search request error:', err.message));
      
    } else {
      const error = JSON.parse(data);
      console.log(`❌ Weather API error (${res.statusCode}): ${error.message}`);
      if (res.statusCode === 401) {
        console.log('💡 Your API key might be invalid or inactive');
      }
    }
  });
}).on('error', err => console.log('❌ Weather request error:', err.message));
