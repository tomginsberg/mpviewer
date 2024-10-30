import React from 'react';
import { ChevronRight, ChevronDown, MapPin } from 'lucide-react';
import { TreeNode, Route } from '../types';

interface TreeViewProps {
  node: TreeNode;
  level?: number;
}

interface RouteCardProps {
  route: Route;
}

const RouteCard: React.FC<RouteCardProps> = ({ route }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 my-2 hover:shadow-md transition-shadow">
      <a
          href={route.URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-blue-600 hover:text-blue-800"
      >
        {route.Route}
      </a>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
        <span className="text-yellow-500">
          {'★'.repeat(Math.round(route['Avg Stars']))}
        </span>
          <span className="text-gray-600">({route['Avg Stars']})</span>
        </div>
        <div className="text-gray-600">{route['Route Type']}</div>
        <div className="text-gray-600">Grade: {route.Rating}</div>
        <div className="text-gray-600">Pitches: {route.Pitches}</div>
        {route.Length && (
            <div className="text-gray-600">Length: {route.Length}ft</div>
        )}
        <div className="col-span-2 text-xs text-gray-500 mt-1">
          {route['Area Latitude'].toFixed(4)}, {route['Area Longitude'].toFixed(4)}
        </div>
      </div>
    </div>
);

const TreeView: React.FC<TreeViewProps> = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);

  const hasChildren = node.children.length > 0;
  const paddingLeft = `${level * 0.5}rem`;

  // Calculate the total number of routes including child nodes recursively
  const calculateTotalRoutes = (node: TreeNode): number => {
    const childRoutes = node.children.reduce(
        (total, child) => total + calculateTotalRoutes(child),
        0
    );
    return node.routes.length + childRoutes;
  };

  const totalRoutes = calculateTotalRoutes(node);

  return (
      <div>
        {node.name && (
            <div
                className="flex items-center py-2 hover:bg-gray-50 cursor-pointer"
                style={{ paddingLeft }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
              {hasChildren ? (
                  isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                  )
              ) : (
                  <MapPin className="w-5 h-5 text-gray-500" />
              )}
              <span className="ml-1 font-medium">{node.name}</span>
              <span className="ml-1 text-sm text-gray-500">
            ({totalRoutes} route{totalRoutes !== 1 ? 's' : ''})
          </span>
            </div>
        )}

        {isExpanded && (
            <>
              {node.routes.map((route, index) => (
                  <RouteCard key={`${route.Route}-${index}`} route={route} />
              ))}
              {node.children.map((child, index) => (
                  <TreeView key={`${child.name}-${index}`} node={child} level={level + 1} />
              ))}
            </>
        )}
      </div>
  );
};

export default TreeView;
