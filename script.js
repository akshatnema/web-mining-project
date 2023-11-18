const {google} = require('googleapis');
const fs = require('fs');
const dotenv = require('dotenv');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

dotenv.config();

const DEVELOPER_KEY = process.env.API_KEY;
const YOUTUBE_API_VERSION = "v3";

const youtube = google.youtube({
    version: YOUTUBE_API_VERSION,
    auth: DEVELOPER_KEY
});

const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
    { id: 'title', title: 'Title' },
    { id: 'description', title: 'Description' },
    { id: 'videoId', title: 'VideoId' },
    { id: 'viewCount', title: 'ViewCount' },
    { id: 'likeCount', title: 'LikeCount' },
    { id: 'dislikeCount', title: 'DislikeCount' },
    { id: 'commentCount', title: 'CommentCount' },
    { id: 'channelTitle', title: 'ChannelTitle' },
    { id: 'viewCCount', title: 'ViewCCount' },
    { id: 'commentCCount', title: 'CommentCCount' },
    { id: 'subscriberCount', title: 'SubscriberCount' },
    ],
});

async function youtube_search(options) {
    let max_results = 10;
    let request_count = 0;
    let channelID = "";
    let nextPageToken = "";

    // Create a CSV output for video list
    // const csvFile = fs.createWriteStream('video_result.csv');
    // csvFile.write("title,description,videoId,viewCount,likeCount,dislikeCount,commentCount,channelTitle,CviewCount,CcommentCount,subscriberCount\n");

    const allPromises = [];

    // Define the search function
    async function search() {

        try {
            const search_response = await youtube.search.list({
                q: options.q,
                part: "id,snippet",
                maxResults: options.max_results,
                pageToken: nextPageToken
            });

            if (search_response.data.items) {
                request_count += search_response.data.items.length;

                for (const search_result of search_response.data.items) {
                    if (search_result.id.kind === "youtube#video") {
                        const promises = [];
                        let title = search_result.snippet.title;
                        let description = search_result.snippet.description;
                        title = title.replace(/[^a-zA-Z0-9 ]/g, '');
                        description = description.replace(/[^a-zA-Z0-9 ]/g, '');
                        let videoId = search_result.id.videoId;
                        const videoPromise = new Promise((res, rej) => {
                            try {
                                const response = youtube.videos.list({
                                    id: videoId,
                                    part: "statistics"
                                })
                                res(response)
                            } catch (err) {
                                rej(err)
                            }
                        })
                        // console.log(videoPromise)
                        promises.push(videoPromise)

                        const channelPromise = new Promise((res, rej) => {
                            try {
                                const response = youtube.channels.list({
                                    id: search_result.snippet.channelId,
                                    part: "snippet,statistics"
                                })
                                res(response)
                            } catch (err) {
                                rej(err)
                            }
                        })
                        // console.log(channelPromise)
                        promises.push(channelPromise)
                        
                        allPromises.push({title, description, videoId, promises: promises})
                        // console.log(promises)
                    }
                }

                nextPageToken = search_response.data.nextPageToken;
                if (request_count < max_results && nextPageToken) {
                  search(); // Continue searching if not yet reached max results
                } else {
                //   csvFile.end(); // Close the CSV file
                }
                if (request_count > max_results) return;
            }

            console.log('searching')
        } catch (e) {
            console.log(e)
        }
    }

    await search(); // Start the initial search
    // console.log(allPromises)
    const data = [];
    await Promise.all(allPromises).then((promises) => {
        promises.forEach((videoPromise) => {
            const title = videoPromise.title;
            const description = videoPromise.description;
            const videoId = videoPromise.videoId;
            
            Promise.all(videoPromise.promises).then((apiData) => {
                const video_result = apiData[0].data.items[0];
                const viewCount = video_result.statistics.viewCount || 0;
                const likeCount = video_result.statistics.likeCount || 0;
                const dislikeCount = video_result.statistics.dislikeCount || 0;
                const commentCount = video_result.statistics.commentCount || 0;

                const channel_result = apiData[1].data.items[0];
                const channelTitle = channel_result.snippet.title.replace(/[^a-zA-Z0-9 ]/g, '');
                const viewCCount = channel_result.statistics.viewCount || 0;
                const commentCCount = channel_result.statistics.commentCount || 0;
                const subscriberCount = channel_result.statistics.subscriberCount || 0;

                const videoObject = {title, description, videoId, viewCount, likeCount, dislikeCount, commentCount, channelTitle, viewCCount, commentCCount, subscriberCount}
                console.log(videoObject)
                data.push(videoObject)
            })
        })
        console.log("hello")
    })
    console.log(data)
    // const res = await csvWriter.writeRecords(data)
    // console.log(res)
}

const options = {
    q: "Google",
    max_results: 50
};

youtube_search(options);
