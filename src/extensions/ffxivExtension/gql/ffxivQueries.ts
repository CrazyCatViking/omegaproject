import gql from 'graphql-tag';

export const GET_FFXIV_CHARACTER_STATS = gql`
  query getCharacterStats($input: FFXIVGetChrInput!) {
    getCharacter(input: $input) {
      id
      name
      title
      activeJob
      portrait

      jobs {
        jobName
        jobId
        level
      }

      mounts {
        totalMounts
        ownedMounts
      }

      minions {
        totalMinions
        ownedMinions
      }
    }
  }
`;

export const FIND_FFXIV_CHARACTER = gql`
  query findCharacter($name: String, $server: String) {
    findCharacter(name: $name, server: $server) {
      totalCount
      items {
        id
        name
        avatar
      }
    }
  }
`;

export const SET_FFXIV_CHARACTER = gql`
  mutation setCharacter($discordId: String!, $ffxivId: Int!) {
    setCharacter(discordId: $discordId, ffxivId: $ffxivId)
  }
`;

export const ENABLE_FFXIV_EXTENSION = gql`
  mutation enableExtension {
    enableExtension
  }
`;