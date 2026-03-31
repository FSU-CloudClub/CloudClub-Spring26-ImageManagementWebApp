import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import '../styles/navbar.css';

const AWSNavbar = ({ user }) => {
  return (
    <Navbar className="Navbar shadow-sm" expand="lg" style={{ backgroundColor: '#fff' }}>
      <Container fluid>
        <Navbar.Brand className="brand-color d-flex align-items-center">
          <i className="bi bi-cloud-fill me-2" style={{ fontSize: "24px", color: "#0d6efd" }}></i>
          <span className="fw-bold">SmartGallery</span>
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-3">
          {/* Display the real Cognito Username */}
          <span className="text-muted d-none d-md-block">Hello, {user.attributes?.email || "Guest"}!</span>
          <i className="bi bi-person-circle fs-3 text-dark"></i>
        </div>
      </Container>
    </Navbar>
  );
};

export default AWSNavbar;
// import React from 'react';
// import './Navbar.css';
// import { Navbar, Nav, Container } from 'react-bootstrap';

// const AWSNavbar = () => {
// return (
// <Navbar className="Navbar" expand ="lg">

// <Container>
// <Navbar.Brand href="/" className="brand-color d-flex align-items-center">
//     <i className="bi bi-cloud-fill me-2" style={{fontSize:"24px"}}></i>
// </Navbar.Brand>
// <Navbar.Toggle aria-controsl="basic-navbar-nav" />
// <Navbar.Collapse id="basic-navbar-nav">
// <Nav className="me-auto">
//     <Nav.Link href="/home" className="link-color">Home</Nav.Link>
//     <Nav.Link href="/about" className="link-color">About</Nav.Link>
//     <Nav.Link href="/contact" className="link-color">Contact</Nav.Link>
//     <Nav.Link href="/More information" className="link-color">More Information</Nav.Link>
// </Nav>
// </Navbar.Collapse>

// </Container>
// <div style={{width: '5%', height: '30px', color: 'white'}}><i size={100}class="bi bi-person-circle fs-3"></i></div>
// </Navbar>
// );
// };

// export default AWSNavbar; 
