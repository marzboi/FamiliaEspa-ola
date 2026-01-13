import axios from 'axios';

const familiaApi = axios.create({
  baseURL: 'https://familiaespanola-d4114-default-rtdb.europe-west1.firebasedatabase.app/',
});

export default familiaApi;
