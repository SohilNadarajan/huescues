import './game.css';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
// const socket = io.connect("http://localhost:3001");
const socket = io.connect("https://hues-and-cues-be1fbd9a0756.herokuapp.com/");

export const Game = () => {
	const { state } = useLocation();
	const navigate = useNavigate();
    const { name, room } = state;
	var isEffectRun = false;
	useEffect(() => {
        if (!isEffectRun && name) {
            socket.emit("join_room", { name, room, type: 'regular' });
			isEffectRun = true;
        }
    }, []);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
		  socket.emit('leave_page');
		};
	
		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('popstate', handleBeforeUnload);
		window.addEventListener('hashchange', handleBeforeUnload);
	
		// Clean up the event listener on component unmount
		return () => {
		  window.removeEventListener('beforeunload', handleBeforeUnload);
		  window.removeEventListener('popstate', handleBeforeUnload);
		  window.removeEventListener('hashchange', handleBeforeUnload);
		};
	}, []);
  
	const colors = ["#602C0F", "#6B2710", "#752213", "#831F19", "#941E1E", "#9D1C1F", "#AF1E22", "#C52127", "#DF1E25", "#EB1C23", "#EC1D23", "#EC1D25", "#EB1B2E", "#ED1A3B", "#EB1A46", "#E91854", "#E51665", "#E21075", "#D70D83", "#D3148D", "#C82791", "#BB2D91", "#B23294", "#A83594", "#9F3894", "#933895", "#8C3D98", "#833D97", "#7C3E99", "#73419A", "#884B20", "#94441E", "#9C3F20", "#AD3F25", "#B83826", "#C62D26", "#D52828", "#E42124", "#EC2324", "#ED282A", "#ED2A32", "#ED2A32", "#EC2041", "#EB204D", "#EC1D5E", "#EC176E", "#ED117C", "#E90D8D", "#DB2A92", "#CD3894", "#BF3F97", "#B43D97", "#A93B97", "#9D3E97", "#963E97", "#8D3D96", "#843E98", "#7C3E99", "#713D97", "#683B96", "#A66128", "#AC5B26", "#BA5A27", "#C14D27", "#CD4727", "#D64026", "#E13926", "#E93024", "#EE362B", "#EE3D40", "#EF3F4C", "#EE3B51", "#EE3C5D", "#EE3267", "#ED3078", "#ED2C87", "#EB3196", "#DA4398", "#CA499B", "#BB4C9C", "#B4499B", "#A64799", "#9E4599", "#954298", "#8C4299", "#843E98", "#793C97", "#733C97", "#663996", "#5A3191", "#C88229", "#D78227", "#DD7627", "#E87824", "#E66A25", "#EA5E26", "#F15F2B", "#EF5533", "#F04E3D", "#EF5650", "#EF5E65", "#EF5F6B", "#EF5871", "#F0537E", "#EF508B", "#EF4F9D", "#DF55A0", "#CD57A1", "#BE5FA5", "#B659A1", "#A553A1", "#9B4F9E", "#944C9E", "#8D499E", "#81449B", "#7B4198", "#6F3E99", "#663795", "#583393", "#472E8A", "#E69C23", "#F19A1D", "#F7921B", "#F58C1E", "#F68625", "#F4792E", "#F4783D", "#F36E45", "#F27052", "#F27767", "#F37674", "#F27781", "#F27788", "#F27094", "#F068A4", "#E76FAC", "#D371AC", "#C671AE", "#BB71AE", "#AC67AA", "#9E5FA6", "#9359A5", "#8D54A3", "#83519F", "#7A499D", "#6E459B", "#623E98", "#583393", "#492F8F", "#342B84", "#FEB414", "#FCB022", "#FAAB2C", "#FBAB3A", "#FAA741", "#F9A24D", "#F59754", "#F68F5E", "#F48864", "#F48872", "#F58E83", "#F38F8E", "#F48F9A", "#F38DA3", "#F287B5", "#DF8DBB", "#D18BBD", "#C68BBE", "#B982B9", "#AA7AB6", "#9C74B3", "#9067AB", "#865EA6", "#7B59A7", "#7151A2", "#624A9E", "#59429A", "#4C3293", "#392F8F", "#2C2877", "#FEC013", "#FDBF28", "#FBB72C", "#FCB43A", "#FCB95E", "#F8AC56", "#FAAA63", "#F9A26D", "#F6A279", "#F7A085", "#F69E94", "#F69D9A", "#F59EA5", "#F69BAA", "#F39DC1", "#E1A5CB", "#D0A6CB", "#CDADD1", "#B898C7", "#A88BC1", "#9A82BC", "#9A82BC", "#7F6DB2", "#7265AD", "#665CA8", "#5954A4", "#4F4BA0", "#44409A", "#313694", "#2B2F86", "#FCD017", "#FECD28", "#FFC82F", "#FDC73E", "#FEC54B", "#FCC058", "#FDBC60", "#FDB86B", "#FBB379", "#FAB083", "#F9AF8E", "#F9B19E", "#F5B6AD", "#F3B6B5", "#ECB6C8", "#D8B7D6", "#CDB7D9", "#CCBDDC", "#B4A9D3", "#A79FCE", "#9794C9", "#8388C2", "#767CBD", "#6A74B7", "#5C6AB1", "#5161AE", "#4859A7", "#3E4FA1", "#2E449E", "#253A97", "#FCE119", "#FDDC26", "#FCDA33", "#FCD942", "#FCDE4C", "#FED859", "#FDDA60", "#FBD66B", "#F5DB7C", "#F1E092", "#ECDB9E", "#E8E1B3", "#E1E0C2", "#DCE1CB", "#D3E0D3", "#C6DDE3", "#C1D9F1", "#C0D8F0", "#A7C8E9", "#99B9DF", "#8BAAD9", "#7AA2D7", "#7092CB", "#6586C3", "#5679BB", "#4C6CB5", "#4261AD", "#3A5BA8", "#334FA2", "#27459E", "#FAEC24", "#F9EB2A", "#FAEB36", "#F9EE45", "#F9F04D", "#FAF25C", "#F8F069", "#EFEE82", "#E7EB8C", "#DEE99D", "#D8E6AC", "#D3E7BF", "#D0E8C9", "#CDE9D3", "#C7E6D6", "#BBE5E3", "#B3E2F2", "#B2E2F6", "#9DDCF5", "#87D6F7", "#7CC6EE", "#71B5E4", "#65A7DC", "#5C97D1", "#518BCA", "#4B7CBF", "#3F6DB6", "#3765B0", "#365BAA", "#3050A3", "#F7EF3C", "#F7EF3E", "#F6EE46", "#F4EF4C", "#F1EC5A", "#ECEC68", "#E6E879", "#DFE784", "#D6E486", "#C8DF8D", "#BEDD97", "#B5DBA2", "#B4DBAF", "#B0DAB5", "#ADDBC1", "#AEDCD7", "#AADCDE", "#A7DDE3", "#99D8E7", "#89D7EE", "#73D1F5", "#64CBF4", "#5AAADD", "#549CD4", "#4889C9", "#4889C9", "#3E7CC0", "#3B6FB8", "#3664AF", "#335CAA", "#F1EC1F", "#F0EB2E", "#EAE932", "#E9E839", "#E5E643", "#DCE453", "#CFDF60", "#C0D968", "#B1D66D", "#A8D377", "#9FD07D", "#98D089", "#92CE98", "#8DCD9B", "#8ECEA7", "#8DCFB3", "#8DD1BF", "#8BD1C6", "#83CFCC", "#7ACDD4", "#69CADA", "#56C8E0", "#3BC6EE", "#38BAEC", "#3CA9E1", "#3B9AD4", "#4088C8", "#3878BD", "#3B6FB8", "#3465B1", "#E0E321", "#DBE126", "#D6E12E", "#D0DE38", "#C8DA43", "#BAD644", "#AFD24C", "#9FCD51", "#91C958", "#85C65E", "#78C468", "#70C271", "#6FC17A", "#6DC182", "#6DC182", "#71C393", "#70C59C", "#73C6A6", "#75C8AB", "#6BC5B4", "#60C4BB", "#55C3C5", "#46C3CF", "#2FC2DB", "#1CBAE3", "#22A9E1", "#299CD7", "#378CCC", "#307EC1", "#2C71B8", "#C2D82D", "#BDD630", "#B5D332", "#ABCF38", "#9FCC39", "#93C93E", "#81C23F", "#79C043", "#6DBB45", "#5DB545", "#54B34B", "#4EB254", "#47B75A", "#48B869", "#50BA73", "#57BD7B", "#58BD7C", "#5DBF86", "#5FC08B", "#5FC092", "#5BC09E", "#50C1AB", "#46C0B3", "#37BFC3", "#27BECE", "#18B9D8", "#0FAEDE", "#17A5DD", "#2395D3", "#2983C6", "#9EC438", "#9AC43C", "#94C23B", "#88BF40", "#7EBB42", "#6CB343", "#63B044", "#54A846", "#4FA646", "#3F9E45", "#349D48", "#31A149", "#2BAA4B", "#2BB14A", "#32B454", "#37B65C", "#43B865", "#47B86E", "#49BA73", "#50BC76", "#52BD84", "#4ABC90", "#45BE9E", "#38BEA8", "#2EBDB7", "#2ABFC6", "#1BBDD2", "#0FB2D3", "#0FA8DA", "#179FDB", "#7BA541", "#76A940", "#70A743", "#65A243", "#5AA445", "#4C9F45", "#439845", "#3A9644", "#299144", "#1D8942", "#1A8B43", "#149145", "#159947", "#18A149", "#1DAB4B", "#20B04C", "#2BB34D", "#32B455", "#3AB65E", "#3EB865", "#40B970", "#3AB97C", "#31BA8A", "#2BB996", "#1FBBA1", "#1ABAAC", "#18BCBE", "#15BBC7", "#13B7D7", "#0DB1E2"];
	const [gameBoardHeight, setGameBoardHeight] = useState(0);
	const [confirmSelection, setConfirmSelection] = useState(false);
	const [inputValue, setInputValue] = useState('');

	const [gameStarted, setGameStarted] = useState(false);
	const [messages, setMessages] = useState([]);
	const [users, setUsers] = useState([]);
	const [gameState, setGameState] = useState(null);

	const [promptColor, setPromptColor] = useState(false);
	const [randomColor, setRandomColor] = useState('white');
	const [randomLabel, setRandomLabel] = useState('');
	const [randomCoord, setRandomCoord] = useState([]);
	const [hint, setHint] = useState('');
	const [hintPlaceholder, setHintPlaceholder] = useState('Provide a description...');
	const [firstSelectedSquare, setFirstSelectedSquare] = useState(null);
	const [secondSelectedSquare, setSecondSelectedSquare] = useState(null);
	const [lowlightEnabled, setLowlightEnabled] = useState(false);

	// send message
	const handleReturnMessage = (event) => {
		if (event.key === 'Enter') {
			socket.emit("send_message", { name, message: inputValue, type: 'regular', room });
			setInputValue('');
		}
	};

	// receive message
	useEffect(() => {
		const handleReceiveMessage = (data) => {
			setMessages((prevMessages) => [...prevMessages, 
				{
					name: data.name,
					message: data.message,
					type: data.type
				}
			]);
			setTimeout(() => {
				const chatStreamElement = document.querySelector('.chat-stream');
				chatStreamElement.scrollTop = chatStreamElement.scrollHeight;
			}, 0);
		};
	  
		socket.on("receive_message", handleReceiveMessage);
	  
		// Cleanup function to remove the listener when the component unmounts
		return () => {
			socket.off("receive_message", handleReceiveMessage);
		};
	}, []);

	// user joined
	useEffect(() => {
		socket.on('user_update', (data) => {
			setUsers(data);
		});

		socket.on('display_turn_results', () => {
			setLowlightEnabled(true);
			setTimeout(() => setLowlightEnabled(false), 5000);
		});
	  
		// Cleanup function to remove the listener when the component unmounts
		return () => {
			socket.off('user_update');
			socket.off('display_turn_results');
		};
	}, []);

	useEffect(() => {
		socket.on('game_started', (initialState) => {
            setGameState(initialState);
        });

		socket.on('game_state_update', (updatedState) => {
            setGameState(updatedState);
			// console.log(users);
			// console.log(users.findIndex(user => user.name === name));
			// console.log(updatedState.playerTurnIndex);
			if (updatedState.guessCycle === 2 
				&& users.findIndex(user => user.name === name) == updatedState.playerTurnIndex
				&& users.findIndex(user => user.name === name) == updatedState.guesserTurnIndex) {
				secondHint();
			}
			if (updatedState.guessCycle === 1
				&& users.findIndex(user => user.name === name) == updatedState.playerTurnIndex
				&& users.findIndex(user => user.name === name) == updatedState.guesserTurnIndex) {
				promptColorCard();
				socket.emit("start_player_turn", { name, room });
			}
			if (updatedState.selections.length === 0) {
				setFirstSelectedSquare(null);
				setSecondSelectedSquare(null);
			}
        });

		socket.on('end_game', () => {
			setGameStarted(false);
		});

		return () => {
			socket.off('game_started');
			socket.off('game_state_update');
			socket.off('end_game');
		};
    }, [users]);

	// resize chat container to match game board
	useEffect(() => {
		// Function to update chat-container height to match game-board height
		const updateChatContainerHeight = () => {
			const gameBoardElement = document.querySelector('.game-board');
			if (gameBoardElement) {
				const height = gameBoardElement.getBoundingClientRect().height;
				setGameBoardHeight(height);
			}
		};
	
		// Initial call to set chat-container height
		updateChatContainerHeight();
	
		// Event listener for window resize
		window.addEventListener('resize', updateChatContainerHeight);
	
		// Clean up function to remove event listener on component unmount
		return () => {
		  	window.removeEventListener('resize', updateChatContainerHeight);
		};
	}, []);

	const startGame = () => {
		if (users.length < 3) {
			alert('Need at least 3 players!');
			return;
		}
		setGameStarted(true);
		socket.emit("start_game", { room });
		socket.emit("start_player_turn", { name, room });
		// first actions
		promptColorCard();
	}

	const secondHint = () => {
		setPromptColor(true);
		socket.emit("player_second_hint", { name, room });
	}

	const generateLabel = (col, row) => {
		const rowLabel = String.fromCharCode(65 + row - 1); // Convert to A-Z
		return `${rowLabel}${col}`;
	};
	
	const getCoordinateAndLabel = (index) => {
		// Ensure index is within bounds
		if (index < 0 || index >= 480) {
			throw new Error('Index out of bounds');
		}
	
		// Convert the index to a coordinate in a 30x16 grid
		const col = (index % 30) + 1; // +1 to account for edge columns
		const row = Math.floor(index / 30) + 1; // +1 to account for edge rows
	
		const label = generateLabel(col, row);
	
		return { col, row, label };
	};

	// send hint
	const handleReturnHint = (event) => {
		if (event.key === 'Enter') {
			// submit hint
			// emit make move with moveData
			let moveData = {
				randomColor,
				randomCoord,
				hint
			};
			socket.emit('send_hint', moveData);
			setPromptColor(false);
			if (gameState.guessCycle === 1) {
				setHintPlaceholder('Refine your description...');
			} else if (gameState.guessCycle === 2) {
				setHintPlaceholder('Provide a description...');
			}
			setHint('');
		}
	};

	const promptColorCard = () => {
		let randomIndex = Math.floor(Math.random() * colors.length);
		let { col, row, label } = getCoordinateAndLabel(randomIndex);

		while (col < 3 || row < 3 || col > 28 || row > 14) {
			randomIndex = Math.floor(Math.random() * colors.length);
			({ col, row, label } = getCoordinateAndLabel(randomIndex));
		}

		// select random color
		setPromptColor(true);
		setRandomColor(colors[randomIndex]);
		setRandomLabel(label);
		setRandomCoord([col, row]);
	}

	const sendGuess = () => {
		let selection = {};
		const icon = users.find(user => user.name === name)?.icon;
		if (gameState.guessCycle === 1) {
			selection = {
				name,
				icon,
				coords: firstSelectedSquare
			};
		}
		if (gameState.guessCycle === 2) {
			selection = {
				name,
				icon,
				coords: secondSelectedSquare
			};
		}
		socket.emit("send_guess", selection);
		setConfirmSelection(false);
	}

	const topLabels = Array.from({ length: 30 }, (_, i) => i + 1);
	const sideLabels = Array.from({ length: 16 }, (_, i) => String.fromCharCode(65 + i));
	const renderGrid = () => {
		let grid = [];
		let colorIndex = 0;
		const [randomX, randomY] = gameState?.randomCoord || [null, null];
		
		const selectedCoordsSet = new Set(gameState?.selections.map(sel => sel.coords));

		for (let row = 0; row < 18; row++) {
			let rowSquares = [];
	
			for (let col = 0; col < 32; col++) {
				const coord = `${row}-${col}`;
				const isSelectedFirst = firstSelectedSquare === coord;
           		const isSelectedSecond = secondSelectedSquare === coord;
            	const userIcon = isSelectedFirst || isSelectedSecond 
					? require(`../../animals/${users.find(user => user.name === name).icon}.png`) 
					: null;

				let opacity = 1;
				if (lowlightEnabled && randomX !== null && randomY !== null) {
					const chebyshevDistance = Math.max(Math.abs(randomX - col), Math.abs(randomY - row));
					if (chebyshevDistance > 2) {
						opacity = 0.4;
					} else if (chebyshevDistance == 2) {
						opacity = 0.7;
					} else if (chebyshevDistance == 1) {
						opacity = 0.85;
					}
				}

				let squareContent = null;
				// Check if the current square is selected
				const selection = gameState?.selections.find(sel => sel.coords === coord);
				if (selection) {
					squareContent = <img className='game-piece-image' src={require(`../../animals/${selection.icon}.png`)} alt={selection.name} />;
				}

				if (row === 0 && col > 0 && col < 31) {
					// Top labels
					rowSquares.push(
					<div key={`${row}-${col}`} className="square label">
						{topLabels[col - 1]}
					</div>
					);
				} else if (row === 17 && col > 0 && col < 31) {
					// Bottom labels
					rowSquares.push(
					<div key={`${row}-${col}`} className="square label">
						{topLabels[col - 1]}
					</div>
					);
				} else if (col === 0 && row > 0 && row < 17) {
					// Left labels
					rowSquares.push(
					<div key={`${row}-${col}`} className="square label">
						{sideLabels[row - 1]}
					</div>
					);
				} else if (col === 31 && row > 0 && row < 17) {
					// Right labels
					rowSquares.push(
					<div key={`${row}-${col}`} className="square label">
						{sideLabels[row - 1]}
					</div>
					);
				} else if (row > 0 && row < 17 && col > 0 && col < 31) {
					// Inner grid with colors
					rowSquares.push(
					<div
						key={`${row}-${col}`}
						className="square"
						style={{ backgroundColor: colors[colorIndex++], opacity }}
						onClick={() => !selectedCoordsSet.has(coord) && handleSquareClick(coord)}
					>
						{!selection && userIcon && <img className='game-piece-image' src={userIcon} alt="User Icon" />}
						{selection && squareContent}
					</div>
					);
				} else {
					// Empty corners
					rowSquares.push(
					<div key={`${row}-${col}`} className="square empty"></div>
					);
				}
			}
	
			grid.push(
				<div key={row} className="row">
					{rowSquares}
				</div>
			);
		}
	
		return grid;
	};

	const handleSquareClick = (coord) => {
		// TODO: don't use 'name' to identify, use 'id'
		const user = users.find(user => user.name === name);
		if (gameState?.guesserTurnIndex === users.findIndex(user => user.name === name)) {
			if (gameState.guessCycle === 1) {
				setFirstSelectedSquare(coord);
			}
			if (gameState.guessCycle === 2) {
				setSecondSelectedSquare(coord);
			}
			
			setConfirmSelection(true);
			// Emit the selection to the server if needed
			// socket.emit('square_selected', { coord, user, room: gameState.room });
		}
	};

	return (
		<>
			{
			promptColor &&	
			<div className='color-prompter'>
				<div className='color-prompter-card'>
					<div className='color-block' style={{background: randomColor}}></div>
					<div className='color-identifier'>{randomLabel}</div>
					<input 
						className='chat-input' 
						placeholder={hintPlaceholder} 
						maxLength={100}
						value={hint}
						onChange={(event) => {setHint(event.target.value);}}
						onKeyDown={handleReturnHint}
					/>
				</div>
			</div>
			}
			<div className='game-background'></div>
			<div className='elements-container'>
					<div className='control-container'>
						<div className='timer-round'>
							{gameState && `Round ${gameState.round} of 3`}
						</div>
						<div className='hint'>
							{gameState && gameState.hint}
							{!gameState && 'waiting to start...'}
						</div>
						<div className='settings'>
							{
							confirmSelection &&
							<div className='confirm-button' onClick={() => sendGuess()}>Confirm Selection</div>
							}
							{
							!gameStarted && users.length > 0 && users[0].name == name &&
							<div className='confirm-button' onClick={() => startGame()}>Start Game</div>
							}
						</div>
					</div>
					<div className='gamepieces-container'>
						<div className='player-list'>
							{users.map((user, index) => (
								<div className={`
									player-box 
									${gameState && gameState.guesserTurnIndex == index ? 'active-guesser' : ''}
									${gameState && gameState.playerTurnIndex == index ? 'active-player' : ''}
									`} 
									key={index}>
									<div className='player-placing'>#{user.placing}</div>
									<div className='player-info'>
										<div className='player-name'>{user.name}</div>
										<div className='player-points'>{user.points} pts</div>
									</div>
									<div className='player-icon'>
										<img className='icon-image' src={require(`../../animals/${user.icon}.png`)} />
									</div>
								</div>
							))}
							{/*
							<div className='player-box'>
								<div className='player-placing'>#1</div>
								<div className='player-info'>
									<div className='player-name'>superman</div>
									<div className='player-points'>10 pts</div>
								</div>
								<div className='player-icon'>
									<img className='icon-image' src={require('../../animals/deer.png')} />
								</div>
							</div>
							<div className='player-box alternate' style={{background: 'springgreen'}}>
								<div className='player-placing'>#2</div>
								<div className='player-info'>
									<div className='player-name'>MyNameJeff</div>
									<div className='player-points'>16 pts</div>
								</div>
								<div className='player-icon'>
									<img className='icon-image' src={require('../../animals/bear.png')} />
								</div>
							</div>
							<div className='player-box'>
								<div className='player-placing'>#4</div>
								<div className='player-turn'></div>
								<div className='player-info'>
									<div className='player-name'>standalert</div>
									<div className='player-points'>4 pts</div>
								</div>
								<div className='player-icon'>
									<img className='icon-image' src={require('../../animals/snake.png')} />
								</div>
							</div>
							<div className='player-box alternate' style={{background: 'yellow'}}>
								<div className='player-placing'>#3</div>
								<div className='player-turn'></div>
								<div className='player-info'>
									<div className='player-name'>jigglyboy</div>
									<div className='player-points'>12 pts</div>
								</div>
								<div className='player-icon'>
									<img className='icon-image' src={require('../../animals/panda.png')} />
								</div>
							</div>
							*/}
						</div>
						<div className='game-board'>
							{renderGrid()}
						</div>
						<div className='chat-container' style={{ height: gameBoardHeight }}>
							<div className='chat-stream'>
								{messages.map((data, index) => {
									let messageElement;

									switch (data.type) {
										case 'regular':
											messageElement = (
												<div key={index} className={`chat-message ${index % 2 === 0 ? 'alternate' : ''}`}>
													<span style={{fontWeight: 500}}>{data.name}:</span> {data.message}
												</div>
											);
											break;
										case 'connect':
											messageElement = (
												<div key={index} className={`chat-message ${index % 2 === 0 ? 'alternate' : ''}`}>
													<span style={{fontWeight: 500, color: '#33CC33'}}>{data.message}</span>
												</div>
											);
											break;
										case 'disconnect':
											messageElement = (
												<div key={index} className={`chat-message ${index % 2 === 0 ? 'alternate' : ''}`}>
													<span style={{fontWeight: 500, color: '#CC3333'}}>{data.message}</span>
												</div>
											);
											break;
										case 'notif':
											messageElement = (
												<div key={index} className={`chat-message ${index % 2 === 0 ? 'alternate' : ''}`}>
													<span style={{fontWeight: 500, color: 'rgb(70, 120, 200)'}}>{data.message}</span>
												</div>
											);
											break;
										case 'winner':
											messageElement = (
												<div key={index} className={`chat-message ${index % 2 === 0 ? 'alternate' : ''}`}>
													<span style={{fontWeight: 500, animation: 'colorRotate 1s linear 0s infinite'}}>{data.message}</span>
												</div>
											);
											break;
									}

									return messageElement;
								})}
							</div>
							<div className='chat-input-container'>
								<input 
									className='chat-input' 
									placeholder='Send a message...' 
									maxLength={100}
									value={inputValue}
									onChange={(event) => {setInputValue(event.target.value);}}
									onKeyDown={handleReturnMessage}
								/>
							</div>
						</div>
					</div>
			</div>
		</>
	);
};