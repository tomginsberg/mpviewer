import React, {useCallback, useState} from 'react';
import {AlertCircle, Upload} from 'lucide-react';
import {Route, TreeNode} from './types';
import TreeView from './components/TreeView';
import {GradeFilter, matchesGrade} from './components/GradeFilter';
import ErrorBoundary from './components/ErrorBoundary';

function filterRoutesByGrades(routes: Route[], selectedGrades: string[]): Route[] {
    if (selectedGrades.length == 0) {
        return routes;
    }
    let filteredRoutes: Route[] = [];

    try {
        filteredRoutes = routes.filter(route =>
            selectedGrades.some(grade => matchesGrade(route.Rating.toString(), grade))
        );
    } catch (error) {
        console.error('Error during filtering:', error);
    }

    console.log('Filtered routes:', filteredRoutes.length);
    return filteredRoutes;
}


function buildLocationTree(routes: Route[], selectedGrades: string[]): TreeNode {
    const filteredRoutes = filterRoutesByGrades(routes, selectedGrades);
    const root: TreeNode = {name: '', children: [], routes: []};

    filteredRoutes.forEach(route => {
        if (!route.Location) return;

        const locationParts = route.Location.split(' > ')
            .filter(Boolean)
            .reverse();

        let currentNode = root;

        locationParts.forEach((part, index) => {
            let child = currentNode.children.find(n => n.name === part);

            if (!child) {
                child = {name: part, children: [], routes: []};
                currentNode.children.push(child);
            }

            if (index === locationParts.length - 1) {
                child.routes.push(route);
            }

            currentNode = child;
        });
    });

    // Remove empty branches
    const pruneEmptyNodes = (node: TreeNode): boolean => {
        node.children = node.children.filter(child => pruneEmptyNodes(child));
        return node.children.length > 0 || node.routes.length > 0;
    };

    pruneEmptyNodes(root);

    // Sort children recursively
    const sortTreeNodes = (node: TreeNode) => {
        node.children.sort((a, b) => a.name.localeCompare(b.name));
        node.children.forEach(sortTreeNodes);
    };

    sortTreeNodes(root);
    return root;
}

import Papa from 'papaparse';

function parseCSV(text: string): Route[] {
    try {
        const { data, errors } = Papa.parse<Record<string, string | number>>(text, {
            header: true, // Use the first row as headers
            skipEmptyLines: true, // Ignore empty lines
            dynamicTyping: (field) => field !== 'Rating', // Keep Rating as string
        });

        if (errors.length > 0) {
            console.error('CSV Parsing Errors:', errors);
            throw new Error('CSV parsing failed');
        }

        // Optional: Validate or transform data if needed.
        return data.map((row) => ({
            ...row,
            Rating: row.Rating ? String(row.Rating).trim() : '', // Ensure Rating is a string
        })) as Route[];
    } catch (error) {
        throw new Error(
            `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

function extractUniqueGrades(routes: Route[]): string[] {
    const gradeSet = new Set<string>();

    routes.forEach(route => {
        if (route.Rating) {
            //
            const grade = route.Rating.toString().split(' ')[0]; // Split by space and take first element
            // check if there is a string in the name

            gradeSet.add(grade);
        }
    });

    // Convert Set to Array and sort
    return Array.from(gradeSet).sort((a, b) => a.localeCompare(b));
}


function App() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [availableGrades, setAvailableGrades] = useState<string[]>([]);

    React.useEffect(() => {
        const fetchCSV = async () => {
            try {
                const response = await fetch('/route-finder.csv');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const text = await response.text();
                // Parse and process the CSV data
                const parsedRoutes = parseCSV(text);
                setRoutes(parsedRoutes);

                // Extract unique grades
                const grades = extractUniqueGrades(parsedRoutes);
                setAvailableGrades(grades);

                // Build the initial tree
                const tree = buildLocationTree(parsedRoutes, selectedGrades);
                setTreeData(tree);
            } catch (error) {
                console.error('Failed to fetch CSV:', error);
                setError('Failed to load data. Please check your internet connection.');
            }
        };

        fetchCSV();
    }, []);



    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);

        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('Failed to read file');

                const parsedRoutes = parseCSV(text);
                setRoutes(parsedRoutes);
                const grades = extractUniqueGrades(parsedRoutes);
                setAvailableGrades(grades);

                const tree = buildLocationTree(parsedRoutes, selectedGrades);
                setTreeData(tree);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to process file');
                setTreeData(null);
                setRoutes([]);
            }
        };


        reader.onerror = () => {
            setError('Failed to read file');
        };

        reader.readAsText(file);
    }, [selectedGrades]);

    const handleToggleGrade = useCallback((grade: string) => {
        setSelectedGrades(prev => {
            const newGrades = prev.includes(grade)
                ? prev.filter(g => g !== grade)
                : [...prev, grade];
            return newGrades;
        });
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedGrades([]);
    }, []);

    // Update tree when filters change
    React.useEffect(() => {
        if (routes.length > 0) {
            try {
                const tree = buildLocationTree(routes, selectedGrades);
                setTreeData(tree);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update filters');
            }
        }
    }, [routes, selectedGrades]);

    const resetUpload = useCallback(() => {
        setTreeData(null);
        setRoutes([]);
        setError(null);
        setSelectedGrades([]);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <ErrorBoundary>
                {!treeData ? (
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="w-full max-w-md">
                            {error && (
                                <div
                                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                                    <div className="text-red-700 text-sm">{error}</div>
                                </div>
                            )}
                            <label
                                className="flex flex-col items-center justify-center w-full h-64 bg-white rounded-lg shadow-lg cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50 transition-all">
                                <Upload className="w-12 h-12 text-gray-400"/>
                                <span className="mt-4 text-lg font-medium text-gray-600">Upload CSV file</span>
                                <span className="mt-2 text-sm text-gray-500">Comma-separated values with headers</span>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto py-8 px-4">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Climbing Routes</h1>
                            <button
                                onClick={resetUpload}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white rounded-lg shadow hover:shadow-md transition-all"
                            >
                                Upload New File
                            </button>
                        </div>

                        <GradeFilter
                            availableGrades={availableGrades}
                            selectedGrades={selectedGrades}
                            onToggleGrade={handleToggleGrade}
                            onClearFilters={handleClearFilters}
                        />


                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <TreeView node={treeData}/>
                        </div>
                    </div>
                )}
            </ErrorBoundary>
        </div>
    );
}

export default App;