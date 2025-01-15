import React from 'react';
import './App.css';
import dogImage from '../../public/dog-img.jpg';
import ButtonComponent from '../shared/Button';
import DashboardComponent from './Dashboard';

export default function AppComponent() {
    console.log('API_URL', 'https://api/v1/graphql');
    const logMessage = () => {
        console.log('hello, I am not referenced anywhere!');
    };
    return (
        <div className="container">
            <div>App Component</div>
            <div>
                <img className="dog" src={dogImage} alt="a dog" />
                <ButtonComponent />
                <DashboardComponent />
            </div>
        </div>
    );
}
