import React, {Component} from 'react';
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import Clarifai from 'clarifai';
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Rank from "./components/Rank/Rank";
import Register from "./components/Register/Register";
import SignIn from "./components/SignIn/SignIn"
import Particles from "react-particles-js";
import './App.css';

const clarifaiApp = new Clarifai.App({
    apiKey: '262858b942184219a0b265ad0ac2d1b5'
});

const particlesOptions = {
    "particles": {
        "number": {
            "value": 150
        },
        "size": {
            "value": 3
        }, "density": {
            "enable": true,
            "value_area":  800
        }
    },
    "interactivity": {
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            }
        }
    }
}

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            input: '',
            imageUrl: '',
            box: {},
            route: 'signin',
            isSignedIn: false,
        }
    }

    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: clarifaiFace.left_col * width,
            topRow: clarifaiFace.top_row * height,
            rightCol: width - (clarifaiFace.right_col * width),
            bottomRow: height - (clarifaiFace.bottom_row * height)
        }
    }

    displayFaceBox = (box) => {
        console.log(box)
        this.setState({box: box})
    }

    onInputChange = event => {
        this.setState({
            input: event.target.value
        });
    };

    onButtonSubmit = () =>{
        this.setState({imageUrl: this.state.input});
        setTimeout(() => {
            console.log(this.state.input)
            clarifaiApp.models.predict(
                Clarifai.FACE_DETECT_MODEL,
                this.state.input)
                .then(response =>this.displayFaceBox(this.calculateFaceLocation(response)))
                .catch(err => console.error(err));
        }, 2000)

    }


    onRouteChange = (route) => {
        if(route === 'signout'){
            this.setState({isSignedIn: false})
        } else if (route === 'home') {
            this.setState({isSignedIn: true})
        }
        this.setState({route: route})
    }

    render() {
        const  {isSignedIn, imageUrl, route, box} = this.state;
        return (
            <div className="App">
                <Particles
                    className="particles"
                    params={particlesOptions}
                />

                <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
                {route === 'home'
                    ?
                    <div>
                        <Logo/>
                        <Rank />
                        <ImageLinkForm
                            onInputChange={this.onInputChange}
                            onButtonSubmit={this.onButtonSubmit}/>
                        <FaceRecognition box={box} imageUrl={imageUrl}/>
                    </div>
                    : (
                        route === 'signin'
                            ? <SignIn onRouteChange={this.onRouteChange}/>
                            : <Register onRouteChange={this.onRouteChange}/>
                    )
                }
            </div>
        );
    }
}

export default App;
