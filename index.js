const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Main route with env variables injected
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download ${process.env.APP_NAME}</title>
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
            background: linear-gradient(135deg, ${process.env.PRIMARY_COLOR} 0%, ${process.env.SECONDARY_COLOR} 100%);
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
        <div class="message" id="message">Preparing ${process.env.APP_NAME}...</div>
        <div class="sub-message" id="subMessage"></div>
        <div class="manual-link">
            ⚡ Having issues? <a href="${process.env.APK_URL}" id="manualLink">Click here to download manually</a>
        </div>
    </div>

    <script>
        const APK_URL = '${process.env.APK_URL}';
        const FILENAME = '${process.env.FILENAME}';
        const DOWNLOAD_DELAY = ${process.env.DOWNLOAD_DELAY};
        const APP_NAME = '${process.env.APP_NAME}';
        
        window.onload = function() {
            setTimeout(() => {
                // Start download
                const link = document.createElement('a');
                link.href = APK_URL;
                link.download = FILENAME;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Serving: ${process.env.APP_NAME}`);
  console.log(`APK URL: ${process.env.APK_URL}`);
});
