// Test script to verify backend is working correctly
// Note: This uses Node.js built-in fetch (available in Node 18+)
// If you're on an older version, install node-fetch: npm install node-fetch

const BASE_URL = 'http://localhost:5000';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testHealthCheck() {
  log('\n📋 Testing Health Check Endpoint...', 'blue');
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/health`);
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);
    
    const data = await response.json();
    
    log(`   Response time: ${responseTime}s`, 'blue');
    log(`   HTTP Status: ${response.status}`, response.ok ? 'green' : 'red');
    
    if (response.ok && data.status === 'ok') {
      log('✅ Health check passed!', 'green');
      log(`   Status: ${data.status}`, 'green');
      log(`   Message: ${data.message}`, 'green');
      log(`   API Key configured: ${data.hasApiKey ? 'Yes ✅' : 'No ⚠️'}`, data.hasApiKey ? 'green' : 'yellow');
      
      if (!data.hasApiKey) {
        log('   ⚠️  Warning: Gemini API key not found in environment', 'yellow');
        log('   ⚠️  Chat functionality may not work without API key', 'yellow');
      }
      return true;
    } else {
      log('❌ Health check failed!', 'red');
      log(`   Response: ${JSON.stringify(data, null, 2)}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Health check error:', 'red');
    log(`   ${error.message}`, 'red');
    log('   Make sure the server is running on port 5000', 'yellow');
    
    // Detailed error analysis
    if (error.message.includes('ECONNREFUSED')) {
      log('   📝 Analysis: Connection refused on port 5000', 'yellow');
      log('   📝 Solution: Start server with "npm run server"', 'yellow');
    } else if (error.message.includes('ENOTFOUND')) {
      log('   📝 Analysis: DNS resolution failed', 'yellow');
      log('   📝 Solution: Check your network connection', 'yellow');
    }
    return false;
  }
}

