
import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4 mb-6">
      <div className="container mx-auto flex items-center">
        <div className="font-bold text-xl text-ad-purple mr-8">AdCreator</div>
        <div className="flex space-x-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => `
              px-3 py-2 rounded-md text-sm font-medium 
              ${isActive 
                ? 'bg-ad-purple text-white' 
                : 'text-ad-gray-dark hover:bg-ad-purple-light hover:text-ad-purple-dark'
              }
            `}
            end
          >
            Create Ad
          </NavLink>
          <NavLink 
            to="/my-ads" 
            className={({ isActive }) => `
              px-3 py-2 rounded-md text-sm font-medium 
              ${isActive 
                ? 'bg-ad-purple text-white' 
                : 'text-ad-gray-dark hover:bg-ad-purple-light hover:text-ad-purple-dark'
              }
            `}
          >
            My Ads
          </NavLink>
          <NavLink 
            to="/content-library" 
            className={({ isActive }) => `
              px-3 py-2 rounded-md text-sm font-medium 
              ${isActive 
                ? 'bg-ad-purple text-white' 
                : 'text-ad-gray-dark hover:bg-ad-purple-light hover:text-ad-purple-dark'
              }
            `}
          >
            Content Library
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
