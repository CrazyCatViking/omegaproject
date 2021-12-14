import gql from 'graphql-tag';

export const GET_FFXIV_CHARACTER = gql`
  query getCharacter($input: FFXIVGetChrInput!) {
    getCharacter(input: $input) {
      id
      name
      title
      activeJob
      avatar

      jobs {
        className
        jobName

        classId
        jobId
        expLevel
        expLevelMax
        level

        specialised
        jobUnlocked
      }

      gear {
        type
        id
        icon
        name
        itemLevel
        glamour {
          id
          name
        }
      }

      mounts {
        totalMounts
        ownedMounts
        items {
          id
          name
        }
      }

      minions {
        totalMinions
        ownedMinions
        items {
          id
          name
        }
      }
      
      guardianDeity
    }
  }
`;

export const FIND_FFXIV_CHARACTER = gql`
  query findCharacter($name: String, $server: String) {
    findCharacter(name: $name, server: $server) {
      name
    }
  }
`;