import axios from 'axios';
import React, { useState,useRef } from 'react'

export default function MessageInput({chatId}) {

    const [contenet, setContent] = useState("");
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();

    const handleFileChange = (e) =>{
        setFile(e.target.files[0]);
    }
    
const submit = async(e) =>{
    e.preventDefault();

    const formData = new FormData();

    formData.append('chat_id',chatId);
    formData.append('content', contenet);
    formData.append('message_type', file ? 'file' : 'text');
    
    if(file){
        formData.append('file', file);
    }

    if (!contenet && !file) {
        alert("Please enter a message or select a file.");
        return; 
    }

    try {
        
        const response = await axios.post('/new-message',formData);

        setContent("");
        setFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }

    } catch (error) {
        console.error(error);
    }
}


  return (
    <div className="bg-white border-t p-4 sticky bottom-0 w-full">
        
        <form onSubmit={submit} className="max-w-4xl mx-auto flex items-center space-x-4">

            <label className="p-2 text-gray-500 hover:text-gray-700 transition cursor-pointer relative inline-flex items-center"> 
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <input ref={fileInputRef}   onChange={handleFileChange}  type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </label>

            <input  value={contenet} onChange={(e)=>setContent(e.target.value)} type="text"  placeholder="Type your message..."  className="flex-1 p-2 border rounded-full focus:outline-none focus:border-blue-500" name='message'/>
        
        {file && <p className="text-sm text-gray-500">{file.name}</p>}

            <button type="submit" className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"  strokeWidth="2"  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"  />
                </svg>
            </button>
        </form>

    </div>
  )
}
