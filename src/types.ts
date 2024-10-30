export interface Route {
  Route: string;
  Location: string;
  URL: string;
  'Avg Stars': number;
  'Your Stars': number;
  'Route Type': string;
  Rating: string;
  Pitches: number;
  Length: number;
  'Area Latitude': number;
  'Area Longitude': number;
}

export interface TreeNode {
  name: string;
  children: TreeNode[];
  routes: Route[];
  isExpanded?: boolean;
}