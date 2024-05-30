import './landing.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://hues-and-cues-be1fbd9a0756.herokuapp.com/");

export const Landing = () => {
    let navigate = useNavigate();

    const [name, setName] = useState('');

    const joinGame = () => {
        if (name == '') {
            alert('Enter a name!');
            return;
        }
        // socket.emit("join_room", { user: name, room });
        navigate('/game', { state: { name, room: 69 } });
    }

    const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			joinGame();
		}
	};

    return (
        <>
            <div className='background'>
                <div className='title-container'>
                    <h1 className='title bigtext'>HUES</h1>
                    <h2 className='title smalltext'><span style={{color: '#000', fontWeight: '700'}}>&</span>CUES</h2>
                </div>
                <div className='action-container'>
                    <input 
                        className='name-input' 
                        placeholder='Enter name' 
                        maxLength={21}
                        value={name}
                        onChange={(event) => {setName(event.target.value);}}
                        onKeyDown={handleKeyDown}
                    />
                    <div className='button' onClick={() => joinGame()}>Play!</div>
                    <div className='button' style={{fontSize: '20px'}}>Create Private Room</div>
                </div>
            </div>
        </>
    );
};