import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { useNavigate, Route, Routes } from 'react-router-dom';
import { Rooms } from './rooms';
import { Room } from './room';
import { ChatRoom } from '../chat_room/_chat_room';
import { NewRoomModal } from './new_room_modal';

export const Home = () => {
  const api = useContext(ApiContext);
  const navigate = useNavigate();

  const [chatRooms, setChatRooms] = useState([]);
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(async () => {
    const res = await api.get('/users/me');
    const { chatRooms } = await api.get('/chat_rooms');
    console.log(chatRooms);
    setChatRooms(chatRooms);
    setUser(res.user);

    navigator.geolocation.getCurrentPosition((location) => {
      setLat(location.coords.latitude);
      setLon(location.coords.longitude);
    }, (err) => {
      console.log(err);
    });

    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const createRoom = async (name) => {
    setIsOpen(false);
    let latitude = lat;
    let longitude = lon;
    const { chatRoom } = await api.post('/chat_rooms', { name, latitude, longitude });
    // console.log(latitude);
    // console.log(longitude);
    // console.log(chatRoom);
    setChatRooms([...chatRooms, chatRoom]);
    navigate(`chat_rooms/${chatRoom.id}`);
  };

  return (
    <div className="container">
      <Rooms>
        {chatRooms.map((room) => {
          let latDif = Math.abs(Math.abs(lat) - Math.abs(room.latitude));
          let lonDif = Math.abs(Math.abs(lon) - Math.abs(room.longitude));
          if (latDif < 1 && lonDif < 1) {
            return (
              <Room key={room.id} to={`chat_rooms/${room.id}`}>
                {room.name}
              </Room>
            );
          } else {
            return (<div key={room.id}></div>);
          }
        })}
        <Room action={() => setIsOpen(true)}>+</Room>
      </Rooms>
      <div className="chat-window">
        <Routes>
          <Route path="chat_rooms/:id" element={<ChatRoom />} />
          <Route path="/*" element={<div>Select a room to get started</div>} />
        </Routes>
      </div>
      {isOpen ? <NewRoomModal createRoom={createRoom} closeModal={() => setIsOpen(false)} /> : null}
    </div>
  );
};
