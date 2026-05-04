const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
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
    <title>Download ${process.env.APP_NAME || 'Cinverse'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, ${process.env.PRIMARY_COLOR || '#667eea'} 0%, ${process.env.SECONDARY_COLOR || '#764ba2'} 100%);
            color: white;
        }

        .container {
            text-align: center;
            padding: 20px;
            animation: fadeIn 0.5s ease;
        }

        .spinner {
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255,255,255,0.3);
            border-top: 4px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        .checkmark {
            width: 100px;
            height: 100px;
            margin: 0 auto 20px;
            display: none;
        }

        .checkmark-circle {
            width: 100px;
            height: 100px;
            background: #4CAF50;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .checkmark-check {
            width: 50px;
            height: 25px;
            border-left: 5px solid white;
            border-bottom: 5px solid white;
            transform: rotate(-45deg);
            margin-top: -8px;
            animation: drawCheck 0.4s ease 0.2s both;
        }

        .message {
            font-size: 24px;
            margin-top: 20px;
            font-weight: bold;
        }

        .sub-message {
            font-size: 14px;
            margin-top: 10px;
            opacity: 0.8;
        }

        .manual-link {
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.7;
        }

        .manual-link a {
            color: white;
            text-decoration: underline;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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

        @keyframes drawCheck {
            from {
                width: 0;
                height: 0;
                opacity: 0;
            }
            to {
                width: 50px;
                height: 25px;
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="spinner" class="spinner"></div>
        <div id="checkmark" class="checkmark">
            <div class="checkmark-circle">
                <div class="checkmark-check"></div>
            </div>
        </div>
        <div class="message" id="message">Preparing ${process.env.APP_NAME || 'Cinverse'}...</div>
        <div class="sub-message" id="subMessage"></div>
        <div class="manual-link">
            ⚡ Having issues? <a href="/download" id="manualLink">Click here to download manually</a>
        </div>
    </div>

    <script>
        const APP_NAME = '${process.env.APP_NAME || 'Cinverse'}';
        const DOWNLOAD_DELAY = ${process.env.DOWNLOAD_DELAY || 1500};
        
        window.onload = function() {
            setTimeout(() => {
                // Start download from our proxy endpoint (this gives correct filename)
                window.location.href = '/download';
                
                // Show check mark
                document.getElementById('spinner').style.display = 'none';
                document.getElementById('checkmark').style.display = 'block';
                document.getElementById('message').innerHTML = '✓ Download Started!';
                document.getElementById('subMessage').innerHTML = \`\${APP_NAME}.apk is being saved to your device\`;
            }, DOWNLOAD_DELAY);
        };
    </script>
</body>
</html>
  `;
  
  res.send(html);
});

// Download endpoint that serves the file with correct filename
app.get('/download', async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url: process.env.APK_URL || 'https://files.catbox.moe/o4875t.apk',
      responseType: 'stream'
    });
    
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Cinverse.apk"');
    res.setHeader('Content-Length', response.headers['content-length']);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Download URL: http://localhost:${PORT}`);
});
