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

export const subscribe = `
  subscription ChannelLive {
    test
  }
`;