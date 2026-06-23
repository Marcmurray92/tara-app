export type ConnectionsGroup = {
  id: string;
  category: string;
  items: [string, string, string, string];
  difficulty?: 1 | 2 | 3 | 4;
};

export type ConnectionsGameData = {
  schemaVersion: 1;
  groups: [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup];
};

