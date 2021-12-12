import gql from 'graphql-tag';

export const GET_FFXIV_CHARACTER = gql`
  query getCharacter($input: FFXIVGetChrInput!) {
    getCharacter(input: $input) {
      name
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