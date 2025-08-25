// Test script to verify GitLab connection logic
const testConnection = async () => {
    // Simulate the settings we're getting from Obsidian
    const settings = {
        gitlabUrl: 'https://gitlab.com',
        gitlabToken: 'glpat-pbewAnG2hqQJs', // This is the token from your settings
        defaultProjectId: '73724923'
    };

    console.log('Testing connection with settings:', {
        gitlabUrl: settings.gitlabUrl,
        gitlabToken: settings.gitlabToken ? `${settings.gitlabToken.substring(0, 10)}...` : 'empty',
        defaultProjectId: settings.defaultProjectId
    });

    // Validate and sanitize inputs (same logic as in the plugin)
    const cleanToken = settings.gitlabToken.trim();
    const cleanUrl = settings.gitlabUrl.trim();
    const cleanProjectId = settings.defaultProjectId.toString().trim();

    // Check for non-ASCII characters in token
    if (!/^[\x00-\x7F]*$/.test(cleanToken)) {
        console.error('❌ Token contains non-ASCII characters:', cleanToken);
        return;
    }

    console.log('✅ Input validation passed');

    try {
        const headers = {
            'Authorization': `Bearer ${cleanToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        console.log('Request headers:', headers);

        const response = await fetch(`${cleanUrl}/api/v4/projects/${cleanProjectId}`, {
            method: 'GET',
            headers: headers
        });

        if (response.ok) {
            console.log('✅ GitLab connection successful!');
            const data = await response.json();
            console.log('Project name:', data.name);
        } else {
            console.log(`❌ GitLab connection failed: ${response.status} ${response.statusText}`);
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.log('Error details:', errorData);
        }
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        console.error('Full error:', error);
    }
};

// Run the test
console.log('🚀 Starting GitLab connection test...');
testConnection();
