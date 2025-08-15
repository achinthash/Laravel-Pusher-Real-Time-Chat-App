import React, { useState,useEffect } from 'react';
import DefaulUser from '../../../../public/images/Default-user.png'
import axios from 'axios';

export default function PrivateChat({onChatCreated }) {

    const [users, setUsers] = useState([]);
    const [searchUser , setSearchQuery] = useState("");
    
    useEffect(()=>{
        
        const usersList = async() =>{
            const response = await axios.get('/all-users');
            setUsers(response.data);
        }

        usersList();
    },[]);


    // search user
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchUser.toLocaleLowerCase())
    );

    const selectedUserList = async(userId) =>{

        try {
            const response = await axios.post('/new-chat',{
                type: 'private',
                user_id : [userId] 
            });
            onChatCreated(response.data.chat.id);

        } catch (error) {
            console.error(error);
        }
    }     

  return (
    <div>

        <input value={searchUser} onChange={(e)=> setSearchQuery(e.target.value)}  type="text"   placeholder="Search for Contacts "  className="py-2 px-2 border-1  rounded-lg w-full bg-white"/>

        <div className='max-h-[40vh] overflow-y-auto'> 
            {
                filteredUsers.map((user)=>(

                    <div key={user.id} onClick={()=>selectedUserList(user.id)}  className="flex items-center justify-between cursor-pointer   bg-slate-300 hover:bg-slate-400  py-2 mb-2 rounded-lg mt-3 ">
                        <div  className="flex items-center "> 
                            {
                                user.avatar ? 
                                <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} className="w-8 h-8 rounded-full ml-2" alt="User" />
                                    :
                                <img src={DefaulUser} className="w-8 h-8 rounded-full ml-2" alt="User" />
                            }
                            <h2 className="text-base font-bold ml-2 mr-2"> {user.name} </h2>
                        </div>

                    </div>
                ))
            }
        </div>
    </div>
  )
}
