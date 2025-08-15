import React, { useState } from 'react';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';

export default function NewChat({onClose,onChatCreated}) {

  const [chatType, setChatType] = useState('private'); 

  return (
    <div className='absolute flex w-full h-full justify-center items-center z-0 inset-0 bg-black/25'>
      <div className='bg-white rounded-lg w-96 p-4'>

        <div className='flex justify-between p-2 border-black border-b-[1px]'>
          <h2 className='font-bold text-lg'>New Conversation</h2>
          <button onClick={onClose} className="  duration-150 cursor-pointer " ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg></button>
        </div>

        {/* Chat Type Selector */}
        <div className='flex justify-between mb-4 mt-2'>

          <h2 onClick={() => setChatType('private')}  className={`cursor-pointer px-4 py-2 rounded ${chatType === 'private' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>  Private Chat  </h2>

          <h2 onClick={() => setChatType('group')} className={`cursor-pointer px-4 py-2 rounded ${chatType === 'group' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}> Group Chat </h2>

        </div>

        {/* Chat Type Content */}
        {chatType === 'private' ? (
          <div>
            <PrivateChat onChatCreated={onChatCreated} />
          </div>

        ) : (

          <div>
           <GroupChat onChatCreated={onChatCreated}/>
          </div>
        )}
      </div>
    </div>
  );
}
