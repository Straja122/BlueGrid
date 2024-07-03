const express = require('express');
const https = require('https');
const JSONStream = require('JSONStream');
const { addItem, getIpAddressFromUrl } = require('./helper/responseHelper');

const app = express();
const port = 3000;
const testUrl = 'https://rest-test-eight.vercel.app/api/test';

// Endpoint to fetch data from another REST API
app.get('/api/files', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const responseData = await fetchData();
    //const jsonResponse = JSON.stringify(responseData, null, 2);

    const readable = JSONStream.stringifyObject();
    readable.pipe(res);
    for (const key in responseData) {
      if (responseData.hasOwnProperty(key)) {
        readable.write([key, responseData[key]]);
      }
    }
    // End the readable stream
    readable.end();
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }
});

const fetchData = () => {
  return new Promise((resolve, reject) => {
    https.get(testUrl, (res) => {
      let data = [];

      // A chunk of data has been received.
      res.on('data', (chunk) => {
        data.push(chunk);
      });

      // The whole response has been received. Print out the result.
      res.on('end', () => {
        console.log('Response ended: ');
        const responseData = JSON.parse(Buffer.concat(data).toString());

        //placeholder ip address
        let ipAddress = "192:168:0:1";
        if (responseData !== undefined) {
          ipAddress = getIpAddressFromUrl(responseData.items[0].fileUrl);
        }

        let fullData = {};

        for (const fileURL of responseData.items) {
          const baseUrl = new URL(fileURL.fileUrl);
          fullData = addItem(fullData, baseUrl, ipAddress);
        }
        resolve(fullData);
      });


    }).on("error", (err) => {
      reject(err);
    });
  });
};

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});