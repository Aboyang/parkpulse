import axios from 'axios';

const address = 'Hall 7, NTU Singapore';
const encodedAddress = encodeURIComponent(address);

const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=AIzaSyDTnImGP2uk0fZAszm2UK3wiarh1f10764`;

const response = await axios.get(url);
const data = response.data;

const result = data.results[0];

console.log('Formatted Address:', result.formatted_address);
console.log('Latitude:', result.geometry.location.lat);
console.log('Longitude:', result.geometry.location.lng);
