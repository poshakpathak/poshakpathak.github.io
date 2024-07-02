import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = () => {
        let errors = {};
        let isValid = true;

        if (!formData.firstName) {
            isValid = false;
            errors['firstName'] = 'First Name is required';
        }

        if (!formData.lastName) {
            isValid = false;
            errors['lastName'] = 'Last Name is required';
        }

        if (!formData.email) {
            isValid = false;
            errors['email'] = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            isValid = false;
            errors['email'] = 'Invalid email address';
        }

        if (!formData.message) {
            isValid = false;
            errors['message'] = 'Message is required';
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            emailjs.sendForm('service_032bxdv', 'template_cbcdf7c', e.target, 'ufEdgCxhPXi8KBd1k')
                .then((result) => {
                    alert('Message sent successfully');
                }, (error) => {
                    alert('Failed to send message, please try again');
                });

            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                message: '',
            });
        }
    };

    return (
        <div className="contact-form-container">
            <h2>Contact Form</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder=""
                    />
                    <div className="error">{formErrors.firstName}</div>
                </div>
                <div className="form-group">
                    <label>Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder=""
                    />
                    <div className="error">{formErrors.lastName}</div>
                </div>
                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder=""
                    />
                    <div className="error">{formErrors.email}</div>
                </div>
                <div className="form-group">
                    <label>Message *</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder=""
                    ></textarea>
                    <div className="error">{formErrors.message}</div>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Contact;