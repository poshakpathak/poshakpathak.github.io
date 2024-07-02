import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import Contact from './Contact';
import Projects from './Projects';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function App() {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <MainContent />
            </div>
        </Router>
    );
}

const Sidebar = () => (
    <div className="sidebar">
        <div className="profile-pic">
            <img src={`${process.env.PUBLIC_URL}/prof_pic.png`} alt="Profile"/>
        </div>
        <div className="profile-info">
            <h1>Poshak Pathak</h1>
        </div>
        <nav>
            <Link to="/about">About Me</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/contact">Contact</Link>
        </nav>
        <div className="contact-info">
            <FontAwesomeIcon icon={faMapMarkerAlt}/> Monroe, Louisiana
        </div>
        <div className="social-icons">
            <a href="https://www.linkedin.com/in/poshak-pathak/" target="_blank" rel="noopener noreferrer"
               className="linkedin">
                <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://www.youtube.com/@PoshakPathak" target="_blank" rel="noopener noreferrer"
               className="youtube">
                <i className="fab fa-youtube"></i>
            </a>
            <a href="https://x.com/PathakPoshak" target="_blank" rel="noopener noreferrer" className="twitter">
                <i className="fab fa-twitter"></i>
            </a>
        </div>
    </div>
);

const MainContent = () => (
    <div className="main-content">
        <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} /> {/* Add the Contact route */}
            <Route path="/" element={<Home />} />
        </Routes>
    </div>
);

const Home = () => (
    <section>
        <h2>Home</h2>
        <p>I am a college junior double majoring in Computer Science and Mathematics at the University
        of Louisiana Monroe. My academic interests mostly surrounds the Data Science/ Machine Learning areas
            and I spend every day trying to learn more about this field. </p>
         <p> My hobbies include hiking, travelling, cricket, and playing chess (unhealthy amount).</p>
        <p> Feel free to navigate around the website and please don't hesitate to reach out to me
        for any questions. </p>
    </section>
);

const About = () => (
    <section>
        <h2>About Me</h2>
        <p>I am interested in finding an industry role as a Machine Learning Engineer, Data Scientist or as
        a Data Analyst so that I can put my knowledge to test in the practical world. </p>
    </section>
);

const Portfolio = () => (
    <section>
        <h2>Resume</h2>
        <p>My resume shows my current experiences and the projects I have completed so far. If I work
            on a project worthy of replacing the current projects on my resume, I will reflect the changes.
        </p>
        <div className="resume-container">
            <iframe
                src={`${process.env.PUBLIC_URL}/Resume.pdf`}
                title="Resume"
                width="100%"
                height="1200px">
            </iframe>
        </div>
    </section>
);




export default App;