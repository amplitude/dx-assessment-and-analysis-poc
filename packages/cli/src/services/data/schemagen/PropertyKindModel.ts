/**
 * Represents trait kinds and must match IdentifyPropertyKind enum in graphql schema (see codegen.yml)
 */
// eslint-disable-next-line import/prefer-default-export
export enum PropertyKindModel {
  Context = 'context',
  Group = 'group',
  Identify = 'identify',
  Page = 'page',
  Event = 'event',
}
