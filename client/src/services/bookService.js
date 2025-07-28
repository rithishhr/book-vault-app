import axios from "axios";
const API_URL = "http://localhost:5000/api/books";

export const getBooks = () => axios.get(API_URL);
export const addBook = (bookData) => axios.post(API_URL, bookData);
