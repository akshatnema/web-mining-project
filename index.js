const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const DEVELOPER_KEY = process.env.API_KEY;
const YOUTUBE_API_VERSION = "v3";

const youtube = google.youtube({
  version: YOUTUBE_API_VERSION,
  auth: DEVELOPER_KEY
});

const fun = async () => {
    const res = await youtube.search.list({
        q: 'hello',
        part: "id,snippet",
        maxResults: 10
      })
      console.log(res)
} 

fun();