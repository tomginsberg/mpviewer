import React from 'react';
import {X} from 'lucide-react';

interface GradeFilterProps {
    availableGrades: string[]; // Add this line
    selectedGrades: string[];
    onToggleGrade: (grade: string) => void;
    onClearFilters: () => void;
}


export const matchesGrade = (rating: string, targetGrade: string): boolean => {
    if (!rating) return false;

    const ratingGrade = rating.split(' ')[0]; // Split by space and take first element

    // Compare the extracted grades
    return ratingGrade === targetGrade;
};


export const GradeFilter: React.FC<GradeFilterProps> = ({
                                                            availableGrades,
                                                            selectedGrades,
                                                            onToggleGrade,
                                                            onClearFilters
                                                        }) => {
    return (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Filter by Grade</h2>
                {selectedGrades.length > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                        <X className="w-4 h-4"/>
                        Clear filters
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {availableGrades.map((grade) => (
                    <button
                        key={grade}
                        onClick={() => onToggleGrade(grade)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${selectedGrades.includes(grade)
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {grade}
                    </button>
                ))}
            </div>
        </div>
    );
};