async function testChatEndpoint(prompt, expectedFormat = 'object', expectedStatus = null) {
  log(`\n📋 Testing Chat Endpoint (${expectedFormat} format)...`, 'blue');
  log(`   Prompt: "${prompt}"`, 'blue');
  
  try {
    let body;
    let description;
    
    if (expectedFormat === 'object') {
      // Correct format: { prompt: "..." }
      body = JSON.stringify({ prompt });
      description = 'Object format: { prompt: "..." }';
    } else {
      // Incorrect format: just the string
      body = JSON.stringify(prompt);
      description = 'String format: "..."';
    }
    
    log(`   Sending: ${description}`, 'blue');
    if (expectedStatus) {
      log(`   Expected status: ${expectedStatus}`, 'blue');
    }
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    const data = await response.json();
    
    log(`   Response time: ${responseTime}s`, 'blue');
    log(`   HTTP Status: ${response.status}`, response.ok ? 'green' : 'red');
    
    // If we have an expected status, check against it
    if (expectedStatus !== null) {
      if (response.status === expectedStatus) {
        log(`✅ Chat endpoint correctly returned ${expectedStatus}!`, 'green');
        if (data.error) {
          log(`   Error message: "${data.error}"`, 'green');
        }
        return true;
      } else {
        log(`❌ Chat endpoint returned ${response.status}, expected ${expectedStatus}!`, 'red');
        log(`   Error: ${data.error || JSON.stringify(data)}`, 'red');
        return false;
      }
    }
    
    // Otherwise, check if response is successful (200 OK)
    if (response.ok) {
      log('✅ Chat endpoint responded successfully!', 'green');
      if (data.reply) {
        const replyLength = data.reply.length;
        log(`   Reply length: ${replyLength} characters`, 'green');
        log(`   Reply preview: ${data.reply.substring(0, 100)}${replyLength > 100 ? '...' : ''}`, 'green');
      } else {
        log('   ⚠️  Warning: Response has no "reply" field', 'yellow');
      }
      return true;
    } else {
      log('❌ Chat endpoint failed!', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${data.error || JSON.stringify(data)}`, 'red');
      
      // Analysis of failure
      if (response.status === 400) {
        log('   📝 Analysis: Bad request - likely input validation issue', 'yellow');
      } else if (response.status === 500) {
        log('   📝 Analysis: Server error - check Gemini API or server logs', 'yellow');
      }
      return false;
    }
  } catch (error) {
    log('❌ Chat endpoint error:', 'red');
    log(`   ${error.message}`, 'red');
    
    // Network error analysis
    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
      log('   📝 Analysis: Connection refused - server may not be running', 'yellow');
    } else if (error.message.includes('JSON')) {
      log('   📝 Analysis: Invalid JSON response from server', 'yellow');
    }
    return false;
  }
}

async function testInvalidInputs() {
  log('\n📋 Testing Invalid Inputs...', 'blue');
  
  const testCases = [
    {
      name: 'Empty body',
      body: null, // No body sent
      expectedStatus: 400,
    },
    {
      name: 'Missing prompt field',
      body: JSON.stringify({}),
      expectedStatus: 400,
    },
    {
      name: 'Empty prompt string',
      body: JSON.stringify({ prompt: '' }),
      expectedStatus: 400,
    },
    {
      name: 'Whitespace-only prompt',
      body: JSON.stringify({ prompt: '   ' }),
      expectedStatus: 400,
    },
    {
      name: 'String instead of object (invalid format)',
      body: JSON.stringify('test string'),
      expectedStatus: 400,
    },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    try {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      // Only add body if it's not null
      if (testCase.body !== null) {
        fetchOptions.body = testCase.body;
      }
      // Note: For empty body test, we send Content-Type but no body
      // This tests how the server handles missing body with JSON content type
      
      const response = await fetch(`${BASE_URL}/api/chat`, fetchOptions);
      
      const data = await response.json();
      
      if (response.status === testCase.expectedStatus) {
        log(`✅ ${testCase.name}: Correctly rejected (${response.status})`, 'green');
        if (data.error) {
          log(`   Error message: "${data.error}"`, 'green');
        }
        passed++;
      } else {
        log(`❌ ${testCase.name}: Expected ${testCase.expectedStatus}, got ${response.status}`, 'red');
        log(`   Response: ${JSON.stringify(data)}`, 'red');
        log(`   📝 Analysis: Backend should reject this input but didn't`, 'yellow');
        failed++;
      }
    } catch (error) {
      log(`❌ ${testCase.name}: Error - ${error.message}`, 'red');
      log(`   📝 Analysis: Network or parsing error occurred`, 'yellow');
      failed++;
    }
  }
  
  log(`\n   Results: ${passed} passed, ${failed} failed`, passed === testCases.length ? 'green' : 'yellow');
  return failed === 0;
}

