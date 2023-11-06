const { google } = require('googleapis');
const fs = require('fs');

const DEVELOPER_KEY = "YOUR_API_KEY";
const YOUTUBE_API_SERVICE_NAME = "youtube";
const YOUTUBE_API_VERSION = "v3";

const youtube = google.youtube({
    version: YOUTUBE_API_VERSION,
    auth: DEVELOPER_KEY
});

async function youtube_search(options) {
    let max_results = 10;
    let request_count = 0;
    let channelID = "";
    let nextPageToken = "";

    // Create a CSV output for video list
    const csvFile = fs.createWriteStream('video_result.csv');
    csvFile.write("title,description,videoId,viewCount,likeCount,dislikeCount,commentCount,channelTitle,CviewCount,CcommentCount,subscriberCount\n");

    const allPromises = [];

    // Define the search function
    async function search() {

        youtube.search.list({
            q: options.q,
            part: "id,snippet",
            maxResults: options.max_results,
            pageToken: nextPageToken
        }, (err, search_response) => {
            if (err) return console.error(err);

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
                        console.log(videoPromise)
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
                        promises.push(channelPromise)

                        // youtube.videos.list({
                        //   id: videoId,
                        //   part: "statistics"
                        // }, (err, video_response) => {
                        //   if (err) return console.error(err);

                        //   const video_result = video_response.data.items[0];
                        //   const viewCount = video_result.statistics.viewCount || 0;
                        //   const likeCount = video_result.statistics.likeCount || 0;
                        //   const dislikeCount = video_result.statistics.dislikeCount || 0;
                        //   const commentCount = video_result.statistics.commentCount || 0;

                        //   youtube.channels.list({
                        //     id: search_result.snippet.channelId,
                        //     part: "snippet,statistics"
                        //   }, (err, channel_response) => {
                        //     if (err) return console.error(err);

                        //     const channel_result = channel_response.data.items[0];
                        //     const channelTitle = channel_result.snippet.title.replace(/[^a-zA-Z0-9 ]/g, '');
                        //     const viewCCount = channel_result.statistics.viewCount || 0;
                        //     const commentCCount = channel_result.statistics.commentCount || 0;
                        //     const subscriberCount = channel_result.statistics.subscriberCount || 0;

                        //     const row = [title, description, videoId, viewCount, likeCount, dislikeCount, commentCount, channelTitle, viewCCount, commentCCount, subscriberCount];
                        //     csvFile.write(row.join(',') + '\n');
                        //   });
                        // });
                        allPromises.push(promises)
                    }
                }

                // nextPageToken = search_response.data.nextPageToken;
                // if (request_count < max_results && nextPageToken) {
                //   search(); // Continue searching if not yet reached max results
                // } else {
                //   csvFile.end(); // Close the CSV file
                // }
                if(request_count > max_results) return ;
            }
        });
    }

    await search(); // Start the initial search
    console.log(allPromises)
    await Promise.all(allPromises).then((promises) => {
        console.log(promises)
    })
}

const options = {
    q: "Google",
    max_results: 50
};

youtube_search(options);
