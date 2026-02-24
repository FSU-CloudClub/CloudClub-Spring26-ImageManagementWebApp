import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';
import 'bootstrap-icons/font/bootstrap-icons.css';



const HoverSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        className="Navbar"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          width: isExpanded ? '250px' : '70px',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
            {isExpanded && <span>Upload</span>}
            {!isExpanded && <i className="bi bi-house-door"></i>}
          </Nav.Link>
          <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
            <i className="bi bi-person me-3"></i>
            {isExpanded && <span>Profile</span>}
          </Nav.Link>
          <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
            <i className="bi bi-gear me-3"></i>
            {isExpanded && <span>Settings</span>}
          </Nav.Link>
        </Nav>
      </div>

      <main className="p-4 flex-grow-1 bg-light">
        <h2>Main Content Area</h2>
        <p>Hover over the sidebar to expand it.</p>
      </main>
    </div>
  );
};

export default HoverSidebar;