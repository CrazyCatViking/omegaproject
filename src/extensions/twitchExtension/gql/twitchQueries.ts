import gql from "graphql-tag";

export const getTwitchStream = gql`
  query GetTwitchStream {
    twitchStreams {
      items {
        streamer {
          name
        }
      }
    }
  }
`;

export const subscribeToChannel = gql`
  mutation SubscribeToChannel($channelName: String!) {
    subscribeToChannel(channelName: $channelName)
  }
`;

export const subscribe = `
  subscription ChannelLive {
    liveStreamFeed {
      id
      title
    }
  }
`;