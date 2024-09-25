import axios from 'axios'
import { urlencoded } from 'express';

const tweets = async (req, res) => {
  console.log("twitts");

  const BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAE7tvwEAAAAAiojo3LvJOcYY3ifT2SWhUxtfSXQ%3DmogsYwcGmE8P7b0kRBjhee0dRix5GQlQbE9trFFRPwnU9RZoku";
  const username = "DeepakK96871817";
  try {
    console.log("enter", username);
    
    const userResponse = await axios(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    console.log("user",userId);
    
    const userId = userResponse?.data?.data?.id;
    console.log("userId", userId);
    
    console.log(userId);
    const tweetResponse = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    const tweets = tweetResponse.data.data;
    console.log(tweets);
    res.status(201).json({user: userId,data:tweets});
  } catch (error) {
    res.status(500).json({error: error});
  }
};

export { tweets };
