
import React from 'react';

const Toast = ({ message }) => {
    return (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            <div className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Toast;
