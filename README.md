# How to start the applications 
    `
    npm install
    npm start
    `
# Test the application
    url : localhost:3000/proxy

# Test Result
    API Proxy server running on http://localhost:3000
    GET /proxy 200 527.321 ms - 1216
    Serving from cache
    GET /proxy 304 2.966 ms - -
    Serving from cache
    GET /proxy 304 1.329 ms - -
    Serving from cache
    GET /proxy 304 0.919 ms - -
    Serving from cache
    GET /proxy 304 0.898 ms - -
    GET /proxy 429 1.285 ms - 49

# Sample Env File
    API_URL=https://api.github.com/users/octocat 
    RATE_LIMIT=5 
    RATE_LIMIT_DURATION=60 
    CACHE_DURATION=300 
    API_KEY=your-secret-api-key 
    PORT=9000 
