// Test file to check Conversation API endpoints
// Run this in browser console to test API endpoints

// Import conversationAPI (adjust path as needed)
import { conversationAPI } from './services/conversationAPI.js';

// Test function
async function testConversationAPI() {
    console.log('🧪 Testing Conversation API endpoints...');

    try {
        // Test 1: Get Scenarios
        console.log('\n1. Testing GET /scenarios...');
        const scenariosResponse = await conversationAPI.getScenarios({
            level: 'N5',
            limit: 5
        });
        console.log('✅ Scenarios response:', scenariosResponse);

        // Test 2: Get Dialogs
        console.log('\n2. Testing GET /dialogs...');
        const dialogsResponse = await conversationAPI.getDialogs({
            level: 'N5',
            limit: 5
        });
        console.log('✅ Dialogs response:', dialogsResponse);

        // Test 3: Start AI Conversation (if we have scenarios)
        if (scenariosResponse.success && scenariosResponse.data.scenarios.length > 0) {
            console.log('\n3. Testing POST /ai/start...');
            const firstScenario = scenariosResponse.data.scenarios[0];
            const conversationResponse = await conversationAPI.startConversation(
                firstScenario._id,
                'N5'
            );
            console.log('✅ Start conversation response:', conversationResponse);

            // Test 4: Send Message (if conversation started)
            if (conversationResponse.success) {
                console.log('\n4. Testing POST /ai/chat...');
                const chatResponse = await conversationAPI.sendMessage(
                    conversationResponse.data.conversationId,
                    'こんにちは'
                );
                console.log('✅ Chat response:', chatResponse);

                // Test 5: End Conversation
                console.log('\n5. Testing POST /ai/end...');
                const endResponse = await conversationAPI.endConversation(
                    conversationResponse.data.conversationId
                );
                console.log('✅ End conversation response:', endResponse);
            }
        }

        console.log('\n🎉 All API tests completed!');

    } catch (error) {
        console.error('❌ API Test Error:', error);
        console.error('Error details:', error.message);

        // Check if it's a network error
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 Suggestion: Backend server might not be running on localhost:3000');
            console.log('💡 Please start the backend server first');
        }

        // Check if it's an auth error
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            console.log('\n💡 Suggestion: Token might be missing or expired');
            console.log('💡 Please check localStorage for token');
        }
    }
}

// Test UI functionality
function testUIFunctionality() {
    console.log('\n🧪 Testing UI functionality...');

    // Check if conversationAPI is available
    if (typeof conversationAPI !== 'undefined') {
        console.log('✅ conversationAPI is available');

        // Check token
        const token = localStorage.getItem('token');
        console.log('🔑 Token status:', token ? 'Available' : 'Not found');

        // Check if we can set token
        try {
            conversationAPI.setToken('test-token');
            console.log('✅ Can set token');
        } catch (error) {
            console.log('❌ Cannot set token:', error);
        }

    } else {
        console.log('❌ conversationAPI is not available');
    }

    // Check if DOM elements exist
    const conversationPage = document.querySelector('[data-testid="conversation-page"]') ||
        document.querySelector('.conversation-container') ||
        document.querySelector('main');

    if (conversationPage) {
        console.log('✅ Conversation page DOM found');
    } else {
        console.log('❌ Conversation page DOM not found');
    }
}

// Run tests
console.log('🚀 Starting Conversation API and UI tests...');
testUIFunctionality();
testConversationAPI();

// Export for manual testing
window.testConversationAPI = testConversationAPI;
window.testUIFunctionality = testUIFunctionality;
