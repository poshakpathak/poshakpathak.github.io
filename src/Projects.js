import React from 'react';
import './Projects.css';

const projects = [
    {
        title: "Chess Engine",
        description: "Created using AI and NN that plays against humans at a reasonably strong rate.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Chess_Programming.svg/1200px-Chess_Programming.svg.png",
        github: "https://github.com/poshakpathak/ChessEngine/",

    },

];

const Projects = () => {

    return (

        <div className="projects-section">
            <h2 className="projects-header">My Projects</h2>
            <div className="projects-container">
                {projects.map((project, index) => (
                    <div className="project-card" key={index}>
                        <img src={project.image} alt={project.title} className="project-image"/>
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="project-links">
                            <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
