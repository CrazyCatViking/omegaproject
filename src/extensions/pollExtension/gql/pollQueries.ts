import gql from "graphql-tag";

const POLL_FRAGMENT = gql`
  fragment pollFragments on Poll {
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
`;

export const GET_POLLS = gql`
  query getPolls {
    polls {
      ...pollFragments
    }
  }

  ${POLL_FRAGMENT}
`;

export const CREATE_POLL = gql`
  mutation createPoll($input: PollInput!) {
    createPoll(input: $input) {
      ...pollFragments
    }
  }

  ${POLL_FRAGMENT}
`;

export const ENABLE_POLL_EXTENSION = gql`
  mutation enablePollExtension {
    enablePollExtension
  }
`;

export const UPDATE_POLL = gql`
  mutation updatePoll($input: PollInput!) {
    updatePoll(input: $input) {
      ...pollFragments
    }
  }

  ${POLL_FRAGMENT}
`;

export const DELETE_POLL = gql`
  mutation deletePoll($id: String) {
    deletePoll(id: $id)
  }
`;