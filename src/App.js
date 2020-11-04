import React, { useReducer, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs' 
import * as mobilenet from '@tensorflow-models/mobilenet'
import './App.css';
import CSSTransition from "react-transition-group/CSSTransition"




export function App() {
  
const stateMachine = {
  initial: 'initial',
  states: {
    initial: {on: {next: 'loadingModel'}},
    loadingModel: {on: {next: 'awaitingUpload'}},
    awaitingUpload: {on: {next: 'ready'}},
    ready: {on: {next: 'classifying'}, showImage: true},
    classifying: {on: {next: 'complete'}, showImage: true},
    complete: {on: {next: 'awaitingUpload'}, showImage:true, showResults: true}
    
  }
}
const reducer = (currentState, event) => stateMachine.states[currentState].on[event] || stateMachine.initial;

  tf.setBackend("cpu")
const [state, dispatch] = useReducer(reducer, stateMachine.initial)
const [model, setModel] = useState(null)
const [imageUrl, setImageUrl] = useState(null)
const [results, setResults] = useState(null)
const [showMap, setShowMap] = useState(null)
const [changeClass, setClass] = useState('img-container')
const inputRef = useRef()
const imageRef = useRef()

const next = ()=>dispatch('next')

const loadModel = async () => {
  next()
  const mobilenetModel = await mobilenet.load()
  setModel(mobilenetModel)
  next()
}

const handleUpload = e =>{
  const {files} = e.target;
  if(files.length > 0){
    const url = URL.createObjectURL(files[0])
    setImageUrl(url)
    setClass('img-container')
    next()
  }
}

const identify = async() => {
  setClass('upper-img-container')
  next()
  const classificationResults = await model.classify(imageRef.current)
  setResults(classificationResults)
 
  next()
  
}
const reset = () => {
  setShowMap(false)
  setImageUrl(null)
  setResults([])
  next()
 }
  


const buttonProps = {
  initial: {text:'Load Model', action:loadModel},
  loadingModel: {text: 'Loading Model...', action:()=>{}},
  awaitingUpload: {text: 'Upload Photo', action:()=> inputRef.current.click()},
  ready: {text: 'Identify', action:identify},
  classifying: {text: 'Identifying', action:()=>{}},
  complete: {text: 'Reset', action:next}
 
  
}
const {showImage = false, showResults = false} = stateMachine.states[state]



return (
    <div className="App">
      <header className="App-header">
        <div className="background"></div>
      <CSSTransition
         in={!showImage}
         timeout={1000}
         classNames="fade"
         unmountOnExit>
           <div className="text-box">
           <h1>Image Classification</h1>
           <h4>This application uses a tensorflow model for classifing your uploaded image.
             The model will provide three objects which have the highest probability to be the object in the image.<br/><br/>
              Give it a shot!
           </h4>
           </div>
         </CSSTransition>

         <CSSTransition
         in={showImage}
         timeout={1000}
         classNames="fade"
         unmountOnExit>
         <div className={changeClass}>
            <img alt="" src={imageUrl} ref={imageRef}/>
            </div>
            </CSSTransition>

  <CSSTransition
   in={showResults}
   timeout={1000}
   classNames="fade"
   unmountOnExit
   onEnter={() => setShowMap(true)}
   onExited={() => reset}>
  <table>
    <tbody>
  <tr>
    <th>Object</th>
    <th>Probability</th>
  </tr>
  
  {showMap && results.map((result,index) =>
  
 
  <tr key={index}> <td>{result.className}</td> 
  <td>{Math.round(result.probability * 100)}%</td></tr>)}
 
  </tbody>
  </table>
  </CSSTransition>
 

        <input id="input" type="file" accept="image/*" capture="camera" ref={inputRef} onChange={handleUpload}/>
    
  <button onClick={buttonProps[state].action}>{buttonProps[state].text}</button>
      </header>
    </div>
  );
}

export default App;
