import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';

export default function AppComponent() {
    if (PRODUCTION) {
        console.log('API_URL', API_URL);
    } else {
        console.log('API_URL', 'https://api/v1/graphql');
    }
    const logMessage = () => {
        console.log('hello, I am not referenced anywhere!');
    };
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                <img className="dog" src={dogImage} alt="a dog" />
            </div>
        </div>
    );
}
