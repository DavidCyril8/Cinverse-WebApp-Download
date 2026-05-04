const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Configuration
const APK_REMOTE_URL = process.env.APK_URL || 'https://files.catbox.moe/o4875t.apk';
const LOCAL_APK_PATH = path.join(__dirname, 'cached_app.apk');
const APP_NAME = process.env.APP_NAME || 'Cinverse';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

// Function to download and cache the APK locally
async function downloadAndCacheAPK() {
  console.log('📥 Downloading APK from remote URL...');
  
  try {
    const response = await axios({
      method: 'get',
      url: APK_REMOTE_URL,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(LOCAL_APK_PATH);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('✅ APK downloaded and cached successfully!');
        console.log(`📁 Saved to: ${LOCAL_APK_PATH}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Failed to download APK:', error.message);
    throw error;
  }
}

// Check if local APK exists, if not download it
async function ensureLocalAPK() {
  try {
    await fs.promises.access(LOCAL_APK_PATH);
    console.log('📱 Local APK already exists, using cached version');
    return true;
  } catch (error) {
    console.log('⚠️ Local APK not found, downloading...');
    await downloadAndCacheAPK();
    return true;
  }
}

// Serve static files if needed
app.use(express.static('public'));
app.use(express.json());

// ============ NEW: Direct API Download Link Endpoint ============
app.get('/api/download-link', (req, res) => {
  try {
    // Get file size
    const stats = fs.statSync(LOCAL_APK_PATH);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Generate direct download URL
    const directDownloadUrl = `${SERVER_URL}/download`;
    
    // Return JSON with download info
    res.json({
      success: true,
      app_name: APP_NAME,
      download_url: directDownloadUrl,
      file_name: `${APP_NAME}.apk`,
      file_size: `${fileSizeInMB} MB`,
      file_size_bytes: stats.size,
      server: SERVER_URL,
      expires: null, // Never expires (local file)
      message: "This URL can be used on any website for direct download"
    });
    
    console.log(`📡 API download link requested by ${req.ip}`);
    
  } catch (error) {
    res.status(404).json({
      success: false,
      error: "APK file not found on server",
      message: "Please contact support"
    });
  }
});

// ============ NEW: Get multiple link formats (for different uses) ============
app.get('/api/links', (req, res) => {
  try {
    const stats = fs.statSync(LOCAL_APK_PATH);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    res.json({
      success: true,
      app_name: APP_NAME,
      links: {
        direct_download: `${SERVER_URL}/download`,
        html_page: SERVER_URL,
        embed_code: `<a href="${SERVER_URL}/download" download="${APP_NAME}.apk">Download ${APP_NAME}</a>`,
        markdown: `[Download ${APP_NAME}](${SERVER_URL}/download)`,
        html_button: `<button onclick="window.location.href='${SERVER_URL}/download'" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Download ${APP_NAME}</button>`
      },
      file_info: {
        name: `${APP_NAME}.apk`,
        size: `${fileSizeInMB} MB`,
        size_bytes: stats.size
      }
    });
    
  } catch (error) {
    res.status(404).json({
      success: false,
      error: "APK file not found"
    });
  }
});

// ============ Main route with animated download page ============
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Download ${APP_NAME}</title>
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
        <div class="message" id="message">Preparing ${APP_NAME}...</div>
        <div class="sub-message" id="subMessage"></div>
        <div class="manual-link">
            ⚡ Having issues? <a href="/download" id="manualLink">Click here to download manually</a>
        </div>
    </div>

    <script>
        const APP_NAME = '${APP_NAME}';
        const DOWNLOAD_DELAY = ${process.env.DOWNLOAD_DELAY || 1500};
        
        window.onload = function() {
            setTimeout(() => {
                // Start download from our server (serves local cached file)
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

// Download endpoint that serves the LOCAL cached file
app.get('/download', async (req, res) => {
  try {
    // Check if local file exists
    if (!fs.existsSync(LOCAL_APK_PATH)) {
      console.error('❌ Local APK not found!');
      return res.status(404).json({ error: 'App file not found on server. Please contact support.' });
    }

    // Get file stats
    const stat = fs.statSync(LOCAL_APK_PATH);
    
    // Set headers for APK download
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', `attachment; filename="${APP_NAME}.apk"`);
    res.setHeader('Content-Length', stat.size);
    
    // Create read stream from local file and pipe to response
    const fileStream = fs.createReadStream(LOCAL_APK_PATH);
    fileStream.pipe(res);
    
    console.log(`📱 Serving cached APK to ${req.ip} - ${APP_NAME}.apk (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    
    fileStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to send file' });
      }
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed. Please try again.' });
  }
});

// Optional: Endpoint to manually refresh the cached APK
app.post('/refresh-cache', async (req, res) => {
  try {
    console.log('🔄 Manually refreshing APK cache...');
    await downloadAndCacheAPK();
    res.json({ success: true, message: 'APK cache refreshed successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server after ensuring APK is cached
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Ensure local APK exists before starting server
    await ensureLocalAPK();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 Download URL: http://localhost:${PORT}`);
      console.log(`💾 Cached APK location: ${LOCAL_APK_PATH}`);
      console.log(`\n📡 API Endpoints:`);
      console.log(`   → Get download link: http://localhost:${PORT}/api/download-link`);
      console.log(`   → Get all links/formats: http://localhost:${PORT}/api/links`);
      console.log(`   → Direct download: http://localhost:${PORT}/download`);
      console.log(`   → Refresh cache: POST /refresh-cache`);
      console.log(`\n💡 Usage on other websites:`);
      console.log(`   Fetch ${SERVER_URL}/api/download-link to get the direct URL\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
