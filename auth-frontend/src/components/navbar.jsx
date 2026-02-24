import React from 'react';
import './Navbar.css';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AWSNavbar = () => {
return (
<Navbar className="Navbar" expand ="lg">
<Container>
<Navbar.Brand href="/" className="fsu-brand-color">S26-AWS</Navbar.Brand>
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
</Navbar>
);
};

export default AWSNavbar; 
