// Comprehensive environment debugging script
const fs = require('fs');
const path = require('path');

console.log('🔍 COMPREHENSIVE ENVIRONMENT DEBUG');
console.log('=====================================\n');

// 1. Check current directory
console.log('1. DIRECTORY INFORMATION:');
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   Script location: ${__dirname}`);
console.log(`   Expected .env path: ${path.join(__dirname, 'backend', '.env')}`);
console.log();

// 2. Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
console.log('2. FILE EXISTENCE CHECK:');
console.log(`   Checking: ${envPath}`);

try {
  const stats = fs.statSync(envPath);
  console.log(`   ✅ .env file exists (${stats.size} bytes)`);
  console.log(`   📅 Last modified: ${stats.mtime}`);
} catch (error) {
  console.log(`   ❌ .env file not found: ${error.message}`);
  console.log('\n🔧 SOLUTION: Create the .env file first!');
  process.exit(1);
}
console.log();

// 3. Read and analyze .env file content
console.log('3. ENV FILE CONTENT ANALYSIS:');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   📄 Raw file contents:');
  console.log('   ' + '='.repeat(50));
  console.log(envContent.split('\n').map(line => `   ${line}`).join('\n'));
  console.log('   ' + '='.repeat(50));
  console.log();
  
  // Parse for API key
  const lines = envContent.split('\n');
  let apiKeyLine = null;
  let apiKey = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('OPENWEATHER_API_KEY=')) {
      apiKeyLine = i + 1;
      apiKey = line.split('=')[1];
      break;
    }
  }
  
  console.log('4. API KEY ANALYSIS:');
  if (apiKeyLine) {
    console.log(`   ✅ API key line found at line ${apiKeyLine}`);
    console.log(`   📝 Raw value: "${apiKey}"`);
    console.log(`   📏 Length: ${apiKey ? apiKey.length : 0} characters`);
    
    if (!apiKey || apiKey.trim() === '') {
      console.log('   ❌ API key is empty!');
    } else if (apiKey === 'your_openweathermap_api_key_here') {
      console.log('   ❌ API key still has placeholder value!');
    } else if (apiKey.length < 30) {
      console.log('   ⚠️  API key seems too short (expected ~32 chars)');
    } else {
      console.log(`   ✅ API key looks valid: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
    }
  } else {
    console.log('   ❌ OPENWEATHER_API_KEY line not found!');
  }
  console.log();
  
} catch (error) {
  console.log(`   ❌ Error reading .env file: ${error.message}`);
}

// 4. Test dotenv loading
console.log('5. TESTING DOTENV LOADING:');
try {
  // Clear any existing env vars
  delete process.env.OPENWEATHER_API_KEY;
  
  // Test different loading methods
  console.log('   🧪 Testing method 1: dotenv.config()');
  require('dotenv').config({ path: envPath });
  console.log(`   Result: ${process.env.OPENWEATHER_API_KEY ? 'SUCCESS' : 'FAILED'}`);
  if (process.env.OPENWEATHER_API_KEY) {
    console.log(`   Value: ${process.env.OPENWEATHER_API_KEY.substring(0, 8)}...${process.env.OPENWEATHER_API_KEY.substring(process.env.OPENWEATHER_API_KEY.length - 4)}`);
  }
  
} catch (error) {
  console.log(`   ❌ Error loading with dotenv: ${error.message}`);
}
console.log();

// 5. Check for common issues
console.log('6. COMMON ISSUES CHECK:');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for BOM
  if (envContent.charCodeAt(0) === 0xFEFF) {
    console.log('   ⚠️  File has BOM (Byte Order Mark) - this can cause issues');
  }
  
  // Check for Windows line endings
  if (envContent.includes('\r\n')) {
    console.log('   ℹ️  File uses Windows line endings (\\r\\n) - this is OK');
  }
  
  // Check for quotes around values
  if (envContent.includes('OPENWEATHER_API_KEY="')) {
    console.log('   ⚠️  API key has quotes - remove them!');
  }
  
  // Check for spaces around equals
  if (envContent.includes('OPENWEATHER_API_KEY =') || envContent.includes('= ')) {
    console.log('   ⚠️  Spaces around equals sign - remove them!');
  }
  
  console.log('   ✅ Common issues check completed');
  
} catch (error) {
  console.log(`   ❌ Error checking for issues: ${error.message}`);
}
console.log();

console.log('🎯 NEXT STEPS:');
console.log('1. Fix any issues shown above');
console.log('2. Restart your backend server completely');
console.log('3. Look for the debug output in server startup');
console.log();

// 6. Test API key with OpenWeatherMap
const apiKey = process.env.OPENWEATHER_API_KEY;
if (apiKey && apiKey !== 'your_openweathermap_api_key_here' && apiKey.trim() !== '') {
  console.log('7. TESTING API KEY WITH OPENWEATHERMAP:');
  const https = require('https');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`;
  
  console.log('   🔄 Making test request...');
  
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const weather = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log('   ✅ API key works! Test successful');
          console.log(`   📍 Test: ${weather.name}, ${weather.sys.country} - ${weather.main.temp}°C`);
        } else {
          console.log(`   ❌ API error (${res.statusCode}): ${weather.message}`);
          if (res.statusCode === 401) {
            console.log('   💡 Your API key might be invalid or inactive');
          }
        }
      } catch (e) {
        console.log('   ❌ Error parsing response');
      }
    });
  }).on('error', (error) => {
    console.log(`   ❌ Network error: ${error.message}`);
  });
}
