const express = require('express');
const axios = require('axios');
const app = express();

app.get('/', async (req, res) => {
  try {
    // Download the file from catbox
    const response = await axios({
      method: 'get',
      url: 'https://files.catbox.moe/o4875t.apk',
      responseType: 'stream'
    });
    
    // Set headers to force download with correct filename
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Cinverse.apk"');
    res.setHeader('Content-Length', response.headers['content-length']);
    
    // Pipe the file to response
    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error downloading file');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Download URL: http://localhost:3000');
});
