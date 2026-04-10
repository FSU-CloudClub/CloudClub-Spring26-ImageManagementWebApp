import React from 'react';
import Dashboard from '../components/Dashboard';

const WelcomeScreen = ({ user, signOut }) => {
    return (
        <div className="feature-container animate-fade-in">
            <section className="content-area">
                <Dashboard user={user} signOut={signOut} />
            </section>
        </div>
    );
};

export default WelcomeScreen;