import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const HoverSidebar = ({signOut}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="bg-dark text-white shadow"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      style={{
        width: isExpanded ? '250px' : '70px',
        transition: 'width 0.3s ease-in-out',
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        height: '40vh',
        borderTopRightRadius: '10%',
        borderBottomRightRadius: '10%',
        marginTop: '10%',
        position: 'fixed',
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
  );
};

export default HoverSidebar; // CRITICAL: This was missing!
// import React, { useState } from 'react';
// import { Nav } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './Navbar.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';



// const HoverSidebar = () => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   return (
//      <div style={{ display: 'flex', height: '100vh', backgroundColor: 'white'}}>
//       <div
//         className="Navbar"
//         onMouseEnter={() => setIsExpanded(true)}
//         onMouseLeave={() => setIsExpanded(false)}
//         style={{
//           width: isExpanded ? '250px' : '70px',
//           transition: 'width 0.3s ease-in-out',
//           overflowX: 'hidden',
//           whiteSpace: 'nowrap',
//           height: '40vh',
//           borderTopRightRadius: '10%',
//           borderBottomRightRadius: '10%',
//           marginTop: '10%'
//         }}
//       >
//         <Nav className="flex-column p-3">
//           <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
//             <i class="bi bi-arrow-up-square-fill"></i>
//             {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Upload</span>}
//           </Nav.Link>
//           <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
//             <i class="bi bi-file-image"></i>
//             {isExpanded && <span>{'\u00A0\u00A0\u00A0\u00A0'}Gallery</span>}
//           </Nav.Link>
//           <Nav.Link href="#" className="text-white mb-3 d-flex align-items-center">
//             <i className="bi bi-gear me-3"></i>
//             {isExpanded && <span>Settings</span>}
//           </Nav.Link>
//         </Nav>
//       </div>

//       <main className="p-4 flex-grow-1 bg-light">
//         {/* <h2> </h2> <p></p>*/}
//       </main>
//     </div>
//   );
// };

// export default HoverSidebar;