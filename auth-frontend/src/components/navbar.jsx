import React from 'react';
import './Navbar.css';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AWSNavbar = () => {
return (
<Navbar className="Navbar" expand ="lg">

<Container>
<Navbar.Brand href="/" className="brand-color d-flex align-items-center">
    <i className="bi bi-cloud-fill me-2" style={{fontSize:"24px"}}></i>
</Navbar.Brand>
<Navbar.Toggle aria-controsl="basic-navbar-nav" />
<Navbar.Collapse id="basic-navbar-nav">
<Nav className="me-auto">
    <Nav.Link href="/home" className="link-color">Home</Nav.Link>
    <Nav.Link href="/about" className="link-color">About</Nav.Link>
    <Nav.Link href="/contact" className="link-color">Contact</Nav.Link>
    <Nav.Link href="/More information" className="link-color">More Information</Nav.Link>
</Nav>
</Navbar.Collapse>

</Container>
<div style={{width: '5%', height: '30px', color: 'white'}}><i size={100}class="bi bi-person-circle fs-3"></i></div>
</Navbar>
);
};

export default AWSNavbar; 
