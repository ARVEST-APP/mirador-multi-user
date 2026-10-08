import { canGrantItemRights, ItemRights, ManifestGroupRights } from './rights';

const { ADMIN, EDITOR, READER } = ManifestGroupRights;
const UNKNOWN = 'owner' as ItemRights;

describe('canGrantItemRights', () => {
  it.each([
    [ADMIN, ADMIN, true],
    [ADMIN, EDITOR, true],
    [ADMIN, READER, true],
    [EDITOR, ADMIN, false],
    [EDITOR, EDITOR, true],
    [EDITOR, READER, true],
    [READER, ADMIN, false],
    [READER, EDITOR, false],
    [READER, READER, false],
    [undefined, READER, false],
    [UNKNOWN, READER, false],
    [ADMIN, UNKNOWN, false],
    [ADMIN, undefined, false],
  ])('%s granting %s: %s', (ownRights, rightsToGrant, expected) => {
    expect(canGrantItemRights(ownRights, rightsToGrant)).toBe(expected);
  });
});
