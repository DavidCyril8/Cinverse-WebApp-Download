const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// Serve static files if needed
app.use(express.static('public'));

// Main route with animated download page
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Cinverse - Download</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        /* Animated background particles */
        .particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
        }

        .particle {
            position: absolute;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            animation: float 20s infinite linear;
        }

        @keyframes float {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
        }

        .container {
            position: relative;
            z-index: 1;
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            box-shadow: 0 25px 45px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.1);
            animation: slideUp 0.6s ease;
            max-width: 500px;
            width: 90%;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Logo/Icon */
        .logo {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 25px;
            margin: 0 auto 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
            animation: pulse 2s infinite;
            box-shadow: 0 10px 30px rgba(102,126,234,0.3);
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
                box-shadow: 0 10px 30px rgba(102,126,234,0.3);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 15px 40px rgba(102,126,234,0.5);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 10px 30px rgba(102,126,234,0.3);
            }
        }

        h1 {
            color: white;
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .version {
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            margin-bottom: 30px;
        }

        /* Download button */
        .download-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            padding: 15px 40px;
            font-size: 18px;
            font-weight: 600;
            color: white;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 20px 0;
            box-shadow: 0 5px 20px rgba(102,126,234,0.4);
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }

        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102,126,234,0.5);
        }

        /* Loading spinner */
        .spinner-container {
            margin: 30px 0;
            display: none;
        }

        .spinner {
            width: 60px;
            height: 60px;
            margin: 0 auto 15px;
            position: relative;
        }

        .spinner:before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #667eea;
            border-right-color: #764ba2;
            animation: spin 1s linear infinite;
        }

        .spinner:after {
            content: '';
            position: absolute;
            width: 70%;
            height: 70%;
            top: 15%;
            left: 15%;
            border-radius: 50%;
            border: 3px solid transparent;
            border-bottom-color: #667eea;
            border-left-color: #764ba2;
            animation: spin 0.8s linear infinite reverse;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Progress bar */
        .progress-container {
            width: 80%;
            margin: 20px auto;
            display: none;
        }

        .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
            overflow: hidden;
        }

        .progress-fill {
            width: 0%;
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 4px;
            transition: width 0.3s ease;
            position: relative;
            animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }

        .progress-text {
            color: rgba(255,255,255,0.8);
            font-size: 12px;
            margin-top: 8px;
        }

        /* Checkmark animation */
        .checkmark-container {
            margin: 30px 0;
            display: none;
        }

        .checkmark {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-shadow: 0 10px 30px rgba(76,175,80,0.3);
        }

        .checkmark svg {
            width: 45px;
            height: 45px;
            stroke: white;
            stroke-width: 3;
            fill: none;
            animation: draw 0.5s ease 0.2s both;
        }

        @keyframes scaleIn {
            from {
                transform: scale(0);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        @keyframes draw {
            from {
                stroke-dasharray: 100;
                stroke-dashoffset: 100;
            }
            to {
                stroke-dasharray: 100;
                stroke-dashoffset: 0;
            }
        }

        /* Status text */
        .status-text {
            color: white;
            font-size: 18px;
            font-weight: 500;
            margin: 15px 0;
        }

        .sub-text {
            color: rgba(255,255,255,0.6);
            font-size: 14px;
            margin: 10px 0;
        }

        /* Features grid */
        .features {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .feature {
            background: rgba(255,255,255,0.05);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            color: rgba(255,255,255,0.7);
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .feature:before {
            content: "✓";
            color: #4CAF50;
        }

        /* Manual link */
        .manual-link {
            margin-top: 30px;
            font-size: 12px;
            opacity: 0.5;
            transition: opacity 0.3s;
        }

        .manual-link a {
            color: white;
            text-decoration: none;
            border-bottom: 1px dashed rgba(255,255,255,0.3);
        }

        .manual-link:hover {
            opacity: 0.8;
        }

        /* Error state */
        .error {
            display: none;
            background: rgba(244,67,54,0.2);
            border: 1px solid rgba(244,67,54,0.5);
            padding: 15px;
            border-radius: 10px;
            margin-top: 20px;
        }

        .error-message {
            color: #ff6b6b;
            font-size: 14px;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body>
    <div class="particles" id="particles"></div>
    
    <div class="container">
        <div class="logo">
            📱
        </div>
        
        <h1>Cinverse</h1>
        <div class="version">Version 2.0.0</div>
        
        <!-- Initial State -->
        <div id="initialState">
            <button class="download-btn" onclick="startDownload()">
                <span>📥</span> Download Now
            </button>
            <div class="features">
                <div class="feature">Fast Download</div>
                <div class="feature">Secure</div>
                <div class="feature">Free</div>
            </div>
        </div>
        
        <!-- Loading State -->
        <div id="loadingState" style="display: none;">
            <div class="spinner-container" style="display: block;">
                <div class="spinner"></div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">Initializing download...</div>
            </div>
            <div class="status-text">Preparing Cinverse</div>
            <div class="sub-text">Please wait while we prepare your download</div>
        </div>
        
        <!-- Success State -->
        <div id="successState" style="display: none;">
            <div class="checkmark-container" style="display: block;">
                <div class="checkmark">
                    <svg viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>
            <div class="status-text">Download Started!</div>
            <div class="sub-text">Cinverse.apk is being saved to your device</div>
            <div class="features">
                <div class="feature">Installation instructions sent</div>
            </div>
        </div>
        
        <!-- Error State -->
        <div id="errorState" class="error" style="display: none;">
            <div class="error-message" id="errorMessage"></div>
        </div>
        
        <div class="manual-link">
            ⚡ Having issues? <a href="#" onclick="manualDownload()">Click here to download manually</a>
        </div>
    </div>

    <script>
        // Generate floating particles
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                const size = Math.random() * 5 + 2;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDuration = Math.random() * 10 + 10 + 's';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particlesContainer.appendChild(particle);
            }
        }
        
        // Simulate progress
        let progress = 0;
        let progressInterval;
        
        function startProgress() {
            progress = 0;
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            
            progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.random() * 10;
                    if (progress > 90) progress = 90;
                    progressFill.style.width = progress + '%';
                    progressText.innerHTML = 'Downloading... ' + Math.floor(progress) + '%';
                }
            }, 200);
        }
        
        function completeProgress() {
            clearInterval(progressInterval);
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            progressFill.style.width = '100%';
            progressText.innerHTML = 'Complete!';
        }
        
        async function startDownload() {
            // Hide initial, show loading
            document.getElementById('initialState').style.display = 'none';
            document.getElementById('loadingState').style.display = 'block';
            
            startProgress();
            
            try {
                // Request the file through our server
                const response = await fetch('/download');
                
                if (!response.ok) throw new Error('Download failed');
                
                // Get the blob
                const blob = await response.blob();
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'Cinverse.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                // Complete progress and show success
                completeProgress();
                
                setTimeout(() => {
                    document.getElementById('loadingState').style.display = 'none';
                    document.getElementById('successState').style.display = 'block';
                    
                    // Auto hide success after 5 seconds and show initial
                    setTimeout(() => {
                        document.getElementById('successState').style.display = 'none';
                        document.getElementById('initialState').style.display = 'block';
                    }, 5000);
                }, 500);
                
            } catch (error) {
                console.error('Download error:', error);
                clearInterval(progressInterval);
                document.getElementById('loadingState').style.display = 'none';
                document.getElementById('errorState').style.display = 'block';
                document.getElementById('errorMessage').innerHTML = 'Download failed. Please use manual download link below.';
                
                setTimeout(() => {
                    document.getElementById('errorState').style.display = 'none';
                    document.getElementById('initialState').style.display = 'block';
                }, 4000);
            }
        }
        
        function manualDownload() {
            window.location.href = '/download';
        }
        
        // Initialize particles
        createParticles();
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Download endpoint that serves the file
app.get('/download', async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://files.catbox.moe/o4875t.apk',
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Cinverse.apk"');
    res.setHeader('Content-Length', response.headers['content-length']);
    
    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Download URL: http://localhost:${PORT}`);
});