async function runAllTests() {
  log('🚀 Starting Backend Tests\n', 'blue');
  log('='.repeat(50), 'blue');
  
  const results = {
    healthCheck: false,
    validChat: false,
    invalidFormat: false,
    invalidInputs: false,
    startTime: Date.now(),
  };
  
  // Test 1: Health check
  log('\n━━━ TEST 1: Health Check ━━━', 'blue');
  results.healthCheck = await testHealthCheck();
  if (!results.healthCheck) {
    log('\n❌ Server is not running or not accessible. Please start the server first.', 'red');
    log('   Run: npm run server', 'yellow');
    log('\n📊 ANALYSIS:', 'yellow');
    log('   • Server connection failed', 'red');
    log('   • Check if server is running on port 5000', 'yellow');
    log('   • Verify no other process is using port 5000', 'yellow');
    process.exit(1);
  }
  
  // Test 2: Valid chat request (correct format)
  log('\n━━━ TEST 2: Valid Chat Request (Correct Format) ━━━', 'blue');
  results.validChat = await testChatEndpoint('Hello, this is a test message', 'object');
  
  // Test 3: Invalid format test (what old frontend would send)
  log('\n━━━ TEST 3: Invalid Format Test ━━━', 'blue');
  log('   (Testing what happens with wrong format - should return 400)', 'yellow');
  // This should return 400 Bad Request, not 500 Internal Server Error
  results.invalidFormat = await testChatEndpoint('Hello, this is a test message', 'string', 400);
  
  // Test 4: Invalid inputs
  log('\n━━━ TEST 4: Invalid Input Validation ━━━', 'blue');
  results.invalidInputs = await testInvalidInputs();
  
  // Calculate total time
  const totalTime = ((Date.now() - results.startTime) / 1000).toFixed(2);
  
  // Final Analysis Report
  log('\n' + '='.repeat(50), 'blue');
  log('📊 FINAL ANALYSIS REPORT', 'blue');
  log('='.repeat(50), 'blue');
  
  // Count only boolean test results (exclude startTime which is a number)
  const passedTests = [
    results.healthCheck,
    results.validChat,
    results.invalidFormat,
    results.invalidInputs
  ].filter(v => v === true).length;
  const totalTests = 4;
  
  log(`\n⏱️  Total Test Time: ${totalTime}s`, 'blue');
  log(`\n📈 Test Results: ${passedTests}/${totalTests} test suites passed`, 
      passedTests === totalTests ? 'green' : 'yellow');
  
  log('\n📋 Detailed Breakdown:', 'blue');
  log(`   ${results.healthCheck ? '✅' : '❌'} Health Check: ${results.healthCheck ? 'PASSED' : 'FAILED'}`, 
      results.healthCheck ? 'green' : 'red');
  log(`   ${results.validChat ? '✅' : '❌'} Valid Chat Request: ${results.validChat ? 'PASSED' : 'FAILED'}`, 
      results.validChat ? 'green' : 'red');
  log(`   ${results.invalidFormat ? '✅' : '❌'} Invalid Format Rejection: ${results.invalidFormat ? 'PASSED' : 'FAILED'}`, 
      results.invalidFormat ? 'green' : 'red');
  log(`   ${results.invalidInputs ? '✅' : '❌'} Invalid Input Validation: ${results.invalidInputs ? 'PASSED' : 'FAILED'}`, 
      results.invalidInputs ? 'green' : 'red');
  
  // Overall Status
  log('\n🎯 Overall Status:', 'blue');
  if (passedTests === totalTests) {
    log('   ✅ ALL TESTS PASSED - Backend is working correctly!', 'green');
    log('   ✅ Input validation is working as expected', 'green');
    log('   ✅ API endpoints are responding correctly', 'green');
    log('   ✅ Ready for production use!', 'green');
  } else if (results.healthCheck && results.validChat) {
    log('   ⚠️  PARTIAL SUCCESS - Core functionality works', 'yellow');
    log('   ⚠️  Some validation tests failed - review above', 'yellow');
  } else {
    log('   ❌ CRITICAL ISSUES FOUND', 'red');
    log('   ❌ Backend needs attention - see errors above', 'red');
  }
  
  // Recommendations (only show if there are issues)
  if (passedTests < totalTests) {
    log('\n💡 Recommendations:', 'blue');
    if (!results.validChat) {
      log('   • Check if Gemini API key is configured correctly', 'yellow');
      log('   • Verify network connectivity to Gemini API', 'yellow');
    }
    if (!results.invalidFormat) {
      log('   • Backend should reject invalid format (string instead of object)', 'yellow');
      log('   • Consider adding validation for request body structure', 'yellow');
    }
    if (!results.invalidInputs) {
      log('   • Review input validation logic in server.js', 'yellow');
      log('   • Ensure all edge cases are handled', 'yellow');
    }
  }
  
  log('\n✨ Testing complete!\n', 'blue');
  
  // Exit with appropriate code
  process.exit(passedTests === totalTests ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  log('\n❌ Fatal Error:', 'red');
  log(`   ${error.message}`, 'red');
  log(`   ${error.stack}`, 'red');
  process.exit(1);
});

