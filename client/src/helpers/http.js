import axios from "axios"

export const http = axios.create({
  baseURL: 'https://tryon-ecomm-server.akbarbudi.xyz'
});