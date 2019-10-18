import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import Avatar from '../components/Avatar/Avatar';
import Destination from '../components/Destination/Destination';
import Weather from '../components/Weather/Weather';
import Message from '../components/Message/Message';

const initialDestinationState = {
  name: '',
  editing: false
};

const initialForecastState = {
  data: [],
  loading: true
};

const Dashboard = (props) => {
  const [destination, setDestination] = useState(initialDestinationState);
  const [forecast, setForecast] = useState(initialForecastState);
  const [file, setFile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [uploadIsLoading, setUploadIsLoading] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [user, setUser] = useState(null);
  const [isError, setIsError] = useState(false);

  let baseURL = "http://localhost:3001";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
       props.history.push('/')
    } else {
      axios.get('/auth', {headers: {'Authorization': token}})
      .then(res => setUser(res.data.user))
      .catch(err => props.history.push('/'));
    }
    getAvatar();

    getAPI();
  }, [props.history]);

  const getAPI = async () => {
    await axios
      .get(`${baseURL}/destination?address=${destination.name}`)
      //.get(`http://localhost:3001/user/me/destination`)
      .then(res => res.data)
      .then(data => {
        setDestination(data.location);
        setForecast(data.forecast);
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.status);
        } else if (error.request) {
          console.log("No Destination");
        } else {
          console.log("Error", error.message);
        }
      });
  };


  const handleChangeDestination = e => {
    setDestination({
      name: e.target.value,
      editing: false
    });
    console.log("change destination");
  };

  const handleOnSubmit = e => {
    e.preventDefault();
    console.log("update destination");
    // axios
    //   .post(`${baseURL}/users/me/destination`, { destination: destination.name })
    //   .then(res => console.log(res))
    //   .catch(error => console.log("error"));
    setForecast({loading: true});
    getAPI();
  };

  const uploadHandler = (event) => {
    setFile(event.target.files[0]);
    setIsUpload(true);
  }

  const submitUploadHandler = () => {
    setUploadIsLoading(true);
    const token = localStorage.getItem('token');
    const config = {
      headers: {'Authorization':  token, 'content-type': 'multipart/form-data'}
    };
    const formData = new FormData();
    formData.append('avatar', file)
    axios.post('/users/me/avatar', formData, config)
    .then(res => {
      getAvatar();
      setUploadIsLoading(false);
      setIsUpload(false);
    })
    .catch(err => {
      setIsError(true);
      setUploadIsLoading(false);
    })
  }

  const getAvatar = () => {
    axios.get('/users/me/avatar', {headers: {'Authorization': localStorage.getItem('token')}})
      .then(res => setAvatar(res.data))
      .catch(err => console.log(err))
  }

  const logoutHandler = () => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {'Authorization':  token}
    };
    const bodyParameters = {key: 'value'}
    axios.post('/users/logout', bodyParameters, config)
      .then(res => {
        localStorage.removeItem('token');
        props.history.push('/');
      }).catch(err => setIsError(true));
  }

  let errorMessage = null;
  if (isError) {
    errorMessage = <Message error={isError}/>
      setTimeout(() => {
        setIsError(false);
      }, 1000);
  }

  return (
    <div className="">
      {errorMessage}
      <div className="container_wrap">
        <button onClick={logoutHandler} className="logout">Log Out</button>
        <Avatar
          upload={uploadHandler}
          submit={submitUploadHandler}
          avatar={avatar}
          username={user}
          isLoading={uploadIsLoading}
          isUpload={isUpload}/>
        <Destination
          name={destination.name}
          editing={destination.editing}
          handleOnSubmit={handleOnSubmit}
          handleChangeDestination={handleChangeDestination}
        />
        <Weather forecast={forecast} />
      </div>
    </div>
  );
};

export default Dashboard;
