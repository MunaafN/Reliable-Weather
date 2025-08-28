// Simple script to test API key configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing API Key Configuration...\n');

// Read .env file manually since dotenv might not be available
const envPath = path.join(__dirname, 'backend', '.env');
let apiKey = null;

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('OPENWEATHER_API_KEY=')) {
      apiKey = line.split('=')[1].trim();
      break;
    }
  }
} catch (error) {
  console.log('❌ Cannot read .env file:', error.message);
}

console.log('1. Environment file check:');
console.log('   .env file path: ./backend/.env');

console.log('\n2. API key status:');
if (!apiKey) {
  console.log('   ❌ OPENWEATHER_API_KEY not found');
  console.log('   💡 Solution: Make sure .env file exists in backend folder');
} else if (apiKey === 'your_openweathermap_api_key_here') {
  console.log('   ❌ API key still has placeholder value');
  console.log('   💡 Solution: Replace with your actual API key');
} else if (apiKey.trim() === '') {
  console.log('   ❌ API key is empty');
  console.log('   💡 Solution: Add your API key after OPENWEATHER_API_KEY=');
} else {
  console.log(`   ✅ API key found: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)} (${apiKey.length} chars)`);
}

console.log('\n3. Testing API key with OpenWeatherMap:');
if (apiKey && apiKey !== 'your_openweathermap_api_key_here' && apiKey.trim() !== '') {
  console.log('   🔄 Testing API key...');
  
  // Use Node.js built-in https module instead of axios
  const https = require('https');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`;
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const weather = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('   ✅ API key is working! Test request successful');
          console.log(`   📍 Test location: ${weather.name}, ${weather.sys.country}`);
          console.log(`   🌡️  Temperature: ${weather.main.temp}°C`);
        } else {
          console.log(`   ❌ API error (${res.statusCode}): ${weather.message}`);
          if (res.statusCode === 401) {
            console.log('   💡 Solution: Check your API key on OpenWeatherMap dashboard');
          }
        }
      } catch (e) {
        console.log('   ❌ Error parsing response:', e.message);
      }
    });
  }).on('error', (error) => {
    console.log('   ❌ Network error:', error.message);
  });
} else {
  console.log('   ⏭️  Skipping API test (no valid API key)');
}

console.log('\n📋 Next steps:');
console.log('1. Fix any issues shown above');
console.log('2. Restart your backend server: npm run dev');
console.log('3. Test your weather app frontend');
