import gql from "graphql-tag";

export const GET_POLLS = gql`
  query getPolls {
    polls {
      id
      mode
      description
      options
      status
      pollMessageData {
        messageId
        channelId
      }
    }
  }
`