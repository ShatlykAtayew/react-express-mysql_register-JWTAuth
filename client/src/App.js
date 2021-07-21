import './App.css';
import { useState, useEffect } from 'react';
import Axios from 'axios';

function App() {

  const [usernameReg, setUsernameReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loginStatus, setLoginStatus] = useState(false);

  Axios.defaults.withCredentials = true;

  const register = () => {
    Axios.post("http://localhost:3002/register", {
      username: usernameReg,
      password: passwordReg
    }).then((response) => {
      console.log(response);
    });
  };

  const login = () => {
    Axios.post("http://localhost:3002/login", {
      username: username,
      password: password
    }).then((response) => {
      if (!response.data.auth){
        setLoginStatus(false);
      } else {
        console.log(response.data);
        localStorage.setItem("token", response.data.token)
        setLoginStatus(true);
      }
    });
  };

  useEffect(() => {
   Axios.get("http://localhost:3002/login").then((response) => {
     if (response.data.loggedIn === true) {
     setLoginStatus(response.data.user[0].username);
     }
   })
  }, [])

  const userAuthenticated = () =>{
    Axios.get("http://localhost:3002/isUserAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token")

      },
    }).then((response) => {
      console.log(response);
    });
  } 


  return (
    <div className="App">
      <div className="registration">
        <h1>Registration</h1>
        <label>Username:</label>
        <input
          type="text"
          onChange={(e) => {
            setUsernameReg(e.target.value);
          }}

        />

        <label>Password:</label>
        <input
          type="password"
          onChange={(e) => {
            setPasswordReg(e.target.value);
          }}

        />
        <button onClick={register}> Register</button>
      </div>
      <div className="login">
        <h1>Login</h1>
        <input
          type="text"
          onChange={(e) => {
            setUsername(e.target.value);
          }}

        />

        <label>Password:</label>
        <input
          type="password"
          onChange={(e) => {
            setPassword(e.target.value);
          }}

        />
        <button onClick={login}> Login</button>
      </div>
      {loginStatus && (
        <button onClick={userAuthenticated}> Check if Authenticated</button>
      )}
    </div>
  );
}

export default App;
