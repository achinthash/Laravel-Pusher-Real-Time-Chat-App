import React, { useEffect, useState } from 'react'
import axios from 'axios';
import DefaultUser from '../../../../public/images/Default-user.png';

export default function ChatHead({chatId,onBack,isMobile}) {
const [chat, setChat] = useState(null);

  useEffect(()=>{
    
    const messages = async()=>{
      try {
          
        const response = await axios.get(`/chat/${chatId}`);
        setChat(response.data)

      } catch (error) {
        console.error(error);
      }
    }

    if (chatId) {
      messages();
    }


  },[chatId]);


  return (
  <div className="bg-blue-600 text-white p-3 shadow-lg">
    <div className="max-w-4xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-4 ml-2">

        {isMobile && (
          <button onClick={onBack} className="relative bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 rounded-full shadow transition duration-150 cursor-pointer " ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg></button>
        )}

        {chat && chat.type ? (
          chat.type === 'group' ? (
            <>
              {chat.avatar ? (
                <img src={`http://127.0.0.1:8000/storage/${chat.avatar}`} className="w-8 h-8 rounded-full mr-2" alt="User" />
              ) : (
                <img src={DefaultUser} className="w-8 h-8 rounded-full mr-2" alt="User" />
              )}
              <h1 className="font-bold">{chat.name}</h1>
            </>
          ) : (
            <>
              {chat.participants?.[0]?.avatar ? (
                <img src={`http://127.0.0.1:8000/storage/${chat.participants[0].avatar}`} className="w-8 h-8 rounded-full mr-2" alt="User" />
              ) : (
                <img src={DefaultUser} className="w-8 h-8 rounded-full mr-2" alt="User" />
              )}
              <h1 className="font-bold">{chat.participants?.[0]?.name}</h1>
            </>
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  </div>
);

}
