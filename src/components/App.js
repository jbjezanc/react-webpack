import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';

export default function AppComponent() {
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
