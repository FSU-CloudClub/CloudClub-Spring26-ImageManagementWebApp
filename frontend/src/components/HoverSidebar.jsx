import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/navbar.css'; // 1. Bring back your CSS file

const HoverSidebar = ({ signOut, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    // 2. We use a flex wrapper to hold the Sidebar AND the Content side-by-side
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <div
        className="bg-dark text-white shadow" // Keep your Bootstrap styling
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          width: isExpanded ? '250px' : '70px',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
          whiteSpace: 'nowrap',
          height: '40vh',
          borderTopRightRadius: '40px', // Changed % to px for better control
          borderBottomRightRadius: '40px',
          marginTop: '10%',
          position: 'fixed', // 3. Changed from 'fixed' to 'sticky'
          top: '20px',
          zIndex: 100
        }}
      >
        <Nav className="flex-column p-3">
          <Nav.Link onClick={() => navigate('/')} className="text-white mb-3 d-flex align-items-center cursor-pointer">
            <i className="bi bi-house"></i>
            {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Dashboard</span>}
          </Nav.Link>
          
          <Nav.Link onClick={() => navigate('/gallery')} className="text-white mb-3 d-flex align-items-center cursor-pointer">
            <i className="bi bi-file-image"></i>
            {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Gallery</span>}
          </Nav.Link>
          
          <Nav.Link onClick={() => navigate('/upload')} className="text-white mb-3 d-flex align-items-center cursor-pointer">
            <i className="bi bi-upload"></i>
            {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Upload</span>}
          </Nav.Link>

          <Nav.Link onClick={signOut} className="text-white mb-3 d-flex align-items-center cursor-pointer">
            <i className="bi bi-box-arrow-right"></i>
            {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Sign Out</span>}
          </Nav.Link>
        </Nav>
      </div>

      {/* 4. MAIN CONTENT AREA: This is where your other components load */}
      <main style={{ flexGrow: 1, padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default HoverSidebar;