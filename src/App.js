import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css';

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
            <img src={`${process.env.PUBLIC_URL}/prof_pic.png`} alt="Profile" />
        </div>
        <div className="profile-info">
            <h1>Poshak Pathak</h1>
            <p>Computer Science & Mathematics</p>
            <p>Monroe, Louisiana</p>
            <p><i> Life is hard as a single mom if you're a man in his early twenties <br/>
            -Sun Tzu </i></p>
        </div>
        <nav>
            <Link to="/about">About Me</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/contact">Contact</Link>
        </nav>
        <div className="contact-info">
            <p>555 your office number</p>
            <p>123 your address street</p>
            <p>Your City, State 12345</p>
        </div>
        <div className="social-icons">
            <a href="https://www.linkedin.com/in/poshak-pathak/" target="_blank" rel="noopener noreferrer" className="linkedin">
                <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://www.youtube.com/@PoshakPathak" target="_blank" rel="noopener noreferrer" className="youtube">
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
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/" element={<Home />} />
        </Routes>
    </div>
);

const Home = () => (
    <section>
        <h2>Home</h2>
        <p>Welcome to my personal webpage. Feel free to browse around and learn more about me.</p>
    </section>
);

const About = () => (
    <section>
        <h2>About Me</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel mauris quam. Phasellus nec pretium mi.</p>
    </section>
);

const Portfolio = () => (
    <section>
        <h2>Resume</h2>
        <p>My resume shows my current experiences and the projects I have completed so far. If I work
        on a project worthy of replacing the current projects on my resume, I will make sure to reflect the changes.
        </p>
        <p> Projects not included on my resume can be found elsewhere on this website. </p>
        <div className="resume-container">
            <iframe
                src={`${process.env.PUBLIC_URL}/Resume.pdf`}
                title="Resume"
                width="100%"
                height="1100px">
            </iframe>
        </div>
    </section>
);

const Blog = () => {
    const posts = [
        { id: 1, title: 'Post 1', content: 'Lorem ipsum dolor sit amet.' },
        { id: 2, title: 'Post 2', content: 'Consectetur adipiscing elit.' },
        { id: 3, title: 'Post 3', content: 'Donec vel mauris quam.' },
    ];

    return (
        <section>
            <h2>Blog</h2>
            {posts.map(post => (
                <div key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                </div>
            ))}
        </section>
    );
};

const Contact = () => (
    <section>
        <h2>Contact</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel mauris quam. Phasellus nec pretium mi.</p>
    </section>
);

export default App;
